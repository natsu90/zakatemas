import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const API_KEY = process.env.METAL_PRICE_API_KEY
if (!API_KEY) {
  console.error('METAL_PRICE_API_KEY env variable is required')
  process.exit(1)
}

const TROY_OZ_TO_GRAM = 31.1035

const url = `https://api.metalpriceapi.com/v1/latest?api_key=${API_KEY}&base=MYR&currencies=XAU,XAG`

const res = await fetch(url)
const data = await res.json()

if (!data.success) {
  console.error('API error:', data)
  process.exit(1)
}

const goldPrice = Math.round((data.rates.MYRXAU / TROY_OZ_TO_GRAM) * 100) / 100
const silverPrice = Math.round((data.rates.MYRXAG / TROY_OZ_TO_GRAM) * 100) / 100

const __dirname = dirname(fileURLToPath(import.meta.url))
const filePath = resolve(__dirname, '..', 'data.json')

const output = {
  gold_price: goldPrice,
  silver_price: silverPrice,
  updated_at: new Date().toISOString(),
}

writeFileSync(filePath, JSON.stringify(output, null, 2) + '\n')
console.log(`Updated: gold=${goldPrice} silver=${silverPrice}`)
