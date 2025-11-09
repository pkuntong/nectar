# PWA Icons & Splash Screens

This directory contains all the icons and splash screens needed for a complete PWA experience on iOS and Android devices.

## Required Icons

Generate these icons from your logo using a tool like [PWA Asset Generator](https://www.npmjs.com/package/pwa-asset-generator) or [RealFaviconGenerator](https://realfavicongenerator.net/).

### App Icons (Required)
- `icon-72x72.png` - Android Chrome
- `icon-96x96.png` - Android Chrome
- `icon-128x128.png` - Android Chrome
- `icon-144x144.png` - Android Chrome, Microsoft
- `icon-152x152.png` - iOS Safari
- `icon-192x192.png` - Android Chrome (standard)
- `icon-384x384.png` - Android Chrome
- `icon-512x512.png` - Android Chrome (high-res)

### Apple Touch Icons
- `apple-touch-icon.png` - 180x180px for iOS devices

### iOS Splash Screens (Launch Images)
These provide native-like app launch experience on iOS:

- `apple-splash-2048-2732.png` - iPad Pro 12.9" (portrait)
- `apple-splash-1668-2388.png` - iPad Pro 11" (portrait)
- `apple-splash-1536-2048.png` - iPad Pro 10.5" (portrait)
- `apple-splash-1125-2436.png` - iPhone X/XS/11 Pro (portrait)
- `apple-splash-1242-2688.png` - iPhone XS Max/11 Pro Max (portrait)
- `apple-splash-828-1792.png` - iPhone XR/11 (portrait)
- `apple-splash-1170-2532.png` - iPhone 12/13/14 Pro (portrait)

## Quick Generation Command

Using [pwa-asset-generator](https://www.npmjs.com/package/pwa-asset-generator):

```bash
npx pwa-asset-generator /path/to/your/logo.png ./public/icons \
  --background "#0A0A0A" \
  --theme-color "#EA5A0C" \
  --icon-only \
  --favicon \
  --type png \
  --quality 100
```

For splash screens:
```bash
npx pwa-asset-generator /path/to/your/logo.png ./public/icons \
  --background "#0A0A0A" \
  --splash-only \
  --type png \
  --quality 100
```

## Design Guidelines

1. **Icon Design**:
   - Use a simple, recognizable logo
   - Ensure good contrast against both light and dark backgrounds
   - Leave adequate padding (safe zone)
   - Test on actual devices

2. **Splash Screen Design**:
   - Center the logo vertically
   - Use brand colors for background
   - Keep it simple and fast to load

3. **Color Scheme**:
   - Background: `#0A0A0A` (dark)
   - Theme: `#EA5A0C` (brand orange)
   - Ensure WCAG AA contrast compliance

## File Formats
- Use PNG format for transparency support
- Optimize images using tools like [TinyPNG](https://tinypng.com/)
- Keep file sizes under 200KB for splash screens

## Testing

After generating icons:
1. Test on iOS Safari (Add to Home Screen)
2. Test on Android Chrome (Add to Home Screen)
3. Verify icons appear correctly in all sizes
4. Check splash screens display properly on different devices
