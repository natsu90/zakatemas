<template>
  <div class="container">
    <header class="page-header">
      <NuxtLink to="/" class="btn-back">← Kembali</NuxtLink>
      <h1 class="page-title">Tambah Rekod</h1>
    </header>

    <form class="form" @submit.prevent="handleSubmit">
      <!-- Metal Type -->
      <div class="field">
        <label class="label">Jenis Logam</label>
        <div class="toggle-group">
          <button type="button" class="toggle-btn" :class="{ active: form.metal_type === 'gold' }" @click="form.metal_type = 'gold'">
            Emas
          </button>
          <button type="button" class="toggle-btn" :class="{ active: form.metal_type === 'silver' }" @click="form.metal_type = 'silver'; form.name_string = ''; form.image_string = ''">
            Perak
          </button>
        </div>
      </div>

      <!-- Metal State -->
      <div class="field">
        <label class="label">Bentuk</label>
        <div class="toggle-group">
          <button type="button" class="toggle-btn" :class="{ active: form.metal_state === 'physical' }" @click="form.metal_state = 'physical'; form.name_string = ''; form.image_string = ''">
            Fizikal
          </button>
          <button type="button" class="toggle-btn" :class="{ active: form.metal_state === 'digital' }" @click="form.metal_state = 'digital'; form.name_string = ''; form.image_string = ''">
            Digital
          </button>
        </div>
      </div>

      <!-- Is Worn (physical gold only) -->
      <div v-if="form.metal_type === 'gold' && form.metal_state === 'physical'" class="field">
        <label class="label">Status Pemakaian</label>
        <div class="toggle-group">
          <button type="button" class="toggle-btn" :class="{ active: form.is_worn }" @click="form.is_worn = true">
            Barang Kemas
          </button>
          <button type="button" class="toggle-btn" :class="{ active: !form.is_worn }" @click="form.is_worn = false">
            Pelaburan
          </button>
        </div>
      </div>

      <!-- Digital: name dropdown -->
      <div v-if="form.metal_state === 'digital'" class="field">
        <label class="label">Platform</label>
        <select v-model="form.name_string" class="input" required>
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

      <!-- Physical: name & image inputs -->
      <template v-if="form.metal_state === 'physical'">
        <div v-if="showNameImageHint" class="hint">Sila isi sekurang-kurangnya nama atau gambar.</div>
        <div class="field">
          <label class="label">Nama</label>
          <input v-model="form.name_string" type="text" class="input" :placeholder="form.metal_type === 'gold' && !form.is_worn ? 'cth: PG 1 dinar' : form.metal_type === 'silver' ? 'cth: PG 5 dirham' : 'cth: Rantai tangan 916'" />
        </div>

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
      </template>

      <!-- Physical Gold Only Fields -->
      <template v-if="form.metal_type === 'gold' && form.metal_state === 'physical'">
        <!-- Gold Percent -->
        <div class="field">
          <label class="label">Ketulenan Emas</label>
          <select v-model.number="form.gold_percent" class="input">
            <option :value="null" disabled>Pilih ketulenan</option>
            <option :value="999">999 / 24K</option>
            <option :value="950">950 / 23K</option>
            <option :value="916">916 / 22K</option>
            <option :value="875">875 / 21K</option>
            <option :value="835">835 / 20K</option>
            <option :value="750">750 / 18K</option>
          </select>
        </div>

        <!-- Collateral -->
        <div class="field">
          <label class="label">Ar-Rahnu (Cagaran)</label>
          <div class="toggle-group">
            <button type="button" class="toggle-btn" :class="{ active: form.is_collateral }" @click="form.is_collateral = true">
              Ya
            </button>
            <button type="button" class="toggle-btn" :class="{ active: !form.is_collateral }" @click="form.is_collateral = false; form.loan_amount = null">
              Tidak
            </button>
          </div>
        </div>

        <div v-if="form.is_collateral" class="field">
          <label class="label">Jumlah Pinjaman + Upah (RM)</label>
          <input v-model.number="form.loan_amount" type="number" class="input" placeholder="cth: 5000" min="0" :max="(form.gram || 0) * goldPrice" step="0.01" required />
        </div>
      </template>

      <!-- Bulk (physical only) -->
      <div v-if="form.metal_state === 'physical'" class="field">
        <label class="label">Bilangan Item</label>
        <div class="toggle-group">
          <button type="button" class="toggle-btn" :class="{ active: form.is_bulk }" @click="form.is_bulk = true">
            Pukal
          </button>
          <button type="button" class="toggle-btn" :class="{ active: !form.is_bulk }" @click="form.is_bulk = false">
            Satu Item
          </button>
        </div>
      </div>

      <!-- Gram -->
      <div class="field">
        <label class="label">Berat (gram)</label>
        <div v-if="form.metal_state === 'physical' && !form.is_worn" class="shortcut-row">
          <button v-for="s in gramShortcuts" :key="s.label" type="button" class="shortcut-btn" @click="form.gram = s.value">
            {{ s.label }}
          </button>
        </div>
        <input v-model.number="form.gram" type="number" class="input" placeholder="cth: 10.5" min="0" :step="form.metal_type === 'gold' ? '0.0001' : '0.001'" required />
      </div>

      <!-- Date -->
      <div class="field">
        <label class="label">Tarikh Pemilikan/Akhir Zakat Dibayar</label>
        <input v-model="form.date" type="date" class="input" :max="today" required />
      </div>

      <button type="submit" class="btn-submit" :disabled="submitting">
        {{ submitting ? 'Menyimpan...' : 'Simpan' }}
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
</style>
