# Deploy Service Worker & SPA Routing Fixes

## ✅ Fixes Applied

1. **Service Worker Cache Error Fixed**
   - Updated `sw.js` to only cache files that exist (`/` and `/index.html`)
   - Implemented graceful fallback with `Promise.allSettled`
   - Service worker will now install even if caching partially fails

2. **SPA Routing 404 Error Fixed**
   - Created `vercel.json` with rewrite rules to handle client-side routes
   - Routes like `/pricing?canceled=true` will now work correctly
   - Service worker headers configured properly

3. **PWA Manifest Updated**
   - Removed references to non-existent icon files
   - Manifest now has empty `icons` array to prevent errors

## 🚀 Deploy to Vercel

### Option 1: Git Push (Recommended)
```bash
git add .
git commit -m "Fix service worker cache errors and SPA routing

- Update sw.js to only cache existing files with graceful fallback
- Add vercel.json for proper SPA client-side routing
- Update manifest.json to remove non-existent icon references
- Fixes: /pricing?canceled=true 404 error
- Fixes: sw.js cache failure on install"

git push origin main
```

### Option 2: Vercel CLI
```bash
# If you have Vercel CLI installed
vercel --prod
```

### Option 3: Manual Deploy via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your **nectar** project
3. Go to **Deployments** tab
4. Click **Redeploy** on latest deployment
5. Uncheck "Use existing Build Cache"
6. Click **Redeploy**

## 🧪 Testing After Deployment

### 1. Test Service Worker
```javascript
// Open browser console on https://nectarforge.app
// Check if service worker registers without errors
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs);
});
```

**Expected**: Should show registered service worker, no cache errors

### 2. Test Stripe Redirect
1. Go to https://nectarforge.app/pricing
2. Click any "Upgrade" button
3. On Stripe checkout page, click **← Back to Nectar Forge**
4. Should return to `/pricing?canceled=true` without 404 error

**Expected**: Returns to pricing page with "canceled=true" query param, no 404

### 3. Test Mobile Navigation
1. Open https://nectarforge.app on mobile or resize browser to mobile width
2. Should see:
   - Hamburger menu icon (top-left)
   - Bottom navigation bar with 4 tabs
3. Test hamburger menu opens/closes
4. Test bottom nav tabs navigate correctly

**Expected**: Both navigation methods work smoothly on mobile

### 4. Check Browser Console
Open DevTools Console (F12) and check for:
- ✅ No service worker errors
- ✅ No 404 errors
- ✅ Service worker installs successfully
- ✅ Stripe integration works

## 📊 Files Changed

### Core Fixes
- [public/sw.js](public/sw.js) - Service worker with graceful cache fallback
- [vercel.json](vercel.json) - SPA routing configuration (NEW)
- [public/manifest.json](public/manifest.json) - Removed non-existent icon refs

### Supporting Files
- [lib/stripe.ts](lib/stripe.ts) - Enhanced error messages
- [public/check-env.html](public/check-env.html) - Diagnostic page

## ⚠️ Known Issues / Future Improvements

### PWA Icons Missing
The manifest currently has an empty `icons` array. To add PWA icons:

```bash
# Install pwa-asset-generator
npm install -g pwa-asset-generator

# Generate icons from your logo
npx pwa-asset-generator /path/to/logo.png ./public/icons \
  --background "#0A0A0A" \
  --theme-color "#EA5A0C" \
  --favicon \
  --type png
```

After generating icons, update [public/manifest.json](public/manifest.json):
```json
{
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

## 🎯 Success Criteria

After deployment, verify:
- [ ] Service worker registers without errors in console
- [ ] No 404 errors on `/pricing?canceled=true` route
- [ ] Stripe checkout redirect flow works
- [ ] Mobile navigation works on actual mobile device
- [ ] No manifest icon warnings (empty array is valid)
- [ ] PWA installs on mobile (Add to Home Screen)

## 🔗 Related Documentation

- [VERCEL_STRIPE_FIX.md](VERCEL_STRIPE_FIX.md) - Stripe environment variable troubleshooting
- [SEO_MOBILE_OPTIMIZATION.md](SEO_MOBILE_OPTIMIZATION.md) - Complete SEO/mobile implementation
- [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) - Comprehensive testing guide
- [MOBILE_NAVIGATION_UPDATE.md](MOBILE_NAVIGATION_UPDATE.md) - Mobile navigation details

## 📞 Need Help?

If issues persist after deployment:
1. Check Vercel build logs for errors
2. Check browser console on live site for specific error messages
3. Verify `vercel.json` was deployed (check Vercel deployment files list)
4. Ensure environment variables are set for Production

---

**Ready to deploy!** 🚀

Choose one of the deployment methods above and test thoroughly after deployment.
