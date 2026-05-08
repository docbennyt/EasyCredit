# Superadmin Overview

## What is the Superadmin Area?

The Superadmin area is a protected section of EasyCredit accessible only to authorized system administrators. It provides:

- **User Management** - View and manage all users
- **System Monitoring** - Track app health and usage
- **Usage Guardrails** - Monitor free plan limits
- **Support Tools** - Help users with issues
- **Audit Logs** - Track administrative actions
- **Analytics** - System-wide statistics

## Accessing the Superadmin Area

### URL

The superadmin area is located at:

```
https://easycredit.app/admin
```

### Authentication

**Step 1: Sign in with authorized email**

Only specific email addresses can access the admin area:
- Initial superadmin: `dr.bennyt.09@gmail.com` (or configured email)

**Step 2: Verify role**

After authentication through Supabase Auth, the system checks:
1. Is the user logged in?
2. Does their profile have `role = "superadmin"`?
3. If yes, grant access
4. If no, redirect to regular app

**Step 3: Access granted**

Once verified, you'll see the superadmin dashboard.

## Important Security Notes

### ⚠️ Authentication Requirements

**What we USE:**
- ✅ Supabase Auth for all authentication
- ✅ Hashed passwords (handled by Supabase)
- ✅ Secure session management
- ✅ Role-based access control (RBAC)
- ✅ Row Level Security (RLS) policies

**What we NEVER do:**
- ❌ Store passwords manually
- ❌ Store plaintext passwords
- ❌ Custom password authentication
- ❌ Bypass Supabase Auth
- ❌ Expose service role keys in frontend

### First-Time Admin Setup

**Option 1: Bootstrap (Recommended)**

1. Deploy the app
2. Visit `/admin`
3. Sign in with authorized email via Supabase Auth
4. If email matches allowlist, role is auto-assigned
5. Access granted

**Option 2: Manual Role Assignment**

1. Admin signs up normally
2. Database admin manually sets `role = "superadmin"` in profiles table
3. Admin signs in
4. Access granted

### Admin Role Storage

Admin role is stored in the `profiles` table:

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'user',  -- 'user' or 'superadmin'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Never store:**
- ❌ Passwords (Supabase Auth handles this)
- ❌ Password hashes (Supabase Auth handles this)
- ❌ API keys
- ❌ Service role keys

## Superadmin Capabilities

### 1. User Management

View and manage all system users:

- Total registered users
- New signups (today, this week, this month)
- Active users
- User list with:
  - Email
  - Account created date
  - Last sign-in
  - Number of ventures
  - Number of customers
  - Number of records
- User status (active, suspended - if implemented)

### 2. App Health Monitoring

System-wide statistics:

- Total ventures across all users
- Total customers across all users
- Total credit records
- Total change records
- Total ledger entries
- Sync errors (if applicable)
- Failed operations
- Recent critical logs

### 3. Usage Guardrails

Monitor free plan limits:

**Supabase Free Plan:**
- Database size estimate
- Number of auth users (limit: 50,000)
- Storage usage (limit: 1 GB)
- Bandwidth/egress (limit: 5 GB/month)
- Edge Function invocations (limit: 500,000/month)
- Realtime connections (limit: 200 concurrent)
- API requests estimate

**Netlify Free Plan:**
- Build minutes (limit: 300/month)
- Bandwidth (limit: 100 GB/month)
- Function invocations (limit: 125,000/month)
- Bundle size warnings

### 4. Alerts and Warnings

Automated alerts for:

- "Database records growing quickly"
- "Large user detected (10,000+ records)"
- "High sync failure rate"
- "Storage usage approaching free plan limit"
- "Bundle size exceeds recommended threshold"
- "Too many failed logins"
- "API error spike detected"

### 5. Support Tools

Help users with issues:

- Search users by email
- View user's venture summary
- Check sync status
- Review error logs for specific users
- Access support-relevant metadata
- **Important:** Do NOT expose sensitive customer details unnecessarily

### 6. Audit Logging

Track all admin actions:

- Admin login events
- Role changes
- User suspensions (if implemented)
- Data exports
- Settings changes
- Support access to user data

Each audit log includes:
- Admin user ID
- Action type
- Target (user, venture, etc.)
- Timestamp
- IP address (if tracked)
- Result (success/failure)

## Dashboard Sections

When you access `/admin`, you'll see:

### Overview Panel
- Total users, ventures, customers, records
- Today's new signups
- Active users this week
- System health status

### User Management Panel
- User search and filter
- Recent signups
- Most active users
- Large users (resource consumption)

### System Health Panel
- Database size estimate
- Error rates
- Sync status
- Recent critical events

### Usage Guardrails Panel
- Supabase limits (users, storage, bandwidth)
- Netlify limits (builds, bandwidth, functions)
- Warning indicators
- Projected usage trends

### Recent Activity Panel
- Recent admin actions
- Recent user signups
- Recent errors
- System events

## Best Practices for Superadmins

### ✅ DO:

**Monitor regularly**
- Check dashboard weekly
- Review usage trends monthly
- Act on alerts promptly
- Plan for scaling before limits hit

**Protect access**
- Never share superadmin credentials
- Log out when done
- Use strong passwords
- Enable 2FA (when available)

**Document actions**
- All admin actions are logged
- Add notes for important decisions
- Keep track of support cases
- Document policy changes

**Respect privacy**
- Only access user data when needed for support
- Don't casually browse private records
- Follow data protection principles
- Minimize exposure of sensitive info

### ❌ DON'T:

**Security risks**
- Don't share login credentials
- Don't expose service role keys
- Don't bypass RLS policies manually
- Don't access production database directly unless emergency

**Privacy violations**
- Don't share user data publicly
- Don't access records without reason
- Don't discuss user details casually
- Don't export data unnecessarily

**Operational risks**
- Don't make schema changes without testing
- Don't delete users without backup
- Don't ignore usage warnings
- Don't disable security features

## Emergency Procedures

### Suspected Security Breach

1. Immediately change admin password
2. Review audit logs for unauthorized access
3. Check for suspicious user activity
4. Disable compromised accounts if needed
5. Review RLS policies
6. Notify affected users if required
7. Document the incident

### Approaching Free Plan Limits

1. Identify largest users/contributors
2. Contact heavy users about usage
3. Consider optimization strategies
4. Plan migration to paid plan if needed
5. Implement rate limiting if appropriate
6. Archive old data if possible

### System Downtime

1. Check Supabase status
2. Check Netlify status
3. Review error logs
4. Check recent deployments
5. Rollback if needed
6. Communicate with users
7. Document the issue and resolution

## Admin Rotation Policy

If additional admins are added later:

1. **Onboarding**
   - Create Supabase Auth account
   - Assign `role = "superadmin"` in profiles
   - Provide admin documentation
   - Review security policies
   - Enable audit logging

2. **Offboarding**
   - Remove `superadmin` role
   - Revoke all access
   - Log the action
   - Review their audit history
   - Update admin contact list

## Support Resources

- **Supabase Dashboard:** [app.supabase.com](https://app.supabase.com)
- **Netlify Dashboard:** [app.netlify.com](https://app.netlify.com)
- **Documentation:** This docs folder
- **Audit Logs:** Available in `/admin/audit`
- **Support Email:** support@easycredit.app

---

**Remember:** With great power comes great responsibility. Use admin access ethically, securely, and only when necessary.
