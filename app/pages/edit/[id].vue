<template>
  <div class="container">
    <header class="header">
      <NuxtLink to="/" class="btn-back">← Kembali</NuxtLink>
      <h1>Kemaskini Rekod</h1>
    </header>

    <div v-if="loading" class="loading">Memuatkan...</div>

    <form v-else-if="entry" class="form" @submit.prevent="handleSubmit">
      <!-- Info badges (read-only) -->
      <div class="info-row">
        <span class="badge" :class="entry.metal_type">
          {{ entry.metal_type === 'gold' ? 'Emas' : 'Perak' }}
        </span>
        <span class="badge physical">Fizikal</span>
        <span v-if="entry.metal_type === 'gold' && entry.gold_percent" class="badge gold">
          {{ entry.gold_percent }}
        </span>
      </div>

      <div v-if="showNameImageHint" class="hint">Sila isi sekurang-kurangnya nama atau gambar.</div>

      <!-- Name -->
      <div class="field">
        <label class="label">Nama</label>
        <input v-model="form.name_string" type="text" class="input" :placeholder="entry.metal_type === 'gold' && !entry.is_worn ? 'cth: PG 1 dinar' : entry.metal_type === 'silver' ? 'cth: PG 5 dirham' : 'cth: Rantai tangan 916'" />
      </div>

      <!-- Image -->
      <div class="field">
        <label class="label">Gambar</label>
        <div v-if="form.image_string" class="image-wrapper">
          <img :src="form.image_string" class="image-preview" />
          <button type="button" class="btn-remove-image" @click="form.image_string = ''">✕</button>
        </div>
        <div v-else class="image-upload" @click="fileInput?.click()">
          <div class="image-placeholder">
            <span class="image-icon">📷</span>
            <span>Tekan untuk muat naik</span>
          </div>
        </div>
        <input ref="fileInput" type="file" accept="image/*" hidden @change="handleImageUpload" />
      </div>

      <!-- Collateral (gold only) -->
      <template v-if="entry.metal_type === 'gold'">
        <div class="field">
          <label class="label">Ar-Rahnu (Cagaran)</label>
          <div class="toggle-group">
            <button type="button" class="toggle-btn" :class="{ active: form.is_collateral }" @click="form.is_collateral = true">
              Ya
            </button>
            <button type="button" class="toggle-btn" :class="{ active: !form.is_collateral }" @click="form.is_collateral = false; if (!entry.is_collateral) form.loan_amount = null">
              {{ entry.is_collateral ? 'Tebus' : 'Tidak' }}
            </button>
          </div>
        </div>

        <div v-if="form.is_collateral" class="field">
          <label class="label">Jumlah Pinjaman + Upah (RM)</label>
          <input v-model.number="form.loan_amount" type="number" class="input" placeholder="cth: 5000" min="0" :max="form.gram * goldPrice" step="0.01" required />
        </div>
      </template>

      <!-- Gram (reduce only, locked if collateral) -->
      <div class="field">
        <label class="label">Berat (gram){{ form.is_collateral ? '' : ` — maks ${entry.gram}g` }}</label>
        <div v-if="entry.is_bulk && !form.is_collateral && !entry.is_worn" class="shortcut-row">
          <button v-for="s in gramShortcuts" :key="s.label" type="button" class="shortcut-btn" :disabled="s.value > entry.gram" @click="form.gram = s.value">
            {{ s.label }}
          </button>
        </div>
        <input v-model.number="form.gram" type="number" class="input" :max="entry.gram" :min="entry.metal_type === 'gold' ? '0.0001' : '0.001'" :step="entry.metal_type === 'gold' ? '0.0001' : '0.001'" required :disabled="!entry.is_bulk || form.is_collateral || entry.is_collateral" />
      </div>

      <button type="submit" class="btn-submit" :disabled="submitting">
        {{ submitting ? 'Menyimpan...' : 'Kemaskini' }}
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

.shortcut-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.shortcut-btn {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  font-size: 0.8rem;
  cursor: pointer;
  color: #555;
  transition: all 0.2s;
}

.shortcut-btn:active {
  background: #d4a017;
  border-color: #d4a017;
  color: #fff;
}

.shortcut-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.image-upload {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s;
}

.image-upload:active {
  border-color: #d4a017;
}

.image-wrapper {
  position: relative;
  display: inline-block;
}

.image-preview {
  max-width: 100%;
  max-height: 200px;
  border-radius: 6px;
  object-fit: contain;
}

.btn-remove-image {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #999;
  font-size: 0.85rem;
}

.image-icon {
  font-size: 1.5rem;
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

.hint {
  font-size: 0.8rem;
  color: #dc2626;
  background: #fef2f2;
  padding: 8px 12px;
  border-radius: 8px;
}
</style>
