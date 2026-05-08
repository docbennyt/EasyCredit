# EasyCredit

This repository contains the EasyCredit application.

Imported project files — initial commit.
# EasyCredit - Simple Credit Tracking PWA

A mobile-first, offline-capable Progressive Web App for tracking customer credit, change, and collections. Built for small businesses, informal traders, family ventures, agents, and shop owners.

## 🎯 Product Vision

EasyCredit replaces notebooks, WhatsApp messages, and loose paper with a clean, trusted, mobile-first dashboard that tracks:
- Customers who bought goods on credit
- Customers who partially paid
- Customers whose change is still being held
- Money collected during the day
- Money still outstanding
- Multiple small ventures under one person or family

## 🚀 Features

### MVP Features (Completed)
- ✅ **Multi-Business Support** - Manage multiple ventures (e.g., Floor Polish, Green Mealies, Fresh Fish)
- ✅ **Customer Management** - Track customer balances, contact info, and transaction history
- ✅ **Flexible Ledger System** - Support for credit given, payments received, change owed, and change returned
- ✅ **Collections Dashboard** - View overdue, due today, and upcoming payments
- ✅ **Offline-First** - Works completely offline using IndexedDB
- ✅ **PWA Support** - Installable as a mobile app
- ✅ **Local Data Storage** - No login required, works entirely with local data
- ✅ **Demo Data** - Pre-seeded sample businesses and customers for testing

### Balance Logic

The app uses a universal customer balance system:
- **Positive balance** = Customer owes the business
- **Negative balance** = Business owes the customer (change)
- **Zero balance** = Customer is settled

### Record Types

1. **Credit Given** - Customer took goods/services on credit (+amount)
2. **Payment Received** - Customer paid (-amount)
3. **Change Owed** - Business owes customer change (-amount)
4. **Change Returned** - Business returned change (+amount)
5. **Adjustment** - Manual correction (±amount)

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons
- **date-fns** - Date utilities

### Local-First Storage
- **Dexie.js** - IndexedDB wrapper for local data storage

### PWA
- **Service Worker** - Offline support
- **Web Manifest** - Installability

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm

### Install Dependencies
```bash
npm install
```

### Development
```bash
npm run dev
```
Visit `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📱 Using the App

### First Time Setup
1. Open the app - you'll see the onboarding screen
2. Click "Get Started"
3. Sample businesses will be created (Floor Polish, Green Mealies, Fresh Fish)
4. You'll be taken to the Dashboard

### Dashboard
The main screen shows:
- **Metrics** - Total owed to you, change you owe, net position, active customers, due today, overdue
- **Quick Actions** - Add Record, View Customers
- **Needs Attention** - Overdue and due today items
- **Recent Activity** - Latest transactions

### Managing Customers
- View all customers with balances
- Search by name or phone
- Click a customer to see full transaction history
- Add transactions directly from customer detail page

### Adding Records
1. Select or create a customer
2. Choose record type (Credit Given, Payment Received, etc.)
3. Enter amount
4. Add optional note and due date
5. Save

### Credit Book (Collections)
- View overdue payments
- See due today items
- Check upcoming payments
- Copy reminder messages to clipboard (ready for WhatsApp)

### Change Book
- View all customers owed change
- See total change you owe
- Track customers waiting for their money
- Return change directly from the list

### Business Switcher
- Switch between different businesses
- Create new businesses
- Each business has separate customers and records

### Settings
- Manage businesses
- Export data as JSON
- Clear all local data
- View app info

## 📊 Data Models

### Business
```typescript
{
  id: string
  name: string
  currency: string
  createdAt: string
  updatedAt: string
}
```

### Customer
```typescript
{
  id: string
  businessId: string
  name: string
  phone?: string
  notes?: string
  createdAt: string
  updatedAt: string
}
```

### Ledger Entry
```typescript
{
  id: string
  businessId: string
  customerId: string
  type: "credit_given" | "payment_received" | "change_owed" | "change_returned" | "adjustment"
  amount: number
  note?: string
  dueDate?: string
  status: "active" | "settled" | "cancelled"
  syncStatus: "local" | "pending_sync" | "synced" | "failed"
  createdAt: string
  updatedAt: string
}
```

## 🗂️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AppShell.tsx
│   ├── BottomNav.tsx
│   ├── Button.tsx
│   ├── CustomerCard.tsx
│   ├── EmptyState.tsx
│   ├── Input.tsx
│   ├── LedgerEntryRow.tsx
│   ├── MetricCard.tsx
│   ├── Modal.tsx
│   ├── StatusBadge.tsx
│   └── TopBar.tsx
├── lib/                 # Utility functions
│   ├── calculations.ts  # Balance and totals calculations
│   ├── currency.ts      # Currency formatting
│   ├── dates.ts         # Date utilities
│   └── ids.ts           # ID generation
├── pages/               # Page components
│   ├── AddRecordPage.tsx
│   ├── BusinessSwitcherPage.tsx
│   ├── CollectionsPage.tsx
│   ├── CustomerDetailPage.tsx
│   ├── CustomersPage.tsx
│   ├── DashboardPage.tsx
│   ├── OnboardingPage.tsx
│   └── SettingsPage.tsx
├── services/            # Data layer
│   ├── businessService.ts
│   ├── customerService.ts
│   ├── db.ts           # Dexie database setup
│   ├── ledgerService.ts
│   ├── seedService.ts  # Demo data
│   ├── settingsService.ts
│   └── syncService.ts  # Placeholder for future Supabase sync
├── types/               # TypeScript types
│   └── index.ts
├── App.tsx             # Main app with routing
└── main.tsx            # Entry point
```

## 🔮 Future Roadmap

### Phase 2 - Cloud Sync (Not Yet Implemented)
- **Supabase Auth** - User authentication
- **Supabase Postgres** - Cloud database
- **Row Level Security** - Data security
- **Multi-device Sync** - Sync across devices
- **Conflict Resolution** - Latest updatedAt wins

### Phase 3 - Advanced Features
- SMS/WhatsApp automation
- Payment gateway integration
- Inventory management
- Tax management
- Invoices
- Interest on loans
- Advanced reporting
- Multi-agent business accounts
- AI insights

## 🎨 Design Principles

The app is designed to be:
- **Trusted** - Financial data requires trust
- **Modern** - Clean, contemporary design
- **Calm** - Not overwhelming
- **Premium** - Professional quality
- **Mobile-First** - Optimized for phones
- **Clear** - Easy to understand
- **Friendly** - Approachable UI
- **Useful** - Solves real problems

Design inspirations:
- **Stripe Dashboard** - Purple/indigo color scheme, trust, and structure
- Mobile banking apps (clarity)
- WhatsApp (simplicity for daily use)

Color Scheme:
- Primary: Purple-Indigo gradient (#7c3aed to #4f46e5)
- Success: Green tones
- Warning: Amber tones
- Danger: Red tones
- Neutral: Gray scale

## 📱 PWA Installation

### Android
1. Open the app in Chrome
2. Tap the three-dot menu
3. Select "Add to Home Screen"
4. Confirm installation

### iOS
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Confirm installation

## 🔒 Data Privacy

- All data is stored locally on your device using IndexedDB
- No data is sent to external servers in this MVP
- No login or account required
- You own your data completely
- Export your data anytime as JSON

## 🐛 Known Limitations

1. **No Cloud Sync** - Currently local-only, cloud sync planned for Phase 2
2. **No Authentication** - Single-user mode only
3. **Basic Export** - Only JSON export, no import yet
4. **No Multi-User** - Designed for single business owner
5. **No Backup** - Manual export required for backup

## 🤝 Contributing

This is an MVP. Future versions will include:
- Supabase backend integration
- User authentication
- Cloud sync
- Advanced features

## 📄 License

This is a demonstration project built for educational purposes.

## 🙏 Acknowledgments

Built with modern web technologies to solve real problems for small business owners, traders, and family ventures who need a simple, trusted way to track credit and change without paperwork.

---

**EasyCredit** - Track who owes you, who you owe change, and what needs collecting — even offline.
