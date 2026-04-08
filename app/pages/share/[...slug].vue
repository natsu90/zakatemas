<template>
  <div class="container share-page">
    <!-- Decoding -->
    <div v-if="decoding" class="share-state">
      <div class="share-spinner"></div>
      <p>Membaca data…</p>
    </div>

    <!-- Decode error -->
    <div v-else-if="decodeError" class="share-state">
      <div class="share-error-icon">✕</div>
      <p class="share-error-msg">{{ decodeError }}</p>
      <NuxtLink to="/" class="btn-submit">Buka Aplikasi</NuxtLink>
    </div>

    <!-- Import done -->
    <div v-else-if="importDone" class="share-state">
      <div class="share-success-icon">✓</div>
      <p class="share-success-msg">{{ importedCount }} rekod berjaya diimport!</p>
      <NuxtLink to="/" class="btn-submit">Buka Aplikasi</NuxtLink>
    </div>

    <!-- Confirmation -->
    <div v-else class="share-card">
      <div class="share-symbol">☽</div>
      <h1 class="share-title">Import Data</h1>
      <p class="share-subtitle">
        Pautan ini mengandungi <strong>{{ importEntries.length }} rekod</strong>.
      </p>

      <div class="share-breakdown">
        <div v-if="goldPhysical" class="share-row">
          <span>Emas Fizikal</span>
          <span>{{ goldPhysical }} rekod</span>
        </div>
        <div v-if="goldDigital" class="share-row">
          <span>Emas Digital</span>
          <span>{{ goldDigital }} rekod</span>
        </div>
        <div v-if="silverCount" class="share-row">
          <span>Perak</span>
          <span>{{ silverCount }} rekod</span>
        </div>
      </div>

      <div class="share-warning">
        Semua data semasa anda akan <strong>digantikan</strong>.
      </div>

      <button class="btn-submit" :disabled="importing" @click="doImport">
        {{ importing ? 'Mengimport…' : 'Ya, Import & Ganti' }}
      </button>
      <NuxtLink to="/" class="btn-cancel">Batal</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Import Data — Zakat Emas & Perak' })

const route   = useRoute()
const router  = useRouter()
const { bulkImport } = useEntries()

// Reconstruct the full encoded string (catch-all captures path segments as array)
const slug = computed(() => {
  const s = route.params.slug
  return Array.isArray(s) ? s.join('/') : (s as string)
})

const decoding    = ref(true)
const decodeError = ref('')
const importEntries = ref<any[]>([])
const importing   = ref(false)
const importDone  = ref(false)
const importedCount = ref(0)

const goldPhysical = computed(() => importEntries.value.filter((e) => e.metal_type === 'gold' && e.metal_state === 'physical').length)
const goldDigital  = computed(() => importEntries.value.filter((e) => e.metal_type === 'gold' && e.metal_state === 'digital').length)
const silverCount  = computed(() => importEntries.value.filter((e) => e.metal_type === 'silver').length)

onMounted(async () => {
  try {
    const encoded = slug.value
    if (!encoded) throw new Error('Tiada data dalam pautan.')

    const lib   = await import('json-url')
    const codec = (lib.default || lib)('lzma')
    const data  = await codec.decompress(encoded)

    if (!Array.isArray(data) || data.length === 0) throw new Error('Format data tidak sah.')
    importEntries.value = data
  } catch (e: any) {
    decodeError.value = e?.message || 'Pautan tidak sah atau rosak.'
  } finally {
    decoding.value = false
  }
})

const doImport = async () => {
  importing.value = true
  try {
    await bulkImport(importEntries.value)
    importedCount.value = importEntries.value.length
    importDone.value = true
  } catch (e) {
    decodeError.value = 'Ralat semasa import. Sila cuba lagi.'
  } finally {
    importing.value = false
  }
}
</script>

<style scoped>
.share-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
}

/* ── Shared state layouts ── */
.share-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  padding: 32px 0;
}

.share-spinner {
  width: 36px;
  height: 36px;
  border: 2.5px solid var(--border-dim);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.share-error-icon,
.share-success-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 700;
}
.share-error-icon {
  background: var(--red-a);
  color: var(--red);
  border: 1px solid rgba(248, 113, 113, 0.2);
}
.share-success-icon {
  background: rgba(104, 211, 145, 0.1);
  color: var(--green);
  border: 1px solid rgba(104, 211, 145, 0.2);
}
.share-error-msg,
.share-success-msg {
  color: var(--t2);
  font-size: 0.9rem;
  margin: 0;
}

/* ── Confirmation card ── */
.share-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--r-xl);
  padding: 32px 24px;
  width: 100%;
  max-width: 360px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  box-shadow: 0 24px 56px rgba(0, 0, 0, 0.5);
}

.share-symbol {
  font-size: 2.2rem;
  color: var(--gold);
  margin-bottom: 10px;
  line-height: 1;
  opacity: 0.85;
}

.share-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--t1);
  margin: 0 0 6px;
}

.share-subtitle {
  font-size: 0.88rem;
  color: var(--t2);
  margin: 0 0 20px;
}
.share-subtitle strong {
  color: var(--t1);
  font-weight: 600;
}

.share-breakdown {
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--border-dim);
  border-radius: var(--r-sm);
  padding: 10px 14px;
  margin-bottom: 16px;
}

.share-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.84rem;
  color: var(--t2);
  padding: 3px 0;
}
.share-row + .share-row {
  border-top: 1px solid var(--border-dim);
  padding-top: 6px;
  margin-top: 2px;
}
.share-row span:last-child {
  font-weight: 600;
  color: var(--t1);
}

.share-warning {
  font-size: 0.8rem;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.18);
  border-radius: var(--r-sm);
  padding: 9px 14px;
  margin-bottom: 18px;
  width: 100%;
  line-height: 1.4;
}
.share-warning strong {
  font-weight: 700;
}

.btn-submit {
  width: 100%;
  margin-bottom: 10px;
}

.btn-cancel {
  display: inline-block;
  font-size: 0.85rem;
  color: var(--t2);
  text-decoration: none;
  padding: 6px 0;
  transition: color 0.15s;
}
.btn-cancel:hover {
  color: var(--t1);
}
</style>
