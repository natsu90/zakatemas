# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:3000
npm run build      # Build for production
npm run generate   # Static site generation
npm run preview    # Preview production build
```

No test or lint commands are configured.

## Architecture

**Zakatemas** is a Malaysian Islamic Zakat (alms) calculator for gold and silver — a client-side SPA (SSR disabled) built with Nuxt 4 + Vue 3. It runs fully offline via PouchDB and is installable as a PWA.

### Key Design Decisions

- **Offline-first**: All data lives in PouchDB (`my_local_db`). The `useEntries` composable in `app/composables/useEntries.ts` is the only data access layer — it wraps all PouchDB CRUD operations.
- **No state management library**: State lives in local `ref()`/`computed()` within pages. `index.vue` is the heaviest page (~938 lines) and contains all zakat calculation logic.
- **Client-only plugin**: `app/plugins/pouchdb.client.ts` initializes PouchDB and exposes `$pouch` globally.
- **Price data**: Gold/silver prices (RM per gram) are stored in `public/data.json` and fetched at runtime. Gold price is for 999 purity; other purities are derived by multiplying by the purity ratio.

### Zakat Calculation Logic (index.vue)

Core constants:
- `NISAB_GRAM = 85g` — minimum gold to owe zakat
- `URUF_GOLD_GRAM` — varies by Malaysian state (180–850g for jewelry)
- `URUF_SILVER_GRAM = 595g`
- `ZAKAT_RATE = 2.5%`
- `HAUL_DAYS = 354` — lunar year holding period

The `getAdjustedGram()` method computes the effective pure gold weight after accounting for purity percentage and Ar-Rahnu (collateral) loan deductions.

### Entry Data Model

```typescript
interface Entry {
  _id: string           // ISO timestamp (PouchDB doc ID)
  _rev?: string         // PouchDB revision
  metal_type: 'gold' | 'silver'
  metal_state: 'physical' | 'digital'
  name_string: string   // Description or platform name
  image_string: string  // Base64 encoded image
  is_worn: boolean      // true = jewelry (Barang Kemas), false = investment
  gold_percent: number | null  // Purity: 999, 916, 750, etc.
  is_collateral: boolean       // Ar-Rahnu pledged item
  loan_amount: number | null
  is_bulk: boolean      // Pukal (bulk) status
  gram: number          // Weight in grams
  date: string          // ISO date string
}
```

### Pages

- `app/pages/index.vue` — Dashboard: displays all entries, calculates zakat totals, state selection modal, payment modal (Zakat Selangor FPX)
- `app/pages/create.vue` — Add new gold/silver entry
- `app/pages/edit/[id].vue` — Edit physical entry
- `app/pages/edit-digital/[id].vue` — Bulk edit digital platform entries (sell/convert)

### Domain Notes

- All UI text is in Malay (ms-MY)
- Digital gold/silver platforms are hard-coded (Agrobank, Maybank, Public Gold, MEEM, etc.)
- State-specific uruf values differ for Perlis (no uruf for gold jewelry — everyone pays zakat on jewelry)
- "Haul" refers to the 354-day lunar holding period before zakat is due
- "Nisab" is the minimum threshold (85g gold or 595g silver) to be liable for zakat
- "Uruf" is a state-specific minimum for jewelry zakat (varies widely by state)
