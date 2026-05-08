# EasyCredit Feature Guide

## 🎯 Core Concept: Two Books System

EasyCredit uses a **two-book system** inspired by traditional merchant record-keeping:

### 📕 Credit Book (Collections)
**Purpose:** Track money customers owe YOU

**Shows:**
- Customers with positive balances
- Overdue payments
- Due today
- Upcoming payments
- No due date items

**Use Cases:**
- Customer bought goods on credit
- Customer made partial payment
- Need to follow up on payments

**Access:** Bottom nav → Credit (bell icon)

---

### 📗 Change Book
**Purpose:** Track money YOU owe customers

**Shows:**
- Customers with negative balances (you owe them)
- Total change owed
- Individual change amounts
- Last interaction date

**Use Cases:**
- Customer paid $10 for $7 item (you owe $3)
- Customer overpaid and waiting for change
- Need to return money when customer comes back

**Access:** Bottom nav → Change (banknote icon)

---

## 🎨 Visual Design Philosophy

### Stripe-Inspired Theme
The app uses a professional purple/indigo gradient scheme:

**Primary Actions:**
- Purple-to-indigo gradient
- Shadow for depth
- Clean, modern look

**Color Meanings:**
- 🟣 Purple/Indigo = Primary actions, active states
- 🟢 Green = Money owed to you (positive)
- 🔴 Red = Money you owe (negative)
- 🟡 Amber = Warnings, due dates
- ⚪ Gray = Neutral, settled

### Typography & Spacing
- Large, readable font sizes
- Generous padding and margins
- Clear visual hierarchy
- Mobile-first design (44px+ touch targets)

---

## 📱 Navigation Structure

### Bottom Navigation (Always Visible)
```
┌─────────┬─────────┬─────────┬─────────┬─────────┐
│  Home   │Customers│   Add   │ Credit  │ Change  │
│    🏠   │   👥    │   ➕    │   🔔    │   💵    │
└─────────┴─────────┴─────────┴─────────┴─────────┘
```

1. **Home** - Dashboard with metrics and overview
2. **Customers** - Full customer list with search
3. **Add** - Quick record entry (prominent gradient button)
4. **Credit** - Credit book for collections
5. **Change** - Change book for returns

### Top Bar Features
- Business name (tap to switch)
- Online/Offline indicator
- Settings icon (gear)

---

## 💡 Understanding Balances

### The Universal Balance System

Every customer has ONE balance that can be:

**Positive (+)** 
- Customer owes you money
- Shows in green
- Appears in Credit Book
- Example: Customer took $10 of goods, paid $3 → Balance: +$7

**Negative (-)**
- You owe customer money (change)
- Shows in red
- Appears in Change Book
- Example: Customer paid $20 for $15 item → Balance: -$5

**Zero (0)**
- All settled
- Shows in gray
- Customer is "clean slate"

### How Balance Changes

**Record Types & Impact:**

| Record Type | Impact | Example |
|------------|---------|---------|
| Credit Given | +amount | Customer took goods worth $10 → +$10 |
| Payment Received | -amount | Customer paid $5 → -$5 |
| Change Owed | -amount | You owe customer $3 → -$3 |
| Change Returned | +amount | You returned $3 → +$3 |
| Adjustment | ±amount | Correction: +$2 or -$2 |

---

## 🔄 Common Workflows

### Workflow 1: Customer Takes Goods on Credit
1. Tap **Add** (center button)
2. Select customer or create new
3. Choose "Credit Given"
4. Enter amount
5. Add note (optional)
6. Set due date (optional)
7. Save
→ Customer balance increases
→ Shows in Credit Book

### Workflow 2: Customer Pays Partial Amount
1. Go to customer detail OR tap **Add**
2. Select customer
3. Choose "Payment Received"
4. Enter amount paid
5. Save
→ Customer balance decreases
→ Still shows in Credit Book if balance > 0

### Workflow 3: Customer Overpays (Change Owed)
1. Tap **Add**
2. Select customer
3. Choose "Change Owed"
4. Enter change amount
5. Note: "Paid $20 for $15 item"
6. Save
→ Customer balance goes negative
→ Shows in Change Book

### Workflow 4: Return Customer's Change
1. Go to **Change Book**
2. Find customer
3. Tap "Return Change" OR navigate to customer detail
4. Choose "Change Returned"
5. Enter amount
6. Save
→ Balance moves back toward zero
→ Removed from Change Book when balance = 0

---

## 📊 Dashboard Metrics Explained

### Total Owed To You
- Sum of all positive customer balances
- Money you should collect
- Green color (good for business)

### Change You Owe
- Sum of all negative customer balances (absolute value)
- Money you need to return
- Red color (liability)

### Net Position
- Formula: `Total Owed - Change Owed`
- Shows overall position
- Positive = more owed to you than you owe
- Negative = you owe more in change

### Active Customers
- Customers with non-zero balances
- Either owe you OR you owe them

### Due Today / Overdue
- Entries with due dates
- Click to go to Credit Book
- Helps with collections

---

## 🎯 Best Practices

### For Small Traders
✅ **DO:**
- Add records immediately after transaction
- Set due dates for credit
- Check Change Book daily
- Use notes to add context
- Keep customer phone numbers updated

❌ **DON'T:**
- Wait to record transactions
- Forget to set due dates
- Mix business records (use separate businesses)
- Delete records (use adjustments instead)

### For Multi-Business Owners
✅ **DO:**
- Create separate business for each venture
- Switch context before adding records
- Use consistent naming
- Export data regularly

❌ **DON'T:**
- Mix customers across businesses
- Use same business for unrelated ventures

---

## 🔐 Data & Privacy

### Local-First
- All data stored on your device
- No cloud dependency (MVP)
- Works offline
- You own your data

### Future (Supabase Integration)
- Optional cloud sync
- Multi-device support
- Backup and restore
- Collaboration features

---

## 💬 User Scenarios

### Scenario 1: Fish Seller
**Problem:** Customer bought $15 of fish, only had $20 bill

**Solution:**
1. Add "Change Owed" for $5
2. Customer shows in Change Book
3. When customer returns, check Change Book
4. Return $5 and mark "Change Returned"
5. Customer removed from Change Book

### Scenario 2: Floor Polish Vendor
**Problem:** Regular customer takes 3 bottles ($24), promises to pay Friday

**Solution:**
1. Add "Credit Given" for $24
2. Set due date to Friday
3. Customer shows in Credit Book
4. Friday: Shows in "Due Today"
5. Copy reminder message, send via WhatsApp
6. When paid, add "Payment Received"

### Scenario 3: Green Mealies
**Problem:** Customer paid $10, then returned $4 worth of goods

**Solution:**
1. Initial "Credit Given" for $10 (if credit)
2. OR "Payment Received" for $10 (if cash)
3. Add "Change Owed" for $4
4. Customer shows in Change Book
5. Return $4 when customer comes back

---

## 🚀 Tips & Tricks

### Quick Actions
- Long-press customer name to copy phone number (future)
- Swipe gestures for quick actions (future)
- Tap business name to switch quickly

### Search
- Search customers by name or phone
- Filter by balance status
- Sort by balance amount

### Reminders
- Use "Copy Reminder" in Credit Book
- Customize message before sending
- Send via WhatsApp, SMS, or any app

### Data Export
- Export all data as JSON
- Backup regularly
- Import on new device (future)

---

## 📞 Support & Questions

### Common Questions

**Q: Can I use this for inventory?**
A: Not yet. MVP focuses on credit/change tracking. Inventory coming in Phase 2.

**Q: How do I share with my assistant?**
A: Multi-user support coming with Supabase integration (Phase 2).

**Q: What if I make a mistake?**
A: Use "Adjustment" record type to correct balances.

**Q: Can I delete a customer?**
A: Yes, in Settings → Manage Businesses (future feature).

**Q: How do I backup?**
A: Settings → Export Data as JSON. Save file to cloud storage.

**Q: Works offline?**
A: Yes! All features work offline after first load.

---

**EasyCredit** - Your digital credit and change notebook.
