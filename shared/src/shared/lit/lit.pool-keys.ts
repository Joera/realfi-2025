export class LitPoolKeys {
  private keys = new Map<string, string>();

  set(poolId: string, key: string): void {
    this.keys.set(poolId, key);
  }

  get(poolId: string): string | undefined {
    return this.keys.get(poolId);
  }

  delete(poolId: string): boolean {
    return this.keys.delete(poolId);
  }

  has(poolId: string): boolean {
    return this.keys.has(poolId);
  }
}