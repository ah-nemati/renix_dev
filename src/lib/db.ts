import { neon } from '@neondatabase/serverless';

export interface BookingRecord {
  id: number | string;
  name: string;
  email: string;
  company?: string;
  service?: string;
  budget?: string;
  brief: string;
  booking_date: string;
  booking_time: string;
  timezone?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  admin_notes?: string;
  created_at: string;
}

export interface EstimateRecord {
  id: number | string;
  project_type: string;
  platforms: string[];
  features: string[];
  timeline_weeks: number;
  min_cost: number;
  max_cost: number;
  contact_email?: string;
  status: string;
  created_at: string;
}

export interface SubscriberRecord {
  id: number | string;
  email: string;
  status?: string;
  created_at: string;
}

export interface ContactMessageRecord {
  id: number | string;
  name?: string;
  email: string;
  subject?: string;
  message: string;
  status?: string;
  created_at: string;
}

export interface ActivityLogRecord {
  id: number | string;
  user_id?: number | null;
  action: string;
  details?: any;
  created_at: string;
}

// In-memory store fallback when DATABASE_URL is not provided
const memoryStore = {
  bookings: [
    {
      id: 1,
      name: "Alex Rivera",
      email: "alex@novapay.io",
      company: "NovaPay Fintech",
      service: "Web & API Development",
      budget: "$15k - $30k",
      brief: "Looking to rebuild our real-time payment dashboard with Next.js and high-frequency webhook pipelines.",
      booking_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      booking_time: "02:00 PM",
      timezone: "UTC",
      status: "confirmed" as const,
      admin_notes: "Very promising lead. Sent preliminary NDA and discovery call invite.",
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 2,
      name: "Dr. Elena Rostova",
      email: "elena@healthsync.ai",
      company: "HealthSync AI",
      service: "AI & Automation",
      budget: "$30k - $60k",
      brief: "We require a HIPAA-compliant RAG pipeline for doctor consultation notes summarization and agentic patient routing.",
      booking_date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
      booking_time: "11:00 AM",
      timezone: "UTC",
      status: "pending" as const,
      admin_notes: "Wants to discuss vector DB options (pgvector vs Pinecone).",
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 3,
      name: "Liam O'Connor",
      email: "liam@tradestack.co",
      company: "TradeStack Mobile",
      service: "Mobile App Development",
      budget: "$20k - $40k",
      brief: "Cross-platform React Native app with biometric auth, offline charts, and push notifications for order triggers.",
      booking_date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      booking_time: "04:00 PM",
      timezone: "UTC",
      status: "completed" as const,
      admin_notes: "Project successfully scoped and contract signed.",
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    }
  ] as BookingRecord[],
  estimates: [
    {
      id: 1,
      project_type: "Full-Stack Web App",
      platforms: ["Web App", "Admin Dashboard"],
      features: ["Custom Authentication & RBAC", "Real-Time WebSocket Engine", "Stripe / LemonSqueezy Payments"],
      timeline_weeks: 6,
      min_cost: 14000,
      max_cost: 22000,
      contact_email: "cto@fintechflow.io",
      status: "in_review",
      created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    }
  ] as EstimateRecord[],
  subscribers: [
    { id: 1, email: "dev-insights@techfounder.com", status: "active", created_at: new Date().toISOString() },
    { id: 2, email: "sarah.dev@cloudpulse.io", status: "active", created_at: new Date(Date.now() - 86400000 * 2).toISOString() }
  ] as SubscriberRecord[],
  activityLogs: [] as ActivityLogRecord[],
};

export function getDatabaseUrl(): string | undefined {
  if (typeof process !== 'undefined' && process.env?.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env?.DATABASE_URL) {
    // @ts-ignore
    return import.meta.env.DATABASE_URL;
  }
  return undefined;
}

let isInitialized = false;

/**
 * Initialize all database tables and indexes in Neon PostgreSQL
 */
export async function initDb(): Promise<{ isConnected: boolean; error?: string }> {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl || databaseUrl.trim() === '') {
    return { isConnected: false, error: 'DATABASE_URL is not set. Using local memory store.' };
  }

  if (isInitialized) {
    return { isConnected: true };
  }

  try {
    const sql = neon(databaseUrl);

    // 1. Users Table (Admin & Team Authentication)
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        password_salt TEXT NOT NULL,
        name VARCHAR(255) NOT NULL DEFAULT 'Admin',
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        last_login_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 2. Auth Sessions Table
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        user_agent TEXT,
        ip_address TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 3. Consultation Bookings Table
    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        company TEXT,
        service TEXT,
        budget TEXT,
        brief TEXT NOT NULL,
        booking_date DATE NOT NULL,
        booking_time TEXT NOT NULL,
        timezone TEXT DEFAULT 'UTC',
        status VARCHAR(20) DEFAULT 'pending',
        admin_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 4. Project Estimates Table
    await sql`
      CREATE TABLE IF NOT EXISTS estimates (
        id SERIAL PRIMARY KEY,
        project_type TEXT NOT NULL,
        platforms TEXT[] NOT NULL,
        features TEXT[] NOT NULL,
        timeline_weeks INT DEFAULT 4,
        min_cost INT DEFAULT 0,
        max_cost INT DEFAULT 0,
        contact_email TEXT,
        status VARCHAR(20) DEFAULT 'new',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 5. Newsletter Subscribers Table
    await sql`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 6. Contact Messages Table
    await sql`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'unread',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 7. Activity Logs Table
    await sql`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Performance Indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at DESC);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_estimates_created ON estimates(created_at DESC);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(LOWER(email));`;

    isInitialized = true;
    return { isConnected: true };
  } catch (err: any) {
    console.error('Failed to initialize Neon database schema:', err);
    return { isConnected: false, error: err?.message || 'Database connection failed' };
  }
}

// ==================== Bookings Management ====================

export async function createBooking(data: {
  name: string;
  email: string;
  company?: string;
  service?: string;
  budget?: string;
  brief: string;
  date: string;
  time: string;
  timezone?: string;
}): Promise<BookingRecord> {
  const databaseUrl = getDatabaseUrl();

  if (databaseUrl && databaseUrl.trim() !== '') {
    try {
      await initDb();
      const sql = neon(databaseUrl);
      const rows = await sql`
        INSERT INTO bookings (name, email, company, service, budget, brief, booking_date, booking_time, timezone, status)
        VALUES (${data.name}, ${data.email}, ${data.company || null}, ${data.service || 'Web Development'}, ${data.budget || 'Flexible'}, ${data.brief}, ${data.date}, ${data.time}, ${data.timezone || 'UTC'}, 'pending')
        RETURNING id, name, email, company, service, budget, brief, booking_date::text, booking_time, timezone, status, admin_notes, created_at::text;
      `;

      if (rows && rows.length > 0) {
        return rows[0] as BookingRecord;
      }
    } catch (err) {
      console.error('Neon DB insert error, falling back to memory store:', err);
    }
  }

  // Fallback to memory store
  const newBooking: BookingRecord = {
    id: Date.now(),
    name: data.name,
    email: data.email,
    company: data.company || '',
    service: data.service || 'Web Development',
    budget: data.budget || 'Flexible',
    brief: data.brief,
    booking_date: data.date,
    booking_time: data.time,
    timezone: data.timezone || 'UTC',
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  memoryStore.bookings.unshift(newBooking);
  return newBooking;
}

export async function getBookings(filters?: {
  status?: string;
  search?: string;
}): Promise<BookingRecord[]> {
  const databaseUrl = getDatabaseUrl();

  if (databaseUrl && databaseUrl.trim() !== '') {
    try {
      await initDb();
      const sql = neon(databaseUrl);
      let query;

      if (filters?.status && filters.status !== 'all') {
        if (filters?.search && filters.search.trim() !== '') {
          const searchPattern = `%${filters.search.trim()}%`;
          query = await sql`
            SELECT id, name, email, company, service, budget, brief, booking_date::text, booking_time, timezone, status, admin_notes, created_at::text
            FROM bookings
            WHERE status = ${filters.status}
              AND (name ILIKE ${searchPattern} OR email ILIKE ${searchPattern} OR company ILIKE ${searchPattern} OR brief ILIKE ${searchPattern})
            ORDER BY created_at DESC;
          `;
        } else {
          query = await sql`
            SELECT id, name, email, company, service, budget, brief, booking_date::text, booking_time, timezone, status, admin_notes, created_at::text
            FROM bookings
            WHERE status = ${filters.status}
            ORDER BY created_at DESC;
          `;
        }
      } else {
        if (filters?.search && filters.search.trim() !== '') {
          const searchPattern = `%${filters.search.trim()}%`;
          query = await sql`
            SELECT id, name, email, company, service, budget, brief, booking_date::text, booking_time, timezone, status, admin_notes, created_at::text
            FROM bookings
            WHERE name ILIKE ${searchPattern} OR email ILIKE ${searchPattern} OR company ILIKE ${searchPattern} OR brief ILIKE ${searchPattern}
            ORDER BY created_at DESC;
          `;
        } else {
          query = await sql`
            SELECT id, name, email, company, service, budget, brief, booking_date::text, booking_time, timezone, status, admin_notes, created_at::text
            FROM bookings
            ORDER BY created_at DESC;
          `;
        }
      }

      return query as BookingRecord[];
    } catch (err) {
      console.error('Neon DB query error, using memory fallback:', err);
    }
  }

  let result = [...memoryStore.bookings];
  if (filters?.status && filters.status !== 'all') {
    result = result.filter(b => b.status === filters.status);
  }
  if (filters?.search && filters.search.trim() !== '') {
    const s = filters.search.toLowerCase();
    result = result.filter(b =>
      b.name.toLowerCase().includes(s) ||
      b.email.toLowerCase().includes(s) ||
      (b.company && b.company.toLowerCase().includes(s)) ||
      b.brief.toLowerCase().includes(s)
    );
  }
  return result;
}

export async function updateBookingStatus(
  id: number | string,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  adminNotes?: string
): Promise<BookingRecord | null> {
  const databaseUrl = getDatabaseUrl();

  if (databaseUrl && databaseUrl.trim() !== '') {
    try {
      await initDb();
      const sql = neon(databaseUrl);
      const rows = await sql`
        UPDATE bookings
        SET status = ${status},
            admin_notes = COALESCE(${adminNotes ?? null}, admin_notes),
            updated_at = NOW()
        WHERE id = ${Number(id)}
        RETURNING id, name, email, company, service, budget, brief, booking_date::text, booking_time, timezone, status, admin_notes, created_at::text;
      `;

      if (rows && rows.length > 0) {
        return rows[0] as BookingRecord;
      }
    } catch (err) {
      console.error('Neon DB update error:', err);
    }
  }

  const idx = memoryStore.bookings.findIndex(b => String(b.id) === String(id));
  if (idx !== -1) {
    memoryStore.bookings[idx].status = status;
    if (adminNotes !== undefined) {
      memoryStore.bookings[idx].admin_notes = adminNotes;
    }
    return memoryStore.bookings[idx];
  }
  return null;
}

export async function deleteBooking(id: number | string): Promise<boolean> {
  const databaseUrl = getDatabaseUrl();

  if (databaseUrl && databaseUrl.trim() !== '') {
    try {
      await initDb();
      const sql = neon(databaseUrl);
      await sql`DELETE FROM bookings WHERE id = ${Number(id)};`;
      return true;
    } catch (err) {
      console.error('Neon DB delete error:', err);
    }
  }

  const prevLen = memoryStore.bookings.length;
  memoryStore.bookings = memoryStore.bookings.filter(b => String(b.id) !== String(id));
  return memoryStore.bookings.length < prevLen;
}

// ==================== Estimates Management ====================

export async function saveEstimate(data: {
  project_type: string;
  platforms: string[];
  features: string[];
  timeline_weeks: number;
  min_cost: number;
  max_cost: number;
  contact_email?: string;
}): Promise<EstimateRecord> {
  const databaseUrl = getDatabaseUrl();

  if (databaseUrl && databaseUrl.trim() !== '') {
    try {
      await initDb();
      const sql = neon(databaseUrl);
      const rows = await sql`
        INSERT INTO estimates (project_type, platforms, features, timeline_weeks, min_cost, max_cost, contact_email)
        VALUES (${data.project_type}, ${data.platforms}, ${data.features}, ${data.timeline_weeks}, ${data.min_cost}, ${data.max_cost}, ${data.contact_email || null})
        RETURNING id, project_type, platforms, features, timeline_weeks, min_cost, max_cost, contact_email, status, created_at::text;
      `;
      if (rows && rows.length > 0) {
        return rows[0] as EstimateRecord;
      }
    } catch (err) {
      console.error('Neon DB estimate error:', err);
    }
  }

  const newEst: EstimateRecord = {
    id: Date.now(),
    project_type: data.project_type,
    platforms: data.platforms,
    features: data.features,
    timeline_weeks: data.timeline_weeks,
    min_cost: data.min_cost,
    max_cost: data.max_cost,
    contact_email: data.contact_email,
    status: 'new',
    created_at: new Date().toISOString(),
  };
  memoryStore.estimates.unshift(newEst);
  return newEst;
}

export async function getEstimates(): Promise<EstimateRecord[]> {
  const databaseUrl = getDatabaseUrl();

  if (databaseUrl && databaseUrl.trim() !== '') {
    try {
      await initDb();
      const sql = neon(databaseUrl);
      const rows = await sql`
        SELECT id, project_type, platforms, features, timeline_weeks, min_cost, max_cost, contact_email, status, created_at::text
        FROM estimates
        ORDER BY created_at DESC;
      `;
      return rows as EstimateRecord[];
    } catch (err) {
      console.error('Neon DB getEstimates error:', err);
    }
  }

  return memoryStore.estimates;
}

export async function deleteEstimate(id: number | string): Promise<boolean> {
  const databaseUrl = getDatabaseUrl();

  if (databaseUrl && databaseUrl.trim() !== '') {
    try {
      await initDb();
      const sql = neon(databaseUrl);
      await sql`DELETE FROM estimates WHERE id = ${Number(id)};`;
      return true;
    } catch (err) {
      console.error('Neon DB delete estimate error:', err);
    }
  }

  const prevLen = memoryStore.estimates.length;
  memoryStore.estimates = memoryStore.estimates.filter(e => String(e.id) !== String(id));
  return memoryStore.estimates.length < prevLen;
}

// ==================== Newsletter Subscribers ====================

export async function saveSubscriber(email: string): Promise<{ success: boolean; message: string }> {
  const databaseUrl = getDatabaseUrl();

  if (databaseUrl && databaseUrl.trim() !== '') {
    try {
      await initDb();
      const sql = neon(databaseUrl);
      await sql`
        INSERT INTO newsletter_subscribers (email)
        VALUES (${email})
        ON CONFLICT (email) DO NOTHING;
      `;
      return { success: true, message: 'Subscribed to tech insights successfully.' };
    } catch (err: any) {
      console.error('Neon DB newsletter error:', err);
      return { success: false, message: err?.message || 'Failed to subscribe' };
    }
  }

  if (!memoryStore.subscribers.some(s => s.email === email)) {
    memoryStore.subscribers.unshift({ id: Date.now(), email, status: 'active', created_at: new Date().toISOString() });
  }
  return { success: true, message: 'Subscribed successfully (local mode).' };
}

export async function getSubscribers(): Promise<SubscriberRecord[]> {
  const databaseUrl = getDatabaseUrl();

  if (databaseUrl && databaseUrl.trim() !== '') {
    try {
      await initDb();
      const sql = neon(databaseUrl);
      const rows = await sql`
        SELECT id, email, status, created_at::text
        FROM newsletter_subscribers
        ORDER BY created_at DESC;
      `;
      return rows as SubscriberRecord[];
    } catch (err) {
      console.error('Neon DB getSubscribers error:', err);
    }
  }

  return memoryStore.subscribers;
}

export async function deleteSubscriber(id: number | string): Promise<boolean> {
  const databaseUrl = getDatabaseUrl();

  if (databaseUrl && databaseUrl.trim() !== '') {
    try {
      await initDb();
      const sql = neon(databaseUrl);
      await sql`DELETE FROM newsletter_subscribers WHERE id = ${Number(id)};`;
      return true;
    } catch (err) {
      console.error('Neon DB delete subscriber error:', err);
    }
  }

  const prevLen = memoryStore.subscribers.length;
  memoryStore.subscribers = memoryStore.subscribers.filter(s => String(s.id) !== String(id));
  return memoryStore.subscribers.length < prevLen;
}

// ==================== Health & Diagnostics ====================

export async function getDbHealth(): Promise<{
  connected: boolean;
  driver: 'Neon Serverless Postgres' | 'Memory / Dev Fallback';
  latencyMs?: number;
  totalBookings: number;
  totalEstimates: number;
  totalSubscribers: number;
  totalUsers?: number;
  activeSessions?: number;
  databaseHost?: string;
  pgVersion?: string;
  error?: string;
}> {
  const databaseUrl = getDatabaseUrl();

  if (databaseUrl && databaseUrl.trim() !== '') {
    try {
      await initDb();
      const startTime = Date.now();
      const sql = neon(databaseUrl);
      const ping = await sql`SELECT 1 as ping, current_database() as db_name, version() as pg_version, NOW() as server_time;`;
      const latencyMs = Date.now() - startTime;

      let host = 'ep-***.neon.tech';
      try {
        const u = new URL(databaseUrl);
        host = u.host;
      } catch {}

      const [bCount, eCount, sCount, uCount, sessCount] = await Promise.all([
        sql`SELECT COUNT(*) as count FROM bookings;`,
        sql`SELECT COUNT(*) as count FROM estimates;`,
        sql`SELECT COUNT(*) as count FROM newsletter_subscribers;`,
        sql`SELECT COUNT(*) as count FROM users;`,
        sql`SELECT COUNT(*) as count FROM sessions WHERE expires_at > NOW();`,
      ]);

      return {
        connected: true,
        driver: 'Neon Serverless Postgres',
        latencyMs,
        databaseHost: host,
        pgVersion: ping[0]?.pg_version?.split(' ')?.[1] || '18.x',
        totalBookings: Number(bCount[0]?.count || 0),
        totalEstimates: Number(eCount[0]?.count || 0),
        totalSubscribers: Number(sCount[0]?.count || 0),
        totalUsers: Number(uCount[0]?.count || 0),
        activeSessions: Number(sessCount[0]?.count || 0),
      };
    } catch (err: any) {
      return {
        connected: false,
        driver: 'Neon Serverless Postgres',
        error: err?.message || 'Connection failed',
        totalBookings: memoryStore.bookings.length,
        totalEstimates: memoryStore.estimates.length,
        totalSubscribers: memoryStore.subscribers.length,
      };
    }
  }

  return {
    connected: true,
    driver: 'Memory / Dev Fallback',
    latencyMs: 1,
    totalBookings: memoryStore.bookings.length,
    totalEstimates: memoryStore.estimates.length,
    totalSubscribers: memoryStore.subscribers.length,
    totalUsers: 1,
    activeSessions: 1,
  };
}
