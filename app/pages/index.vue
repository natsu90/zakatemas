<template>
  <div class="page">

    <!-- ── Header ── -->
    <header class="header">
      <div class="header-brand">
        <div class="logo-mark">
          <span class="logo-glyph">z</span>
        </div>
        <div class="header-text">
          <div class="header-title">ZakatEmas</div>
          <div class="header-state">{{ selectedState || 'PILIH NEGERI' }}</div>
        </div>
      </div>
      <div class="header-actions">
        <NuxtLink to="/create" class="icon-btn" aria-label="Tambah">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M8 2V14M2 8H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </NuxtLink>
        <button class="icon-btn" aria-label="Tetapan" @click="modalState = selectedState; showStateModal = true">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M8 1V3M8 13V15M3.5 3.5L4.9 4.9M11.1 11.1L12.5 12.5M1 8H3M13 8H15M3.5 12.5L4.9 11.1M11.1 4.9L12.5 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            <circle cx="8" cy="8" r="2.6" stroke="currentColor" stroke-width="1.3"/>
          </svg>
        </button>
      </div>
    </header>

    <!-- ── Hero: Price Ticker ── -->
    <section class="hero-card">
      <div class="hero-top">
        <div>
          <div class="eyebrow">Harga Spot · MYR / gram</div>
          <div class="hero-price-row">
            <span class="hero-currency">RM</span>
            <span class="hero-integer">{{ heroInteger }}</span>
            <span class="hero-decimal">.{{ heroDecimal }}</span>
          </div>
        </div>
        <div class="hero-right">
          <div class="change-pill" :class="change24h >= 0 ? 'pill-up' : 'pill-down'">
            <svg width="9" height="9" viewBox="0 0 10 10">
              <path :d="change24h >= 0 ? 'M2 7L5 3L8 7' : 'M2 3L5 7L8 3'" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ Math.abs(change24h).toFixed(2) }}%
          </div>
          <span class="change-label">24H</span>
        </div>
      </div>

      <!-- Sparkline -->
      <div class="sparkline-wrap">
        <svg class="sparkline-svg" viewBox="0 0 310 48" preserveAspectRatio="none" overflow="visible">
          <defs>
            <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="#e2b34a" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="#e2b34a" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <path :d="sparkArea" fill="url(#sparkFill)"/>
          <path :d="sparkLine" stroke="#e2b34a" stroke-width="1.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
          <circle :cx="sparkDotX" :cy="sparkDotY" r="6" fill="#e2b34a" opacity="0.18"/>
          <circle :cx="sparkDotX" :cy="sparkDotY" r="2.6" fill="#e2b34a"/>
        </svg>
      </div>

      <!-- Karat tabs -->
      <div class="karat-tabs">
        <button
          v-for="tab in karatTabs"
          :key="tab.k"
          class="karat-tab"
          :class="{ active: activeKarat === tab.k }"
          @click="activeKarat = tab.k"
        >
          <span class="karat-label">{{ tab.label }}</span>
          <span class="karat-price">{{ tab.price.toFixed(2) }}</span>
        </button>
      </div>

      <!-- Live footer -->
      <div class="hero-footer">
        <span class="live-row">
          <span class="live-dot"></span>
          LIVE · {{ formatDateTime(prices.updated_at) }}
        </span>
        <span class="week-text">MINGGU {{ weekChangeText }}</span>
      </div>
    </section>

    <!-- ── Nisab Meter ── -->
    <section v-if="entries.length" class="info-card">
      <div class="nisab-head">
        <span class="eyebrow muted">Menuju Nisab Emas</span>
        <span class="nisab-pct-label">{{ nisabPct }}%</span>
      </div>
      <div class="nisab-grams">
        <span class="big-num">{{ nisabDisplayWeight.toFixed(2) }}</span>
        <span class="unit-g">g</span>
        <span class="nisab-of">/ 85g nisab</span>
      </div>
      <div class="progress-outer">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: nisabPct + '%' }"></div>
        </div>
        <div v-for="t in [25, 50, 75]" :key="t" class="progress-tick" :style="{ left: t + '%' }"></div>
      </div>
      <div class="nisab-caption">
        Baki <span class="nisab-highlight">{{ nisabRemaining }}g</span> sebelum wajib zakat emas pelaburan.
      </div>
    </section>

    <!-- ── Portfolio ── -->
    <section v-if="entries.length && portfolioTotal > 0" class="info-card">
      <div class="portfolio-head">
        <div>
          <div class="eyebrow muted">Portfolio Semasa</div>
          <div class="portfolio-total-row">
            <span class="total-rm">RM</span>
            <span class="big-num">{{ portfolioTotal.toLocaleString('en-MY', { maximumFractionDigits: 0 }) }}</span>
          </div>
        </div>
        <div v-if="hasNisab" class="change-pill pill-up">
          <svg width="9" height="9" viewBox="0 0 10 10">
            <path d="M2 7L5 3L8 7" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ zakatPct }}%
        </div>
      </div>

      <!-- Stacked allocation bar -->
      <div class="stack-bar">
        <div v-if="summaryInvest.worth > 0" class="stack-seg" style="background: #e2b34a;" :style="{ flex: summaryInvest.worth }"></div>
        <div v-if="summaryWorn.worth > 0" class="stack-seg" style="background: #c49524;" :style="{ flex: summaryWorn.worth }"></div>
        <div v-if="summarySilver.worth > 0" class="stack-seg" style="background: #c8d3e0;" :style="{ flex: summarySilver.worth }"></div>
      </div>

      <div class="portfolio-rows">
        <div v-if="summaryInvest.gram > 0" class="portfolio-row">
          <span class="row-dot" style="background: #e2b34a;"></span>
          <span class="row-label">Emas Pelaburan</span>
          <span class="row-gram">{{ summaryInvest.gram }}g</span>
          <span class="row-worth">RM {{ summaryInvest.worth.toLocaleString('en-MY', { maximumFractionDigits: 0 }) }}</span>
        </div>
        <div v-if="summaryWorn.gram > 0" class="portfolio-row">
          <span class="row-dot" style="background: #c49524;"></span>
          <span class="row-label">Barang Kemas</span>
          <span class="row-gram">{{ summaryWorn.gram }}g</span>
          <span class="row-worth">RM {{ summaryWorn.worth.toLocaleString('en-MY', { maximumFractionDigits: 0 }) }}</span>
        </div>
        <div v-if="summarySilver.gram > 0" class="portfolio-row">
          <span class="row-dot" style="background: #c8d3e0;"></span>
          <span class="row-label">Perak</span>
          <span class="row-gram">{{ summarySilver.gram }}g</span>
          <span class="row-worth">RM {{ summarySilver.worth.toLocaleString('en-MY', { maximumFractionDigits: 0 }) }}</span>
        </div>
      </div>
    </section>

    <!-- ── Entry List ── -->
    <section class="entry-section">
      <div class="entry-header">
        <span class="eyebrow muted">Rekod · {{ entries.length }}</span>
        <NuxtLink to="/create" class="add-link">+ TAMBAH</NuxtLink>
      </div>

      <div v-if="displayItems.length === 0" class="empty">
        <div class="empty-glyph">◈</div>
        <p>Tiada rekod lagi.</p>
        <NuxtLink to="/create" class="btn-add-first">Tambah Rekod Pertama</NuxtLink>
      </div>

      <div v-else class="entry-list">
        <div v-for="item in displayItems" :key="item.key" class="entry-card">

          <!-- Digital group -->
          <template v-if="item.type === 'digital-group'">
            <div class="entry-inner" @click="toggleGroup(item.key)" style="cursor: pointer;">
              <div class="entry-thumb thumb-gold">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="8" width="18" height="11" rx="1.2" stroke="#e2b34a" stroke-width="1.3"/>
                  <path d="M6 8L8 5H16L18 8" stroke="#e2b34a" stroke-width="1.3" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="entry-body">
                <div class="entry-name">{{ platformNames[item.platform] || item.platform }}</div>
                <div class="entry-meta">
                  <span class="meta-pill meta-digital">DIGITAL · {{ item.count }}</span>
                  <span v-if="!expandedGroups.has(item.key)" class="meta-date">· {{ formatDate(item.entries[0].date) }}</span>
                </div>
                <div v-if="expandedGroups.has(item.key)" class="entry-records">
                  <div v-for="e in item.entries" :key="e._id" class="record-row-inner">
                    <span class="rec-date">{{ formatDate(e.date) }}</span>
                    <span class="rec-gram">{{ e.gram }}g</span>
                    <button class="rec-del" @click.stop="handleDelete(e)">✕</button>
                  </div>
                </div>
              </div>
              <div class="entry-weight">
                <div class="wt-num">{{ item.totalGram.toFixed(item.totalGram >= 100 ? 1 : 2) }}<span class="wt-unit">g</span></div>
                <div class="wt-rm">RM {{ Math.round(item.totalGram * (item.metal_type === 'gold' ? GOLD_PRICE : SILVER_PRICE)).toLocaleString('en-MY') }}</div>
              </div>
              <div class="entry-side-actions">
                <NuxtLink :to="`/edit-digital/${item.platform}`" class="entry-edit" @click.stop>✎</NuxtLink>
                <span class="collapse-caret" :class="{ expanded: expandedGroups.has(item.key) }">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </div>
            </div>
          </template>

          <!-- Physical entry -->
          <template v-else>
            <div class="entry-inner">
              <div class="entry-thumb" :class="item.entry.metal_type === 'gold' ? 'thumb-gold' : 'thumb-silver'">
                <svg v-if="item.entry.metal_type === 'gold'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="8" width="18" height="11" rx="1.2" stroke="#e2b34a" stroke-width="1.3"/>
                  <path d="M6 8L8 5H16L18 8" stroke="#e2b34a" stroke-width="1.3" stroke-linejoin="round"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="7" stroke="#c8d3e0" stroke-width="1.3"/>
                </svg>
              </div>
              <div class="entry-body">
                <div class="entry-name">{{ item.entry.name_string || (item.entry.metal_type === 'gold' ? 'Emas' : 'Perak') }}</div>
                <div class="entry-meta">
                  <span class="meta-pill meta-physical">FIZIKAL</span>
                  <span v-if="item.entry.metal_type === 'gold'" class="meta-date">· {{ item.entry.is_worn ? 'Kemas' : 'Pelaburan' }}</span>
                  <span v-if="item.entry.is_collateral" class="meta-collateral">· Ar-Rahnu</span>
                  <span v-if="item.entry.is_bulk" class="meta-date">· Pukal</span>
                  <span class="meta-date">· {{ formatDate(item.entry.date) }}</span>
                </div>
                <img v-if="item.entry.image_string" :src="item.entry.image_string" class="entry-img"/>
              </div>
              <div class="entry-weight">
                <div class="wt-num">{{ item.entry.gram.toFixed(item.entry.gram >= 100 ? 1 : 2) }}<span class="wt-unit">g</span></div>
                <div class="wt-rm">RM {{ entryRm(item.entry).toLocaleString('en-MY') }}</div>
              </div>
              <div class="entry-side-actions">
                <NuxtLink :to="`/edit/${item.entry._id}`" class="entry-edit">✎</NuxtLink>
                <button class="entry-del" @click="handleDelete(item.entry)">✕</button>
              </div>
            </div>
          </template>

        </div>
      </div>
    </section>

    <!-- ── Bottom Bayar Footer ── -->
    <div v-if="displayItems.length" class="bayar-footer">
      <div class="bayar-card">
        <div class="bayar-info">
          <div class="eyebrow">{{ hasNisab ? 'Jumlah Zakat Wajib' : futureZakat ? 'Anggaran Zakat' : 'Jumlah Zakat' }}</div>
          <div class="bayar-amount-row">
            <span class="bayar-rm">RM</span>
            <span class="bayar-int">{{ zakatInt.toLocaleString('en-MY') }}</span>
            <span class="bayar-dec">.{{ zakatDec }}</span>
          </div>
        </div>
        <button v-if="hasNisab" class="btn-bayar-cta" @click="showBayarModal = true">
          Bayar
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M3 7H11M11 7L7 3M11 7L7 11" stroke="#0a0806" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button v-else-if="futureZakat" class="btn-bayar-future">
          Bayar pada<br/>{{ formatDate(futureZakat.date.toISOString()) }}
        </button>
        <span v-else class="bayar-status">Tidak Wajib</span>
      </div>
    </div>

    <!-- ── Floating Buttons ── -->
    <button class="btn-float btn-float-share" @click="openShareModal" aria-label="Kongsi">
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M7.5 1.5V9.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
        <path d="M4.5 4.5L7.5 1.5L10.5 4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2.5 8.5V12.5H12.5V8.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- ── Modal: State ── -->
    <div v-if="showStateModal" class="modal-overlay" @click.self="selectedState && (showStateModal = false, modalState = selectedState)">
      <div class="modal-card">
        <div class="modal-icon">◈</div>
        <h2 class="modal-title">Pilih Negeri</h2>
        <p class="modal-subtitle">Kadar uruf emas berbeza mengikut negeri</p>
        <select v-model="modalState" class="input modal-select">
          <option value="" disabled>-- Pilih negeri --</option>
          <option v-for="s in STATE_URUF" :key="s.label" :value="s.label">{{ s.label }} — {{ s.label === 'Perlis' ? 'Tiada Uruf, Ikut Nisab 85g' : s.value + 'g' }}</option>
        </select>
        <div class="modal-prices">
          <div class="modal-price-row">
            <span>Emas 999</span>
            <span class="modal-price-value">RM {{ GOLD_PRICE.toFixed(2) }}/g</span>
          </div>
          <div class="modal-price-row">
            <span>Perak</span>
            <span class="modal-price-value">RM {{ SILVER_PRICE.toFixed(2) }}/g</span>
          </div>
          <div class="modal-price-updated">Dikemaskini {{ formatDateTime(prices.updated_at) }}</div>
        </div>
        <button class="btn-submit" :disabled="!modalState" @click="saveState">Simpan</button>
        <p class="modal-credit">Dibina oleh <a href="https://sulai.mn/" target="_blank" rel="noopener">Sulaiman Sudirman</a></p>
        <p class="modal-credit">Maklumbalas: <a href="mailto:contact@zakatemas.app">contact@zakatemas.app</a></p>
      </div>
    </div>

    <!-- ── Modal: Bayar ── -->
    <div v-if="showBayarModal" class="modal-overlay" @click.self="showBayarModal = false">
      <div class="modal-card">
        <h2 class="modal-title">Bayar Zakat</h2>
        <p class="modal-subtitle">Sila bayar di pautan berikut dengan maklumat di bawah:</p>
        <div class="modal-bayar-info">
          <div v-if="nisabWeight >= NISAB_GRAM || urufWeight > URUF_GOLD_GRAM" class="modal-bayar-row">
            <span>Jenis Zakat</span>
            <span class="modal-bayar-value">ZAKAT EMAS</span>
          </div>
          <div v-else class="modal-bayar-row">
            <span>Jenis Zakat</span>
            <span class="modal-bayar-value">ZAKAT PERAK</span>
          </div>
          <div class="modal-bayar-row">
            <span>Haul / Tahun</span>
            <span class="modal-bayar-value">{{ new Date().getFullYear() }}</span>
          </div>
          <div class="modal-bayar-row">
            <span>Jumlah Bayaran (RM)</span>
            <span class="modal-bayar-value modal-bayar-amount">{{ zakatAmount.toFixed(2) }}</span>
          </div>
        </div>
        <a href="https://fpx.zakatselangor.com.my/" target="_blank" rel="noopener" class="btn-bayar-link">Bayar di Zakat Selangor ↗</a>
        <p class="modal-subtitle" style="margin-top: 12px;">Kemudian klik butang di bawah selepas bayaran berjaya.</p>
        <button class="btn-submit" @click="handleBayar">Selesai Bayaran</button>
      </div>
    </div>

    <!-- ── Modal: Share ── -->
    <div v-if="showShareModal" class="modal-overlay" @click.self="showShareModal = false">
      <div class="modal-card">
        <h2 class="modal-title">Kongsi Data</h2>
        <p class="modal-subtitle">Salin pautan untuk import data ke peranti lain. Imej tidak disertakan.</p>
        <div v-if="shareLoading" class="share-loading">
          <div class="share-spinner"></div>
          <span>Menjana pautan…</span>
        </div>
        <template v-else-if="shareUrl">
          <div v-if="shareQrDataUrl" class="share-qr-wrap">
            <img :src="shareQrDataUrl" alt="QR kod pautan kongsi" class="share-qr" />
          </div>
          <div class="share-url-box">
            <span class="share-url-text">{{ shareUrl }}</span>
          </div>
          <button class="btn-submit" :class="{ copied: shareCopied }" @click="copyShareUrl">
            {{ shareCopied ? '✓ Disalin!' : 'Salin Pautan' }}
          </button>
        </template>
        <template v-else>
          <p class="share-empty">Tiada rekod untuk dikongsi.</p>
        </template>
      </div>
    </div>

    <div style="height: 120px;"></div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Kalkulator Zakat Emas & Perak' })

const { entries, fetchEntries, updateEntry, deleteEntry } = useEntries()

const { data: prices } = await useFetch('/data.json', { default: () => ({ gold_price: 650, silver_price: 12, updated_at: new Date().toISOString() }) })
const GOLD_PRICE = computed(() => prices.value.gold_price)
const SILVER_PRICE = computed(() => prices.value.silver_price)

onMounted(() => {
  fetchEntries()
  const saved = localStorage.getItem('selectedState')
  if (saved) {
    selectedState.value = saved
  } else {
    showStateModal.value = true
  }
})

type DisplayItem =
  | { type: 'entry'; key: string; entry: any }
  | { type: 'digital-group'; key: string; platform: string; metal_type: string; totalGram: number; count: number; entries: any[] }

const displayItems = computed<DisplayItem[]>(() => {
  const items: DisplayItem[] = []
  const digitalGroups = new Map<string, any[]>()

  for (const e of entries.value) {
    if (e.metal_state === 'digital') {
      const group = digitalGroups.get(e.name_string) || []
      group.push(e)
      digitalGroups.set(e.name_string, group)
    } else {
      items.push({ type: 'entry', key: e._id, entry: e })
    }
  }

  for (const [platform, group] of digitalGroups) {
    group.sort((a: any, b: any) => b.date.localeCompare(a.date))
    items.push({
      type: 'digital-group',
      key: `digital-${platform}`,
      platform,
      metal_type: group[0].metal_type,
      totalGram: parseFloat(group.reduce((sum: number, e: any) => sum + e.gram, 0).toFixed(3)),
      count: group.length,
      entries: group,
    })
  }

  items.sort((a, b) => {
    const dateA = a.type === 'entry' ? a.entry.date : a.entries[0].date
    const dateB = b.type === 'entry' ? b.entry.date : b.entries[0].date
    return dateB.localeCompare(dateA)
  })

  return items
})

const STATE_URUF = [
  { label: 'Terengganu', value: 850 },
  { label: 'Wilayah Persekutuan & Selangor', value: 800 },
  { label: 'Kelantan', value: 600 },
  { label: 'Perak', value: 500 },
  { label: 'Pahang', value: 500 },
  { label: 'Johor', value: 425 },
  { label: 'Pulau Pinang', value: 250 },
  { label: 'Negeri Sembilan', value: 200 },
  { label: 'Kedah', value: 200 },
  { label: 'Melaka', value: 180 },
  { label: 'Sabah', value: 152 },
  { label: 'Sarawak', value: 90 },
  { label: 'Perlis', value: 85 },
]

const selectedState = ref('')
const modalState = ref('')
const showStateModal = ref(false)
const showBayarModal = ref(false)
const expandedGroups = ref(new Set<string>())

const toggleGroup = (key: string) => {
  const next = new Set(expandedGroups.value)
  next.has(key) ? next.delete(key) : next.add(key)
  expandedGroups.value = next
}

const NISAB_GRAM = 85
const isPerlis = computed(() => selectedState.value === 'Perlis')
const URUF_GOLD_GRAM = computed(() => {
  if (isPerlis.value) return 0
  const found = STATE_URUF.find((s) => s.label === selectedState.value)
  return found ? found.value : 800
})
const URUF_SILVER_GRAM = 595
const ZAKAT_RATE = 0.025
const HAUL_DAYS = 354

const hasHaul = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  return diff >= HAUL_DAYS * 24 * 60 * 60 * 1000
}

const getAdjustedGram = (e: any) => {
  const base = e.gold_percent && e.gold_percent !== 999
    ? e.gram * (e.gold_percent / 1000)
    : e.gram
  if (e.is_collateral && e.loan_amount) {
    const netValue = base * GOLD_PRICE.value - e.loan_amount
    return netValue > 0 ? netValue / GOLD_PRICE.value : 0
  }
  return base
}

const nisabWeight = computed(() => {
  let total = 0
  for (const e of entries.value) {
    if (e.metal_type !== 'gold' || !hasHaul(e.date)) continue
    if (e.metal_state === 'digital') {
      total += e.gram
    } else if (!e.is_worn || isPerlis.value) {
      total += getAdjustedGram(e)
    }
  }
  return parseFloat(total.toFixed(3))
})

const urufWeight = computed(() => {
  if (isPerlis.value) return 0
  let total = 0
  for (const e of entries.value) {
    if (e.metal_type !== 'gold' || !hasHaul(e.date)) continue
    if (e.metal_state === 'physical' && e.is_worn) {
      total += getAdjustedGram(e)
    }
  }
  return parseFloat(total.toFixed(3))
})

const silverWeight = computed(() => {
  let total = 0
  for (const e of entries.value) {
    if (e.metal_type === 'silver' && hasHaul(e.date)) {
      total += e.gram
    }
  }
  return parseFloat(total.toFixed(3))
})

const summaryInvest = computed(() => {
  let gram = 0
  for (const e of entries.value) {
    if (e.metal_type !== 'gold') continue
    if (e.metal_state === 'digital') gram += e.gram
    else if (!e.is_worn) gram += getAdjustedGram(e)
  }
  gram = parseFloat(gram.toFixed(3))
  return { gram, worth: gram * GOLD_PRICE.value }
})

const summaryWorn = computed(() => {
  let gram = 0
  for (const e of entries.value) {
    if (e.metal_type === 'gold' && e.metal_state === 'physical' && e.is_worn) {
      gram += getAdjustedGram(e)
    }
  }
  gram = parseFloat(gram.toFixed(3))
  return { gram, worth: gram * GOLD_PRICE.value }
})

const summarySilver = computed(() => {
  let gram = 0
  for (const e of entries.value) {
    if (e.metal_type === 'silver') gram += e.gram
  }
  gram = parseFloat(gram.toFixed(3))
  return { gram, worth: gram * SILVER_PRICE.value }
})

const hasNisab = computed(() =>
  nisabWeight.value >= NISAB_GRAM
  || urufWeight.value > URUF_GOLD_GRAM.value
  || silverWeight.value > URUF_SILVER_GRAM,
)

const zakatAmount = computed(() => {
  let total = 0
  if (nisabWeight.value >= NISAB_GRAM) {
    total += nisabWeight.value * GOLD_PRICE.value
  }
  if (urufWeight.value > URUF_GOLD_GRAM.value) {
    total += (urufWeight.value - URUF_GOLD_GRAM.value) * GOLD_PRICE.value
  }
  if (silverWeight.value > URUF_SILVER_GRAM) {
    total += (silverWeight.value - URUF_SILVER_GRAM) * SILVER_PRICE.value
  }
  return parseFloat((total * ZAKAT_RATE).toFixed(2))
})

const futureZakat = computed(() => {
  if (hasNisab.value) return null

  const haulMs = HAUL_DAYS * 24 * 60 * 60 * 1000
  const now = Date.now()

  const pending = entries.value
    .filter((e) => !hasHaul(e.date))
    .map((e) => ({
      entry: e,
      haulDate: new Date(new Date(e.date).getTime() + haulMs),
    }))
    .filter((p) => p.haulDate.getTime() > now)
    .sort((a, b) => a.haulDate.getTime() - b.haulDate.getTime())

  if (!pending.length) return null

  let runNisab = nisabWeight.value
  let runUruf = urufWeight.value
  let runSilver = silverWeight.value

  for (const p of pending) {
    const e = p.entry
    if (e.metal_type === 'gold') {
      if (e.metal_state === 'digital') {
        runNisab += e.gram
      } else if (!e.is_worn || isPerlis.value) {
        runNisab += getAdjustedGram(e)
      } else {
        runUruf += getAdjustedGram(e)
      }
    } else if (e.metal_type === 'silver') {
      runSilver += e.gram
    }

    if (runNisab >= NISAB_GRAM || runUruf > URUF_GOLD_GRAM.value || runSilver > URUF_SILVER_GRAM) {
      let total = 0
      if (runNisab >= NISAB_GRAM) total += runNisab * GOLD_PRICE.value
      if (runUruf > URUF_GOLD_GRAM.value) total += (runUruf - URUF_GOLD_GRAM.value) * GOLD_PRICE.value
      if (runSilver > URUF_SILVER_GRAM) total += (runSilver - URUF_SILVER_GRAM) * SILVER_PRICE.value
      return { date: p.haulDate, amount: parseFloat((total * ZAKAT_RATE).toFixed(2)) }
    }
  }

  return null
})

const handleBayar = async () => {
  const today = new Date().toISOString().split('T')[0]
  const toUpdate = entries.value.filter((e) => {
    if (!hasHaul(e.date)) return false
    if (e.metal_type === 'gold') {
      if (e.metal_state === 'digital') return nisabWeight.value >= NISAB_GRAM
      if (!e.is_worn || isPerlis.value) return nisabWeight.value >= NISAB_GRAM
      if (e.is_worn) return urufWeight.value > URUF_GOLD_GRAM.value
    }
    if (e.metal_type === 'silver') return silverWeight.value > URUF_SILVER_GRAM
    return false
  })
  for (const e of toUpdate) {
    await updateEntry({ ...e, date: today })
  }
  showBayarModal.value = false
}

const handleDelete = async (entry: any) => {
  if (confirm('Padam rekod ini?')) {
    await deleteEntry(entry)
  }
}

const platformNames: Record<string, string> = {
  AGROBANK: 'Agrobank AGROGold Account-i',
  BANKISLAM: 'Bank Islam Gold Account-i',
  BANKRAKYAT: 'Bank Rakyat eGold-i',
  BSN: 'BSN MyGold Account-i',
  BURSA: 'Bursa Gold Dinar',
  MAYBANK: 'Maybank Islamic Gold Account-i',
  MBSB: 'MBSB Bank PrimeGold-i',
  MEEM: 'MEEM Gold GSS',
  MEEMSILVER: 'MEEM Gold SSS',
  PGSILVER: 'Public Gold SAP',
  PUBLICGOLD: 'Public Gold GAP',
}

const saveState = () => {
  if (!modalState.value) return
  selectedState.value = modalState.value
  localStorage.setItem('selectedState', modalState.value)
  showStateModal.value = false
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('ms-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// ── Hero computed ──
const activeKarat = ref('999')

const karatTabs = computed(() => [
  { k: '999', label: '999', price: GOLD_PRICE.value },
  { k: '916', label: '916', price: GOLD_PRICE.value * 0.916 },
  { k: '750', label: '750', price: GOLD_PRICE.value * 0.750 },
  { k: 'AG',  label: 'AG',  price: SILVER_PRICE.value },
])

const heroPrice = computed(() => {
  const tab = karatTabs.value.find(t => t.k === activeKarat.value)
  return tab ? tab.price : GOLD_PRICE.value
})

const heroInteger = computed(() => Math.floor(heroPrice.value))
const heroDecimal = computed(() => (heroPrice.value % 1).toFixed(2).slice(2))

// Simulated 30-day sparkline
const SPARK_DATA = [
  662, 665, 668, 664, 670, 672, 675, 678, 676, 681,
  685, 688, 684, 690, 693, 691, 695, 698, 696, 692,
  689, 686, 688, 691, 694, 690, 686, 690, 692, 694,
]

const sparkPaths = computed(() => {
  const data = SPARK_DATA
  const W = 310, H = 48
  const min = Math.min(...data), max = Math.max(...data)
  const range = Math.max(1, max - min)
  const stepX = W / (data.length - 1)
  const pts = data.map((v, i) => [
    i * stepX,
    H - ((v - min) / range) * (H - 6) - 3,
  ])
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const area = `${line} L${W} ${H} L0 ${H} Z`
  const last = pts[pts.length - 1]
  return { line, area, dotX: last[0].toFixed(1), dotY: last[1].toFixed(1) }
})

const sparkLine = computed(() => sparkPaths.value.line)
const sparkArea = computed(() => sparkPaths.value.area)
const sparkDotX = computed(() => sparkPaths.value.dotX)
const sparkDotY = computed(() => sparkPaths.value.dotY)

const change24h = computed(() => (prices.value as any).change24h ?? 1.42)
const weekChangeText = computed(() => {
  const v = (prices.value as any).change7d ?? -0.83
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
})

// ── Nisab meter (all gold, no haul filter) ──
const nisabDisplayWeight = computed(() => {
  let total = 0
  for (const e of entries.value) {
    if (e.metal_type !== 'gold') continue
    if (e.metal_state === 'digital') {
      total += e.gram
    } else if (!e.is_worn || isPerlis.value) {
      total += getAdjustedGram(e)
    }
  }
  return parseFloat(total.toFixed(3))
})
const nisabPct = computed(() => Math.min(100, Math.round((nisabDisplayWeight.value / NISAB_GRAM) * 100)))
const nisabRemaining = computed(() => Math.max(0, NISAB_GRAM - nisabDisplayWeight.value).toFixed(2))

// ── Portfolio ──
const portfolioTotal = computed(() =>
  summaryInvest.value.worth + summaryWorn.value.worth + summarySilver.value.worth
)

const zakatPct = computed(() => {
  if (!portfolioTotal.value) return '0.00'
  return ((zakatAmount.value / portfolioTotal.value) * 100).toFixed(2)
})

// ── Bayar footer ──
const displayZakatAmount = computed(() => {
  if (hasNisab.value) return zakatAmount.value
  if (futureZakat.value) return futureZakat.value.amount
  return 0
})
const zakatInt = computed(() => Math.floor(displayZakatAmount.value))
const zakatDec = computed(() => (displayZakatAmount.value % 1).toFixed(2).slice(2))

// ── Entry RM helper ──
const entryRm = (e: any) => {
  if (e.metal_type === 'silver') return Math.round(e.gram * SILVER_PRICE.value)
  const purity = (e.gold_percent || 999) / 999
  return Math.round(e.gram * GOLD_PRICE.value * purity)
}

// ── Share ──
const showShareModal = ref(false)
const shareUrl = ref('')
const shareQrDataUrl = ref('')
const shareLoading = ref(false)
const shareCopied = ref(false)

const openShareModal = async () => {
  showShareModal.value = true
  shareLoading.value = true
  shareUrl.value = ''
  shareQrDataUrl.value = ''
  shareCopied.value = false

  if (!entries.value.length) {
    shareLoading.value = false
    return
  }

  try {
    const lib = await import('json-url')
    const codec = (lib.default || lib)('lzma')
    const data = entries.value.map(({ _rev, image_string, ...e }: any) => e)
    const compressed = await codec.compress(data)
    const appRoot = window.location.href.split('?')[0].split('#')[0].replace(/\/+$/, '')
    shareUrl.value = `${appRoot}/share/${compressed}`
    const QRCode = await import('qrcode')
    shareQrDataUrl.value = await QRCode.toDataURL(shareUrl.value, { width: 220, margin: 2 })
  } catch (e) {
    console.error(e)
  } finally {
    shareLoading.value = false
  }
}

const copyShareUrl = async () => {
  if (!shareUrl.value) return
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    shareCopied.value = true
    setTimeout(() => { shareCopied.value = false }, 2500)
  } catch {
    // noop
  }
}
</script>

<style scoped>
/* ── Page ── */
.page {
  max-width: 480px;
  margin: 0 auto;
  padding: 0 14px;
  padding-top: 70px;
  background: #0a0806;
  min-height: 100vh;
  font-family: 'Outfit', system-ui, sans-serif;
}

/* ── Header ── */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  max-width: 480px;
  margin: 0 auto;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(10, 8, 6, 0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-mark {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: linear-gradient(140deg, #e2b34a, #c49524);
  display: grid;
  place-items: center;
  box-shadow: 0 4px 14px rgba(226,179,74,0.16), inset 0 1px 0 rgba(255,255,255,0.3);
  flex-shrink: 0;
}

.logo-glyph {
  font-family: 'Fraunces', 'Cormorant Garamond', serif;
  font-size: 17px;
  font-weight: 700;
  font-style: italic;
  color: #0a0806;
  line-height: 1;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header-title {
  font-size: 14px;
  font-weight: 600;
  color: #f4ecd6;
  line-height: 1;
  letter-spacing: -0.2px;
}

.header-state {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  color: #5a4f3f;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.header-actions {
  display: flex;
  gap: 6px;
}

.icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #1e1913;
  border: 1px solid rgba(255,255,255,0.06);
  display: grid;
  place-items: center;
  cursor: pointer;
  color: #a89878;
  text-decoration: none;
  transition: background 0.15s, border-color 0.15s;
}
.icon-btn:hover {
  background: #252018;
  border-color: rgba(226,179,74,0.18);
  color: #e2b34a;
}

/* ── Eyebrow ── */
.eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: #e2b34a;
}
.eyebrow.muted {
  color: #a89878;
}

/* ── Big num ── */
.big-num {
  font-family: 'Fraunces', 'Cormorant Garamond', serif;
  font-variant-numeric: tabular-nums lining-nums;
  letter-spacing: -0.5px;
  line-height: 1;
}

/* ── Hero card ── */
.hero-card {
  margin: 14px 0 0;
  background: radial-gradient(120% 100% at 100% 0%, rgba(226,179,74,0.10), transparent 60%), #181410;
  border: 1px solid rgba(212,160,23,0.18);
  border-radius: 18px;
  padding: 14px 16px 16px;
  position: relative;
  overflow: hidden;
}

.hero-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.hero-price-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 8px;
}

.hero-currency {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #a89878;
  font-weight: 500;
  margin-right: 2px;
}

.hero-integer {
  font-family: 'Fraunces', 'Cormorant Garamond', serif;
  font-size: 46px;
  font-weight: 400;
  color: #f4ecd6;
  font-variant-numeric: tabular-nums lining-nums;
  letter-spacing: -0.5px;
  line-height: 1;
}

.hero-decimal {
  font-family: 'Fraunces', 'Cormorant Garamond', serif;
  font-size: 22px;
  font-weight: 400;
  color: #a89878;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.hero-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.change-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px 3px 6px;
  border-radius: 999px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.pill-up {
  background: rgba(123,211,160,0.10);
  border: 1px solid rgba(123,211,160,0.25);
  color: #7bd3a0;
}
.pill-down {
  background: rgba(239,107,107,0.10);
  border: 1px solid rgba(239,107,107,0.25);
  color: #ef6b6b;
}

.change-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: #5a4f3f;
}

/* Sparkline */
.sparkline-wrap {
  margin-top: 10px;
  margin-left: -4px;
  margin-right: -4px;
}
.sparkline-svg {
  display: block;
  width: 100%;
  height: 48px;
}

/* Karat tabs */
.karat-tabs {
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 4px;
  background: rgba(0,0,0,0.25);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 3px;
}

.karat-tab {
  background: transparent;
  border: 1px solid transparent;
  border-radius: 9px;
  padding: 7px 4px 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  transition: background 0.15s, border-color 0.15s;
}
.karat-tab.active {
  background: linear-gradient(180deg, rgba(226,179,74,0.18), rgba(226,179,74,0.06));
  border-color: rgba(212,160,23,0.18);
}

.karat-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  color: #a89878;
  letter-spacing: 0.4px;
  transition: color 0.15s;
}
.karat-tab.active .karat-label {
  color: #e2b34a;
}

.karat-price {
  font-size: 12px;
  font-weight: 500;
  font-family: 'JetBrains Mono', monospace;
  color: #5a4f3f;
  font-variant-numeric: tabular-nums;
  transition: color 0.15s;
}
.karat-tab.active .karat-price {
  color: #f4ecd6;
}

/* Hero footer */
.hero-footer {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px dashed rgba(255,255,255,0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  color: #5a4f3f;
}

.live-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #7bd3a0;
  box-shadow: 0 0 6px #7bd3a0;
  flex-shrink: 0;
}

/* ── Info Card (Nisab / Portfolio) ── */
.info-card {
  margin: 12px 0 0;
  padding: 14px 16px;
  background: #181410;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 18px;
}

/* Nisab */
.nisab-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nisab-pct-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #5a4f3f;
  font-variant-numeric: tabular-nums;
}

.nisab-grams {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 8px;
}

.nisab-grams .big-num {
  font-size: 36px;
  font-weight: 400;
  color: #f4ecd6;
}

.unit-g {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #a89878;
}

.nisab-of {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #5a4f3f;
  margin-left: 4px;
}

.progress-outer {
  margin-top: 12px;
  position: relative;
}

.progress-track {
  height: 8px;
  border-radius: 999px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #c49524, #e2b34a);
  border-radius: 999px;
  box-shadow: 0 0 12px rgba(226,179,74,0.16);
  transition: width 0.5s ease;
}

.progress-tick {
  position: absolute;
  top: 0;
  width: 1px;
  height: 8px;
  background: rgba(0,0,0,0.4);
  transform: translateX(-50%);
}

.nisab-caption {
  margin-top: 10px;
  font-size: 11.5px;
  color: #5a4f3f;
  line-height: 1.5;
}

.nisab-highlight {
  color: #e2b34a;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
}

/* Portfolio */
.portfolio-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.portfolio-total-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 6px;
}

.total-rm {
  font-size: 12px;
  color: #a89878;
  font-family: 'JetBrains Mono', monospace;
}

.portfolio-total-row .big-num {
  font-size: 28px;
  font-weight: 400;
  color: #f4ecd6;
}

.stack-bar {
  margin-top: 12px;
  height: 6px;
  border-radius: 999px;
  overflow: hidden;
  display: flex;
  gap: 2px;
}

.stack-seg {
  border-radius: 999px;
  opacity: 0.85;
}

.portfolio-rows {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.portfolio-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.row-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  opacity: 0.85;
  flex-shrink: 0;
}

.row-label {
  font-size: 13px;
  color: #f4ecd6;
  flex: 1;
  font-weight: 500;
}

.row-gram {
  font-size: 12px;
  color: #5a4f3f;
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
}

.row-worth {
  font-size: 13px;
  color: #f4ecd6;
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  min-width: 82px;
  text-align: right;
}

/* ── Entry Section ── */
.entry-section {
  margin-top: 18px;
}

.entry-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px 10px;
}

.add-link {
  background: transparent;
  border: none;
  color: #e2b34a;
  font-size: 11.5px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.4px;
  cursor: pointer;
  text-decoration: none;
  transition: opacity 0.15s;
}
.add-link:hover {
  opacity: 0.8;
}

.empty {
  text-align: center;
  padding: 52px 16px;
  color: #a89878;
}
.empty-glyph {
  font-size: 2.5rem;
  color: #5a4f3f;
  margin-bottom: 12px;
  opacity: 0.6;
}
.empty p {
  margin: 0 0 16px;
  font-size: 0.9rem;
}
.btn-add-first {
  display: inline-block;
  background: #e2b34a;
  color: #0a0806;
  padding: 10px 22px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 0.15s;
}
.btn-add-first:hover {
  background: #ebc063;
}

.entry-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.entry-card {
  background: #181410;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  overflow: hidden;
  transition: border-color 0.15s;
}
.entry-card:hover {
  border-color: rgba(226,179,74,0.14);
}

.entry-inner {
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.entry-thumb {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
}
.thumb-gold {
  background: linear-gradient(135deg, rgba(226,179,74,0.18), rgba(196,149,36,0.08));
  border: 1px solid rgba(226,179,74,0.22);
}
.thumb-silver {
  background: linear-gradient(135deg, rgba(200,211,224,0.16), rgba(200,211,224,0.04));
  border: 1px solid rgba(200,211,224,0.18);
}

.entry-body {
  flex: 1;
  min-width: 0;
}

.entry-name {
  font-size: 14px;
  font-weight: 500;
  color: #f4ecd6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.entry-meta {
  margin-top: 3px;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  font-size: 10.5px;
  font-family: 'JetBrains Mono', monospace;
  color: #5a4f3f;
  letter-spacing: 0.3px;
}

.meta-pill {
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.meta-physical {
  background: rgba(123,211,160,0.10);
  color: #7bd3a0;
}
.meta-digital {
  background: rgba(120,170,255,0.10);
  color: #82adff;
}
.meta-date {
  color: #5a4f3f;
}
.meta-collateral {
  color: #ef6b6b;
  font-weight: 600;
}

.entry-img {
  max-width: 100%;
  max-height: 80px;
  border-radius: 6px;
  object-fit: contain;
  border: 1px solid rgba(255,255,255,0.06);
  margin-top: 6px;
}

.entry-records {
  margin-top: 6px;
  background: rgba(0,0,0,0.2);
  border-radius: 6px;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.record-row-inner {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.rec-date {
  flex: 1;
  color: #5a4f3f;
  font-family: 'JetBrains Mono', monospace;
}
.rec-gram {
  font-weight: 600;
  color: #f4ecd6;
  font-family: 'JetBrains Mono', monospace;
}
.rec-del {
  background: none;
  border: none;
  color: #5a4f3f;
  font-size: 10px;
  cursor: pointer;
  padding: 2px 5px;
  border-radius: 4px;
  transition: color 0.15s;
}
.rec-del:hover {
  color: #ef6b6b;
}

.entry-weight {
  text-align: right;
  flex-shrink: 0;
}

.wt-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  font-weight: 600;
  color: #f4ecd6;
  font-variant-numeric: tabular-nums;
}
.wt-unit {
  font-size: 11px;
  color: #5a4f3f;
  font-weight: 400;
  margin-left: 2px;
}
.wt-rm {
  font-size: 10.5px;
  color: #5a4f3f;
  font-family: 'JetBrains Mono', monospace;
  margin-top: 2px;
  font-variant-numeric: tabular-nums;
}

.entry-side-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.entry-edit {
  color: #5a4f3f;
  font-size: 13px;
  text-decoration: none;
  padding: 3px 6px;
  border-radius: 5px;
  transition: color 0.15s, background 0.15s;
}
.entry-edit:hover {
  color: #f4ecd6;
  background: rgba(255,255,255,0.06);
}

.entry-del {
  background: none;
  border: none;
  color: #5a4f3f;
  font-size: 11px;
  cursor: pointer;
  padding: 3px 6px;
  border-radius: 5px;
  transition: color 0.15s, background 0.15s;
}
.entry-del:hover {
  color: #ef6b6b;
  background: rgba(239,107,107,0.08);
}

.collapse-caret {
  color: #5a4f3f;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  transition: transform 0.2s, color 0.15s;
}
.collapse-caret.expanded {
  transform: rotate(180deg);
  color: #e2b34a;
}

/* ── Bayar Footer ── */
.bayar-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 480px;
  margin: 0 auto;
  padding: 10px 14px 14px;
  background: linear-gradient(180deg, transparent, rgba(0,0,0,0.5));
  z-index: 10;
}

.bayar-card {
  background: linear-gradient(135deg, rgba(226,179,74,0.10), rgba(196,149,36,0.02));
  border: 1px solid rgba(212,160,23,0.18);
  border-radius: 16px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  background-color: rgba(10, 8, 6, 0.88);
}

.bayar-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bayar-amount-row {
  display: flex;
  align-items: baseline;
  gap: 3px;
  margin-top: 2px;
}

.bayar-rm {
  font-size: 12px;
  color: #a89878;
  font-family: 'JetBrains Mono', monospace;
}

.bayar-int {
  font-family: 'Fraunces', 'Cormorant Garamond', serif;
  font-size: 26px;
  font-weight: 400;
  color: #f4ecd6;
  font-variant-numeric: tabular-nums lining-nums;
  letter-spacing: -0.5px;
  line-height: 1;
}

.bayar-dec {
  font-family: 'Fraunces', 'Cormorant Garamond', serif;
  font-size: 14px;
  font-weight: 400;
  color: #a89878;
  font-variant-numeric: tabular-nums;
}

.btn-bayar-cta {
  background: linear-gradient(180deg, #e2b34a, #c49524);
  color: #0a0806;
  border: none;
  padding: 12px 22px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(226,179,74,0.16), inset 0 1px 0 rgba(255,255,255,0.3);
  letter-spacing: 0.2px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: opacity 0.15s, transform 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
}
.btn-bayar-cta:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-bayar-future {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.06);
  color: #e2b34a;
  padding: 7px 12px;
  border-radius: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 500;
  cursor: default;
  text-align: center;
  max-width: 140px;
  line-height: 1.4;
  flex-shrink: 0;
}

.bayar-status {
  font-size: 13px;
  color: #5a4f3f;
  font-family: 'JetBrains Mono', monospace;
  flex-shrink: 0;
}

/* ── Float buttons ── */
.btn-float {
  position: fixed;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #181410;
  border: 1px solid rgba(255,255,255,0.06);
  color: #e2b34a;
  cursor: pointer;
  z-index: 15;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  transition: background 0.15s, border-color 0.15s;
}
.btn-float:hover {
  background: #1e1913;
  border-color: rgba(226,179,74,0.18);
}
.btn-float-share {
  bottom: 104px;
  right: 16px;
}

/* ── Modals (shared from global, minimal overrides) ── */
.modal-icon {
  font-size: 1.8rem;
  color: #e2b34a;
  margin-bottom: 8px;
  opacity: 0.8;
}

.modal-title {
  font-family: 'Fraunces', 'Cormorant Garamond', serif;
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0 0 4px;
  color: #f4ecd6;
}

.modal-subtitle {
  font-size: 0.82rem;
  color: #a89878;
  margin: 0 0 18px;
}

.modal-select {
  margin-bottom: 14px;
  text-align: left;
}

.modal-prices {
  background: #161210;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 16px;
  text-align: left;
}

.modal-price-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.84rem;
  color: #a89878;
  padding: 3px 0;
}

.modal-price-value {
  font-weight: 600;
  color: #f4ecd6;
}

.modal-price-updated {
  font-size: 0.68rem;
  color: #5a4f3f;
  margin-top: 6px;
  text-align: right;
  font-family: 'JetBrains Mono', monospace;
}

.modal-bayar-info {
  background: #161210;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px;
  padding: 12px 14px;
  margin: 14px 0;
  text-align: left;
}

.modal-bayar-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.84rem;
  color: #a89878;
  padding: 4px 0;
}

.modal-bayar-row + .modal-bayar-row {
  border-top: 1px solid rgba(255,255,255,0.06);
  margin-top: 2px;
  padding-top: 6px;
}

.modal-bayar-value {
  font-weight: 600;
  color: #f4ecd6;
}

.modal-bayar-amount {
  color: #e2b34a;
  font-size: 0.95rem;
}

.btn-bayar-link {
  display: block;
  margin: 14px 0 4px;
  padding: 11px 20px;
  background: #161210;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  color: #e2b34a;
  font-weight: 600;
  font-size: 0.88rem;
  text-decoration: none;
  transition: background 0.15s;
}
.btn-bayar-link:hover {
  background: rgba(226,179,74,0.08);
}

.modal-credit {
  font-size: 0.68rem;
  color: #5a4f3f;
  margin: 14px 0 0;
}
.modal-credit + .modal-credit {
  margin-top: 3px;
}
.modal-credit a {
  color: #a89878;
  text-decoration: none;
}
.modal-credit a:hover {
  color: #f4ecd6;
}

/* Share modal */
.share-qr-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}
.share-qr {
  width: 220px;
  height: 220px;
  border-radius: 8px;
}
.share-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #a89878;
  font-size: 0.88rem;
  padding: 16px 0;
}
.share-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.06);
  border-top-color: #e2b34a;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.share-url-box {
  background: #161210;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 14px;
  word-break: break-all;
  max-height: 80px;
  overflow-y: auto;
}
.share-url-text {
  font-size: 0.72rem;
  color: #a89878;
  font-family: 'JetBrains Mono', monospace;
  line-height: 1.5;
}
.btn-submit.copied {
  background: #2d6a4f;
  box-shadow: 0 4px 16px rgba(45,106,79,0.3);
}
.share-empty {
  color: #a89878;
  font-size: 0.88rem;
  padding: 12px 0;
}
</style>
