interface Entry {
  _id: string
  _rev?: string
  metal_type: 'gold' | 'silver'
  metal_state: 'physical' | 'digital'
  name_string: string
  name_type: 'text' | 'image'
  is_worn: boolean
  gold_percent: number | null
  is_collateral: boolean
  loan_amount: number | null
  is_bulk: boolean
  gram: number
  date: string
}

export const useEntries = () => {
  const entries = ref<Entry[]>([])

  const getDb = () => useNuxtApp().$pouch as any

  const fetchEntries = async () => {
    const result = await getDb().allDocs({ include_docs: true, descending: true })
    entries.value = result.rows.map((row: any) => row.doc)
  }

  const addEntry = async (entry: Omit<Entry, '_id'>) => {
    await getDb().put({
      _id: new Date().toISOString(),
      ...entry,
    })
    await fetchEntries()
  }

  const getEntry = async (id: string): Promise<Entry> => {
    return await getDb().get(id)
  }

  const updateEntry = async (entry: Entry) => {
    await getDb().put(entry)
    await fetchEntries()
  }

  const deleteEntry = async (entry: Entry) => {
    await getDb().remove(entry)
    await fetchEntries()
  }

  return { entries, fetchEntries, addEntry, getEntry, updateEntry, deleteEntry }
}
