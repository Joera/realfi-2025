// capability-delegation.store.ts
import { PermissionlessSafeService, PermissionlessSimpleService } from '@s3ntiment/shared';
import { Listener, Observable } from './observable.js';

export async function fetchCapabilityDelegation(
  backendUrl: string,
  userAddr: string,
  signature: string
): Promise<any> {
  const response = await fetch(`${backendUrl}/api/lit-payment-delegation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userAddr, signature })
  });

  if (!response.ok) {
    const { msg } = await response.json();
    throw new Error(msg ?? 'fetchCapabilityDelegation: unauthorized');
  }

  const { payload } = await response.json();
  return payload;
}

export class CapabilityDelegationStore {
  private delegationObservable: Observable<any | null>;

  constructor() {
    this.delegationObservable = new Observable<any | null>(null);
  }

  get delegation(): any | null {
    return this.delegationObservable.get();
  }

  subscribe(listener: Listener<any | null>): () => void {
    return this.delegationObservable.subscribe(listener);
  }

  async ensure(
    backendUrl: string,
    account: PermissionlessSimpleService | PermissionlessSafeService
  ): Promise<any> {
    const cached = this.delegationObservable.get();
    if (cached) return cached;

    const signature = await account.signMessage('Request capability to decrypt');
    const delegation = await fetchCapabilityDelegation(backendUrl, account.getSignerAddress(), signature);
    this.delegationObservable.set(delegation);
    return delegation;
  }

  clear(): void {
    this.delegationObservable.set(null);
  }
}