<template>
  <div class="container">
    <header class="header">
      <h1>Kira Zakat Emas <span class="h1-sub">& Perak</span></h1>
      <NuxtLink to="/create" class="btn-add">+ Tambah</NuxtLink>
    </header>

    <div v-if="displayItems.length === 0" class="empty">
      <p>Tiada rekod lagi.</p>
      <NuxtLink to="/create" class="btn-primary">Tambah Rekod Pertama</NuxtLink>
    </div>

    <ul v-else class="list">
      <li v-for="item in displayItems" :key="item.key" class="card">
        <!-- Grouped digital gold card -->
        <template v-if="item.type === 'digital-group'">
          <div class="card-header">
            <span class="badge" :class="item.metal_type === 'gold' ? 'gold' : 'silver'">{{ item.metal_type === 'gold' ? 'Emas' : 'Perak' }}</span>
            <span class="badge digital">Digital</span>
            <span class="badge gram">{{ item.totalGram }}g</span>
            <NuxtLink :to="`/edit-digital/${item.platform}`" class="btn-edit">✎</NuxtLink>
          </div>
          <div class="card-body">
            <div class="card-name">{{ platformNames[item.platform] || item.platform }}</div>
            <div class="records-summary">
              <div v-for="e in item.entries" :key="e._id" class="record-row">
                <span class="record-date">{{ formatDate(e.date) }}</span>
                <span class="record-gram">{{ e.gram }}g</span>
              </div>
            </div>
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

    <footer v-if="displayItems.length" class="footer">
      <div class="footer-info">
        <span class="footer-label">Jumlah Zakat</span>
        <span v-if="hasNisab" class="footer-amount">RM {{ zakatAmount.toFixed(2) }}</span>
        <span v-else-if="futureZakat" class="footer-amount">RM {{ futureZakat.amount.toFixed(2) }}</span>
        <span v-else class="footer-amount">RM 0.00</span>
      </div>
      <button v-if="hasNisab" class="btn-bayar" :disabled="zakatAmount < 10" @click="handleBayar">Bayar</button>
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
      totalGram: parseFloat(group.reduce((sum: number, e: any) => sum + e.gram, 0).toFixed(2)),
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

const NISAB_GRAM = 85
const URUF_GOLD_GRAM = 800
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
    } else if (!e.is_worn) {
      total += getAdjustedGram(e)
    }
  }
  return parseFloat(total.toFixed(2))
})

const urufWeight = computed(() => {
  let total = 0
  for (const e of entries.value) {
    if (e.metal_type !== 'gold' || !hasHaul(e.date)) continue
    if (e.metal_state === 'physical' && e.is_worn) {
      total += getAdjustedGram(e)
    }
  }
  return parseFloat(total.toFixed(2))
})

const silverWeight = computed(() => {
  let total = 0
  for (const e of entries.value) {
    if (e.metal_type === 'silver' && hasHaul(e.date)) {
      total += e.gram
    }
  }
  return parseFloat(total.toFixed(2))
})

const hasNisab = computed(() =>
  nisabWeight.value >= NISAB_GRAM
  || urufWeight.value > URUF_GOLD_GRAM
  || silverWeight.value > URUF_SILVER_GRAM,
)

const zakatAmount = computed(() => {
  let total = 0
  if (nisabWeight.value >= NISAB_GRAM) {
    total += nisabWeight.value * GOLD_PRICE.value
  }
  if (urufWeight.value > URUF_GOLD_GRAM) {
    total += (urufWeight.value - URUF_GOLD_GRAM) * GOLD_PRICE.value
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
      } else if (!e.is_worn) {
        runNisab += getAdjustedGram(e)
      } else {
        runUruf += getAdjustedGram(e)
      }
    } else if (e.metal_type === 'silver') {
      runSilver += e.gram
    }

    if (runNisab >= NISAB_GRAM || runUruf > URUF_GOLD_GRAM || runSilver > URUF_SILVER_GRAM) {
      let total = 0
      if (runNisab >= NISAB_GRAM) total += runNisab * GOLD_PRICE.value
      if (runUruf > URUF_GOLD_GRAM) total += (runUruf - URUF_GOLD_GRAM) * GOLD_PRICE.value
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
      if (!e.is_worn) return nisabWeight.value >= NISAB_GRAM
      if (e.is_worn) return urufWeight.value > URUF_GOLD_GRAM
    }
    if (e.metal_type === 'silver') return silverWeight.value > URUF_SILVER_GRAM
    return false
  })
  for (const e of toUpdate) {
    await updateEntry({ ...e, date: today })
  }
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

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
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
</style>
