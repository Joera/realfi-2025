import { getPoolKey, storePoolKey } from "./lit.key-storage.js";

export class LitPoolKeys {

  private keys = new Map<string, string>();

  async set(poolId: string, key: string): Promise<void> {
    this.keys.set(poolId, key);
    await storePoolKey(poolId, key);
  }

  async get(poolId: string): Promise<string | undefined> {
    let key = this.keys.get(poolId);
    console.log(1,key)
    if (key == undefined) {
      key = await getPoolKey(poolId) || undefined
      console.log(2,key)
    }
    return key
  }

  delete(poolId: string): boolean {
    return this.keys.delete(poolId);
  }

  has(poolId: string): boolean {
    return this.keys.has(poolId);
  }
}