# Supabase Setup Guide

## Overview

EasyCredit uses Supabase for:
- **Authentication** - User accounts and sessions
- **Database** - PostgreSQL with real-time capabilities
- **Storage** - File storage (if needed)
- **Edge Functions** - Serverless functions (if needed)
- **Row Level Security** - Data isolation and security

## Project Creation

### Step 1: Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in details:
   - **Name:** EasyCredit
   - **Database Password:** Generate strong password (save securely!)
   - **Region:** Choose closest to users
   - **Plan:** Free (for MVP)
4. Wait for project to provision (~2 minutes)

### Step 2: Get API Keys

From Supabase dashboard → Settings → API:

**Anon Key (Public)**
- Safe to use in frontend
- Protected by RLS policies
- Copy for environment variables

**Service Role Key (Secret)**
- **NEVER expose in frontend**
- Only for server-side operations
- Only for trusted backend code
- Store securely in backend env only

**Project URL**
- Your Supabase project URL
- Needed for client initialization

## Environment Variables

Create `.env` file:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# NEVER put service role key in frontend env
# Service role key only in backend/Edge Functions if used
```

Add to `.env.example`:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Add to `.gitignore`:

```
.env
.env.local
```

## Database Schema

### Core Tables

Run these in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- PROFILES TABLE
-- ================================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'superadmin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- BUSINESSES TABLE
-- ================================================================
CREATE TABLE businesses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_businesses_user_id ON businesses(user_id);
CREATE INDEX idx_businesses_updated_at ON businesses(updated_at);

-- ================================================================
-- CUSTOMERS TABLE
-- ================================================================
CREATE TABLE customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES businesses ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_business_id ON customers(business_id);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_updated_at ON customers(updated_at);

-- ================================================================
-- LEDGER_ENTRIES TABLE
-- ================================================================
CREATE TABLE ledger_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES businesses ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'credit_given',
    'payment_received',
    'change_owed',
    'change_returned',
    'adjustment'
  )),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  note TEXT,
  due_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'settled', 'cancelled')),
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('local', 'pending_sync', 'synced', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ledger_entries_business_id ON ledger_entries(business_id);
CREATE INDEX idx_ledger_entries_customer_id ON ledger_entries(customer_id);
CREATE INDEX idx_ledger_entries_type ON ledger_entries(type);
CREATE INDEX idx_ledger_entries_due_date ON ledger_entries(due_date);
CREATE INDEX idx_ledger_entries_status ON ledger_entries(status);
CREATE INDEX idx_ledger_entries_sync_status ON ledger_entries(sync_status);
CREATE INDEX idx_ledger_entries_updated_at ON ledger_entries(updated_at);

-- ================================================================
-- ADMIN_AUDIT_LOGS TABLE
-- ================================================================
CREATE TABLE admin_audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_audit_logs_admin_user_id ON admin_audit_logs(admin_user_id);
CREATE INDEX idx_admin_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX idx_admin_audit_logs_created_at ON admin_audit_logs(created_at);

-- ================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ledger_entries_updated_at BEFORE UPDATE ON ledger_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Row Level Security (RLS)

**Enable RLS on all tables:**

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
```

**Create RLS Policies:**

```sql
-- ================================================================
-- PROFILES POLICIES
-- ================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Superadmins can view all profiles
CREATE POLICY "Superadmins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- ================================================================
-- BUSINESSES POLICIES
-- ================================================================

-- Users can view their own businesses
CREATE POLICY "Users can view own businesses"
  ON businesses FOR SELECT
  USING (user_id = auth.uid());

-- Users can create businesses
CREATE POLICY "Users can create businesses"
  ON businesses FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own businesses
CREATE POLICY "Users can update own businesses"
  ON businesses FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own businesses
CREATE POLICY "Users can delete own businesses"
  ON businesses FOR DELETE
  USING (user_id = auth.uid());

-- Superadmins can view all businesses (read-only for monitoring)
CREATE POLICY "Superadmins can view all businesses"
  ON businesses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- ================================================================
-- CUSTOMERS POLICIES
-- ================================================================

-- Users can view customers in their businesses
CREATE POLICY "Users can view own customers"
  ON customers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = customers.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- Users can create customers in their businesses
CREATE POLICY "Users can create customers"
  ON customers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = customers.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- Users can update customers in their businesses
CREATE POLICY "Users can update own customers"
  ON customers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = customers.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- Users can delete customers in their businesses
CREATE POLICY "Users can delete own customers"
  ON customers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = customers.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- ================================================================
-- LEDGER_ENTRIES POLICIES
-- ================================================================

-- Users can view ledger entries in their businesses
CREATE POLICY "Users can view own ledger entries"
  ON ledger_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = ledger_entries.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- Users can create ledger entries in their businesses
CREATE POLICY "Users can create ledger entries"
  ON ledger_entries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = ledger_entries.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- Users can update ledger entries in their businesses
CREATE POLICY "Users can update own ledger entries"
  ON ledger_entries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = ledger_entries.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- Users can delete ledger entries in their businesses
CREATE POLICY "Users can delete own ledger entries"
  ON ledger_entries FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = ledger_entries.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- ================================================================
-- ADMIN_AUDIT_LOGS POLICIES
-- ================================================================

-- Only superadmins can view audit logs
CREATE POLICY "Superadmins can view audit logs"
  ON admin_audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- Only superadmins can insert audit logs
CREATE POLICY "Superadmins can create audit logs"
  ON admin_audit_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );
```

## Authentication Setup

### Email/Password Auth

In Supabase Dashboard → Authentication → Providers:

1. **Enable Email provider**
2. **Confirm Email:** Enable (recommended for production)
3. **Email Templates:** Customize if desired

### Site URL Configuration

In Supabase Dashboard → Authentication → URL Configuration:

```
Site URL: https://easycredit.app
Redirect URLs:
  - https://easycredit.app/**
  - http://localhost:5173/** (for development)
```

### Session Configuration

In Supabase Dashboard → Authentication → Settings:

- **JWT Expiry:** 3600 seconds (1 hour) - Default
- **Refresh Token Rotation:** Enabled
- **Reuse Interval:** 10 seconds
- **Session Timeout:** Maximum (for PWA long sessions)

**For PWA long-lived sessions:**
Consider increasing JWT expiry or implementing automatic refresh.

## Initial Superadmin Setup

### Method 1: Auto-bootstrap (Recommended)

Create an Edge Function or use Supabase Dashboard SQL:

```sql
-- Set superadmin role for authorized email
UPDATE profiles
SET role = 'superadmin'
WHERE email = 'dr.bennyt.09@gmail.com';
```

### Method 2: Environment-based

Store authorized admin emails in environment variable:

```bash
VITE_ADMIN_EMAILS=dr.bennyt.09@gmail.com,admin@easycredit.app
```

Check in frontend code before rendering `/admin` route.

## Monitoring & Usage

### Enable Realtime (Optional)

If using real-time features:

```sql
-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE ledger_entries;
```

### Database Backups

- **Free Plan:** Daily automatic backups (7 days retention)
- **Download Backup:** Supabase Dashboard → Database → Backups

### Monitor Usage

Check Supabase Dashboard → Settings → Usage:
- Database size
- Auth users
- Storage
- Bandwidth
- Edge Function invocations

Set up alerts when approaching limits.

## Testing RLS Policies

Test RLS policies in SQL Editor:

```sql
-- Test as specific user
SELECT auth.uid(); -- Should return user ID

-- Test policies
SELECT * FROM businesses; -- Should only show user's businesses
SELECT * FROM customers; -- Should only show user's customers
```

Use Supabase Dashboard → SQL Editor → RLS Helper.

## Security Checklist

Before production:

- [ ] RLS enabled on all tables
- [ ] Policies tested and working
- [ ] Service role key never exposed
- [ ] Anon key used correctly in frontend
- [ ] Environment variables secured
- [ ] Email confirmation enabled
- [ ] Site URL configured correctly
- [ ] JWT settings appropriate
- [ ] Audit logging implemented
- [ ] Backups scheduled
- [ ] Usage monitoring active

## Troubleshooting

**Issue: Can't insert/update data**
- Check RLS policies
- Verify auth.uid() matches user_id

**Issue: Unauthorized access**
- Review RLS policies
- Check user authentication
- Verify role assignments

**Issue: Slow queries**
- Add indexes
- Check query plans
- Review table sizes

**Issue: Session expires too quickly**
- Increase JWT expiry
- Implement token refresh
- Check session settings

---

**Next:** Set up [Netlify Deployment](04-netlify-deployment.md)
