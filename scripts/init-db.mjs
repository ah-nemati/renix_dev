import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

// Read .env file manually if process.env.DATABASE_URL is not set
function loadEnv() {
  if (process.env.DATABASE_URL) return;
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.substring(0, eqIdx).trim();
          let val = trimmed.substring(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  } catch (err) {
    console.warn('Could not load .env file:', err.message);
  }
}

loadEnv();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ Error: DATABASE_URL is not set in environment or .env file.');
  process.exit(1);
}

// Web Crypto PBKDF2 Password Hashing for Admin
function generateSalt(bytes = 16) {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password, salt) {
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

async function setupDatabase() {
  console.log('🚀 Connecting to Neon PostgreSQL...');
  const sql = neon(dbUrl);

  try {
    const ping = await sql`SELECT 1 as ping, current_database() as db_name, version() as pg_version;`;
    console.log(`✅ Connected to database: "${ping[0].db_name}" (${ping[0].pg_version.split(' ')[0]} ${ping[0].pg_version.split(' ')[1]})`);

    console.log('\n📦 Creating tables and schemas...');

    // 1. Users Table
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
    console.log('  ✓ Table created: users');

    // 2. Sessions Table
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
    console.log('  ✓ Table created: sessions');

    // 3. Bookings Table
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
    console.log('  ✓ Table created: bookings');

    // 4. Estimates Table
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
    console.log('  ✓ Table created: estimates');

    // 5. Newsletter Subscribers Table
    await sql`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('  ✓ Table created: newsletter_subscribers');

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
    console.log('  ✓ Table created: contact_messages');

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
    console.log('  ✓ Table created: activity_logs');

    // Indexes
    console.log('\n⚡ Creating performance indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at DESC);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_estimates_created ON estimates(created_at DESC);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(LOWER(email));`;
    console.log('  ✓ All indexes verified.');

    // Seed default admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@renix.dev';
    const adminPass = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSCODE || 'renix2026';
    const adminName = 'Renix System Admin';

    console.log(`\n🔐 Seeding Administrator Account (${adminEmail})...`);
    const existingUser = await sql`SELECT id, email FROM users WHERE LOWER(email) = ${adminEmail.toLowerCase()} LIMIT 1;`;

    if (existingUser.length === 0) {
      const salt = generateSalt();
      const hash = await hashPassword(adminPass, salt);
      await sql`
        INSERT INTO users (email, password_hash, password_salt, name, role)
        VALUES (${adminEmail.toLowerCase()}, ${hash}, ${salt}, ${adminName}, 'admin');
      `;
      console.log(`  ✓ Created initial Admin account: ${adminEmail}`);
      console.log(`  ✓ Passcode / Password: ${adminPass}`);
    } else {
      console.log(`  ℹ Admin account already exists (ID: ${existingUser[0].id}).`);
    }

    // Seed initial demo consultation bookings if table is empty
    const existingBookings = await sql`SELECT COUNT(*) as count FROM bookings;`;
    if (Number(existingBookings[0].count) === 0) {
      console.log('\n📝 Seeding initial demo bookings for dashboard preview...');
      await sql`
        INSERT INTO bookings (name, email, company, service, budget, brief, booking_date, booking_time, timezone, status, admin_notes)
        VALUES 
        ('Alex Rivera', 'alex@novapay.io', 'NovaPay Fintech', 'Web & API Development', '$15k - $30k', 'Looking to rebuild our real-time payment dashboard with Next.js and high-frequency webhook pipelines.', (CURRENT_DATE + INTERVAL '2 days'), '02:00 PM', 'UTC', 'confirmed', 'Very promising lead. Sent preliminary NDA and discovery call invite.'),
        ('Dr. Elena Rostova', 'elena@healthsync.ai', 'HealthSync AI', 'AI & Automation', '$30k - $60k', 'We require a HIPAA-compliant RAG pipeline for doctor consultation notes summarization and agentic patient routing.', (CURRENT_DATE + INTERVAL '4 days'), '11:00 AM', 'UTC', 'pending', 'Wants to discuss vector DB options (pgvector vs Pinecone).'),
        ('Liam O''Connor', 'liam@tradestack.co', 'TradeStack Mobile', 'Mobile App Development', '$20k - $40k', 'Cross-platform React Native app with biometric auth, offline charts, and push notifications for order triggers.', (CURRENT_DATE + INTERVAL '5 days'), '04:00 PM', 'UTC', 'completed', 'Project successfully scoped and contract signed.');
      `;
      console.log('  ✓ Seeded demo bookings.');
    }

    // Seed initial demo subscribers if empty
    const existingSubs = await sql`SELECT COUNT(*) as count FROM newsletter_subscribers;`;
    if (Number(existingSubs[0].count) === 0) {
      await sql`
        INSERT INTO newsletter_subscribers (email)
        VALUES ('dev-insights@techfounder.com'), ('sarah.dev@cloudpulse.io')
        ON CONFLICT DO NOTHING;
      `;
      console.log('  ✓ Seeded demo newsletter subscribers.');
    }

    // Seed demo estimates if empty
    const existingEst = await sql`SELECT COUNT(*) as count FROM estimates;`;
    if (Number(existingEst[0].count) === 0) {
      await sql`
        INSERT INTO estimates (project_type, platforms, features, timeline_weeks, min_cost, max_cost, contact_email, status)
        VALUES ('Full-Stack Web App', ARRAY['Web App', 'Admin Dashboard'], ARRAY['Custom Authentication & RBAC', 'Real-Time WebSocket Engine', 'Stripe / LemonSqueezy Payments'], 6, 14000, 22000, 'cto@fintechflow.io', 'in_review');
      `;
      console.log('  ✓ Seeded demo estimate.');
    }

    console.log('\n🎉 Neon Database setup and initialization completed successfully!\n');
  } catch (err) {
    console.error('\n❌ Neon Database Setup Error:', err);
    process.exit(1);
  }
}

setupDatabase();
