# Release Checklist

## Pre-Deployment Checklist

Complete all items before deploying to production.

### 🔐 Authentication & Security

- [ ] Supabase Auth configured and tested
- [ ] Email confirmation enabled
- [ ] Site URL configured in Supabase
- [ ] Redirect URLs configured
- [ ] JWT expiry settings appropriate
- [ ] RLS enabled on all tables
- [ ] RLS policies tested and working
- [ ] Service role key NEVER exposed in frontend
- [ ] Anon key used correctly
- [ ] Environment variables secured
- [ ] `.env` in `.gitignore`
- [ ] No hardcoded secrets in code
- [ ] Password reset flow tested
- [ ] Session persistence working
- [ ] Logout functionality working

### 👤 User Authentication Flow

- [ ] Login page is first screen (not onboarding)
- [ ] Onboarding only shown to new signups
- [ ] Returning users go directly to dashboard
- [ ] PWA sessions persist correctly
- [ ] Auto-login working for PWA users
- [ ] Token refresh implemented
- [ ] Session expiry handled gracefully
- [ ] Re-authentication flow clear

### 👨‍💼 Superadmin Area

- [ ] `/admin` route protected
- [ ] Only superadmin role can access
- [ ] Initial admin email configured
- [ ] Admin role stored in profiles table
- [ ] Admin cannot be set manually by users
- [ ] RLS prevents non-admins from accessing admin data
- [ ] Audit logging implemented
- [ ] Admin actions logged correctly
- [ ] User management working
- [ ] System stats displaying
- [ ] Usage monitoring active
- [ ] Normal users cannot access `/admin`

### 📊 Data Model & Database

- [ ] All tables created
- [ ] Indexes added for performance
- [ ] Foreign keys configured
- [ ] Cascade deletes working correctly
- [ ] Updated_at triggers working
- [ ] Default values set appropriately
- [ ] Constraints validated
- [ ] Test data can be added/deleted
- [ ] User data isolation verified
- [ ] No cross-user data leaks

### 💰 Business Logic

- [ ] Balance calculations correct
- [ ] Credit given increases balance
- [ ] Payment received decreases balance
- [ ] Change owed creates negative balance
- [ ] Change returned moves toward zero
- [ ] Dashboard metrics accurate
- [ ] Collection rate formula correct
- [ ] Customer risk scoring working
- [ ] Cashflow calculations correct
- [ ] Due date logic working
- [ ] Overdue detection accurate

### 📱 PWA Implementation

- [ ] `manifest.json` configured
- [ ] App name set correctly
- [ ] Icons created (192x192, 512x512)
- [ ] Theme color set
- [ ] Background color set
- [ ] Service worker registered
- [ ] Offline mode working
- [ ] Cache strategy implemented
- [ ] Install prompt showing
- [ ] Install prompt dismissible
- [ ] Dismissal state persisted
- [ ] App installs on Android
- [ ] App installs on iOS (Safari)
- [ ] App installs on desktop

### 🔌 Offline Functionality

- [ ] App loads offline after first visit
- [ ] Dashboard works offline
- [ ] Customers page works offline
- [ ] Records can be added offline
- [ ] Local database (IndexedDB) working
- [ ] Sync status indicator visible
- [ ] Online/offline status shown
- [ ] Data syncs when connection returns
- [ ] No data loss in offline mode
- [ ] Graceful degradation for online-only features

### 📞 Phone Integration

- [ ] `tel:` links working
- [ ] Call button triggers phone app on mobile
- [ ] Copy number button working
- [ ] Clipboard API permissions handled
- [ ] "No phone saved" state shown
- [ ] Phone numbers formatted properly

### 🎨 UI/UX

- [ ] Mobile responsive (tested on real devices)
- [ ] Touch targets 48px minimum
- [ ] Text readable on small screens
- [ ] No horizontal scrolling
- [ ] Forms accessible
- [ ] Error states friendly
- [ ] Loading states shown
- [ ] Empty states helpful
- [ ] Success messages clear
- [ ] Navigation intuitive
- [ ] Colors accessible (contrast)
- [ ] Icons meaningful

### 🧪 Testing

- [ ] Login/logout flow
- [ ] Sign up flow
- [ ] Password reset flow
- [ ] Create venture
- [ ] Add customer
- [ ] Add credit record
- [ ] Add payment record
- [ ] Add change owed record
- [ ] Add change returned record
- [ ] Customer balance updates correctly
- [ ] Dashboard metrics update
- [ ] Risk scoring calculates
- [ ] Cashflow chart renders
- [ ] Action list generates
- [ ] Search customers works
- [ ] Filter customers works
- [ ] Sort customers works
- [ ] Due date warnings appear
- [ ] Overdue alerts show
- [ ] Phone links work on mobile
- [ ] Copy number works
- [ ] Offline mode tested
- [ ] PWA install tested
- [ ] Admin access tested (authorized)
- [ ] Admin blocked (unauthorized)

### 🏗️ Build & Deployment

- [ ] Production build succeeds
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] No console warnings (critical ones fixed)
- [ ] Bundle size reasonable (<1MB gzipped)
- [ ] Environment variables configured in Netlify
- [ ] Supabase keys added to Netlify
- [ ] Build command correct
- [ ] Publish directory correct
- [ ] Redirect rules for SPA routing
- [ ] Security headers configured
- [ ] Custom domain configured (if applicable)
- [ ] HTTPS working
- [ ] DNS configured correctly

### 📦 Netlify Configuration

**File: `netlify.toml`**

- [ ] Build settings configured
- [ ] Redirect rules added
- [ ] Headers configured
- [ ] Environment variables set

**Example `netlify.toml`:**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"

[[headers]]
  for = "/manifest.json"
  [headers.values]
    Content-Type = "application/manifest+json"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
    Service-Worker-Allowed = "/"
```

### 🔒 Security Headers

- [ ] X-Frame-Options set
- [ ] X-Content-Type-Options set
- [ ] Referrer-Policy set
- [ ] Permissions-Policy set (if applicable)
- [ ] CSP considered (if implemented)

### 📈 Monitoring & Analytics

- [ ] Error tracking configured (planned)
- [ ] Usage analytics set up (planned)
- [ ] Supabase usage monitoring
- [ ] Netlify usage monitoring
- [ ] Admin dashboard shows stats
- [ ] Free plan guardrails active

### 🗄️ Backup & Recovery

- [ ] Supabase automatic backups enabled
- [ ] Backup schedule understood (daily on free plan)
- [ ] Backup retention period known (7 days on free plan)
- [ ] Data export tested
- [ ] Recovery procedure documented
- [ ] Disaster recovery plan in place

### 📄 Documentation

- [ ] User guides complete
- [ ] Admin guides complete
- [ ] Developer guides complete
- [ ] API documentation (if applicable)
- [ ] FAQ updated
- [ ] Known limitations documented
- [ ] Privacy policy page (planned)
- [ ] Terms of service page (planned)

### ⚠️ Known Limitations Documented

- [ ] MVP limitations clear
- [ ] Free plan limits documented
- [ ] Browser compatibility documented
- [ ] Offline limitations clear
- [ ] Future features noted

### 🎯 Pre-Launch Final Checks

**Critical Path Test:**

1. [ ] User signs up successfully
2. [ ] User verifies email (if required)
3. [ ] User completes onboarding
4. [ ] User creates first venture
5. [ ] User adds first customer
6. [ ] User records first credit
7. [ ] Dashboard shows correct balance
8. [ ] User can log out
9. [ ] User can log back in
10. [ ] Data persists correctly
11. [ ] PWA installs correctly
12. [ ] User stays logged in after install
13. [ ] Offline mode works
14. [ ] Admin can access `/admin`
15. [ ] Normal user cannot access `/admin`

**Performance:**

- [ ] Initial load <3 seconds
- [ ] Subsequent loads <1 second (PWA)
- [ ] Dashboard renders quickly
- [ ] Charts render without lag
- [ ] Form submissions responsive
- [ ] No janky animations
- [ ] Mobile performance acceptable

**Cross-Browser:**

- [ ] Chrome (desktop)
- [ ] Chrome (Android)
- [ ] Safari (iOS)
- [ ] Safari (macOS)
- [ ] Edge (Windows)
- [ ] Firefox (desktop)

**Device Testing:**

- [ ] iPhone 12+ (or similar)
- [ ] Android phone (recent)
- [ ] iPad/tablet
- [ ] Desktop 1920x1080
- [ ] Desktop 1366x768
- [ ] Small phone (<375px width)

## Post-Deployment Checklist

After deployment, verify:

### Immediate Checks (First Hour)

- [ ] Site accessible at production URL
- [ ] HTTPS working
- [ ] PWA install prompt appears
- [ ] Can sign up new account
- [ ] Can log in existing account
- [ ] Data saves correctly
- [ ] Metrics calculate correctly
- [ ] No JavaScript errors in console
- [ ] Service worker registered
- [ ] Offline mode works

### First Day Checks

- [ ] Monitor error logs
- [ ] Check Supabase usage
- [ ] Check Netlify bandwidth
- [ ] Review user signups (if any)
- [ ] Test forgot password flow
- [ ] Verify email delivery
- [ ] Check mobile experience
- [ ] Monitor performance metrics

### First Week Checks

- [ ] Review error rates
- [ ] Check database size growth
- [ ] Monitor API usage
- [ ] Review user feedback
- [ ] Check analytics data
- [ ] Verify backups running
- [ ] Review admin audit logs
- [ ] Check for abuse/spam signups

## Emergency Rollback Plan

If critical issues found:

1. **Immediate:**
   - Netlify → Deploys → Click previous deploy → Publish
   - Updates rollback instantly

2. **Database Issues:**
   - Supabase → Database → Backups → Restore
   - Coordinate with Netlify rollback

3. **Communication:**
   - Update status page (if exists)
   - Email active users (if list exists)
   - Post incident report

## Launch Communication

### Internal Team

- [ ] Deployment time scheduled
- [ ] Team notified
- [ ] Monitoring assigned
- [ ] Support ready
- [ ] Rollback plan reviewed

### Users (if applicable)

- [ ] Announcement prepared
- [ ] Feature highlights ready
- [ ] Support email active
- [ ] FAQ updated
- [ ] Onboarding materials ready

## Post-Launch Monitoring

**Daily (First Week):**
- Error rates
- Sign-up funnel
- User retention
- Performance metrics
- Database growth
- Support tickets

**Weekly:**
- Usage trends
- Feature adoption
- Free plan utilization
- Performance trends
- User feedback themes

**Monthly:**
- Plan upgrade assessment
- Feature roadmap review
- Infrastructure optimization
- Documentation updates

---

## Sign-Off

Before launching, confirm:

- [ ] **Developer:** All features implemented and tested
- [ ] **Security:** Authentication and RLS verified
- [ ] **Admin:** Monitoring and tools ready
- [ ] **Support:** Documentation complete and support ready
- [ ] **Founder:** Product ready for users

**Deployment Date:** _______________

**Deployed By:** _______________

**Production URL:** _______________

**Admin Access:** _______________

---

**Ready to launch?** Follow this checklist systematically. Don't skip steps!

**After launch:** Monitor closely for the first 48 hours.
