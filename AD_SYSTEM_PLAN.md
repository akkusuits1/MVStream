# Ad Management System — Implementation Plan

## Part 1: Ad Blocker Detection & Enforcement

### Detection Strategy (multi-layered):
1. **Bait Element Method** — Inject decoy `<div>` with class/id adblockers target. If hidden/removed → detected
2. **Script Interference Detection** — Check if ad-related elements are blocked
3. **Fetch-based Detection** — Try loading known ad script URL; if blocked → adblocker active
4. **CSS Trap Detection** — Use CSS bait rules adblockers filter

### Enforcement:
- Full-screen overlay with blur on body content
- Message: "Ad Blocker Detected — Please disable your ad blocker to support us"
- Non-dismissible — must disable adblocker to proceed
- Check on every page load + periodically (every 30s)

### Files:
- `src/hooks/useAdBlocker.ts`
- `src/components/AdBlockerDetector.tsx`

---

## Part 2: Ad Configuration in Firebase

### Database structure under `ads/` path:
```
ads/
  config/
    adBlockerEnabled: boolean
    adBlockerMessage: string
  placements/
    {placementId}/
      name: string
      position: string
      enabled: boolean
      ads/
        {adId}/
          name: string
          provider: string    // "adsense" | "adsterra" | "monatag"
          type: string        // "banner" | "native" | "popunder" | "socialbar" | "smartlink" | "push" | "in-page-push"
          code: string
          enabled: boolean
          size: string
          mobileCode: string
          createdAt: number
          updatedAt: number
```

### Files:
- `src/services/ads.ts`

---

## Part 3: Ad Rendering System

### Placement zones:
| Zone | Position | Typical Ads |
|------|----------|-------------|
| header-banner | Below navbar | Banner 728x90 |
| sidebar | Right sidebar | Banner 300x250, 160x600 |
| in-content | Between content rows | Native banner |
| footer-banner | Above footer | Banner 728x90 |
| popunder | On first click | Popunder |
| socialbar | Fixed bottom-right | Social bar |
| interstitial | Between navigation | Interstitial |

### Files:
- `src/components/ads/AdSlot.tsx`
- `src/components/ads/PopUnder.tsx`
- `src/components/ads/SocialBar.tsx`
- `src/components/ads/InPagePush.tsx`
- `src/components/ads/Interstitial.tsx`

---

## Part 4: Admin Ads Manager

### Sidebar:
- Add `{ tab: 'ads', label: 'Ads', icon: Megaphone }` to AdminApp.tsx

### Features:
1. Overview Tab — All placements with toggles
2. Add/Edit Placement — Create placement zones
3. Add/Edit Ad — Provider, type, code, size, mobile code, toggle
4. Ad Blocker Settings — Toggle detection, customize message
5. Preview — Show ad before saving

### Files:
- `src/admin/components/AdsManager.tsx`
- `src/admin/components/AdEditor.tsx`
- `src/admin/components/PlacementEditor.tsx`

---

## Part 5: Provider Templates

### AdSense:
- Auto ads script injection
- Manual ad unit code (data-ad-client, data-ad-slot)

### Adsterra:
- Banner code (JS embed)
- Native banner code
- Popunder script
- Social bar script
- In-page push script

### Monatag:
- SmartLink code
- Push notification script
- In-page push code

---

## All Files:

### New (11):
1. `src/hooks/useAdBlocker.ts`
2. `src/components/AdBlockerDetector.tsx`
3. `src/services/ads.ts`
4. `src/components/ads/AdSlot.tsx`
5. `src/components/ads/PopUnder.tsx`
6. `src/components/ads/SocialBar.tsx`
7. `src/components/ads/InPagePush.tsx`
8. `src/components/ads/Interstitial.tsx`
9. `src/admin/components/AdsManager.tsx`
10. `src/admin/components/AdEditor.tsx`
11. `src/admin/components/PlacementEditor.tsx`

### Modified (3):
1. `src/admin/AdminApp.tsx` — Add ads tab
2. `src/App.tsx` — Add AdBlockerDetector + AdSlots
3. `src/services/content.ts` — Add ads settings

---

## Responsive Design:
- All components use Tailwind responsive classes (sm:, md:, lg:)
- Mobile-first approach
- Admin panel: collapsible sidebar on mobile
- Ad slots: responsive sizes, mobile-specific codes
- Touch-friendly controls on mobile
