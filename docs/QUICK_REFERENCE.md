# EasyCredit Onboarding - Quick Reference Card

## 🎯 The 4-Step Flow

```
1. WELCOME
   "Know who owes you. Know who you owe."
   → Click: "Set up my first venture"

2. VENTURE
   Enter: "Fresh Fish" (or any business name)
   → Click: "Continue"

3. CUSTOMER
   Enter: "Mai T" (customer name)
   Optional: "077..." (phone)
   → Click: "Add customer"

4. FOCUS (AHA MOMENT)
   See: Mai T on beautiful gradient card
   Choose:
   → "Record Credit" (customer owes you)
   → "Keep Change" (you owe customer)
```

---

## 📁 Files Changed

### Added (6 files)
```
src/components/onboarding/
  ├── OnboardingLayout.tsx
  ├── WelcomeScreen.tsx
  ├── VentureSetupScreen.tsx
  ├── CustomerSetupScreen.tsx
  └── CustomerFocusScreen.tsx

src/pages/
  └── NewOnboardingPage.tsx
```

### Modified (2 files)
```
src/App.tsx              # Routes to NewOnboardingPage
src/pages/AddRecordPage  # Accepts type param
```

### Removed (1 file)
```
src/pages/OnboardingPage.tsx  # Old demo version
```

---

## 🔌 Key Integration

### AddRecordPage URL Parameters
```typescript
// From Step 4 - Record Credit
/add-record?customerId=XXX&type=credit_given

// From Step 4 - Keep Change
/add-record?customerId=XXX&type=change_owed

// AddRecordPage reads:
const customerId = searchParams.get('customerId');
const type = searchParams.get('type');

// Result: Customer and type preselected
```

---

## 🎨 Visual Hierarchy

### Step 4 (Customer Focus)
```
┌─────────────────────────────┐
│ Customer Card (Dominant)    │
│ ┌─────────────────────────┐ │
│ │ Gradient Purple-Indigo  │ │
│ │ 👤 Mai T (24px bold)   │ │
│ │ 077... (14px light)    │ │
│ │ [Fresh Fish] [Ready]   │ │
│ └─────────────────────────┘ │
│                             │
│ 4 Blurred Cards (Background)│
│ Create depth effect         │
│                             │
│ ┌─────────────────────────┐ │
│ │ 📈 Record Credit    →  │ │
│ │ Customer owes you       │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 💵 Keep Change      →  │ │
│ │ You owe customer        │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

---

## 💾 Data Created

### After Step 2
```json
Business:
{
  "id": "uuid",
  "name": "Fresh Fish",
  "currency": "USD"
}

Settings:
{
  "selectedBusinessId": "uuid"
}
```

### After Step 3
```json
Customer:
{
  "id": "uuid",
  "businessId": "business-uuid",
  "name": "Mai T",
  "phone": "077 123 4567"
}

Settings:
{
  "hasCompletedOnboarding": true
}
```

---

## ✅ Testing Steps

1. **Clear IndexedDB**
   - DevTools → Application → IndexedDB
   - Delete `easycredit_local_db`

2. **Reload App**
   - Should redirect to `/onboarding`

3. **Complete Flow**
   - Step 1: Click "Set up my first venture"
   - Step 2: Enter "Fresh Fish", click Continue
   - Step 3: Enter "Mai T", click Add customer
   - Step 4: See Mai T card

4. **Test Record Credit**
   - Click "Record Credit"
   - Verify customer preselected
   - Verify type = Credit Given
   - Enter $10, save
   - Check dashboard

5. **Test Keep Change**
   - Go back to customer detail
   - Click "Add Transaction"
   - OR from onboarding Step 4
   - Click "Keep Change"
   - Verify type = Change Owed
   - Enter $5, save

---

## 🎨 Color Codes

### Backgrounds
```
Gradient: from-purple-50 via-indigo-50 to-purple-100
Card: white
Customer card: from-purple-600 to-indigo-600
```

### Accents
```
Credit: green-50, green-100, green-600
Change: red-50, red-100, red-600
Button: purple-600 to indigo-600
```

### Text
```
Heading: gray-900
Body: gray-600
Helper: gray-500
Light: gray-400
```

---

## 📏 Sizing

### Touch Targets
```
Primary buttons: 48px height
Action cards: 64px height
Input fields: 48px height
```

### Typography
```
Headline: 30px (text-3xl)
Step title: 24px (text-2xl)
Card name: 24px (text-2xl)
Button: 16px (text-base)
Helper: 14px (text-sm)
```

### Icons
```
Welcome: 40px
Steps: 32px
Customer: 28px
Actions: 24px
```

---

## 🚀 Build Command

```bash
npm run build

# Output:
# ✓ 2100 modules transformed
# dist/index.html 479 KB (145 KB gzipped)
# ✓ built in ~5s
```

---

## 🔄 Onboarding Flow State

```typescript
type Step = 'welcome' | 'venture' | 'customer' | 'focus';

State managed:
- currentStep: Step
- ventureId: string
- ventureName: string
- customerId: string
- customerName: string
- customerPhone: string | undefined
```

---

## 📝 Copy Examples

### Step 1
```
Headline: "Know who owes you. Know who you owe."
Support: "EasyCredit helps you track customer credit and customer change for every venture you manage."
Button: "Set up my first venture"
```

### Step 2
```
Heading: "What venture are we tracking first?"
Helper: "This keeps each business separate, with its own customers, Credit Book, and Change Book."
Placeholder: "Fresh Fish, Floor Polish, Green Mealies..."
Button: "Continue"
```

### Step 3
```
Heading: "Add your first customer"
Helper: "Start with one person. You can add the rest later."
Badge: "for Fresh Fish"
Button: "Add customer"
```

### Step 4
```
Heading: "[Name] is ready"
Helper: "Now choose what you want to record for this customer."
Actions:
- "Record Credit" / "Customer owes you"
- "Keep Change" / "You owe customer change"
Link: "Go to dashboard"
```

---

## 🎯 Key Metrics

### Completion Time
- Target: 60-90 seconds
- Step 1: 5s (read + click)
- Step 2: 15s (type + click)
- Step 3: 20s (type + click)
- Step 4: 10s (read + choose)
- First record: 30s (amount + save)

### User Understanding
- Step 1: Knows what app does
- Step 2: Creates ownership
- Step 3: Personalizes experience
- Step 4: Experiences "aha moment"

---

## 📞 Common Questions

**Q: Can I skip onboarding?**
A: Not in current version. Complete all 4 steps once.

**Q: Can I go back a step?**
A: Not yet. Future enhancement.

**Q: Is phone required?**
A: No. Phone is always optional.

**Q: Can I add more later?**
A: Yes. Add more ventures and customers anytime.

**Q: What if I make a mistake?**
A: Edit in Settings or customer detail page.

---

## ✨ The "Aha Moment"

**What the user realizes on Step 4:**

> "Oh! So when Mai T takes fish and says she'll pay later,  
> I click **Record Credit**.  
>   
> And when I'm holding change for Mai T,  
> I click **Keep Change**.  
>   
> That's it. That's the whole app. I get it!"

---

## 🎉 Success Indicators

- [x] User completes onboarding
- [x] User creates first record
- [x] User understands Credit vs Change
- [x] User adds 2nd customer
- [x] User returns next day

---

**Quick reference complete. See full docs for details.**

Files to read:
- `ONBOARDING_GUIDE.md` - Complete guide
- `VISUAL_WALKTHROUGH.md` - Screen designs
- `IMPLEMENTATION_SUMMARY.md` - What was built
