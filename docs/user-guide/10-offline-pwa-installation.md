# Offline & PWA Installation

## What is a PWA?

PWA stands for **Progressive Web App**. It means EasyCredit works like a native mobile app:

✅ **Install on your home screen** - Like any app from the app store  
✅ **Works offline** - Use without internet connection  
✅ **Faster loading** - Opens instantly  
✅ **Stay logged in** - No need to log in repeatedly  
✅ **No app store** - Install directly from browser  
✅ **Auto-updates** - Always get latest features  

## Why Install EasyCredit as an App?

**Benefits:**

1. **Faster Access**
   - Opens immediately like a native app
   - No need to type URL every time
   - App icon on your home screen

2. **Works Offline**
   - Record transactions without internet
   - View your dashboard offline
   - Data syncs when internet returns

3. **Stays Logged In**
   - No repeated logins
   - Secure session that lasts
   - Works like mobile banking apps

4. **Better Experience**
   - Full-screen app feeling
   - No browser address bar
   - Smoother navigation

5. **Saves Data**
   - Uses less mobile data
   - Faster after first visit
   - Cached for offline use

## How to Install on Android

### Step 1: Open in Chrome

1. Open **Google Chrome** on your Android phone
2. Go to EasyCredit website
3. Sign in to your account

### Step 2: Install Prompt

You'll see a popup at the bottom:

```
[Install EasyCredit]
```

**OR** you can manually install:

1. Tap the **⋮** (three dots) menu
2. Tap **"Add to Home screen"**
3. Confirm the app name
4. Tap **"Add"**

### Step 3: Open the App

1. Find EasyCredit icon on your home screen
2. Tap to open
3. You're already logged in!
4. Use like any app

**Note:** The app will stay logged in. No need to sign in every time.

## How to Install on iPhone (iOS)

### Step 1: Open in Safari

1. Open **Safari** browser (not Chrome)
2. Go to EasyCredit website
3. Sign in to your account

### Step 2: Add to Home Screen

1. Tap the **Share** button (square with arrow pointing up)
2. Scroll down and tap **"Add to Home Screen"**
3. Edit the name if you want (e.g., "EasyCredit")
4. Tap **"Add"** in the top right

### Step 3: Open the App

1. Find EasyCredit icon on your home screen
2. Tap to open
3. You're already logged in!
4. Use like any app

**iOS Limitation:** Session persistence is good but may require re-login after extended periods.

## How to Install on Desktop

### Windows/Mac Chrome

1. Open **Chrome** browser
2. Go to EasyCredit website
3. Sign in
4. Click the **⊕** install icon in the address bar
5. Click **"Install"**
6. App opens in its own window
7. Find in your applications folder

### Windows Edge

1. Open **Edge** browser
2. Go to EasyCredit website
3. Sign in
4. Click the **⊕** install icon
5. Click **"Install"**
6. App opens in its own window

### Mac Safari

Safari on Mac doesn't fully support PWA installation. Use Chrome instead.

## Offline Mode

Once installed, EasyCredit works offline:

### What Works Offline

✅ **View Dashboard** - See your metrics  
✅ **View Customers** - Browse customer list  
✅ **Add Records** - Record credit and payments  
✅ **View History** - See past transactions  
✅ **Check Insights** - View analytics  

### What Requires Internet

❌ **First-time login** - Initial authentication  
❌ **Cloud sync** - Sending data to cloud  
❌ **Multi-device sync** - Syncing across devices  

### How Offline Mode Works

1. **First Visit (Online)**
   - App downloads to your device
   - Stores data locally
   - Caches for offline use

2. **Subsequent Visits (Offline)**
   - Opens instantly from cache
   - Uses local database (IndexedDB)
   - All features work

3. **When Internet Returns**
   - App syncs changes to cloud
   - Downloads any remote updates
   - Continues working seamlessly

### Offline Indicator

The app shows your connection status:

- 🟢 **Green WiFi icon** - Online and synced
- 🔴 **Red WiFi icon** - Offline mode active
- 🟡 **Yellow sync icon** - Syncing data

## Staying Logged In

### How Long Sessions Last

**PWA Installed:**
- Sessions last as long as possible
- Automatic token refresh
- Similar to mobile banking apps
- May require re-login after very long periods (weeks/months)

**Browser (Not Installed):**
- Sessions may expire sooner
- Browser may clear data
- Install as PWA for best experience

### To Stay Logged In

✅ **DO:**
- Install as PWA
- Keep app installed
- Use regularly
- Allow app to refresh in background

❌ **DON'T:**
- Clear browser data
- Uninstall and reinstall frequently
- Log out unless necessary
- Block cookies/storage

### If You Get Logged Out

Simply log back in:
1. Open app
2. Enter email and password
3. Your data is still there
4. Continue where you left off

## Managing Storage

### How Much Storage is Used?

EasyCredit uses:
- **App Files:** ~2-5 MB (one-time)
- **Your Data:** Depends on records
  - 1,000 records ≈ 500 KB
  - 10,000 records ≈ 5 MB

**Typical Usage:** 5-10 MB total

### Checking Storage

**Android:**
Settings → Apps → EasyCredit → Storage

**iPhone:**
Settings → General → iPhone Storage → EasyCredit

**Browser:**
Developer Tools → Application → Storage

### Clearing Storage

⚠️ **Warning:** Only clear storage if you have a problem and your data is backed up!

**To clear:**
1. Ensure data is synced to cloud (check online)
2. Uninstall app or clear browser data
3. Reinstall/reopen app
4. Log in
5. Data syncs back from cloud

## Troubleshooting PWA

### Can't Find Install Option

**Android:**
- Use Chrome browser (not other browsers)
- Visit full website URL
- Check if already installed
- Try clearing Chrome cache

**iPhone:**
- Use Safari browser (not Chrome)
- Tap Share button
- Scroll to find "Add to Home Screen"
- Ensure not in Private mode

### App Won't Work Offline

Check:
- ✓ Did you open the app at least once while online?
- ✓ Is the app fully loaded before going offline?
- ✓ Did browser clear cache?
- ✓ Try force-refresh when online

### App Looks Outdated

The app auto-updates, but you can force update:

1. Close the app completely
2. Open while online
3. Refresh/reload if needed
4. Latest version loads automatically

### Lost All Data

If data is lost:

1. **Check if logged in to correct account**
2. **Check internet connection** - Data may sync back
3. **Check if data was synced before** - Local-only data can't be recovered
4. **Contact support** if synced data is missing

## Best Practices

### For Best Performance

✅ Install as PWA  
✅ Open app regularly  
✅ Keep phone/computer storage available  
✅ Allow automatic updates  
✅ Stay online occasionally to sync  

### For Data Safety

✅ Record transactions immediately  
✅ Sync regularly (connect to internet)  
✅ Don't clear storage unnecessarily  
✅ Enable automatic cloud sync when available  
✅ Export data periodically as backup  

### For Battery Life

✅ PWA apps are battery-efficient  
✅ Close when not in use  
✅ Background sync is minimal  

## PWA vs Website

### Website (Browser)

- Type URL every time
- Shows browser address bar
- May log out more often
- Takes up browser tabs
- Less app-like feel

### PWA (Installed)

- Tap icon to open
- Full-screen app experience
- Stays logged in longer
- Own window/separate app
- Works better offline
- Faster loading

**Recommendation:** Install as PWA for the best experience!

## Frequently Asked Questions

**Q: Is the PWA safe?**  
A: Yes, it's the same website, just installed for easier access.

**Q: Does it use more data?**  
A: No, it uses less data because it caches content.

**Q: Can I uninstall it?**  
A: Yes, uninstall like any app. Your cloud data is safe.

**Q: Will I lose my data if I uninstall?**  
A: No, if your data was synced to the cloud, it's safe.

**Q: Do I need to update it?**  
A: No, it updates automatically when you open it online.

**Q: Can I use both website and app?**  
A: Yes, they're the same thing. Data syncs across both.

**Q: Does it work on all phones?**  
A: Works on most modern phones (Android 5+, iOS 12+).

---

**Ready to install?** Follow the steps for your device and enjoy the app experience!
