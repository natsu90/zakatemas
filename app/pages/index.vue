<template>
  <div class="container">
    <header class="header">
      <h1>Kira Zakat Emas <span class="h1-sub">& Perak</span></h1>
      <NuxtLink to="/create" class="btn-add">+ Tambah</NuxtLink>
    </header>

    <div v-if="entries.length" class="summary">
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
      <p>Tiada rekod lagi.</p>
      <NuxtLink to="/create" class="btn-primary">Tambah Rekod Pertama</NuxtLink>
    </div>

    <ul v-else class="list">
      <li v-for="item in displayItems" :key="item.key" class="card">
        <!-- Grouped digital gold card -->
        <template v-if="item.type === 'digital-group'">
          <div class="card-header card-header-toggle" @click="toggleGroup(item.key)">
            <span class="badge" :class="item.metal_type === 'gold' ? 'gold' : 'silver'">{{ item.metal_type === 'gold' ? 'Emas' : 'Perak' }}</span>
            <span class="badge digital">Digital</span>
            <span class="badge gram">{{ item.totalGram }}g</span>
            <NuxtLink :to="`/edit-digital/${item.platform}`" class="btn-edit" @click.stop>✎</NuxtLink>
            <span class="btn-collapse">{{ expandedGroups.has(item.key) ? '▼' : '▶' }}</span>
          </div>
          <div class="card-body">
            <div class="card-name">{{ platformNames[item.platform] || item.platform }}</div>
            <template v-if="expandedGroups.has(item.key)">
              <div class="records-summary">
                <div v-for="e in item.entries" :key="e._id" class="record-row">
                  <span class="record-date">{{ formatDate(e.date) }}</span>
                  <span class="record-gram">{{ e.gram }}g</span>
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
              <span v-if="item.entry.gold_percent">·</span>
              <span>{{ item.entry.is_worn ? 'Barang Kemas' : 'Pelaburan' }}</span>
              <template v-if="item.entry.is_collateral">
                <span>·</span>
                <span class="collateral-tag">Ar-Rahnu</span>
              </template>
              <template v-if="item.entry.is_bulk">
                <span>·</span>
                <span class="bulk-tag">Pukal</span>
              </template>
            </div>
            <div v-else-if="item.entry.is_bulk" class="card-details"><span class="bulk-tag">Pukal</span></div>
            <div class="card-date">{{ formatDate(item.entry.date) }}</div>
          </div>
        </template>
      </li>
    </ul>

    <!-- State selection modal -->
    <div v-if="showStateModal" class="modal-overlay" @click.self="selectedState && (showStateModal = false, modalState = selectedState)">
      <div class="modal-card">
        <h2 class="modal-title">Pilih Negeri</h2>
        <p class="modal-subtitle">Kadar uruf emas berbeza mengikut negeri</p>
        <select v-model="modalState" class="modal-select">
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
        <button class="btn-save" :disabled="!modalState" @click="saveState">Simpan</button>
        <p class="modal-credit">Dibina oleh <a href="https://sulai.mn/" target="_blank" rel="noopener">Sulaiman Sudirman</a></p>
        <p class="modal-credit">Maklumbalas: <a href="mailto:contact@zakatemas.app">contact@zakatemas.app</a></p>
      </div>
    </div>

    <!-- Bayar modal -->
    <div v-if="showBayarModal" class="modal-overlay" @click.self="showBayarModal = false">
      <div class="modal-card">
        <h2 class="modal-title">Bayar Zakat</h2>
        <p class="modal-bayar-text">Sila bayar di pautan berikut dengan maklumat di bawah:</p>
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
            <span class="modal-bayar-value">{{ zakatAmount.toFixed(2) }}</span>
          </div>
        </div>
        <a href="https://fpx.zakatselangor.com.my/" target="_blank" rel="noopener" class="btn-bayar-link">Bayar di Zakat Selangor</a>
        <p class="modal-bayar-text">Kemudian klik butang di bawah selepas bayaran berjaya.</p>
        <button class="btn-save" @click="handleBayar">Selesai Bayaran</button>
      </div>
    </div>

    <!-- Floating info button -->
    <button class="btn-info" @click="modalState = selectedState; showStateModal = true">i</button>

    <footer v-if="displayItems.length" class="footer">
      <div class="footer-info">
        <span class="footer-label">Jumlah Zakat</span>
        <span v-if="hasNisab" class="footer-amount">RM {{ zakatAmount.toFixed(2) }}</span>
        <span v-else-if="futureZakat" class="footer-amount">RM {{ futureZakat.amount.toFixed(2) }}</span>
        <span v-else class="footer-amount">RM 0.00</span>
      </div>
      <button v-if="hasNisab" class="btn-bayar" @click="showBayarModal = true">Bayar</button>
      <button v-else-if="futureZakat" class="btn-bayar-future disabled">Bayar Zakat pada <br/>{{ formatDate(futureZakat.date.toISOString()) }}</button>
      <span v-else class="btn-bayar-future disabled">Tidak Wajib Zakat</span>
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

  // Entries that haven't reached haul yet, with their future haul date
  const pending = entries.value
    .filter((e) => !hasHaul(e.date))
    .map((e) => ({
      entry: e,
      haulDate: new Date(new Date(e.date).getTime() + haulMs),
    }))
    .filter((p) => p.haulDate.getTime() > now)
    .sort((a, b) => a.haulDate.getTime() - b.haulDate.getTime())

  if (!pending.length) return null

  // Start with current haul-reached totals
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
</script>

<style scoped>
.container {
  max-width: 480px;
  margin: 0 auto;
  padding: 16px;
  padding-top: 68px;
  padding-bottom: 90px;
}

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
  background: #fafafa;
}

.header h1 {
  font-size: 1.4rem;
  margin: 0;
}

.h1-sub {
  font-size: 0.85rem;
}

.btn-add {
  background: #d4a017;
  color: #fff;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
}

.summary {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-row {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
}

.summary-label {
  color: #666;
  flex: 1;
}

.summary-gram {
  font-weight: 600;
  color: #444;
  margin-right: 12px;
  min-width: 60px;
  text-align: right;
}

.summary-worth {
  font-weight: 600;
  color: #222;
  min-width: 100px;
  text-align: right;
}

.empty {
  text-align: center;
  padding: 48px 16px;
  color: #888;
}

.btn-primary {
  display: inline-block;
  margin-top: 12px;
  background: #d4a017;
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 14px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge.gold {
  background: #fef3c7;
  color: #92400e;
}

.badge.silver {
  background: #f1f5f9;
  color: #475569;
}

.badge.physical {
  background: #ecfdf5;
  color: #065f46;
}

.badge.digital {
  background: #eff6ff;
  color: #1e40af;
}

.badge.gram {
  background: #f3f4f6;
  color: #374151;
  text-transform: none;
  letter-spacing: 0;
}

.btn-edit {
  margin-left: auto;
  color: #aaa;
  font-size: 1rem;
  text-decoration: none;
  padding: 2px 6px;
}

.btn-delete {
  margin-left: auto;
  background: none;
  border: none;
  color: #aaa;
  font-size: 1rem;
  cursor: pointer;
  padding: 2px 6px;
}

.btn-edit + .btn-delete {
  margin-left: 0;
}

.card-image {
  max-width: 100%;
  max-height: 120px;
  border-radius: 6px;
  object-fit: contain;
  margin-bottom: 4px;
}

.card-name {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 4px;
}

.card-details {
  font-size: 0.85rem;
  color: #666;
}

.card-date {
  font-size: 0.75rem;
  color: #999;
  margin-top: 6px;
}

.card-header-toggle {
  cursor: pointer;
  user-select: none;
}

.btn-collapse {
  color: #aaa;
  font-size: 1rem;
  padding: 2px 6px;
}

.btn-edit + .btn-collapse {
  margin-left: 0;
}

.records-summary {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.record-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.record-date {
  color: #999;
}

.record-gram {
  font-weight: 600;
  color: #444;
}

.collateral-tag {
  color: #dc2626;
}

.bulk-tag {
  color: #854d0e;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 480px;
  margin: 0 auto;
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #e5e5e5;
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
  font-size: 0.75rem;
  color: #888;
}

.footer-amount {
  font-size: 1.2rem;
  font-weight: 700;
  color: #222;
}

.btn-bayar {
  background: #d4a017;
  color: #fff;
  border: none;
  padding: 12px 28px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-bayar-future {
  background: none;
  border: 1px solid #d4a017;
  color: #d4a017;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  max-width: 160px;
  line-height: 1.3;
}

.btn-bayar-future.disabled {
  border-color: #ccc;
  color: #999;
  cursor: default;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-card {
  background: #fff;
  border-radius: 16px;
  padding: 28px 24px;
  max-width: 360px;
  width: calc(100% - 32px);
  text-align: center;
}

.modal-title {
  font-size: 1.3rem;
  margin: 0 0 4px;
}

.modal-subtitle {
  font-size: 0.85rem;
  color: #888;
  margin: 0 0 20px;
}

.modal-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  margin-bottom: 16px;
  appearance: auto;
}

.btn-save {
  width: 100%;
  background: #d4a017;
  color: #fff;
  border: none;
  padding: 12px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: default;
}

.modal-prices {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 16px;
}

.modal-price-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  padding: 2px 0;
}

.modal-price-value {
  font-weight: 600;
}

.modal-price-updated {
  font-size: 0.7rem;
  color: #aaa;
  margin-top: 4px;
  text-align: right;
}

.modal-bayar-text {
  font-size: 0.9rem;
  color: #555;
  margin: 12px 0 12px;
}

.modal-bayar-info {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 10px 12px;
  margin: 12px 0;
  text-align: left;
}

.modal-bayar-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  padding: 3px 0;
}

.modal-bayar-value {
  font-weight: 600;
}

.btn-bayar-link {
  display: inline-block;
  margin: 12px 0;
  padding: 10px 20px;
  background: #f0f0f0;
  border-radius: 8px;
  color: #d4a017;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
}

.modal-credit {
  font-size: 0.7rem;
  color: #aaa;
  margin: 16px 0 0;
}

.modal-credit + .modal-credit {
  margin-top: 4px;
}

.modal-credit a {
  color: #999;
}

.btn-info {
  position: fixed;
  bottom: 80px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #d4a017;
  color: #fff;
  border: none;
  font-size: 1rem;
  font-weight: 700;
  font-style: italic;
  cursor: pointer;
  z-index: 10;
  font-family: serif;
}
</style>
