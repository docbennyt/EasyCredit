# EasyCredit - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 3. First Launch
- You'll see the onboarding screen
- Click "Get Started"
- Sample businesses will be created automatically:
  - Floor Polish
  - Green Mealies
  - Fresh Fish
- Sample customers and transactions will be added
- You'll be redirected to the Dashboard

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Testing the App

### Test Scenarios

#### 1. View Dashboard
- See metrics for the selected business
- Check total owed, change owed, net position
- View recent activity
- See overdue items

#### 2. Switch Business
- Click the business name in the top bar
- Switch to a different business (e.g., from Floor Polish to Fresh Fish)
- Notice the dashboard updates with different data

#### 3. View Customers
- Go to Customers tab
- Search for customers by name or phone
- Click on a customer to see details
- View their balance and transaction history

#### 4. Add a New Record

**Scenario: Customer takes goods on credit**
1. Go to Add tab
2. Select a customer (or create new)
3. Choose "Credit Given"
4. Enter amount: $10
5. Add note: "2 bottles of polish"
6. Optionally set due date
7. Save
8. Customer balance increases by $10

**Scenario: Customer pays**
1. Go to Add tab
2. Select same customer
3. Choose "Payment Received"
4. Enter amount: $5
5. Add note: "Partial payment"
6. Save
7. Customer balance decreases by $5

**Scenario: Customer is owed change**
1. Go to Add tab
2. Select a customer
3. Choose "Change Owed"
4. Enter amount: $3
5. Add note: "Paid $10 for $7 item"
6. Save
7. Customer balance becomes negative (you owe them)

**Scenario: Return customer's change**
1. Go to customer detail
2. Click "Add Transaction"
3. Choose "Change Returned"
4. Enter amount: $3
5. Save
6. Customer balance returns to zero

#### 5. Collections
- Go to Collections tab
- View overdue items (items with past due dates)
- View due today items
- Click "Copy" to copy reminder message
- Paste into WhatsApp or SMS to send to customer

#### 6. Create New Business
- Go to Settings
- Click "Manage Businesses"
- Click "Add New Business"
- Enter name: "Vegetables"
- Select currency: USD
- Create
- You'll be switched to the new business
- Add customers and records specific to this business

#### 7. Export Data
- Go to Settings
- Click "Export Data as JSON"
- A JSON file will be downloaded
- This file contains all your businesses, customers, and transactions

#### 8. Test Offline Mode
- Open browser DevTools
- Go to Network tab
- Check "Offline" mode
- Reload the page
- App should still work (after first load)
- Add records while offline
- They'll be marked as "Local" until synced (future feature)

## PWA Installation

### Test on Mobile Device

#### Option 1: Local Network
1. Get your computer's local IP (e.g., 192.168.1.100)
2. Run `npm run dev`
3. On your phone, navigate to `http://YOUR_IP:5173`
4. Test the app on mobile

#### Option 2: Deploy to Netlify
1. Build the app: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Access the live URL on your phone
4. Install as PWA

### Install as PWA on Phone
- **Android Chrome**: Menu → "Add to Home Screen"
- **iOS Safari**: Share → "Add to Home Screen"

## Verification Checklist

✅ Onboarding completes successfully
✅ Sample data loads correctly
✅ Dashboard shows correct metrics
✅ Can switch between businesses
✅ Can view customers and their balances
✅ Can add new customer
✅ Can add credit record
✅ Customer balance updates correctly
✅ Can add payment record
✅ Balance decreases correctly
✅ Can record change owed
✅ Balance becomes negative
✅ Can return change
✅ Balance moves to zero
✅ Collections page shows overdue/due items
✅ Copy reminder works
✅ Can create new business
✅ Can export data
✅ App works after refresh
✅ Data persists in IndexedDB
✅ App works offline (after first load)
✅ Bottom navigation works
✅ UI is mobile-friendly

## Browser Compatibility

**Recommended:**
- Chrome/Edge 90+
- Safari 14+
- Firefox 88+

**Required Features:**
- IndexedDB support
- Service Worker support
- ES6+ JavaScript

## Data Location

All data is stored in IndexedDB:
- Database name: `easycredit_local_db`
- Tables: businesses, customers, ledgerEntries, settings

To view in Chrome DevTools:
1. Open DevTools (F12)
2. Go to Application tab
3. Expand IndexedDB
4. Find `easycredit_local_db`

## Troubleshooting

### App doesn't load
- Clear browser cache
- Check console for errors
- Try in incognito mode
- Check if IndexedDB is enabled

### Data not persisting
- Check if in private/incognito mode
- Check browser storage settings
- Look for IndexedDB errors in console

### Service Worker issues
- Unregister old service workers in DevTools
- Clear cache and reload
- Check sw.js is accessible

### Balance calculations wrong
- Check the calculations.ts logic
- Verify entry types are correct
- Check for duplicate entries

## Development Tips

### Hot Reload
Vite provides instant hot module replacement. Changes appear immediately.

### TypeScript Errors
Run `npm run build` to see all TypeScript errors.

### Database Inspection
Use Dexie DevTools or browser IndexedDB inspector to view data.

### Adding New Features
1. Update types in `src/types/index.ts`
2. Add service methods in `src/services/`
3. Add calculation logic in `src/lib/calculations.ts`
4. Create UI components in `src/components/`
5. Add pages in `src/pages/`
6. Update routing in `src/App.tsx`

## Next Steps

After testing the MVP:

1. **Gather User Feedback**
   - Test with real users
   - Identify pain points
   - Collect feature requests

2. **Plan Supabase Integration**
   - Set up Supabase project
   - Design database schema
   - Implement authentication
   - Build sync logic

3. **Add Advanced Features**
   - SMS notifications
   - WhatsApp integration
   - Payment reminders
   - Reports and analytics

4. **Improve UX**
   - Add animations
   - Improve mobile gestures
   - Better error handling
   - Loading states

5. **Performance**
   - Optimize bundle size
   - Lazy load routes
   - Improve rendering
   - Better caching

---

**Need Help?**
Check the README.md for full documentation.
