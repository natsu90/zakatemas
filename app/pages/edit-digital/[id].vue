<template>
  <div class="container">
    <header class="page-header">
      <NuxtLink to="/" class="btn-back">← Kembali</NuxtLink>
      <h1 class="page-title">Kemaskini {{ isSilverPlatform ? 'Perak' : 'Emas' }} Digital</h1>
    </header>

    <div v-if="loading" class="loading">Memuatkan...</div>

    <form v-else-if="platformEntries.length" class="form" @submit.prevent="handleSubmit">
      <!-- Info badges (read-only) -->
      <div class="info-row">
        <span class="badge" :class="isSilverPlatform ? 'silver' : 'gold'">{{ isSilverPlatform ? 'Perak' : 'Emas' }}</span>
        <span class="badge digital">Digital</span>
        <span class="badge gram">{{ totalGram }}g</span>
      </div>
      <div class="platform-name">{{ platformNames[platform] || platform }}</div>

      <!-- Record breakdown -->
      <div class="records-summary">
        <div v-for="e in platformEntries" :key="e._id" class="record-row">
          <span class="record-date">{{ formatDate(e.date) }}</span>
          <span class="record-gram">{{ e.gram }}g</span>
        </div>
      </div>

      <!-- Mode toggle -->
      <div class="field">
        <label class="label">Jenis Kemaskini</label>
        <div class="toggle-group">
          <button type="button" class="toggle-btn" :class="{ active: mode === 'manual' }" @click="mode = 'manual'">
            Jual
          </button>
          <button type="button" class="toggle-btn" :class="{ active: mode === 'convert' }" @click="mode = 'convert'">
            Tukar ke Fizikal
          </button>
        </div>
      </div>

      <!-- Jual: deduction input -->
      <div v-if="mode === 'manual'" class="field">
        <label class="label">Jumlah tolak (gram) — maks {{ totalGram }}g</label>
        <input v-model.number="deductGram" type="number" class="input" :max="totalGram" :min="isSilverPlatform ? '0.001' : '0.0001'" :step="isSilverPlatform ? '0.001' : '0.0001'" required />
      </div>

      <!-- Convert: denomination grid -->
      <div v-else class="field">
        <label class="label">Pilih denominasi (gram)</label>
        <div class="denom-grid">
          <button
            v-for="d in denominations"
            :key="d.value"
            type="button"
            class="denom-btn"
            :class="{ active: selectedDenom === d.value, disabled: d.value > totalGram }"
            :disabled="d.value > totalGram"
            @click="selectedDenom = d.value"
          >
            {{ d.label }}
          </button>
        </div>
      </div>

      <button type="submit" class="btn-submit" :disabled="submitting || !canSubmit">
        {{ submitting ? 'Menyimpan...' : mode === 'manual' ? 'Tolak' : 'Tukar' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Kemaskini Digital — Zakat Emas & Perak' })

const route = useRoute()
const router = useRouter()
const { entries, fetchEntries, updateEntry, addEntry, deleteEntry } = useEntries()

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

const SILVER_PLATFORMS = ['MEEMSILVER', 'PGSILVER']

const denominations = computed(() => {
  // Gold platforms
  if (platform === 'BURSA') return [{ label: '1 dinar', value: 4.25 }]
  if (platform === 'PUBLICGOLD') return [
    { label: '1g', value: 1 },
    { label: '5g', value: 5 },
    { label: '10g', value: 10 },
    { label: '20g', value: 20 },
    { label: '50g', value: 50 },
    { label: '½ dinar', value: 2.125 },
    { label: '1 dinar', value: 4.25 },
    { label: '5 dinar', value: 21.25 },
  ]
  // Silver platforms
  if (platform === 'MEEMSILVER') return [
    { label: '1 dirham', value: 2.975 },
    { label: '5 dirham', value: 14.875 },
    { label: '10 dirham', value: 29.75 },
    { label: '100g', value: 100 },
    { label: '250g', value: 250 },
    { label: '500g', value: 500 },
    { label: '1000g', value: 1000 },
  ]
  if (platform === 'PGSILVER') return [
    { label: '5 dirham', value: 14.875 },
    { label: '10 dirham', value: 29.75 },
    { label: '100g', value: 100 },
    { label: '250g', value: 250 },
    { label: '500g', value: 500 },
    { label: '1000g', value: 1000 },
  ]
  // Default gold
  return [
    { label: '1g', value: 1 },
    { label: '5g', value: 5 },
    { label: '10g', value: 10 },
    { label: '20g', value: 20 },
    { label: '50g', value: 50 },
    { label: '100g', value: 100 },
    { label: '250g', value: 250 },
    { label: '1000g', value: 1000 },
  ]
})

const platform = route.params.id as string
const isSilverPlatform = SILVER_PLATFORMS.includes(platform)
const loading = ref(true)
const submitting = ref(false)
const mode = ref<'manual' | 'convert'>('manual')
const deductGram = ref<number | null>(null)
const selectedDenom = ref<number | null>(null)

// All digital gold entries for this platform, sorted by date ascending (earliest first)
const platformEntries = computed(() =>
  entries.value
    .filter((e) => e.metal_state === 'digital' && e.name_string === platform)
    .sort((a, b) => a.date.localeCompare(b.date)),
)

const totalGram = computed(() =>
  parseFloat(platformEntries.value.reduce((sum, e) => sum + e.gram, 0).toFixed(3)),
)

const canSubmit = computed(() => {
  if (mode.value === 'manual') {
    return deductGram.value != null && deductGram.value > 0 && deductGram.value <= totalGram.value
  }
  return selectedDenom.value !== null && selectedDenom.value <= totalGram.value
})

onMounted(async () => {
  await fetchEntries()
  loading.value = false
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Deduct from earliest records first (FIFO)
// Returns the latest date among deducted records
const deductFromEntries = async (amount: number): Promise<string> => {
  let remaining = amount
  let lastDeductedDate = ''
  // platformEntries is already sorted ascending (earliest first)
  const sorted = [...platformEntries.value]

  for (const entry of sorted) {
    if (remaining <= 0) break

    lastDeductedDate = entry.date

    if (entry.gram <= remaining) {
      remaining = parseFloat((remaining - entry.gram).toFixed(3))
      await deleteEntry(entry)
    } else {
      const newGram = parseFloat((entry.gram - remaining).toFixed(3))
      remaining = 0
      await updateEntry({ ...entry, gram: newGram })
    }
  }

  return lastDeductedDate
}

const handleSubmit = async () => {
  if (!canSubmit.value) return

  submitting.value = true
  try {
    if (mode.value === 'manual') {
      await deductFromEntries(deductGram.value!)
    } else {
      const denom = selectedDenom.value!

      const denomLabel = denominations.value.find(d => d.value === denom)?.label || `${denom}g`
      const lastDate = await deductFromEntries(denom)

      // Create new physical record
      const isSilver = SILVER_PLATFORMS.includes(platform)
      await addEntry({
        metal_type: isSilver ? 'silver' : 'gold',
        metal_state: 'physical',
        name_string: `${platform} ${denomLabel}`,
        image_string: '',
        is_worn: false,
        gold_percent: isSilver ? null : 999,
        is_collateral: false,
        loan_amount: null,
        is_bulk: false,
        gram: denom,
        date: lastDate,
      })
    }
    router.push('/')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
  padding-top: 8px;
}

.page-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
  color: var(--t1);
}

.platform-name {
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--t1);
  margin-top: 4px;
}

/* ── Denomination Grid ── */
.denom-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.denom-btn {
  padding: 12px 6px;
  background: var(--surface);
  border: 1px solid var(--border-dim);
  border-radius: var(--r-sm);
  color: var(--t2);
  font-family: 'Outfit', sans-serif;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
}
.denom-btn:hover {
  border-color: var(--border);
  color: var(--t1);
  background: var(--card);
}
.denom-btn.active {
  background: var(--gold);
  border-color: var(--gold);
  color: #0d0b08;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(212, 160, 23, 0.28);
}
.denom-btn.disabled {
  opacity: 0.2;
  cursor: not-allowed;
}
</style>
