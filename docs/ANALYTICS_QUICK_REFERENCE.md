# EasyCredit Analytics - Quick Reference

## 🎯 What Changed

**Dashboard:** Added insights section BELOW existing content  
**Customers:** Enhanced with risk badges and phone actions  
**Everything Else:** Unchanged ✅

---

## 📱 New User Actions

### Call a Customer
```
1. Go to Customers page
2. Find customer card
3. Tap phone number or "Call Now"
4. Phone dialer opens automatically
```

### Copy Phone Number
```
1. Find customer with phone
2. Tap copy icon next to number
3. Paste anywhere (WhatsApp, SMS, etc.)
```

### Check Customer Risk
```
1. View any customer card
2. Look for colored badge:
   - Green "Reliable" = Safe
   - Blue "Good" = Normal
   - Amber "Watch" = Attention needed
   - Red "High Risk" = Avoid more credit
3. Read reason below (e.g., "5 days overdue")
```

### View Today's Actions
```
1. Go to Dashboard
2. Scroll past Recent Activity
3. See "Today's Actions" card
4. Shows prioritized follow-ups:
   - High priority (red) = Overdue
   - Medium priority (amber) = Due today
   - Low priority (blue) = Change to return
```

### Check Cashflow Trend
```
1. Dashboard → Scroll to "Cashflow Pattern"
2. View chart showing:
   - Credit Given (red line)
   - Payments Received (green line)
   - Change Owed (orange dashed)
   - Change Returned (blue dashed)
3. Toggle "View 7 days" / "View 30 days"
```

### Check Collection Rate
```
1. Dashboard → Scroll to "Credit Given vs Collected"
2. See green progress bar
3. Read percentage (e.g., "85.3%")
4. Interpretation:
   - < 80% = Warning (giving too much credit)
   - 90%+ = Excellent (healthy cash flow)
```

---

## 🔢 Understanding Risk Scores

### Scoring System (0-100)
```
80-100 = Reliable (Green)
60-79  = Good (Blue)
40-59  = Watch (Amber)
0-39   = High Risk (Red)
```

### What Affects Score

**Negative Factors:**
- Overdue days (-5 per day)
- High outstanding balance
- No payment history
- No recent payments (30+ days)

**Positive Factors:**
- Recent settlement
- Consistent payments
- You owe them change (negative balance)

### Common Risk Reasons
- "Usually pays on time"
- "5 days overdue"
- "Overdue and becoming risky"
- "No recent payment (30+ days)"
- "You owe customer change"
- "Settled - good payment history"

---

## 📊 Dashboard Layout

```
┌─────────────────────────────────┐
│ EXISTING (Top of Dashboard)     │
├─────────────────────────────────┤
│ • 6 Metric Cards                │
│ • Quick Actions                 │
│ • Needs Attention               │
│ • Recent Activity               │
├─────────────────────────────────┤
│ NEW (Scroll Down for Insights)  │
├─────────────────────────────────┤
│ • Cashflow Insights Heading     │
│ • Today's Actions               │
│ • Cashflow Pattern Chart        │
│ • Credit vs Collections         │
│ • Money Trapped Analysis        │
└─────────────────────────────────┘
```

---

## 🎨 Color Coding Guide

### Customer Status
- **Green** = Customer owes you
- **Red** = You owe customer change
- **Gray** = Settled (no balance)

### Risk Level
- **Green** = Reliable customer
- **Blue** = Good standing
- **Amber** = Watch closely
- **Red** = High risk - avoid more credit

### Action Priority
- **Red card** = High priority (overdue)
- **Amber card** = Medium priority (due today)
- **Blue card** = Low priority (return change)

### Charts
- **Red line** = Credit given (money going out)
- **Green line** = Payments received (money coming in)
- **Orange dashed** = Change you owe
- **Blue dashed** = Change you returned

---

## 💰 Key Metrics Explained

### Collection Rate
```
Formula: (Payments Received / Credit Given) × 100

Example:
Credit Given: $100
Payments Received: $85
Collection Rate: 85%

Meaning: You collected 85% of what you gave out
```

**Healthy Range:** 85-95%
- < 80% = Giving too much credit
- 80-90% = Normal
- 90%+ = Excellent

### Money Trapped
```
= Total amount customers currently owe you

Example: $150

Meaning: This money is outside your business.
Focus on collections to bring it back in.
```

### Net Position
```
= Money owed to you - Change you owe

Example:
Owed to you: $150
Change you owe: $20
Net Position: +$130

Interpretation:
Positive = More owed to you than you owe
Negative = You owe more change than credit
```

---

## 📞 Phone Integration Details

### What Works
✅ Mobile browsers (Chrome, Safari, etc.)  
✅ Desktop with phone apps (Skype, FaceTime)  
✅ Copy to clipboard  
✅ One-tap dialing  

### What Doesn't
❌ Desktop without phone apps (link does nothing)  
❌ Browsers blocking clipboard (shows error gracefully)  

### Best Practices
- Add phone numbers to all important customers
- Use compact phone display in lists
- Call from mobile for best experience
- Copy number if call link doesn't work

---

## 🎯 Action Item Types

### Follow Up (High Priority)
```
Icon: 📈 TrendingUp (red)
When: Customer is overdue
Action: Call customer to request payment
Example: "Follow up with Mr Moyo — 5 days overdue"
```

### Collect Payment (Medium Priority)
```
Icon: 📈 TrendingUp (red)
When: Payment due today
Action: Remind customer payment is due
Example: "Collect payment from Mai T — due today"
```

### Return Change (Low Priority)
```
Icon: 💵 Banknote (blue)
When: You owe customer change
Action: Return money when customer visits
Example: "Return 2.00 change to Tawanda"
```

---

## 🔍 Common Scenarios

### Scenario 1: Customer Becoming Risky
```
1. Customer card shows "Watch" badge (amber)
2. Reason: "No recent payment (30+ days)"
3. Balance: $50
4. Action: Call before giving more credit
```

### Scenario 2: Overdue Follow-Up
```
1. Dashboard shows in "Today's Actions"
2. Priority: High (red card)
3. Message: "Follow up with customer — 7 days overdue"
4. Tap card → View customer detail
5. Tap phone number → Call immediately
```

### Scenario 3: Low Collection Rate
```
1. Dashboard scroll to "Credit vs Collections"
2. Collection Rate: 65%
3. Warning: "Below 80% - consider follow-ups"
4. Action: Review Today's Actions, make calls
```

### Scenario 4: Cashflow Pattern Discovery
```
1. View Cashflow Pattern chart
2. Notice: Credit (red line) always higher than Payments (green)
3. Insight: "I'm giving credit faster than collecting"
4. Decision: Tighten credit policy or improve collections
```

---

## 🛠️ Troubleshooting

### Phone Link Not Working
**Problem:** Tap phone number, nothing happens  
**Solution:** You're on desktop without phone app  
**Workaround:** Use copy button, paste in your phone

### Risk Badge Seems Wrong
**Problem:** "Good" customer shows "Watch"  
**Check:** Last payment date, current balance  
**Likely:** Recent payment late or balance growing  

### Chart Empty
**Problem:** Cashflow chart shows no lines  
**Cause:** No records in selected time period  
**Solution:** Change from 7 days to 30 days, or add records

### No Action Items
**Problem:** "Today's Actions" says "All clear"  
**Meaning:** No overdue, no due today, no change owed  
**Good!** Your business is current

---

## 📚 Where to Find Things

### Customer Risk
- Customers page → Each customer card → Badge + reason

### Phone Actions
- Customers page → Customer card → Phone number
- Customer detail page → Phone section

### Today's Actions
- Dashboard → Scroll past Recent Activity → "Today's Actions"

### Cashflow Chart
- Dashboard → Scroll down → "Cashflow Pattern"

### Collection Rate
- Dashboard → Scroll down → "Credit Given vs Collected"

### Money Trapped
- Dashboard → Scroll down → "Money Trapped in Credit"

---

## 🎓 Tips for Success

### Daily Routine
1. Open Dashboard
2. Check "Needs Attention"
3. Scroll to "Today's Actions"
4. Call overdue customers first
5. Remind due-today customers
6. Return change when customers visit

### Weekly Review
1. Check Cashflow Pattern (30 days)
2. Review Collection Rate
3. Identify "Watch" customers
4. Adjust credit policy if needed

### Monthly Analysis
1. Compare this month vs last month
2. Track collection rate trend
3. Identify problem customers early
4. Celebrate improvements

---

## 🚀 Quick Wins

### Improve Collection Rate
1. Follow up on overdue within 3 days
2. Call before due date as reminder
3. Be consistent with due dates
4. Reward prompt payers (verbal praise)

### Reduce Risk
1. Check risk badge before giving credit
2. Avoid "High Risk" customers
3. Monitor "Watch" customers closely
4. Track days overdue

### Save Time
1. Use one-tap phone calling
2. Copy phone numbers to WhatsApp
3. Check action list daily
4. Sort customers by priority automatically

---

**Everything you need to make EasyCredit work for you!**

For full details, see ANALYTICS_UPGRADE.md
