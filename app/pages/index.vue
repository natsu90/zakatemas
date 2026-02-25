<template>
  <div class="container">
    <header class="header">
      <h1>Zakat Emas</h1>
      <NuxtLink to="/create" class="btn-add">+ Tambah</NuxtLink>
    </header>

    <div v-if="entries.length === 0" class="empty">
      <p>Tiada rekod lagi.</p>
      <NuxtLink to="/create" class="btn-primary">Tambah Rekod Pertama</NuxtLink>
    </div>

    <ul v-else class="list">
      <li v-for="entry in entries" :key="entry._id" class="card">
        <div class="card-header">
          <span class="badge" :class="entry.metal_type">
            {{ entry.metal_type === 'gold' ? 'Emas' : 'Perak' }}
          </span>
          <span class="badge" :class="entry.metal_state">
            {{ entry.metal_state === 'physical' ? 'Fizikal' : 'Digital' }}
          </span>
          <button class="btn-delete" @click="handleDelete(entry)">✕</button>
        </div>
        <div class="card-body">
          <img v-if="entry.name_type === 'image'" :src="entry.name_string" class="card-image" />
          <div v-else class="card-name">{{ entry.metal_state === 'digital' ? platformNames[entry.name_string] || entry.name_string : entry.name_string }}</div>
          <div class="card-details">
            <span>{{ entry.gram }}g</span>
            <span v-if="entry.metal_type === 'gold' && entry.metal_state === 'physical' && entry.gold_percent">
              · {{ entry.gold_percent }}%
            </span>
            <span v-if="entry.metal_type === 'gold' && entry.metal_state === 'physical'">
              · {{ entry.is_worn ? 'Dipakai' : 'Disimpan' }}
            </span>
          </div>
          <div class="card-date">{{ formatDate(entry.date) }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const { entries, fetchEntries, deleteEntry } = useEntries()

onMounted(() => {
  fetchEntries()
})

const handleDelete = async (entry: any) => {
  if (confirm('Padam rekod ini?')) {
    await deleteEntry(entry)
  }
}

const platformNames: Record<string, string> = {
  BURSA: 'Bursa Gold Dinar (BGD)',
  MAYBANK: 'Maybank Islamic Gold Account-i (MIGA-i)',
  TNG: 'e-Mas (TNG eWallet)',
  PUBLIC_GOLD: 'Public Gold GAP',
  CIMB: 'CIMB e-Gold Investment Account (eGIA)',
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<style scoped>
.container {
  max-width: 480px;
  margin: 0 auto;
  padding: 16px;
  padding-top: 68px;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 480px;
  margin: 0 auto;
  padding: 12px 16px;
  background: #fafafa;
}

.header h1 {
  font-size: 1.4rem;
  margin: 0;
}

.btn-add {
  background: #d4a017;
  color: #fff;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
}

.empty {
  text-align: center;
  padding: 48px 16px;
  color: #888;
}

.btn-primary {
  display: inline-block;
  margin-top: 12px;
  background: #d4a017;
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 14px;
}

.card-header {
  display: flex;
  align-items: center;
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

.badge.digital {
  background: #eff6ff;
  color: #1e40af;
}

.btn-delete {
  margin-left: auto;
  background: none;
  border: none;
  color: #aaa;
  font-size: 1rem;
  cursor: pointer;
  padding: 2px 6px;
}

.card-image {
  max-width: 100%;
  max-height: 120px;
  border-radius: 6px;
  object-fit: contain;
  margin-bottom: 4px;
}

.card-name {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 4px;
}

.card-details {
  font-size: 0.85rem;
  color: #666;
}

.card-date {
  font-size: 0.75rem;
  color: #999;
  margin-top: 6px;
}
</style>
