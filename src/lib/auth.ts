import { neon } from '@neondatabase/serverless';
import { getDatabaseUrl, initDb } from './db';

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  created_at?: string;
  last_login_at?: string;
}

export interface SessionInfo {
  token: string;
  user: AdminUser;
  expires_at: string;
}

// In-memory fallback auth store for development when database is unavailable
const memoryUsers: Array<{
  id: number;
  email: string;
  password_hash: string;
  password_salt: string;
  name: string;
  role: string;
  created_at: string;
  last_login_at?: string;
}> = [];

const memorySessions: Array<{
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  created_at: string;
}> = [];

// ==================== Cryptographic Utilities (Web Crypto API) ====================

/**
 * Generate a cryptographically secure random salt (hex format)
 */
export function generateSalt(bytes = 16): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a cryptographically secure session token
 */
export function generateSessionToken(bytes = 32): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a password using PBKDF2 with SHA-256 and 100,000 iterations
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = encoder.encode(salt);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a plain text password against stored hash and salt
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
  storedSalt: string
): Promise<boolean> {
  const hash = await hashPassword(password, storedSalt);
  return hash === storedHash;
}

// ==================== User & Admin Authentication ====================

/**
 * Find user by email or username
 */
export async function findUserByEmail(email: string) {
  const databaseUrl = getDatabaseUrl();
  const normalizedEmail = email.trim().toLowerCase();

  if (databaseUrl && databaseUrl.trim() !== '') {
    try {
      await initDb();
      const sql = neon(databaseUrl);
      const rows = await sql`
        SELECT id, email, password_hash, password_salt, name, role, created_at, last_login_at
        FROM users
        WHERE LOWER(email) = ${normalizedEmail} OR (role = 'admin' AND ${normalizedEmail} = 'admin')
        LIMIT 1;
      `;
      if (rows && rows.length > 0) {
        return rows[0];
      }
    } catch (err) {
      console.error('Error finding user in Neon DB:', err);
    }
  }

  return memoryUsers.find(
    u => u.email.toLowerCase() === normalizedEmail || (u.role === 'admin' && normalizedEmail === 'admin')
  ) || null;
}

/**
 * Create or seed an admin user if not already existing
 */
export async function seedAdminUser(
  email = 'admin@renix.dev',
  password = 'renix2026',
  name = 'Renix System Admin'
): Promise<AdminUser> {
  const databaseUrl = getDatabaseUrl();
  const normalizedEmail = email.trim().toLowerCase();
  const salt = generateSalt();
  const hash = await hashPassword(password, salt);

  if (databaseUrl && databaseUrl.trim() !== '') {
    try {
      await initDb();
      const sql = neon(databaseUrl);
      
      // Check if user already exists
      const existing = await sql`
        SELECT id, email, name, role FROM users WHERE LOWER(email) = ${normalizedEmail} LIMIT 1;
      `;

      if (existing && existing.length > 0) {
        return existing[0] as AdminUser;
      }

      // Insert new admin user
      const inserted = await sql`
        INSERT INTO users (email, password_hash, password_salt, name, role)
        VALUES (${normalizedEmail}, ${hash}, ${salt}, ${name}, 'admin')
        RETURNING id, email, name, role, created_at;
      `;

      if (inserted && inserted.length > 0) {
        return inserted[0] as AdminUser;
      }
    } catch (err) {
      console.error('Error seeding admin user in Neon DB:', err);
    }
  }

  // Memory fallback
  const existingMem = memoryUsers.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existingMem) {
    return {
      id: existingMem.id,
      email: existingMem.email,
      name: existingMem.name,
      role: existingMem.role,
    };
  }

  const newMemUser = {
    id: 1,
    email: normalizedEmail,
    password_hash: hash,
    password_salt: salt,
    name,
    role: 'admin',
    created_at: new Date().toISOString(),
  };
  memoryUsers.push(newMemUser);

  return {
    id: newMemUser.id,
    email: newMemUser.email,
    name: newMemUser.name,
    role: newMemUser.role,
  };
}

/**
 * Authenticate credentials and create a session
 */
export async function authenticateAndCreateSession(
  identifier: string,
  passcodeOrPassword: string,
  reqInfo?: { userAgent?: string; ipAddress?: string }
): Promise<{ success: boolean; session?: SessionInfo; error?: string }> {
  await initDb();
  
  // Ensure default admin exists
  await seedAdminUser();

  const user = await findUserByEmail(identifier);
  if (!user) {
    return { success: false, error: 'Invalid credentials. User not found.' };
  }

  const isValid = await verifyPassword(
    passcodeOrPassword,
    user.password_hash,
    user.password_salt
  );

  // Also support default admin passcode fallback if matched with env ADMIN_PASSCODE
  const envPasscode = (typeof process !== 'undefined' && process.env?.ADMIN_PASSCODE) || 'renix2026';
  const isEnvPasscodeMatch = passcodeOrPassword.trim() === envPasscode && user.role === 'admin';

  if (!isValid && !isEnvPasscodeMatch) {
    return { success: false, error: 'Invalid email or password.' };
  }

  // Create session (valid for 7 days)
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const databaseUrl = getDatabaseUrl();

  if (databaseUrl && databaseUrl.trim() !== '') {
    try {
      const sql = neon(databaseUrl);

      // Update last login
      await sql`
        UPDATE users SET last_login_at = NOW() WHERE id = ${user.id};
      `;

      // Insert session
      await sql`
        INSERT INTO sessions (user_id, token, expires_at, user_agent, ip_address)
        VALUES (${user.id}, ${token}, ${expiresAt}, ${reqInfo?.userAgent || null}, ${reqInfo?.ipAddress || null});
      `;

      // Clean up old expired sessions
      await sql`DELETE FROM sessions WHERE expires_at < NOW();`;

      return {
        success: true,
        session: {
          token,
          expires_at: expiresAt,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            last_login_at: new Date().toISOString(),
          },
        },
      };
    } catch (err: any) {
      console.error('Error storing session in Neon DB:', err);
    }
  }

  // Memory fallback
  const memSession = {
    id: Date.now(),
    user_id: user.id,
    token,
    expires_at: expiresAt,
    created_at: new Date().toISOString(),
  };
  memorySessions.push(memSession);

  return {
    success: true,
    session: {
      token,
      expires_at: expiresAt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        last_login_at: new Date().toISOString(),
      },
    },
  };
}

/**
 * Validate a session token and return user if active
 */
export async function validateSessionToken(token: string): Promise<AdminUser | null> {
  if (!token || token.trim() === '') return null;

  const databaseUrl = getDatabaseUrl();

  if (databaseUrl && databaseUrl.trim() !== '') {
    try {
      await initDb();
      const sql = neon(databaseUrl);
      const rows = await sql`
        SELECT u.id, u.email, u.name, u.role, u.created_at, u.last_login_at
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token = ${token}
          AND s.expires_at > NOW()
        LIMIT 1;
      `;

      if (rows && rows.length > 0) {
        return rows[0] as AdminUser;
      }
    } catch (err) {
      console.error('Error validating session in Neon DB:', err);
    }
  }

  // Memory fallback
  const memSession = memorySessions.find(
    s => s.token === token && new Date(s.expires_at) > new Date()
  );
  if (memSession) {
    const memUser = memoryUsers.find(u => u.id === memSession.user_id);
    if (memUser) {
      return {
        id: memUser.id,
        email: memUser.email,
        name: memUser.name,
        role: memUser.role,
      };
    }
  }

  return null;
}

/**
 * Revoke/delete a session token
 */
export async function revokeSessionToken(token: string): Promise<boolean> {
  if (!token) return false;
  const databaseUrl = getDatabaseUrl();

  if (databaseUrl && databaseUrl.trim() !== '') {
    try {
      const sql = neon(databaseUrl);
      await sql`DELETE FROM sessions WHERE token = ${token};`;
      return true;
    } catch (err) {
      console.error('Error revoking session in Neon DB:', err);
    }
  }

  const idx = memorySessions.findIndex(s => s.token === token);
  if (idx !== -1) {
    memorySessions.splice(idx, 1);
    return true;
  }
  return false;
}

/**
 * Change user password
 */
export async function changeUserPassword(
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const databaseUrl = getDatabaseUrl();

  if (newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters long.' };
  }

  if (databaseUrl && databaseUrl.trim() !== '') {
    try {
      await initDb();
      const sql = neon(databaseUrl);
      const rows = await sql`
        SELECT id, password_hash, password_salt FROM users WHERE id = ${userId} LIMIT 1;
      `;

      if (!rows || rows.length === 0) {
        return { success: false, error: 'User not found.' };
      }

      const user = rows[0];
      const isCurrentValid = await verifyPassword(
        currentPassword,
        user.password_hash,
        user.password_salt
      );

      if (!isCurrentValid) {
        return { success: false, error: 'Current password is incorrect.' };
      }

      const newSalt = generateSalt();
      const newHash = await hashPassword(newPassword, newSalt);

      await sql`
        UPDATE users
        SET password_hash = ${newHash},
            password_salt = ${newSalt},
            updated_at = NOW()
        WHERE id = ${userId};
      `;

      return { success: true };
    } catch (err: any) {
      console.error('Error updating password in Neon DB:', err);
      return { success: false, error: err?.message || 'Failed to update password' };
    }
  }

  const user = memoryUsers.find(u => u.id === userId);
  if (!user) return { success: false, error: 'User not found in memory store.' };

  const isCurrentValid = await verifyPassword(
    currentPassword,
    user.password_hash,
    user.password_salt
  );
  if (!isCurrentValid) {
    return { success: false, error: 'Current password is incorrect.' };
  }

  const newSalt = generateSalt();
  const newHash = await hashPassword(newPassword, newSalt);
  user.password_hash = newHash;
  user.password_salt = newSalt;

  return { success: true };
}

// ==================== Request Helpers ====================

/**
 * Extract auth token from Request headers or cookies
 */
export function extractAuthToken(request: Request): string | null {
  // Check Authorization header: Bearer <token>
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // Check Cookie header: renix_session=<token>
  const cookieHeader = request.headers.get('cookie') || request.headers.get('Cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith('renix_session=')) {
        return decodeURIComponent(cookie.substring('renix_session='.length));
      }
    }
  }

  return null;
}

/**
 * Helper to verify request is authorized for admin actions
 */
export async function verifyAdminAuth(request: Request): Promise<{
  authorized: boolean;
  user?: AdminUser;
  error?: string;
}> {
  const token = extractAuthToken(request);
  if (!token) {
    return { authorized: false, error: 'Unauthorized: Authentication token is missing.' };
  }

  const user = await validateSessionToken(token);
  if (!user) {
    return { authorized: false, error: 'Unauthorized: Session is invalid or has expired.' };
  }

  return { authorized: true, user };
}
