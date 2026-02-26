<template>
  <div class="container">
    <header class="header">
      <NuxtLink to="/" class="btn-back">← Kembali</NuxtLink>
      <h1>Tambah Rekod</h1>
    </header>

    <form class="form" @submit.prevent="handleSubmit">
      <!-- Metal Type -->
      <div class="field">
        <label class="label">Jenis Logam</label>
        <div class="toggle-group">
          <button type="button" class="toggle-btn" :class="{ active: form.metal_type === 'gold' }" @click="form.metal_type = 'gold'">
            Emas
          </button>
          <button type="button" class="toggle-btn" :class="{ active: form.metal_type === 'silver' }" @click="form.metal_type = 'silver'; form.metal_state = 'physical'; form.name_string = ''; form.name_type = 'text'">
            Perak
          </button>
        </div>
      </div>

      <!-- Metal State (gold only) -->
      <div v-if="form.metal_type === 'gold'" class="field">
        <label class="label">Bentuk</label>
        <div class="toggle-group">
          <button type="button" class="toggle-btn" :class="{ active: form.metal_state === 'physical' }" @click="form.metal_state = 'physical'; form.name_string = ''; form.name_type = 'text'">
            Fizikal
          </button>
          <button type="button" class="toggle-btn" :class="{ active: form.metal_state === 'digital' }" @click="form.metal_state = 'digital'; form.name_string = ''; form.name_type = 'text'">
            Digital
          </button>
        </div>
      </div>

      <!-- Digital: name dropdown -->
      <div v-if="form.metal_state === 'digital'" class="field">
        <label class="label">Platform</label>
        <select v-model="form.name_string" class="input" required>
          <option value="" disabled>Pilih platform</option>
          <option value="AGROBANK">Agrobank AGROGold Account-i</option>
          <option value="BANKRAKYAT">Bank Rakyat eGold-i</option>
          <option value="BSN">BSN MyGold Account-i</option>
          <option value="BURSA">Bursa Gold Dinar</option>
          <option value="MAYBANK">Maybank Islamic Gold Account-i</option>
          <option value="MBSB">MBSB Bank PrimeGold-i</option>
          <option value="PUBLICGOLD">Public Gold GAP</option>
        </select>
      </div>

      <!-- Physical: name type toggle -->
      <template v-else>
        <div class="field">
          <label class="label">Jenis Nama</label>
          <div class="toggle-group">
            <button type="button" class="toggle-btn" :class="{ active: form.name_type === 'text' }" @click="form.name_type = 'text'; form.name_string = ''">
              Teks
            </button>
            <button type="button" class="toggle-btn" :class="{ active: form.name_type === 'image' }" @click="form.name_type = 'image'; form.name_string = ''">
              Gambar
            </button>
          </div>
        </div>

        <!-- Name String (text) -->
        <div v-if="form.name_type === 'text'" class="field">
          <label class="label">Nama</label>
          <input v-model="form.name_string" type="text" class="input" placeholder="cth: Rantai tangan 916" required />
        </div>

        <!-- Name String (image) -->
        <div v-else class="field">
          <label class="label">Gambar</label>
          <div class="image-upload" @click="fileInput?.click()">
            <img v-if="form.name_string" :src="form.name_string" class="image-preview" />
            <div v-else class="image-placeholder">
              <span class="image-icon">📷</span>
              <span>Tekan untuk muat naik</span>
            </div>
            <input ref="fileInput" type="file" accept="image/*" hidden @change="handleImageUpload" />
          </div>
        </div>
      </template>

      <!-- Physical Gold Only Fields -->
      <template v-if="form.metal_type === 'gold' && form.metal_state === 'physical'">
        <!-- Is Worn -->
        <div class="field">
          <label class="label">Status Pemakaian</label>
          <div class="toggle-group">
            <button type="button" class="toggle-btn" :class="{ active: form.is_worn }" @click="form.is_worn = true">
              Dipakai
            </button>
            <button type="button" class="toggle-btn" :class="{ active: !form.is_worn }" @click="form.is_worn = false">
              Disimpan
            </button>
          </div>
        </div>

        <!-- Gold Percent -->
        <div class="field">
          <label class="label">Ketulenan Emas</label>
          <select v-model.number="form.gold_percent" class="input">
            <option :value="null" disabled>Pilih ketulenan</option>
            <option :value="999">999</option>
            <option :value="916">916</option>
            <option :value="833">833</option>
            <option :value="750">750</option>
          </select>
        </div>

        <!-- Collateral (only when not worn) -->
        <template v-if="!form.is_worn">
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
            <input v-model.number="form.loan_amount" type="number" class="input" placeholder="cth: 5000" min="0" step="0.01" required />
          </div>
        </template>
      </template>

      <!-- Gram -->
      <div class="field">
        <label class="label">Berat (gram)</label>
        <div v-if="form.metal_state === 'physical'" class="shortcut-row">
          <button v-for="s in gramShortcuts" :key="s.label" type="button" class="shortcut-btn" @click="form.gram = s.value">
            {{ s.label }}
          </button>
        </div>
        <input v-model.number="form.gram" type="number" class="input" placeholder="cth: 10.5" min="0" step="0.01" required />
      </div>

      <!-- Date -->
      <div class="field">
        <label class="label">Tarikh Dimiliki/Akhir Zakat Dibayar</label>
        <input v-model="form.date" type="date" class="input" :max="today" required />
      </div>

      <button type="submit" class="btn-submit" :disabled="submitting">
        {{ submitting ? 'Menyimpan...' : 'Simpan' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { addEntry } = useEntries()

const today = new Date().toISOString().split('T')[0]

const form = reactive({
  metal_type: 'gold' as 'gold' | 'silver',
  metal_state: 'physical' as 'physical' | 'digital',
  name_string: '',
  name_type: 'text' as 'text' | 'image',
  is_worn: false,
  gold_percent: 999 as number | null,
  is_collateral: false,
  loan_amount: null as number | null,
  gram: null as number | null,
  date: today,
})

const fileInput = ref<HTMLInputElement>()
const submitting = ref(false)

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
    form.name_string = reader.result as string
  }
  reader.readAsDataURL(file)
}

const handleSubmit = async () => {
  if (!form.gram) return

  submitting.value = true
  try {
    await addEntry({
      metal_type: form.metal_type,
      metal_state: form.metal_state,
      name_string: form.name_string,
      name_type: form.name_type,
      is_worn: form.metal_type === 'gold' && form.metal_state === 'physical' ? form.is_worn : false,
      gold_percent: form.metal_type === 'gold' && form.metal_state === 'physical' ? form.gold_percent : null,
      is_collateral: form.metal_type === 'gold' && form.metal_state === 'physical' && !form.is_worn ? form.is_collateral : false,
      loan_amount: form.metal_type === 'gold' && form.metal_state === 'physical' && !form.is_worn && form.is_collateral ? form.loan_amount : null,
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

.image-preview {
  max-width: 100%;
  max-height: 200px;
  border-radius: 6px;
  object-fit: contain;
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
</style>
