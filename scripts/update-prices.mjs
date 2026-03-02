import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import https from 'https'

const PAGE_URL = 'https://www.zakatselangor.com.my/info-semasa-nisab-emas-perak/'

const html = await new Promise((resolve, reject) => {
  https.get(PAGE_URL, (res) => {
    let data = ''
    res.on('data', (chunk) => { data += chunk })
    res.on('end', () => resolve(data))
    res.on('error', reject)
  }).on('error', reject)
})

// Gold 999 price: appears in td after the 999 row, inside <span>RM xxx.xx</span>
const goldMatch = html.match(/999[\s\S]*?<span[^>]*>RM\s*([\d,.]+)<\/span>/)
if (!goldMatch) {
  console.error('Could not find gold price on page')
  process.exit(1)
}

// Silver price: appears in td with class="silver_place", inside <span>RM xxx.xx</span>
const silverMatch = html.match(/silver_place[\s\S]*?<span[^>]*>RM\s*([\d,.]+)<\/span>/)
if (!silverMatch) {
  console.error('Could not find silver price on page')
  process.exit(1)
}

const goldPrice = parseFloat(goldMatch[1].replace(',', ''))
const silverPrice = parseFloat(silverMatch[1].replace(',', ''))

if (isNaN(goldPrice) || isNaN(silverPrice)) {
  console.error(`Invalid prices: gold=${goldMatch[1]} silver=${silverMatch[1]}`)
  process.exit(1)
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const filePath = resolve(__dirname, '..', 'data.json')

const output = {
  gold_price: goldPrice,
  silver_price: silverPrice,
  updated_at: new Date().toISOString(),
}

writeFileSync(filePath, JSON.stringify(output, null, 2) + '\n')
console.log(`Updated: gold=${goldPrice} silver=${silverPrice}`)
