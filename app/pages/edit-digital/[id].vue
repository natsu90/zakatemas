<template>
  <div class="container">
    <header class="header">
      <NuxtLink to="/" class="btn-back">← Kembali</NuxtLink>
      <h1>Kemaskini Emas Digital</h1>
    </header>

    <div v-if="loading" class="loading">Memuatkan...</div>

    <form v-else-if="platformEntries.length" class="form" @submit.prevent="handleSubmit">
      <!-- Info badges (read-only) -->
      <div class="info-row">
        <span class="badge gold">Emas</span>
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
        <input v-model.number="deductGram" type="number" class="input" :max="totalGram" min="0.01" step="0.01" required />
      </div>

      <!-- Convert: denomination grid -->
      <div v-else class="field">
        <label class="label">Pilih denominasi (gram)</label>
        <div class="denom-grid">
          <button
            v-for="d in denominations"
            :key="d"
            type="button"
            class="denom-btn"
            :class="{ active: selectedDenom === d, disabled: d > totalGram }"
            :disabled="d > totalGram"
            @click="selectedDenom = d"
          >
            {{ d }}g
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
const route = useRoute()
const router = useRouter()
const { entries, fetchEntries, updateEntry, addEntry, deleteEntry } = useEntries()

const platformNames: Record<string, string> = {
  AGROBANK: 'Agrobank AGROGold Account-i',
  BANKRAKYAT: 'Bank Rakyat eGold-i',
  BSN: 'BSN MyGold Account-i',
  BURSA: 'Bursa Gold Dinar',
  MAYBANK: 'Maybank Islamic Gold Account-i',
  MBSB: 'MBSB Bank PrimeGold-i',
  PUBLICGOLD: 'Public Gold GAP',
}

const denominations = [1, 5, 10, 20, 50, 100, 250, 1000]

const platform = route.params.id as string
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
  parseFloat(platformEntries.value.reduce((sum, e) => sum + e.gram, 0).toFixed(2)),
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
      remaining = parseFloat((remaining - entry.gram).toFixed(2))
      await deleteEntry(entry)
    } else {
      const newGram = parseFloat((entry.gram - remaining).toFixed(2))
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

      const lastDate = await deductFromEntries(denom)

      // Create new physical gold record
      await addEntry({
        metal_type: 'gold',
        metal_state: 'physical',
        name_string: platform,
        name_type: 'text',
        is_worn: false,
        gold_percent: 999,
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
.container {
  max-width: 480px;
  margin: 0 auto;
  padding: 16px;
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.header h1 {
  font-size: 1.2rem;
  margin: 0;
}

.btn-back {
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
}

.loading {
  text-align: center;
  padding: 48px 16px;
  color: #888;
}

.info-row {
  display: flex;
  gap: 6px;
}

.platform-name {
  font-weight: 600;
  font-size: 1rem;
  margin-top: 6px;
}

.records-summary {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.record-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #666;
}

.record-date {
  color: #888;
}

.record-gram {
  font-weight: 600;
  color: #444;
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

.form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #444;
}

.input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: #d4a017;
}

.toggle-group {
  display: flex;
  gap: 8px;
}

.toggle-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
}

.toggle-btn.active {
  background: #d4a017;
  border-color: #d4a017;
  color: #fff;
  font-weight: 600;
}

.denom-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.denom-btn {
  padding: 12px 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #444;
}

.denom-btn.active {
  background: #d4a017;
  border-color: #d4a017;
  color: #fff;
  font-weight: 600;
}

.denom-btn.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-submit {
  margin-top: 8px;
  padding: 14px;
  background: #d4a017;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
