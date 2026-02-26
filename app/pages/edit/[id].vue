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

      <!-- Name Type -->
      <div class="field">
        <label class="label">Jenis Nama</label>
        <div class="toggle-group">
          <button type="button" class="toggle-btn" :class="{ active: form.name_type === 'text' }" @click="switchNameType('text')">
            Teks
          </button>
          <button type="button" class="toggle-btn" :class="{ active: form.name_type === 'image' }" @click="switchNameType('image')">
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

      <!-- Is Worn (gold only) -->
      <div v-if="entry.metal_type === 'gold'" class="field">
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

      <!-- Collateral (gold, not worn) -->
      <template v-if="entry.metal_type === 'gold' && !form.is_worn">
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

      <!-- Gram (reduce only, locked if collateral) -->
      <div class="field">
        <label class="label">Berat (gram){{ form.is_collateral ? '' : ` — maks ${entry.gram}g` }}</label>
        <div v-if="!form.is_collateral" class="shortcut-row">
          <button v-for="s in gramShortcuts" :key="s.label" type="button" class="shortcut-btn" :disabled="s.value > entry.gram" @click="form.gram = s.value">
            {{ s.label }}
          </button>
        </div>
        <input v-model.number="form.gram" type="number" class="input" :max="entry.gram" min="0.01" step="0.01" required :disabled="form.is_collateral" />
      </div>

      <button type="submit" class="btn-submit" :disabled="submitting">
        {{ submitting ? 'Menyimpan...' : 'Kemaskini' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { getEntry, updateEntry } = useEntries()

const entry = ref<any>(null)
const loading = ref(true)

const form = reactive({
  name_type: 'text' as 'text' | 'image',
  name_string: '',
  is_worn: false,
  is_collateral: false,
  loan_amount: null as number | null,
  gram: 0,
})

const originalNameString = ref('')
const fileInput = ref<HTMLInputElement>()
const submitting = ref(false)

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

const switchNameType = (type: 'text' | 'image') => {
  if (type === form.name_type) return
  form.name_type = type
  // Restore original if switching back to the original type
  if (type === entry.value.name_type) {
    form.name_string = originalNameString.value
  } else {
    form.name_string = ''
  }
}

onMounted(async () => {
  try {
    const doc = await getEntry(route.params.id as string)
    entry.value = doc
    originalNameString.value = doc.name_string
    form.name_type = doc.name_type
    form.name_string = doc.name_string
    form.is_worn = doc.is_worn
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
    form.name_string = reader.result as string
  }
  reader.readAsDataURL(file)
}

const handleSubmit = async () => {
  if (!form.gram || form.gram > entry.value.gram) return

  submitting.value = true
  try {
    await updateEntry({
      ...entry.value,
      name_type: form.name_type,
      name_string: form.name_string,
      is_worn: entry.value.metal_type === 'gold' ? form.is_worn : entry.value.is_worn,
      is_collateral: entry.value.metal_type === 'gold' && !form.is_worn ? form.is_collateral : false,
      loan_amount: entry.value.metal_type === 'gold' && !form.is_worn && form.is_collateral ? form.loan_amount : null,
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
