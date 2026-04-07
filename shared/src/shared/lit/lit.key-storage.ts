import fs from 'fs/promises'
import path from 'path'

const STORAGE_DIR = path.join(process.cwd(), '.data', 'pool-keys')

// Initialize storage directory
async function initStorage() {
  await fs.mkdir(STORAGE_DIR, { recursive: true })
}

// Store pool key
async function storePoolKey(poolId: string, pkpPublicKey: string) {
  const filePath = path.join(STORAGE_DIR, `${poolId}.json`)
  const data = {
    poolId,
    pkpPublicKey,
    createdAt: Date.now()
  }
  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

// Retrieve pool key
async function getPoolKey(poolId: string): Promise<string | null> {
  try {
    const filePath = path.join(STORAGE_DIR, `${poolId}.json`)
    const content = await fs.readFile(filePath, 'utf-8')
    const data = JSON.parse(content)
    return data.pkpPublicKey
  } catch (error) {
    return null // File doesn't exist
  }
}

// List all pools
async function listPools(): Promise<string[]> {
  const files = await fs.readdir(STORAGE_DIR)
  return files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''))
}

// Delete pool key
async function deletePoolKey(poolId: string) {
  const filePath = path.join(STORAGE_DIR, `${poolId}.json`)
  await fs.unlink(filePath)
}