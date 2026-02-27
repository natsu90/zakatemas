<template>
  <div class="container">
    <header class="header">
      <h1>Zakat Emas & Perak</h1>
      <NuxtLink to="/create" class="btn-add">+ Tambah</NuxtLink>
    </header>

    <div v-if="displayItems.length === 0" class="empty">
      <p>Tiada rekod lagi.</p>
      <NuxtLink to="/create" class="btn-primary">Tambah Rekod Pertama</NuxtLink>
    </div>

    <ul v-else class="list">
      <li v-for="item in displayItems" :key="item.key" class="card">
        <!-- Grouped digital gold card -->
        <template v-if="item.type === 'digital-group'">
          <div class="card-header">
            <span class="badge gold">Emas</span>
            <span class="badge digital">Digital</span>
            <span class="badge gram">{{ item.totalGram }}g</span>
            <NuxtLink :to="`/edit-digital/${item.platform}`" class="btn-edit">✎</NuxtLink>
          </div>
          <div class="card-body">
            <div class="card-name">{{ platformNames[item.platform] || item.platform }}</div>
            <div class="records-summary">
              <div v-for="e in item.entries" :key="e._id" class="record-row">
                <span class="record-date">{{ formatDate(e.date) }}</span>
                <span class="record-gram">{{ e.gram }}g</span>
              </div>
            </div>
          </div>
        </template>
        <!-- Individual entry card -->
        <template v-else>
          <div class="card-header">
            <span class="badge" :class="item.entry.metal_type">
              {{ item.entry.metal_type === 'gold' ? 'Emas' : 'Perak' }}
            </span>
            <span class="badge physical">Fizikal</span>
            <span class="badge gram">{{ item.entry.gram }}g</span>
            <NuxtLink :to="`/edit/${item.entry._id}`" class="btn-edit">✎</NuxtLink>
            <button class="btn-delete" @click="handleDelete(item.entry)">✕</button>
          </div>
          <div class="card-body">
            <img v-if="item.entry.name_type === 'image'" :src="item.entry.name_string" class="card-image" />
            <div v-else class="card-name">{{ item.entry.name_string }}</div>
            <div v-if="item.entry.metal_type === 'gold'" class="card-details">
              <span v-if="item.entry.gold_percent">{{ item.entry.gold_percent }}</span>
              <span v-if="item.entry.gold_percent">·</span>
              <span>{{ item.entry.is_worn ? 'Barang Kemas' : 'Pelaburan' }}</span>
            </div>
            <div class="card-date">{{ formatDate(item.entry.date) }}</div>
          </div>
        </template>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const { entries, fetchEntries, deleteEntry } = useEntries()

onMounted(() => {
  fetchEntries()
})

type DisplayItem =
  | { type: 'entry'; key: string; entry: any }
  | { type: 'digital-group'; key: string; platform: string; totalGram: number; count: number; entries: any[] }

const displayItems = computed<DisplayItem[]>(() => {
  const items: DisplayItem[] = []
  const digitalGroups = new Map<string, any[]>()

  for (const e of entries.value) {
    if (e.metal_state === 'digital') {
      const group = digitalGroups.get(e.name_string) || []
      group.push(e)
      digitalGroups.set(e.name_string, group)
    } else {
      items.push({ type: 'entry', key: e._id, entry: e })
    }
  }

  for (const [platform, group] of digitalGroups) {
    items.push({
      type: 'digital-group',
      key: `digital-${platform}`,
      platform,
      totalGram: parseFloat(group.reduce((sum: number, e: any) => sum + e.gram, 0).toFixed(2)),
      count: group.length,
      entries: group,
    })
  }

  return items
})

const handleDelete = async (entry: any) => {
  if (confirm('Padam rekod ini?')) {
    await deleteEntry(entry)
  }
}

const platformNames: Record<string, string> = {
  AGROBANK: 'Agrobank AGROGold Account-i',
  BANKRAKYAT: 'Bank Rakyat eGold-i',
  BSN: 'BSN MyGold Account-i',
  BURSA: 'Bursa Gold Dinar',
  MAYBANK: 'Maybank Islamic Gold Account-i',
  MBSB: 'MBSB Bank PrimeGold-i',
  PUBLICGOLD: 'Public Gold GAP',
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

.badge.gram {
  background: #f3f4f6;
  color: #374151;
  text-transform: none;
  letter-spacing: 0;
}

.btn-edit {
  margin-left: auto;
  color: #aaa;
  font-size: 1rem;
  text-decoration: none;
  padding: 2px 6px;
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

.btn-edit + .btn-delete {
  margin-left: 0;
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

.records-summary {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.record-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.record-date {
  color: #999;
}

.record-gram {
  font-weight: 600;
  color: #444;
}
</style>
