<template>
  <div class="form-page">

    <header class="form-header">
      <NuxtLink to="/" class="btn-back-pill">
        <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
          <path d="M7 1L1 6.5L7 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Kembali
      </NuxtLink>
      <h1 class="form-title">{{ isSilverPlatform ? 'Perak' : 'Emas' }} Digital</h1>
    </header>

    <div v-if="loading" class="form-loading">
      <div class="loading-ring"></div>
      <span>Memuatkan…</span>
    </div>

    <form v-else-if="platformEntries.length" class="form-body" @submit.prevent="handleSubmit">

      <!-- Platform identity card -->
      <div class="platform-card">
        <div class="platform-thumb" :class="isSilverPlatform ? 'thumb-silver' : 'thumb-gold'">
          <svg v-if="!isSilverPlatform" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="8" width="18" height="11" rx="1.2" stroke="#e2b34a" stroke-width="1.3"/>
            <path d="M6 8L8 5H16L18 8" stroke="#e2b34a" stroke-width="1.3" stroke-linejoin="round"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="7" stroke="#c8d3e0" stroke-width="1.3"/>
          </svg>
        </div>
        <div class="platform-info">
          <div class="platform-name">{{ platformNames[platform] || platform }}</div>
          <div class="platform-badges">
            <span class="id-badge" :class="isSilverPlatform ? 'badge-silver' : 'badge-gold'">
              {{ isSilverPlatform ? 'Perak' : 'Emas' }}
            </span>
            <span class="id-badge badge-digital">Digital</span>
            <span class="id-badge badge-purity">{{ platformEntries.length }} rekod</span>
          </div>
        </div>
        <div class="platform-total">
          <span class="total-num">{{ totalGram }}</span>
          <span class="total-unit">g</span>
        </div>
      </div>

      <!-- Record breakdown -->
      <div class="form-card records-card">
        <span class="field-label">Pecahan Rekod</span>
        <div class="records-list">
          <div v-for="(e, i) in platformEntries" :key="e._id" class="record-item" :class="{ 'rec-last': i === platformEntries.length - 1 }">
            <span class="rec-date">{{ formatDate(e.date) }}</span>
            <span class="rec-gram">{{ e.gram }}g</span>
          </div>
        </div>
      </div>

      <!-- Mode toggle -->
      <div class="form-card">
        <span class="field-label">Jenis Kemaskini</span>
        <div class="seg-control cols-2">
          <button type="button" class="seg-btn" :class="{ active: mode === 'manual' }" @click="mode = 'manual'">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v6M4 4l3-3 3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 10h10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
            Jual
          </button>
          <button type="button" class="seg-btn" :class="{ active: mode === 'convert' }" @click="mode = 'convert'">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <rect x="1.5" y="4" width="5" height="7" rx="0.8" stroke="currentColor" stroke-width="1.3"/>
              <rect x="7.5" y="3" width="5" height="7" rx="0.8" stroke="currentColor" stroke-width="1.3"/>
              <path d="M9 7h2M10 6v2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            </svg>
            Tukar ke Fizikal
          </button>
        </div>
      </div>

      <!-- Jual: manual deduction -->
      <div v-if="mode === 'manual'" class="form-card">
        <span class="field-label">Jumlah Tolak (gram) — maks {{ totalGram }}g</span>
        <input v-model.number="deductGram" type="number" class="form-input"
          :max="totalGram"
          :min="isSilverPlatform ? '0.001' : '0.0001'"
          :step="isSilverPlatform ? '0.001' : '0.0001'"
          placeholder="0.0000"
          required />
        <div v-if="deductGram && deductGram > 0 && deductGram <= totalGram" class="gram-hint">
          Baki selepas: {{ (totalGram - deductGram).toFixed(isSilverPlatform ? 3 : 4) }}g
        </div>
        <div v-else-if="deductGram && deductGram > totalGram" class="form-hint" style="margin-top: 8px;">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="#ef6b6b" stroke-width="1.3"/>
            <path d="M7 4V7.5" stroke="#ef6b6b" stroke-width="1.4" stroke-linecap="round"/>
            <circle cx="7" cy="9.5" r="0.7" fill="#ef6b6b"/>
          </svg>
          Melebihi baki {{ totalGram }}g.
        </div>
      </div>

      <!-- Convert: denomination grid -->
      <div v-else class="form-card">
        <span class="field-label">Pilih Denominasi (gram)</span>
        <div class="denom-grid">
          <button
            v-for="d in denominations"
            :key="d.value"
            type="button"
            class="denom-btn"
            :class="{ active: selectedDenom === d.value, unavailable: d.value > totalGram }"
            :disabled="d.value > totalGram"
            @click="selectedDenom = d.value"
          >
            <span class="denom-label">{{ d.label }}</span>
            <span class="denom-gram">{{ d.value }}g</span>
          </button>
        </div>
      </div>

      <button type="submit" class="btn-submit-new" :disabled="submitting || !canSubmit">
        <span v-if="submitting" class="btn-spinner"></span>
        <template v-if="!submitting">
          {{ mode === 'manual' ? 'Tolak Baki' : 'Tukar ke Fizikal' }}
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M3 7H11M11 7L7 3M11 7L7 11" stroke="#0a0806" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </template>
        <template v-else>Menyimpan…</template>
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

const deductFromEntries = async (amount: number): Promise<string> => {
  let remaining = amount
  let lastDeductedDate = ''
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
.form-page {
  max-width: 480px;
  margin: 0 auto;
  padding: 0 14px 80px;
  background: #0a0806;
  min-height: 100vh;
}

/* ── Header ── */
.form-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 0 -14px;
  padding: 13px 18px;
  background: rgba(10, 8, 6, 0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.btn-back-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #a89878;
  text-decoration: none;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
  font-weight: 500;
  padding: 7px 13px;
  border-radius: 999px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  transition: color 0.15s, background 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
}
.btn-back-pill:hover {
  color: #f4ecd6;
  background: rgba(255,255,255,0.09);
}

.form-title {
  font-family: 'Fraunces', 'Cormorant Garamond', serif;
  font-size: 1.25rem;
  font-weight: 500;
  color: #f4ecd6;
  margin: 0;
  letter-spacing: -0.3px;
  line-height: 1.1;
}

/* ── Loading ── */
.form-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 64px 16px;
  color: #a89878;
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
}
.loading-ring {
  width: 28px;
  height: 28px;
  border: 2px solid rgba(255,255,255,0.08);
  border-top-color: #e2b34a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Form body ── */
.form-body {
  padding-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ── Platform card ── */
.platform-card {
  background: radial-gradient(120% 100% at 100% 0%, rgba(226,179,74,0.08), transparent 60%), #181410;
  border: 1px solid rgba(212,160,23,0.18);
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 2px;
}

.platform-thumb {
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

.platform-info {
  flex: 1;
  min-width: 0;
}
.platform-name {
  font-size: 13.5px;
  font-weight: 500;
  color: #f4ecd6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 5px;
}
.platform-badges {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.id-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 999px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}
.badge-gold { background: rgba(226,179,74,0.12); color: #e2b34a; border: 1px solid rgba(226,179,74,0.22); }
.badge-silver { background: rgba(200,211,224,0.1); color: #c8d3e0; border: 1px solid rgba(200,211,224,0.2); }
.badge-digital { background: rgba(130,173,255,0.1); color: #82adff; border: 1px solid rgba(130,173,255,0.2); }
.badge-purity { background: rgba(255,255,255,0.06); color: #a89878; border: 1px solid rgba(255,255,255,0.08); }

.platform-total {
  display: flex;
  align-items: baseline;
  gap: 2px;
  flex-shrink: 0;
}
.total-num {
  font-family: 'Fraunces', 'Cormorant Garamond', serif;
  font-size: 26px;
  font-weight: 400;
  color: #f4ecd6;
  font-variant-numeric: tabular-nums lining-nums;
  letter-spacing: -0.5px;
  line-height: 1;
}
.total-unit {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #a89878;
}

/* ── Form card ── */
.form-card {
  background: #181410;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 14px 16px;
}

.field-label {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 1.3px;
  text-transform: uppercase;
  color: #a89878;
  margin-bottom: 10px;
}

/* ── Records list ── */
.records-card { padding-bottom: 8px; }

.records-list {
  display: flex;
  flex-direction: column;
}

.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.record-item.rec-last { border-bottom: none; }

.rec-date {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
  color: #5a4f3f;
}
.rec-gram {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 600;
  color: #f4ecd6;
  font-variant-numeric: tabular-nums;
}

/* ── Segmented control ── */
.seg-control {
  display: grid;
  gap: 4px;
  background: rgba(0,0,0,0.28);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 3px;
}
.seg-control.cols-2 { grid-template-columns: 1fr 1fr; }

.seg-btn {
  background: transparent;
  border: 1px solid transparent;
  border-radius: 9px;
  padding: 10px 8px;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  font-size: 13.5px;
  font-weight: 500;
  color: #a89878;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.seg-btn.active {
  background: linear-gradient(180deg, rgba(226,179,74,0.18), rgba(226,179,74,0.06));
  border-color: rgba(212,160,23,0.22);
  color: #e2b34a;
  font-weight: 600;
}
.seg-btn:hover:not(.active) { color: #f4ecd6; }

/* ── Form input ── */
.form-input {
  width: 100%;
  padding: 12px 14px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  color: #f4ecd6;
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
  -webkit-appearance: none;
  font-variant-numeric: tabular-nums;
}
.form-input:focus {
  border-color: rgba(226,179,74,0.4);
  box-shadow: 0 0 0 3px rgba(226,179,74,0.07);
}
.form-input::placeholder { color: #5a4f3f; }

/* ── Gram hint ── */
.gram-hint {
  margin-top: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #7bd3a0;
  opacity: 0.8;
  letter-spacing: 0.3px;
}

/* ── Hint ── */
.form-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(239,107,107,0.07);
  border: 1px solid rgba(239,107,107,0.18);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 12.5px;
  color: #ef6b6b;
  font-family: 'JetBrains Mono', monospace;
}

/* ── Denomination grid ── */
.denom-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.denom-btn {
  padding: 11px 6px 10px;
  background: rgba(0,0,0,0.25);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  color: #a89878;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.denom-btn:hover:not(.unavailable) {
  border-color: rgba(226,179,74,0.2);
  background: rgba(226,179,74,0.06);
  color: #f4ecd6;
}
.denom-btn.active {
  background: linear-gradient(180deg, rgba(226,179,74,0.2), rgba(226,179,74,0.08));
  border-color: rgba(212,160,23,0.3);
  color: #e2b34a;
}
.denom-btn.unavailable {
  opacity: 0.2;
  cursor: not-allowed;
}

.denom-label {
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
}
.denom-gram {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: inherit;
  opacity: 0.6;
  font-variant-numeric: tabular-nums;
}
.denom-btn.active .denom-gram { opacity: 0.8; }

/* ── Submit ── */
.btn-submit-new {
  width: 100%;
  padding: 15px;
  background: linear-gradient(180deg, #e2b34a, #c49524);
  color: #0a0806;
  border: none;
  border-radius: 14px;
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.2px;
  box-shadow: 0 6px 20px rgba(226,179,74,0.18), inset 0 1px 0 rgba(255,255,255,0.28);
  transition: opacity 0.15s, transform 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
}
.btn-submit-new:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
.btn-submit-new:disabled { opacity: 0.35; cursor: not-allowed; transform: none; box-shadow: none; }
.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(10,8,6,0.3);
  border-top-color: #0a0806;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
</style>
