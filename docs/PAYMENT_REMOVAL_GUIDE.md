# Payment/Subscription Removal Guide

This document lists all payment/subscription related code that should be removed from the main branch (keeping it only in the "planing" branch).

## Files to Modify

### 1. `src/components/JournalView.vue`

**Remove these template sections:**

- **Lines 39-46**: Free tier banner
```vue
<!-- Free Tier Banner -->
<div v-if="!isPro" class="free-tier-banner">
    <span>
        🆓 Free Tier - Limited to {{ symbolsList.length }}/3 trading pairs
    </span>
    <button @click="handleUpgradeClick" class="banner-upgrade-btn">Upgrade to Pro</button>
</div>
```

- **Lines 241**: Pro badge
```vue
<span v-if="isPro" class="badge-pro">✨ PRO</span>
```

- **Lines 245-276**: License input section (entire section from "License Key" to "Trading Pairs to Track")
```vue
<div v-if="!isPro" class="license-input-group">
    <!-- ... license input ... -->
</div>
<div v-if="isPro" class="license-active">
    <!-- ... active badge ... -->
</div>
<div v-if="!isPro" class="license-info">
    <!-- ... upgrade info ... -->
</div>
```

- **Line 278**: Remove the "(Max 3 on Free)" text
```vue
<label>Trading Pairs to Track {{ !isPro ? '(Max 3 on Free)' : '' }}</label>
<!-- Change to: -->
<label>Trading Pairs to Track</label>
```

**Remove these script sections:**

- **Line 359-360**: License-related refs
```js
const licenseKey = ref('')
const isPro = ref(false)
```

- **Lines 438-477**: `validateLicense` function and license loading logic

- **Lines 483-493**: Symbol limit check in `addSymbol` function
```js
// Free tier limit: 3 symbols
if (!isPro.value && symbolsList.value.length >= 3) {
    const confirmed = await upgradePrompt()
    if (confirmed) {
        // In production, redirect to upgrade page
        console.log('Redirect to upgrade page')
    }
    return
}
```

- **Lines 513-521**: `handleUpgradeClick` function

### 2. `src/composables/useKinesisAlert.js`

**Remove:**

- **Lines 141-154**: `upgradePrompt` function
```js
// Pro upgrade specific alert
const upgradePrompt = () => {
    return showAlert({
        type: "confirm",
        title: "Upgrade to Pro",
        japaneseTitle: "プロにアップグレード",
        message:
            "Free tier is limited to 3 trading pairs. Upgrade to Pro for unlimited pairs and advanced features!",
        confirmText: "Upgrade Now",
        cancelText: "Maybe Later",
    });
};
```

- Remove `upgradePrompt` from the return statement (line 165)

### 3. `src/styles/journal-view.css`

**Remove these CSS sections:**

- **Lines 198-237**: Free tier banner styles
```css
/* Free Tier Banner */
.free-tier-banner { ... }
.banner-upgrade-btn { ... }
```

- **Lines 807-920**: Entire LICENSE SECTION
```css
/* ============================================
   LICENSE SECTION
   ============================================ */
.license-section { ... }
.license-label { ... }
.license-input-group { ... }
.license-input { ... }
.license-active { ... }
.license-status { ... }
.license-info { ... }
.upgrade-banner { ... }
```

## Summary

After removing all payment/subscription code:
- No license key input
- No Pro badge
- No free tier banner
- No symbol limit (unlimited symbols)
- No upgrade prompts
- Cleaner, simpler codebase

This will make the main branch completely free and open, while keeping the monetization features in the "planing" branch for future consideration.
