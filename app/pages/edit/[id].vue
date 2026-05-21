<template>
  <div class="form-page">

    <header class="form-header">
      <NuxtLink to="/" class="btn-back-pill">
        <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
          <path d="M7 1L1 6.5L7 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Kembali
      </NuxtLink>
      <h1 class="form-title">Kemaskini Rekod</h1>
    </header>

    <div v-if="loading" class="form-loading">
      <div class="loading-ring"></div>
      <span>Memuatkan…</span>
    </div>

    <form v-else-if="entry" class="form-body" @submit.prevent="handleSubmit">

      <!-- Read-only identity card -->
      <div class="identity-card">
        <div class="identity-thumb" :class="entry.metal_type === 'gold' ? 'thumb-gold' : 'thumb-silver'">
          <svg v-if="entry.metal_type === 'gold'" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="8" width="18" height="11" rx="1.2" stroke="#e2b34a" stroke-width="1.3"/>
            <path d="M6 8L8 5H16L18 8" stroke="#e2b34a" stroke-width="1.3" stroke-linejoin="round"/>
          </svg>
          <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="7" stroke="#c8d3e0" stroke-width="1.3"/>
          </svg>
        </div>
        <div class="identity-info">
          <div class="identity-name">{{ entry.name_string || (entry.metal_type === 'gold' ? 'Emas' : 'Perak') }}</div>
          <div class="identity-badges">
            <span class="id-badge" :class="entry.metal_type === 'gold' ? 'badge-gold' : 'badge-silver'">
              {{ entry.metal_type === 'gold' ? 'Emas' : 'Perak' }}
            </span>
            <span class="id-badge badge-physical">Fizikal</span>
            <span v-if="entry.metal_type === 'gold' && entry.gold_percent" class="id-badge badge-purity">
              {{ entry.gold_percent }}
            </span>
            <span v-if="entry.is_worn" class="id-badge badge-worn">Kemas</span>
            <span v-if="entry.is_bulk" class="id-badge badge-bulk">Pukal</span>
          </div>
        </div>
        <div class="identity-gram">
          <span class="id-gram-num">{{ entry.gram }}</span>
          <span class="id-gram-unit">g</span>
        </div>
      </div>

      <!-- Hint -->
      <div v-if="showNameImageHint" class="form-hint">
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="#ef6b6b" stroke-width="1.3"/>
          <path d="M7 4V7.5" stroke="#ef6b6b" stroke-width="1.4" stroke-linecap="round"/>
          <circle cx="7" cy="9.5" r="0.7" fill="#ef6b6b"/>
        </svg>
        Sila isi sekurang-kurangnya nama atau gambar.
      </div>

      <!-- Nama -->
      <div class="form-card">
        <span class="field-label">Nama</span>
        <input v-model="form.name_string" type="text" class="form-input"
          :placeholder="entry.metal_type === 'gold' && !entry.is_worn ? 'cth: PG 1 dinar' : entry.metal_type === 'silver' ? 'cth: PG 5 dirham' : 'cth: Rantai tangan 916'" />
      </div>

      <!-- Gambar -->
      <div class="form-card">
        <span class="field-label">Gambar</span>
        <div v-if="form.image_string" class="img-preview-wrap">
          <img :src="form.image_string" class="img-preview" />
          <button type="button" class="btn-rm-img" @click="form.image_string = ''">✕</button>
        </div>
        <div v-else class="img-upload-area" @click="fileInput?.click()">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="#5a4f3f" stroke-width="1.3"/>
            <circle cx="8.5" cy="10.5" r="1.5" stroke="#5a4f3f" stroke-width="1.3"/>
            <path d="M3 15L7 11L10 14L14 10L21 17" stroke="#5a4f3f" stroke-width="1.3" stroke-linejoin="round"/>
          </svg>
          <span>Tekan untuk muat naik gambar</span>
        </div>
        <input ref="fileInput" type="file" accept="image/*" hidden @change="handleImageUpload" />
      </div>

      <!-- Ar-Rahnu (gold only) -->
      <template v-if="entry.metal_type === 'gold'">
        <div class="form-card">
          <span class="field-label">Ar-Rahnu (Cagaran)</span>
          <div class="seg-control cols-2">
            <button type="button" class="seg-btn" :class="{ active: form.is_collateral }"
              @click="form.is_collateral = true">Ya</button>
            <button type="button" class="seg-btn" :class="{ active: !form.is_collateral }"
              @click="form.is_collateral = false; if (!entry.is_collateral) form.loan_amount = null">
              {{ entry.is_collateral ? 'Tebus' : 'Tidak' }}
            </button>
          </div>
        </div>

        <div v-if="form.is_collateral" class="form-card">
          <span class="field-label">Jumlah Pinjaman + Upah (RM)</span>
          <input v-model.number="form.loan_amount" type="number" class="form-input"
            placeholder="cth: 5000" min="0" :max="form.gram * goldPrice" step="0.01" required />
        </div>
      </template>

      <!-- Berat -->
      <div class="form-card">
        <span class="field-label">
          Berat (gram){{ form.is_collateral ? '' : ` — maks ${entry.gram}g` }}
        </span>
        <div v-if="entry.is_bulk && !form.is_collateral && !entry.is_worn" class="shortcut-chips">
          <button v-for="s in gramShortcuts" :key="s.label" type="button" class="chip"
            :disabled="s.value > entry.gram" @click="form.gram = s.value">{{ s.label }}</button>
        </div>
        <input v-model.number="form.gram" type="number" class="form-input"
          :max="entry.gram"
          :min="entry.metal_type === 'gold' ? '0.0001' : '0.001'"
          :step="entry.metal_type === 'gold' ? '0.0001' : '0.001'"
          required
          :disabled="!entry.is_bulk || form.is_collateral || entry.is_collateral" />
        <div v-if="form.gram" class="gram-hint">
          ≈ RM {{ approxValue }}
        </div>
      </div>

      <button type="submit" class="btn-submit-new" :disabled="submitting">
        <span v-if="submitting" class="btn-spinner"></span>
        {{ submitting ? 'Menyimpan…' : 'Kemaskini' }}
      </button>

    </form>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Kemaskini Rekod — Zakat Emas & Perak' })

const route = useRoute()
const router = useRouter()
const { getEntry, updateEntry } = useEntries()

const { data: prices } = await useFetch('/data.json', { default: () => ({ gold_price: 650, silver_price: 12 }) })
const goldPrice = computed(() => prices.value.gold_price)
const silverPrice = computed(() => prices.value.silver_price)

const entry = ref<any>(null)
const loading = ref(true)

const form = reactive({
  name_string: '',
  image_string: '',
  is_collateral: false,
  loan_amount: null as number | null,
  gram: 0,
})
const fileInput = ref<HTMLInputElement>()
const submitting = ref(false)
const showNameImageHint = ref(false)

const approxValue = computed(() => {
  if (!form.gram || !entry.value) return ''
  if (entry.value.metal_type === 'gold') {
    const purity = (entry.value.gold_percent || 999) / 999
    return Math.round(form.gram * goldPrice.value * purity).toLocaleString('en-MY')
  }
  return Math.round(form.gram * silverPrice.value).toLocaleString('en-MY')
})

const gramShortcuts = computed(() => {
  if (entry.value?.metal_type === 'gold') {
    return [
      { label: '½ dinar', value: 2.125 },
      { label: '1 dinar', value: 4.25 },
      { label: '5 dinar', value: 21.25 },
      { label: '1 oz', value: 31.1 },
    ]
  }
  return [
    { label: '1 dirham', value: 2.975 },
    { label: '5 dirham', value: 14.875 },
    { label: '10 dirham', value: 29.75 },
    { label: '1 oz', value: 31.1 },
  ]
})

onMounted(async () => {
  try {
    const doc = await getEntry(route.params.id as string)
    entry.value = doc
    form.name_string = doc.name_string
    form.image_string = doc.image_string || ''
    form.is_collateral = doc.is_collateral || false
    form.loan_amount = doc.loan_amount || null
    form.gram = doc.gram
  } finally {
    loading.value = false
  }
})

const handleImageUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const img = new Image()
    img.onload = () => {
      const MAX = 800
      let w = img.width
      let h = img.height
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX }
        else { w = Math.round(w * MAX / h); h = MAX }
      }
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      form.image_string = canvas.toDataURL('image/jpeg', 0.8)
    }
    img.src = reader.result as string
  }
  reader.readAsDataURL(file)
}

const handleSubmit = async () => {
  if (!form.gram || form.gram > entry.value.gram) return
  if (!form.name_string.trim() && !form.image_string) {
    showNameImageHint.value = true
    return
  }
  showNameImageHint.value = false

  submitting.value = true
  try {
    const isGold = entry.value.metal_type === 'gold'
    await updateEntry({
      ...entry.value,
      name_string: form.name_string,
      image_string: form.image_string,
      is_collateral: isGold ? form.is_collateral : false,
      loan_amount: isGold && form.is_collateral ? form.loan_amount : null,
      gram: form.gram,
    })
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

/* ── Identity card ── */
.identity-card {
  background: radial-gradient(120% 100% at 100% 0%, rgba(226,179,74,0.08), transparent 60%), #181410;
  border: 1px solid rgba(212,160,23,0.18);
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 2px;
}

.identity-thumb {
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

.identity-info {
  flex: 1;
  min-width: 0;
}

.identity-name {
  font-size: 14px;
  font-weight: 500;
  color: #f4ecd6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 5px;
}

.identity-badges {
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
.badge-physical { background: rgba(123,211,160,0.1); color: #7bd3a0; border: 1px solid rgba(123,211,160,0.2); }
.badge-purity { background: rgba(255,255,255,0.06); color: #a89878; border: 1px solid rgba(255,255,255,0.08); }
.badge-worn { background: rgba(130,173,255,0.1); color: #82adff; border: 1px solid rgba(130,173,255,0.2); }
.badge-bulk { background: rgba(200,163,90,0.1); color: #c8a35a; border: 1px solid rgba(200,163,90,0.2); }

.identity-gram {
  display: flex;
  align-items: baseline;
  gap: 2px;
  flex-shrink: 0;
}
.id-gram-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  font-weight: 600;
  color: #f4ecd6;
  font-variant-numeric: tabular-nums;
}
.id-gram-unit {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #5a4f3f;
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
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
  -webkit-appearance: none;
}
.form-input:focus {
  border-color: rgba(226,179,74,0.4);
  box-shadow: 0 0 0 3px rgba(226,179,74,0.07);
}
.form-input::placeholder { color: #5a4f3f; }
.form-input:disabled { opacity: 0.35; cursor: not-allowed; }

/* ── Gram hint ── */
.gram-hint {
  margin-top: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #e2b34a;
  opacity: 0.7;
  letter-spacing: 0.3px;
}

/* ── Shortcut chips ── */
.shortcut-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.chip {
  padding: 5px 12px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 999px;
  color: #a89878;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
}
.chip:hover:not(:disabled) {
  background: rgba(226,179,74,0.08);
  border-color: rgba(212,160,23,0.28);
  color: #e2b34a;
}
.chip:disabled { opacity: 0.2; cursor: not-allowed; }

/* ── Hint ── */
.form-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(239,107,107,0.07);
  border: 1px solid rgba(239,107,107,0.18);
  border-radius: 12px;
  padding: 11px 14px;
  font-size: 12.5px;
  color: #ef6b6b;
  font-family: 'JetBrains Mono', monospace;
}

/* ── Image ── */
.img-upload-area {
  border: 1.5px dashed rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 26px 16px;
  text-align: center;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #5a4f3f;
  font-size: 13px;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
}
.img-upload-area:hover {
  border-color: rgba(226,179,74,0.3);
  background: rgba(226,179,74,0.04);
  color: #a89878;
}
.img-preview-wrap { position: relative; display: inline-block; }
.img-preview {
  max-width: 100%;
  max-height: 160px;
  border-radius: 10px;
  object-fit: contain;
  border: 1px solid rgba(255,255,255,0.06);
  display: block;
}
.btn-rm-img {
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(0,0,0,0.8);
  color: #f4ecd6;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.btn-rm-img:hover { background: rgba(239,107,107,0.8); }

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
