# EasyCredit - Technical Architecture

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    EasyCredit PWA                       │
│              (Offline-First Architecture)               │
└─────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
        ┌───▼───┐      ┌───▼───┐      ┌───▼───┐
        │  UI   │      │ Logic │      │ Data  │
        │ Layer │      │ Layer │      │ Layer │
        └───┬───┘      └───┬───┘      └───┬───┘
            │              │              │
    ┌───────┴───────┐  ┌──┴──┐      ┌───┴────┐
    │   Components  │  │ Lib │      │ Dexie  │
    │     Pages     │  │Calc │      │  DB    │
    └───────────────┘  └─────┘      └────────┘
```

---

## 📁 Project Structure

```
easycredit/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   ├── icon-192.png          # App icon
│   └── icon-512.png          # App icon
│
├── src/
│   ├── components/           # 15 reusable components
│   │   ├── AppShell.tsx     # Layout wrapper
│   │   ├── BottomNav.tsx    # Bottom navigation (5 items)
│   │   ├── TopBar.tsx       # Top bar with business switcher
│   │   ├── Button.tsx       # Button with variants
│   │   ├── Input.tsx        # Form input
│   │   ├── Modal.tsx        # Modal dialog
│   │   ├── MetricCard.tsx   # Dashboard metrics
│   │   ├── CustomerCard.tsx # Customer list item
│   │   ├── LedgerEntryRow.tsx # Transaction row
│   │   ├── StatusBadge.tsx  # Status indicators
│   │   ├── EmptyState.tsx   # Empty state handler
│   │   └── LoadingSpinner.tsx # Loading indicator
│   │
│   ├── pages/               # 9 page components
│   │   ├── OnboardingPage.tsx      # First-time setup
│   │   ├── DashboardPage.tsx       # Home screen
│   │   ├── CustomersPage.tsx       # Customer list
│   │   ├── CustomerDetailPage.tsx  # Customer detail
│   │   ├── AddRecordPage.tsx       # Add transaction
│   │   ├── CollectionsPage.tsx     # Credit book
│   │   ├── ChangePage.tsx          # Change book
│   │   ├── BusinessSwitcherPage.tsx # Business switcher
│   │   └── SettingsPage.tsx        # Settings
│   │
│   ├── services/            # Data layer (7 services)
│   │   ├── db.ts           # Dexie database setup
│   │   ├── businessService.ts    # Business CRUD
│   │   ├── customerService.ts    # Customer CRUD
│   │   ├── ledgerService.ts      # Ledger CRUD
│   │   ├── settingsService.ts    # Settings persistence
│   │   ├── seedService.ts        # Demo data
│   │   └── syncService.ts        # Future cloud sync
│   │
│   ├── lib/                 # Utilities (4 modules)
│   │   ├── calculations.ts # Balance & totals logic
│   │   ├── currency.ts     # Currency formatting
│   │   ├── dates.ts        # Date utilities
│   │   └── ids.ts          # ID generation
│   │
│   ├── types/
│   │   └── index.ts        # TypeScript types
│   │
│   ├── utils/
│   │   └── cn.ts           # Tailwind merge utility
│   │
│   ├── App.tsx             # Main app with routing
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
│
├── index.html              # HTML template
├── package.json            # Dependencies
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript config
└── tailwind.config.js      # Tailwind config (v4)
```

---

## 🎨 Component Architecture

### Component Hierarchy

```
App (Router)
└── Routes
    ├── OnboardingPage
    │   └── Button
    │
    ├── DashboardPage
    │   ├── AppShell
    │   │   └── BottomNav
    │   ├── TopBar
    │   ├── MetricCard (×6)
    │   ├── LedgerEntryRow (×N)
    │   └── EmptyState
    │
    ├── CustomersPage
    │   ├── AppShell
    │   ├── TopBar
    │   ├── Input (search)
    │   ├── CustomerCard (×N)
    │   └── EmptyState
    │
    ├── CustomerDetailPage
    │   ├── AppShell
    │   ├── TopBar
    │   ├── StatusBadge
    │   ├── Button
    │   └── LedgerEntryRow (×N)
    │
    ├── AddRecordPage
    │   ├── AppShell
    │   ├── TopBar
    │   ├── Input (×N)
    │   └── Button
    │
    ├── CollectionsPage (Credit Book)
    │   ├── AppShell
    │   ├── TopBar
    │   └── CollectionCard (×N)
    │       ├── Button (×2)
    │       └── StatusBadge
    │
    ├── ChangePage (Change Book)
    │   ├── AppShell
    │   ├── TopBar
    │   └── ChangeCard (×N)
    │       └── Button
    │
    ├── BusinessSwitcherPage
    │   ├── AppShell
    │   ├── TopBar
    │   ├── Modal
    │   │   ├── Input (×2)
    │   │   └── Button
    │   └── BusinessCard (×N)
    │
    └── SettingsPage
        ├── AppShell
        ├── TopBar
        └── Button (×3)
```

---

## 💾 Data Architecture

### Database Schema (IndexedDB via Dexie)

```typescript
Database: easycredit_local_db

Tables:
┌─────────────┐
│ businesses  │
├─────────────┤
│ id          │ (PK, indexed)
│ name        │
│ currency    │
│ createdAt   │
│ updatedAt   │ (indexed)
└─────────────┘

┌─────────────┐
│ customers   │
├─────────────┤
│ id          │ (PK, indexed)
│ businessId  │ (FK, indexed)
│ name        │ (indexed)
│ phone       │
│ notes       │
│ createdAt   │
│ updatedAt   │ (indexed)
└─────────────┘

┌──────────────┐
│ ledgerEntries│
├──────────────┤
│ id           │ (PK, indexed)
│ businessId   │ (FK, indexed)
│ customerId   │ (FK, indexed)
│ type         │ (indexed)
│ amount       │
│ note         │
│ dueDate      │ (indexed)
│ status       │ (indexed)
│ syncStatus   │ (indexed)
│ createdAt    │
│ updatedAt    │ (indexed)
└──────────────┘

┌─────────────┐
│ settings    │
├─────────────┤
│ key         │ (PK)
│ ...fields   │
└─────────────┘
```

### Data Relationships

```
Business 1──N Customer 1──N LedgerEntry

business.id → customer.businessId
customer.id → ledgerEntry.customerId

Cascade Delete:
- Delete business → Delete customers → Delete entries
- Delete customer → Delete entries
```

---

## 🔄 Data Flow

### Read Flow (Get Customer Balance)

```
User clicks customer
    ↓
CustomerDetailPage component
    ↓
useEffect hook
    ↓
getCustomerById(id)
    ↓
db.customers.get(id)
    ↓
getLedgerEntriesByCustomer(id)
    ↓
db.ledgerEntries.where('customerId').equals(id)
    ↓
calculateCustomerBalance(entries)
    ↓
entries.reduce((sum, entry) => sum + calculateEntryImpact(entry))
    ↓
setState({ customer, balance, entries })
    ↓
React re-renders with data
```

### Write Flow (Add Credit Record)

```
User submits form
    ↓
handleSubmit(formData)
    ↓
Validate input
    ↓
createLedgerEntry({
    businessId,
    customerId,
    type: 'credit_given',
    amount,
    ...
})
    ↓
Generate ID (timestamp + random)
    ↓
Add timestamps (createdAt, updatedAt)
    ↓
Set status: 'active', syncStatus: 'local'
    ↓
db.ledgerEntries.add(entry)
    ↓
IndexedDB writes to disk
    ↓
navigate(/customer/:id)
    ↓
Page re-loads with new balance
```

---

## 🧮 Business Logic Layer

### Calculation Functions

```typescript
// Core calculation: How entry affects balance
calculateEntryImpact(entry: LedgerEntry): number
    credit_given     → +amount
    payment_received → -amount
    change_owed      → -amount
    change_returned  → +amount
    adjustment       → ±amount

// Customer balance
calculateCustomerBalance(entries: LedgerEntry[]): number
    filter(status === 'active')
    reduce(sum + calculateEntryImpact(entry))

// Customer status
getCustomerStatus(balance: number): CustomerStatus
    balance > 0  → 'owes_you'
    balance < 0  → 'you_owe'
    balance === 0 → 'settled'

// Due status
getDueStatus(entry: LedgerEntry): DueStatus
    !dueDate        → 'no_due_date'
    isPast(dueDate) → 'overdue'
    isToday(dueDate)→ 'due_today'
    isFuture(dueDate)→ 'upcoming'

// Business totals
calculateBusinessTotals(customers, entries): BusinessTotals
    for each customer:
        balance = calculateCustomerBalance(entries)
        if balance > 0: totalOwedToBusiness += balance
        if balance < 0: totalChangeOwed += abs(balance)
    netPosition = totalOwedToBusiness - totalChangeOwed
    counts: overdue, dueToday, unsynced, etc.
```

---

## 🎯 Routing Architecture

```typescript
/ (root)
├─ hasCompletedOnboarding? → /dashboard : /onboarding
│
├─ /onboarding              (public, first-time)
│
├─ /dashboard               (main app home)
├─ /customers               (customer list)
├─ /customer/:customerId    (customer detail)
├─ /add-record              (add transaction)
├─ /collections             (credit book)
├─ /change                  (change book)
├─ /business-switcher       (switch business)
├─ /settings                (app settings)
│
└─ * → / (catch-all redirect)
```

### Route Guards

```typescript
All routes (except /onboarding):
    Check hasCompletedOnboarding
    If false → redirect to /onboarding
    If true → render route

Most routes:
    Check selectedBusinessId
    If null → redirect to /dashboard
    If set → load business data
```

---

## 🎨 State Management

### Local Component State (useState)

```typescript
Pages:
- Loading states (isLoading)
- Form values (name, amount, note, etc.)
- Modal open/closed
- Search queries
- Selected items

Components:
- UI state (expanded, active, etc.)
- Temporary values
```

### IndexedDB (Dexie) - Persistent State

```typescript
All business data:
- businesses[]
- customers[]
- ledgerEntries[]
- settings{}

Access pattern:
- Query on mount (useEffect)
- Update via services
- Re-query or local state update
```

### No Global State (Yet)

```
Current: Each page queries its own data
Future: Consider React Context or Zustand for:
- Current business
- User session (after auth)
- Global loading state
- Toast notifications
```

---

## 🔌 Service Layer API

### Business Service

```typescript
getAllBusinesses(): Promise<Business[]>
getBusinessById(id): Promise<Business | undefined>
createBusiness(name, currency): Promise<Business>
updateBusiness(id, updates): Promise<void>
deleteBusiness(id): Promise<void>
```

### Customer Service

```typescript
getCustomersByBusiness(businessId): Promise<Customer[]>
getCustomerById(id): Promise<Customer | undefined>
createCustomer(businessId, data): Promise<Customer>
updateCustomer(id, updates): Promise<void>
deleteCustomer(id): Promise<void>
searchCustomers(businessId, query): Promise<Customer[]>
```

### Ledger Service

```typescript
getLedgerEntriesByBusiness(businessId): Promise<LedgerEntry[]>
getLedgerEntriesByCustomer(customerId): Promise<LedgerEntry[]>
getLedgerEntryById(id): Promise<LedgerEntry | undefined>
createLedgerEntry(data): Promise<LedgerEntry>
updateLedgerEntry(id, updates): Promise<void>
deleteLedgerEntry(id): Promise<void>
getUnsyncedEntries(): Promise<LedgerEntry[]>
```

---

## 🎨 Design System Tokens

### Colors (Purple Theme)

```typescript
Primary:
- purple-600: #9333ea
- indigo-600: #4f46e5
- Gradient: from-purple-600 to-indigo-600

Semantic:
- Green: Positive balances (owes you)
- Red: Negative balances (you owe)
- Amber: Warnings, due dates
- Gray: Neutral, settled

Status Colors:
- owes_you: green-100/green-800
- you_owe: red-100/red-800
- settled: gray-100/gray-800
- overdue: red-100/red-800
- due_today: amber-100/amber-800
```

### Typography

```typescript
Sizes:
- 3xl: 1.875rem (30px) - Hero text
- 2xl: 1.5rem (24px)   - Large numbers
- xl: 1.25rem (20px)   - Page titles
- lg: 1.125rem (18px)  - Section headers
- base: 1rem (16px)    - Body text
- sm: 0.875rem (14px)  - Secondary text
- xs: 0.75rem (12px)   - Labels

Weights:
- bold: 700  - Headings, important
- semibold: 600 - Card titles
- medium: 500 - Buttons
- normal: 400 - Body text
```

### Spacing

```typescript
Scale:
- 1: 0.25rem (4px)
- 2: 0.5rem (8px)
- 3: 0.75rem (12px)
- 4: 1rem (16px)     - Base unit
- 5: 1.25rem (20px)
- 6: 1.5rem (24px)
- 8: 2rem (32px)

Common:
- Card padding: p-4, p-5, p-6
- Section gap: space-y-6
- Item gap: space-y-3
- Inline gap: gap-2
```

---

## 📱 PWA Architecture

### Service Worker Strategy

```javascript
Install:
1. Cache app shell (/, /index.html)
2. Cache static assets

Fetch:
1. Try cache first
2. Fallback to network
3. Cache network response
4. If both fail, show offline page

Activate:
1. Delete old caches
2. Take control of clients
```

### Offline Support

```
First Load (Online):
    Download HTML, CSS, JS
    Install service worker
    Cache app shell
    ✓ App ready

Subsequent (Offline):
    Service worker intercepts
    Returns cached HTML
    App boots from cache
    IndexedDB provides data
    ✓ Full functionality

Network:
    Online: Show green WiFi icon
    Offline: Show gray WiFi icon
    No feature degradation
```

---

## 🔮 Future Architecture (Phase 2)

### Supabase Integration

```
Current:          Future:
┌──────────┐     ┌──────────┐
│ IndexedDB│     │ IndexedDB│←──┐
└──────────┘     └──────────┘   │
                       ↕         │ Sync
                 ┌──────────┐   │
                 │ Supabase │←──┘
                 │ Postgres │
                 └──────────┘
                       ↕
                 ┌──────────┐
                 │   Auth   │
                 └──────────┘
```

### Sync Strategy

```typescript
On Change:
    1. Write to IndexedDB (instant)
    2. Mark syncStatus: 'pending_sync'
    3. Queue for background sync

Background Sync:
    1. Get unsynced entries
    2. Push to Supabase
    3. Pull changes from Supabase
    4. Resolve conflicts (latest wins)
    5. Mark syncStatus: 'synced'

Conflict Resolution:
    updatedAt comparison
    Latest write wins
    Keep audit trail
```

---

## 📊 Performance Considerations

### Bundle Size
```
Total: 469 KB (143 KB gzipped)
- React + Router: ~140 KB
- Dexie: ~60 KB
- Tailwind (purged): ~50 KB
- Lucide icons: ~40 KB
- App code: ~100 KB
- date-fns (tree-shaken): ~20 KB
```

### Optimization Opportunities
- Code splitting by route
- Lazy load non-critical routes
- Preload critical routes
- Optimize icon imports
- Service worker caching strategy

### IndexedDB Performance
- Indexed fields for fast queries
- Batch operations where possible
- Avoid full table scans
- Use where() clauses efficiently

---

## 🧪 Testing Strategy

### Current (Manual)
- Component rendering
- User flows
- Data persistence
- Offline functionality
- Cross-browser testing

### Future (Automated)
```typescript
Unit Tests:
- calculations.ts functions
- Service layer methods
- Utility functions

Integration Tests:
- Component + service
- Form submissions
- Data flow

E2E Tests:
- Onboarding flow
- Add record flow
- Business switching
```

---

## 🎯 Summary

**Architecture Style:** Offline-first, component-based SPA

**Key Patterns:**
- Service layer for data access
- Separation of business logic (lib/)
- Reusable component library
- IndexedDB for persistence
- React Router for navigation
- TypeScript for safety

**Strengths:**
- Fast (local-first)
- Reliable (works offline)
- Maintainable (clear separation)
- Extensible (service layer ready for cloud)
- Type-safe (TypeScript)

**Ready for Phase 2:**
- Add Supabase service
- Keep IndexedDB as cache
- Sync in background
- No UI changes needed

---

**EasyCredit** - Built to scale from MVP to SaaS.
