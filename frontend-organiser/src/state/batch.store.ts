import { Observable, Listener } from './observable.js';
import { Batch } from '@s3ntiment/shared';
import { loadBatchesFromStorage, saveBatchesToStorage } from './storage.js';

export class BatchStore {
  private observable: Observable<Batch[]>;

  constructor() {
    const stored = loadBatchesFromStorage();
    const batches = Object.values(stored).filter(Boolean) as Batch[];
    this.observable = new Observable<Batch[]>(batches);

    this.observable.subscribe((batches) => {
      const map = Object.fromEntries(batches.map(b => [b.id, b]));
      saveBatchesToStorage(map);
    });
  }

  get all(): Batch[] {
    return this.observable.get();
  }

  get(id: string): Batch | undefined {
    return this.observable.get().find(b => b.id === id);
  }

  set(batches: Batch[]): void {
    this.observable.set(batches);
  }

  add(batch: Batch): void {
    this.observable.update(current => {
      const index = current.findIndex(b => b.id === batch.id);
      if (index === -1) return [...current, batch];
      const updated = [...current];
      updated[index] = batch;
      return updated;
    });
  }

  remove(id: string): void {
    this.observable.update(current => current.filter(b => b.id !== id));
  }

  removeCard(batchId: string, nullifier: string): void {
    this.observable.update(current =>
        current.map(b =>
            b.id === batchId
                ? { ...b, cards: b.cards!.filter(c => c.nullifier !== nullifier) }
                : b
        )
    );
  }

  clear(): void {
    this.observable.set([]);
  }

  subscribe(listener: Listener<Batch[]>): () => void {
    return this.observable.subscribe(listener);
  }
}