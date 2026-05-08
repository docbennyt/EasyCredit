# EasyCredit - Quick Start Guide

## 🚀 Get Running in 3 Minutes

### Step 1: Install & Run
```bash
npm install
npm run dev
```
Open `http://localhost:5173`

### Step 2: Complete Onboarding
1. Click "Get Started"
2. Wait for demo data to load
3. You're in!

### Step 3: Explore
- **Dashboard** - See overview
- **Customers** - Browse sample customers
- **Add** - Try adding a record
- **Credit** - View who owes you
- **Change** - View who you owe

---

## 📖 Core Concepts (30 seconds)

### The Balance Rule
```
Positive (+) = Customer owes YOU → Shows in Credit Book 📕
Negative (-) = YOU owe customer → Shows in Change Book 📗
Zero (0) = All settled → Customer is clear ✅
```

### Record Types
```
Credit Given ➕    → Customer took goods on credit
Payment Received ➖ → Customer paid you
Change Owed ➖     → You owe customer change
Change Returned ➕  → You gave change back
Adjustment ±️      → Fix mistakes
```

---

## 🎯 Try These Scenarios

### Scenario 1: Customer Buys on Credit
```
Add → Select "Mai T" → Credit Given → $10 → Save
Result: Mai T's balance = +$10 (shown in Credit Book)
```

### Scenario 2: Customer Pays Partially
```
Add → Select "Mai T" → Payment Received → $5 → Save
Result: Mai T's balance = +$5 (still in Credit Book)
```

### Scenario 3: Customer Overpays
```
Add → Select "Tawanda" → Change Owed → $3 → Save
Result: Tawanda's balance = -$3 (shown in Change Book)
```

### Scenario 4: Return Change
```
Change Book → Find "Tawanda" → Return Change → $3 → Save
Result: Tawanda's balance = $0 (settled, removed from both books)
```

---

## 🎨 Navigation Guide

### Bottom Nav (Always Visible)
```
┌─────────┬─────────┬─────────┬─────────┬─────────┐
│  Home   │Customers│   Add   │ Credit  │ Change  │
│  📊     │   👥    │   ➕    │   📕    │   📗    │
└─────────┴─────────┴─────────┴─────────┴─────────┘
```

**Home** - Dashboard with metrics  
**Customers** - All customers list  
**Add** - Quick add record (purple button)  
**Credit** - People who owe you  
**Change** - People you owe  

### Top Bar
- **Business Name** - Tap to switch businesses
- **WiFi Icon** - Online/offline status
- **⚙️ Settings** - Tap gear icon

---

## 💡 Common Tasks

### Switch Business
```
Tap business name → Select different business → Done
```

### Search Customer
```
Customers → Type name in search box
```

### View Customer Details
```
Customers → Tap customer card
```

### Copy Payment Reminder
```
Credit Book → Find customer → Tap "Copy" → Paste in WhatsApp
```

### Export Data
```
Settings (gear icon) → Export Data as JSON
```

### Create New Business
```
Tap business name → Add New Business → Enter name → Create
```

---

## 🎨 Color Guide

### What Colors Mean
- **Purple/Indigo** = Primary actions, active items
- **Green** = Money owed to you (good!)
- **Red** = Money you owe (liability)
- **Amber** = Warning, due dates
- **Gray** = Neutral, settled

### Balance Colors
```
+$10 in GREEN  = Customer owes you $10
-$5 in RED     = You owe customer $5
$0 in GRAY     = All settled
```

---

## 📱 Mobile Tips

### Install as App (PWA)
**Android Chrome:**
1. Menu (⋮)
2. "Add to Home screen"
3. Confirm

**iOS Safari:**
1. Share button
2. "Add to Home Screen"
3. Confirm

### Works Offline
- Load app once with internet
- Use offline forever
- All features work locally
- Data syncs when online (future)

---

## 🔑 Keyboard Shortcuts

```
Dashboard    - /
Customers    - c
Add Record   - a
Credit Book  - r
Change Book  - h
Settings     - s
```
(Future feature - not yet implemented)

---

## 📊 Understanding Dashboard

### Metrics Explained
```
Total Owed To You    = Σ(positive balances) = $50
Change You Owe       = Σ(negative balances) = $10
Net Position         = $50 - $10 = $40 ✅

Due Today           = 2 items need attention today
Overdue             = 1 item past due date ⚠️
```

---

## 🎯 Best Practices

### ✅ DO
- Record transactions immediately
- Set due dates for credit
- Add customer phone numbers
- Use notes for context
- Check Change Book daily
- Export data weekly

### ❌ DON'T
- Delete records (use adjustments)
- Mix different businesses
- Wait to record transactions
- Forget to return change

---

## 🐛 Troubleshooting

### App Won't Load
```
1. Clear browser cache
2. Try incognito mode
3. Check browser console (F12)
```

### Data Disappeared
```
1. Check if correct business selected
2. Look in IndexedDB (DevTools → Application → IndexedDB)
3. Check exported backup files
```

### Balance Seems Wrong
```
1. View customer detail
2. Check all transactions
3. Use Adjustment record to fix
```

### Can't Add Record
```
1. Ensure customer selected
2. Check amount is valid number
3. Verify required fields filled
```

---

## 📞 Quick Help

### Sample Data Includes
- **3 Businesses:** Floor Polish, Green Mealies, Fresh Fish
- **5 Customers:** Mai T, Tawanda, Uncle Joe, Rudo, Mr Moyo
- **8 Transactions:** Mix of credit, payments, and change

### Test Users
```
Mai T      - Owes $5 (paid partial)
Tawanda    - Owed $2 change
Uncle Joe  - Settled (paid in full)
Rudo       - Owes $12 (due tomorrow)
Mr Moyo    - Owes $10 (overdue)
```

---

## 🎓 Learn More

**Full Documentation:**
- `README.md` - Complete project docs
- `FEATURE_GUIDE.md` - Detailed features
- `SETUP.md` - Developer setup
- `PROJECT_SUMMARY.md` - Technical overview

**Key Files:**
- `/src/pages/*` - All pages
- `/src/components/*` - UI components
- `/src/services/*` - Data layer
- `/src/lib/calculations.ts` - Balance logic

---

## 🚀 Deploy to Production

### Build
```bash
npm run build
```

### Deploy to Netlify
```bash
# Option 1: Drag & drop dist/ folder to Netlify
# Option 2: Connect GitHub repo
# Option 3: Use Netlify CLI
netlify deploy --prod
```

### Environment
- Node 18+
- Build command: `npm run build`
- Publish directory: `dist`

---

## ✨ You're Ready!

**You now know:**
- ✅ How to run the app
- ✅ Core concepts (balance, record types)
- ✅ Navigation structure
- ✅ Common workflows
- ✅ Troubleshooting basics

**Start using EasyCredit to:**
- Track customer credit
- Manage customer change
- Follow up on collections
- Run your business better

---

**Questions?** Read the full docs or explore the code!

**EasyCredit** - Simple. Offline. Yours.
