<template>
  <div class="container">
    <header class="header">
      <div class="header-brand">
        <div class="header-eyebrow">Kira Zakat</div>
        <h1>Emas <span class="h1-amp">&</span> Perak</h1>
      </div>
      <NuxtLink to="/create" class="btn-add">+ Tambah</NuxtLink>
    </header>

    <div v-if="entries.length" class="summary">
      <div class="summary-heading">Portfolio Semasa</div>
      <div v-if="summaryInvest.gram" class="summary-row">
        <span class="summary-label">Emas Pelaburan</span>
        <span class="summary-gram">{{ summaryInvest.gram }}g</span>
        <span class="summary-worth">RM {{ summaryInvest.worth.toFixed(2) }}</span>
      </div>
      <div v-if="summaryWorn.gram" class="summary-row">
        <span class="summary-label">Barang Kemas</span>
        <span class="summary-gram">{{ summaryWorn.gram }}g</span>
        <span class="summary-worth">RM {{ summaryWorn.worth.toFixed(2) }}</span>
      </div>
      <div v-if="summarySilver.gram" class="summary-row">
        <span class="summary-label">Perak</span>
        <span class="summary-gram">{{ summarySilver.gram }}g</span>
        <span class="summary-worth">RM {{ summarySilver.worth.toFixed(2) }}</span>
      </div>
    </div>

    <div v-if="displayItems.length === 0" class="empty">
      <div class="empty-glyph">◈</div>
      <p>Tiada rekod lagi.</p>
      <NuxtLink to="/create" class="btn-primary">Tambah Rekod Pertama</NuxtLink>
    </div>

    <ul v-else class="list">
      <li v-for="item in displayItems" :key="item.key" class="card">
        <!-- Grouped digital card -->
        <template v-if="item.type === 'digital-group'">
          <div class="card-header card-header-toggle" @click="toggleGroup(item.key)">
            <span class="badge" :class="item.metal_type === 'gold' ? 'gold' : 'silver'">{{ item.metal_type === 'gold' ? 'Emas' : 'Perak' }}</span>
            <span class="badge digital">Digital</span>
            <span class="badge gram">{{ item.totalGram }}g</span>
            <NuxtLink :to="`/edit-digital/${item.platform}`" class="btn-edit" @click.stop>✎</NuxtLink>
            <span class="btn-collapse" :class="{ expanded: expandedGroups.has(item.key) }">
              <svg width="15" height="13" viewBox="0 0 15 13" fill="none" aria-hidden="true">
                <line x1="1" y1="1.5"  x2="14" y2="1.5"  stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                <line x1="1" y1="6.5"  x2="14" y2="6.5"  stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                <line x1="1" y1="11.5" x2="14" y2="11.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
              </svg>
            </span>
          </div>
          <div class="card-body">
            <div class="card-name">{{ platformNames[item.platform] || item.platform }}</div>
            <template v-if="expandedGroups.has(item.key)">
              <div class="records-summary card-records">
                <div v-for="e in item.entries" :key="e._id" class="record-row">
                  <span class="record-date">{{ formatDate(e.date) }}</span>
                  <span class="record-gram">{{ e.gram }}g</span>
                  <button class="record-delete" @click.stop="handleDelete(e)">✕</button>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="card-date">{{ formatDate(item.entries[0].date) }}</div>
            </template>
          </div>
        </template>

        <!-- Individual entry card -->
        <template v-else>
          <div class="card-header">
            <span class="badge" :class="item.entry.metal_type">
              {{ item.entry.metal_type === 'gold' ? 'Emas' : 'Perak' }}
            </span>
            <span class="badge physical">Fizikal</span>
            <span class="badge gram">{{ item.entry.gram }}g</span>
            <NuxtLink :to="`/edit/${item.entry._id}`" class="btn-edit">✎</NuxtLink>
            <button class="btn-delete" @click="handleDelete(item.entry)">✕</button>
          </div>
          <div class="card-body">
            <div v-if="item.entry.name_string" class="card-name">{{ item.entry.name_string }}</div>
            <img v-if="item.entry.image_string" :src="item.entry.image_string" class="card-image" />
            <div v-if="item.entry.metal_type === 'gold'" class="card-details">
              <span v-if="item.entry.gold_percent">{{ item.entry.gold_percent }}</span>
              <span v-if="item.entry.gold_percent" class="card-dot">·</span>
              <span>{{ item.entry.is_worn ? 'Barang Kemas' : 'Pelaburan' }}</span>
              <template v-if="item.entry.is_collateral">
                <span class="card-dot">·</span>
                <span class="collateral-tag">Ar-Rahnu</span>
              </template>
              <template v-if="item.entry.is_bulk">
                <span class="card-dot">·</span>
                <span class="bulk-tag">Pukal</span>
              </template>
            </div>
            <div v-else-if="item.entry.is_bulk" class="card-details">
              <span class="bulk-tag">Pukal</span>
            </div>
            <div class="card-date">{{ formatDate(item.entry.date) }}</div>
          </div>
        </template>
      </li>
    </ul>

    <!-- State modal -->
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

    <!-- Bayar modal -->
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

    <!-- Floating share button -->
    <button class="btn-share" @click="openShareModal">
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
        <path d="M7.5 1.5V9.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
        <path d="M4.5 4.5L7.5 1.5L10.5 4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2.5 8.5V12.5H12.5V8.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- Floating info button -->
    <button class="btn-info" @click="modalState = selectedState; showStateModal = true">i</button>

    <!-- Share modal -->
    <div v-if="showShareModal" class="modal-overlay" @click.self="showShareModal = false">
      <div class="modal-card">
        <h2 class="modal-title">Kongsi Data</h2>
        <p class="modal-subtitle">Salin pautan untuk import data ke peranti lain. Imej tidak disertakan.</p>
        <div v-if="shareLoading" class="share-loading">
          <div class="share-spinner"></div>
          <span>Menjana pautan…</span>
        </div>
        <template v-else-if="shareUrl">
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

    <footer v-if="displayItems.length" class="footer">
      <div class="footer-info">
        <span class="footer-label">Jumlah Zakat</span>
        <span v-if="hasNisab" class="footer-amount">RM {{ zakatAmount.toFixed(2) }}</span>
        <span v-else-if="futureZakat" class="footer-amount">RM {{ futureZakat.amount.toFixed(2) }}</span>
        <span v-else class="footer-amount">RM 0.00</span>
      </div>
      <button v-if="hasNisab" class="btn-bayar" @click="showBayarModal = true">Bayar</button>
      <button v-else-if="futureZakat" class="btn-bayar-future">Bayar pada<br/>{{ formatDate(futureZakat.date.toISOString()) }}</button>
      <span v-else class="footer-status">Tidak Wajib</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Kalkulator Zakat Emas & Perak' })

const { entries, fetchEntries, updateEntry, deleteEntry } = useEntries()

const { data: prices } = await useFetch('/data.json', { default: () => ({ gold_price: 650, silver_price: 12 }) })
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

// ── Share ──────────────────────────────────────────────────────────────────
const showShareModal = ref(false)
const shareUrl = ref('')
const shareLoading = ref(false)
const shareCopied = ref(false)

const openShareModal = async () => {
  showShareModal.value = true
  shareLoading.value = true
  shareUrl.value = ''
  shareCopied.value = false

  if (!entries.value.length) {
    shareLoading.value = false
    return
  }

  try {
    const lib = await import('json-url')
    const codec = (lib.default || lib)('lzma')
    // Strip PouchDB internals and large image blobs to keep URL manageable
    const data = entries.value.map(({ _rev, image_string, ...e }: any) => e)
    const compressed = await codec.compress(data)
    // Use the current page URL as the app root (works on localhost, custom domain, and GitHub Pages subdirs)
    const appRoot = window.location.href.split('?')[0].split('#')[0].replace(/\/+$/, '')
    shareUrl.value = `${appRoot}/share/${compressed}`
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
    // fallback: select text
  }
}
</script>

<style scoped>
.container {
  padding-top: 72px;
  padding-bottom: 88px;
}

/* ── Header ── */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 480px;
  margin: 0 auto;
  padding: 12px 16px;
  background: rgba(13, 11, 8, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-dim);
}

.header-brand {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.header-eyebrow {
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--gold);
  letter-spacing: 1.2px;
  text-transform: uppercase;
  line-height: 1;
  margin-bottom: 2px;
}

.header h1 {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.45rem;
  font-weight: 600;
  margin: 0;
  line-height: 1;
  color: var(--t1);
}

.h1-amp {
  font-style: italic;
  color: var(--gold);
}

.btn-add {
  background: var(--gold);
  color: #0d0b08;
  padding: 8px 16px;
  border-radius: var(--r-sm);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.88rem;
  letter-spacing: 0.2px;
  transition: background 0.15s;
  white-space: nowrap;
}
.btn-add:hover {
  background: var(--gold-bright);
}

/* ── Summary ── */
.summary {
  background: var(--card);
  border: 1px solid var(--border);
  border-left: 3px solid var(--gold);
  border-radius: var(--r-md);
  padding: 14px 16px;
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-heading {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--gold);
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.summary-row {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
}

.summary-label {
  color: var(--t2);
  flex: 1;
}

.summary-gram {
  font-weight: 500;
  color: var(--t2);
  margin-right: 12px;
  min-width: 56px;
  text-align: right;
  font-size: 0.82rem;
}

.summary-worth {
  font-weight: 600;
  color: var(--t1);
  min-width: 96px;
  text-align: right;
  font-size: 0.88rem;
}

/* ── Empty State ── */
.empty {
  text-align: center;
  padding: 52px 16px;
  color: var(--t2);
}

.empty-glyph {
  font-size: 2.5rem;
  color: var(--t3);
  margin-bottom: 12px;
  opacity: 0.6;
}

.empty p {
  margin: 0 0 16px;
  font-size: 0.9rem;
}

.btn-primary {
  display: inline-block;
  background: var(--gold);
  color: #0d0b08;
  padding: 10px 22px;
  border-radius: var(--r-sm);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 0.15s;
}
.btn-primary:hover {
  background: var(--gold-bright);
}

/* ── Entry List ── */
.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card {
  background: var(--card);
  border: 1px solid var(--border-dim);
  border-radius: var(--r-md);
  padding: 14px;
  transition: border-color 0.15s;
}
.card:hover {
  border-color: var(--border);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
}

.card-header-toggle {
  cursor: pointer;
  user-select: none;
}

.btn-edit {
  margin-left: auto;
  color: var(--t3);
  font-size: 0.95rem;
  text-decoration: none;
  padding: 3px 7px;
  border-radius: 5px;
  transition: color 0.15s, background 0.15s;
}
.btn-edit:hover {
  color: var(--t1);
  background: var(--border-dim);
}

.btn-delete {
  background: none;
  border: none;
  color: var(--t3);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 3px 7px;
  border-radius: 5px;
  transition: color 0.15s, background 0.15s;
}
.btn-delete:hover {
  color: var(--red);
  background: var(--red-a);
}

.btn-edit + .btn-delete {
  margin-left: 0;
}

.btn-collapse {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--t2);
  padding: 4px 7px;
  border-radius: 5px;
  transition: color 0.15s, background 0.15s;
}
.btn-collapse:hover {
  color: var(--t1);
  background: var(--border-dim);
}
.btn-collapse.expanded {
  color: var(--gold);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-name {
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--t1);
}

.card-image {
  max-width: 100%;
  max-height: 120px;
  border-radius: 6px;
  object-fit: contain;
  border: 1px solid var(--border-dim);
  margin: 4px 0;
}

.card-details {
  font-size: 0.8rem;
  color: var(--t2);
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.card-dot {
  color: var(--t3);
}

.card-date {
  font-size: 0.72rem;
  color: var(--t3);
  margin-top: 2px;
}

.card-records {
  margin-top: 8px;
}

.record-delete {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--t3);
  font-size: 0.75rem;
  cursor: pointer;
  padding: 1px 5px;
  border-radius: 4px;
  line-height: 1;
  transition: color 0.15s, background 0.15s;
}
.record-delete:hover {
  color: var(--red);
  background: var(--red-a);
}

.collateral-tag {
  color: var(--red);
  font-weight: 500;
}

.bulk-tag {
  color: #c8a35a;
  font-weight: 500;
}

/* ── Footer ── */
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 480px;
  margin: 0 auto;
  padding: 12px 16px;
  background: rgba(13, 11, 8, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 10;
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.footer-label {
  font-size: 0.68rem;
  color: var(--t3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.footer-amount {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--t1);
  line-height: 1.1;
}

.btn-bayar {
  background: var(--gold);
  color: #0d0b08;
  border: none;
  padding: 11px 24px;
  border-radius: var(--r-md);
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(212, 160, 23, 0.28);
  transition: background 0.15s, transform 0.15s;
  white-space: nowrap;
}
.btn-bayar:hover {
  background: var(--gold-bright);
  transform: translateY(-1px);
}

.btn-bayar-future {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--gold);
  padding: 7px 12px;
  border-radius: var(--r-sm);
  font-family: 'Outfit', sans-serif;
  font-size: 0.72rem;
  font-weight: 500;
  cursor: default;
  text-align: center;
  max-width: 140px;
  line-height: 1.4;
}

.footer-status {
  font-size: 0.78rem;
  color: var(--t3);
  padding: 7px 12px;
}

/* ── Floating Share Button ── */
.btn-share {
  position: fixed;
  bottom: 128px;
  right: 16px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--card);
  border: 1px solid var(--border);
  color: var(--gold);
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  transition: background 0.15s, border-color 0.15s;
}
.btn-share:hover {
  background: var(--card-hover);
  border-color: var(--gold-a2);
}

/* ── Share Modal Content ── */
.share-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--t2);
  font-size: 0.88rem;
  padding: 16px 0;
}
.share-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-dim);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.share-url-box {
  background: var(--surface);
  border: 1px solid var(--border-dim);
  border-radius: var(--r-sm);
  padding: 10px 14px;
  margin-bottom: 14px;
  word-break: break-all;
  max-height: 80px;
  overflow-y: auto;
}
.share-url-text {
  font-size: 0.72rem;
  color: var(--t2);
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  line-height: 1.5;
}
.btn-submit.copied {
  background: #2d6a4f;
  box-shadow: 0 4px 16px rgba(45, 106, 79, 0.3);
}
.share-empty {
  color: var(--t2);
  font-size: 0.88rem;
  padding: 12px 0;
}

/* ── Floating Info Button ── */
.btn-info {
  position: fixed;
  bottom: 80px;
  right: 16px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--card);
  border: 1px solid var(--border);
  color: var(--gold);
  font-size: 1rem;
  font-weight: 700;
  font-style: italic;
  font-family: 'Cormorant Garamond', Georgia, serif;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  transition: background 0.15s, border-color 0.15s;
}
.btn-info:hover {
  background: var(--card-hover);
  border-color: var(--gold-a2);
}

/* ── Modal Content ── */
.modal-icon {
  font-size: 1.8rem;
  color: var(--gold);
  margin-bottom: 8px;
  opacity: 0.8;
}

.modal-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0 0 4px;
  color: var(--t1);
}

.modal-subtitle {
  font-size: 0.82rem;
  color: var(--t2);
  margin: 0 0 18px;
}

.modal-select {
  margin-bottom: 14px;
  text-align: left;
}

.modal-prices {
  background: var(--surface);
  border: 1px solid var(--border-dim);
  border-radius: var(--r-sm);
  padding: 12px 14px;
  margin-bottom: 16px;
  text-align: left;
}

.modal-price-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.84rem;
  color: var(--t2);
  padding: 3px 0;
}

.modal-price-value {
  font-weight: 600;
  color: var(--t1);
}

.modal-price-updated {
  font-size: 0.68rem;
  color: var(--t3);
  margin-top: 6px;
  text-align: right;
}

.modal-bayar-info {
  background: var(--surface);
  border: 1px solid var(--border-dim);
  border-radius: var(--r-sm);
  padding: 12px 14px;
  margin: 14px 0;
  text-align: left;
}

.modal-bayar-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.84rem;
  color: var(--t2);
  padding: 4px 0;
}

.modal-bayar-row + .modal-bayar-row {
  border-top: 1px solid var(--border-dim);
  margin-top: 2px;
  padding-top: 6px;
}

.modal-bayar-value {
  font-weight: 600;
  color: var(--t1);
}

.modal-bayar-amount {
  color: var(--gold-bright);
  font-size: 0.95rem;
}

.btn-bayar-link {
  display: block;
  margin: 14px 0 4px;
  padding: 11px 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-sm);
  color: var(--gold-bright);
  font-weight: 600;
  font-size: 0.88rem;
  text-decoration: none;
  transition: background 0.15s, border-color 0.15s;
}
.btn-bayar-link:hover {
  background: var(--gold-a);
  border-color: var(--border);
}

.modal-credit {
  font-size: 0.68rem;
  color: var(--t3);
  margin: 14px 0 0;
}
.modal-credit + .modal-credit {
  margin-top: 3px;
}
.modal-credit a {
  color: var(--t2);
  text-decoration: none;
}
.modal-credit a:hover {
  color: var(--t1);
}
</style>
