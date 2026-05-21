<template>
  <div class="form-page">

    <header class="form-header">
      <NuxtLink to="/" class="btn-back-pill">
        <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
          <path d="M7 1L1 6.5L7 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Kembali
      </NuxtLink>
      <h1 class="form-title">Tambah Rekod</h1>
    </header>

    <form class="form-body" @submit.prevent="handleSubmit">

      <!-- Jenis Logam -->
      <div class="form-card">
        <span class="field-label">Jenis Logam</span>
        <div class="seg-control cols-2">
          <button type="button" class="seg-btn" :class="{ active: form.metal_type === 'gold' }"
            @click="form.metal_type = 'gold'">
            <span class="seg-icon">Au</span> Emas
          </button>
          <button type="button" class="seg-btn" :class="{ active: form.metal_type === 'silver' }"
            @click="form.metal_type = 'silver'; form.name_string = ''; form.image_string = ''">
            <span class="seg-icon seg-icon-silver">Ag</span> Perak
          </button>
        </div>
      </div>

      <!-- Bentuk -->
      <div class="form-card">
        <span class="field-label">Bentuk</span>
        <div class="seg-control cols-2">
          <button type="button" class="seg-btn" :class="{ active: form.metal_state === 'physical' }"
            @click="form.metal_state = 'physical'; form.name_string = ''; form.image_string = ''">
            Fizikal
          </button>
          <button type="button" class="seg-btn" :class="{ active: form.metal_state === 'digital' }"
            @click="form.metal_state = 'digital'; form.name_string = ''; form.image_string = ''">
            Digital
          </button>
        </div>
      </div>

      <!-- Status Pemakaian (gold + physical) -->
      <div v-if="form.metal_type === 'gold' && form.metal_state === 'physical'" class="form-card">
        <span class="field-label">Status Pemakaian</span>
        <div class="seg-control cols-2">
          <button type="button" class="seg-btn" :class="{ active: form.is_worn }" @click="form.is_worn = true">
            Barang Kemas
          </button>
          <button type="button" class="seg-btn" :class="{ active: !form.is_worn }" @click="form.is_worn = false">
            Pelaburan
          </button>
        </div>
      </div>

      <!-- Platform (digital) -->
      <div v-if="form.metal_state === 'digital'" class="form-card">
        <span class="field-label">Platform</span>
        <select v-model="form.name_string" class="form-input" required>
          <option value="" disabled>Pilih platform</option>
          <template v-if="form.metal_type === 'gold'">
            <option value="AGROBANK">Agrobank AGROGold Account-i</option>
            <option value="BANKISLAM">Bank Islam Gold Account-i</option>
            <option value="BANKRAKYAT">Bank Rakyat eGold-i</option>
            <option value="BSN">BSN MyGold Account-i</option>
            <option value="BURSA">Bursa Gold Dinar</option>
            <option value="MAYBANK">Maybank Islamic Gold Account-i</option>
            <option value="MBSB">MBSB Bank PrimeGold-i</option>
            <option value="MEEM">MEEM Gold GSS</option>
            <option value="PUBLICGOLD">Public Gold GAP</option>
          </template>
          <template v-else>
            <option value="MEEMSILVER">MEEM Gold SSS</option>
            <option value="PGSILVER">Public Gold SAP</option>
          </template>
        </select>
      </div>

      <!-- Name & Image (physical) -->
      <template v-if="form.metal_state === 'physical'">
        <div v-if="showNameImageHint" class="form-hint">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="#ef6b6b" stroke-width="1.3"/>
            <path d="M7 4V7.5" stroke="#ef6b6b" stroke-width="1.4" stroke-linecap="round"/>
            <circle cx="7" cy="9.5" r="0.7" fill="#ef6b6b"/>
          </svg>
          Sila isi sekurang-kurangnya nama atau gambar.
        </div>

        <div class="form-card">
          <span class="field-label">Nama</span>
          <input v-model="form.name_string" type="text" class="form-input" :placeholder="namePlaceholder" />
        </div>

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
      </template>

      <!-- Physical Gold: Ketulenan + Ar-Rahnu -->
      <template v-if="form.metal_type === 'gold' && form.metal_state === 'physical'">
        <div class="form-card">
          <span class="field-label">Ketulenan Emas</span>
          <select v-model.number="form.gold_percent" class="form-input">
            <option :value="null" disabled>Pilih ketulenan</option>
            <option :value="999">999 / 24K</option>
            <option :value="950">950 / 23K</option>
            <option :value="916">916 / 22K</option>
            <option :value="875">875 / 21K</option>
            <option :value="835">835 / 20K</option>
            <option :value="750">750 / 18K</option>
          </select>
        </div>

        <div class="form-card">
          <span class="field-label">Ar-Rahnu (Cagaran)</span>
          <div class="seg-control cols-2">
            <button type="button" class="seg-btn" :class="{ active: form.is_collateral }"
              @click="form.is_collateral = true">Ya</button>
            <button type="button" class="seg-btn" :class="{ active: !form.is_collateral }"
              @click="form.is_collateral = false; form.loan_amount = null">Tidak</button>
          </div>
        </div>

        <div v-if="form.is_collateral" class="form-card">
          <span class="field-label">Jumlah Pinjaman + Upah (RM)</span>
          <input v-model.number="form.loan_amount" type="number" class="form-input"
            placeholder="cth: 5000" min="0" :max="(form.gram || 0) * goldPrice" step="0.01" required />
        </div>
      </template>

      <!-- Bilangan Item (physical) -->
      <div v-if="form.metal_state === 'physical'" class="form-card">
        <span class="field-label">Bilangan Item</span>
        <div class="seg-control cols-2">
          <button type="button" class="seg-btn" :class="{ active: form.is_bulk }" @click="form.is_bulk = true">
            Pukal
          </button>
          <button type="button" class="seg-btn" :class="{ active: !form.is_bulk }" @click="form.is_bulk = false">
            Satu Item
          </button>
        </div>
      </div>

      <!-- Berat -->
      <div class="form-card">
        <span class="field-label">Berat (gram)</span>
        <div v-if="form.metal_state === 'physical' && !form.is_worn" class="shortcut-chips">
          <button v-for="s in gramShortcuts" :key="s.label" type="button" class="chip"
            @click="form.gram = s.value">{{ s.label }}</button>
        </div>
        <input v-model.number="form.gram" type="number" class="form-input" placeholder="cth: 10.5"
          min="0" :step="form.metal_type === 'gold' ? '0.0001' : '0.001'" required />
        <div v-if="form.gram" class="gram-hint">
          ≈ RM {{ approxValue }}
        </div>
      </div>

      <!-- Tarikh -->
      <div class="form-card">
        <span class="field-label">Tarikh Pemilikan / Akhir Zakat Dibayar</span>
        <input v-model="form.date" type="date" class="form-input" :max="today" required />
      </div>

      <button type="submit" class="btn-submit-new" :disabled="submitting">
        <span v-if="submitting" class="btn-spinner"></span>
        {{ submitting ? 'Menyimpan…' : 'Simpan Rekod' }}
      </button>

    </form>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Tambah Rekod — Zakat Emas & Perak' })

const router = useRouter()
const { entries, fetchEntries, addEntry, updateEntry } = useEntries()

await fetchEntries()

const { data: prices } = await useFetch('/data.json', { default: () => ({ gold_price: 650, silver_price: 12 }) })
const goldPrice = computed(() => prices.value.gold_price)
const silverPrice = computed(() => prices.value.silver_price)

const today = new Date().toISOString().split('T')[0]

const form = reactive({
  metal_type: 'gold' as 'gold' | 'silver',
  metal_state: 'physical' as 'physical' | 'digital',
  name_string: '',
  image_string: '',
  is_worn: false,
  gold_percent: 999 as number | null,
  is_collateral: false,
  loan_amount: null as number | null,
  is_bulk: false,
  gram: null as number | null,
  date: today,
})

const fileInput = ref<HTMLInputElement>()
const submitting = ref(false)
const showNameImageHint = ref(false)

const namePlaceholder = computed(() => {
  if (form.metal_type === 'gold' && !form.is_worn) return 'cth: PG 1 dinar'
  if (form.metal_type === 'silver') return 'cth: PG 5 dirham'
  return 'cth: Rantai tangan 916'
})

const approxValue = computed(() => {
  if (!form.gram) return ''
  if (form.metal_type === 'gold') {
    const purity = (form.gold_percent || 999) / 999
    return Math.round(form.gram * goldPrice.value * purity).toLocaleString('en-MY')
  }
  return Math.round(form.gram * silverPrice.value).toLocaleString('en-MY')
})

const gramShortcuts = computed(() => {
  if (form.metal_type === 'gold') {
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
  if (!form.gram) return
  if (form.metal_state === 'physical' && !form.name_string.trim() && !form.image_string) {
    showNameImageHint.value = true
    return
  }
  showNameImageHint.value = false

  submitting.value = true
  try {
    if (form.metal_state === 'digital') {
      const existing = entries.value.find(
        (e: any) => e.metal_state === 'digital' && e.metal_type === form.metal_type && e.name_string === form.name_string && e.date === form.date,
      )
      if (existing) {
        await updateEntry({ ...existing, gram: parseFloat(((existing as any).gram + form.gram!).toFixed(form.metal_type === 'gold' ? 4 : 3)) })
        router.push('/')
        return
      }
    }

    await addEntry({
      metal_type: form.metal_type,
      metal_state: form.metal_state,
      name_string: form.name_string,
      image_string: form.metal_state === 'physical' ? form.image_string : '',
      is_worn: form.metal_type === 'gold' && form.metal_state === 'physical' ? form.is_worn : false,
      gold_percent: form.metal_type === 'gold' && form.metal_state === 'physical' ? form.gold_percent : null,
      is_collateral: form.metal_type === 'gold' && form.metal_state === 'physical' ? form.is_collateral : false,
      loan_amount: form.metal_type === 'gold' && form.metal_state === 'physical' && form.is_collateral ? form.loan_amount : null,
      is_bulk: form.metal_state === 'physical' ? form.is_bulk : false,
      gram: form.gram,
      date: form.date,
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

/* ── Form body ── */
.form-body {
  padding-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ── Form card ── */
.form-card {
  background: #181410;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 14px 16px;
}

/* ── Field label ── */
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
.seg-control.cols-3 { grid-template-columns: 1fr 1fr 1fr; }

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
  gap: 6px;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.seg-btn.active {
  background: linear-gradient(180deg, rgba(226,179,74,0.18), rgba(226,179,74,0.06));
  border-color: rgba(212,160,23,0.22);
  color: #e2b34a;
  font-weight: 600;
}
.seg-btn:hover:not(.active) {
  color: #f4ecd6;
}

.seg-icon {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(226,179,74,0.12);
  color: #e2b34a;
  letter-spacing: 0.3px;
}
.seg-icon-silver {
  background: rgba(200,211,224,0.12);
  color: #c8d3e0;
}

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
.form-input::placeholder {
  color: #5a4f3f;
}
.form-input:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
select.form-input {
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='%23a89878' d='M0 0l6 8 6-8z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 36px;
  background-color: rgba(0,0,0,0.3);
}
input[type="date"].form-input {
  color-scheme: dark;
}

/* ── Gram value hint ── */
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
.chip:disabled {
  opacity: 0.2;
  cursor: not-allowed;
}

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

/* ── Image upload ── */
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

.img-preview-wrap {
  position: relative;
  display: inline-block;
}
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
.btn-rm-img:hover {
  background: rgba(239,107,107,0.8);
}

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
.btn-submit-new:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
}
.btn-submit-new:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(10,8,6,0.3);
  border-top-color: #0a0806;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
