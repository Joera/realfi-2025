import { Observable, Listener } from './observable.js';
import { Survey } from '@s3ntiment/shared';
import { DraftMeta, DraftsMap } from './types.js';
import {
  loadDraftsFromStorage,
  saveDraftsToStorage,
  loadCurrentDraftId,
  saveCurrentDraftId,
  slugify,
} from './storage.js';

export class DraftsStore {
  private draftObservable: Observable<Survey>;
  private currentIdObservable: Observable<string | null>;

  constructor() {
    const currentDraftId = loadCurrentDraftId();
    const drafts = loadDraftsFromStorage();
    const currentDraft = currentDraftId && drafts[currentDraftId]
      ? drafts[currentDraftId].config
      : {};

    this.draftObservable = new Observable<Survey>(currentDraft);
    this.currentIdObservable = new Observable<string | null>(currentDraftId);

    // Auto-save on changes
    this.draftObservable.subscribe((draft) => {
      this.saveCurrent(draft);
    });
  }

  get draft(): Survey {
    return this.draftObservable.get();
  }

  get currentId(): string | null {
    return this.currentIdObservable.get();
  }

  update(updates: Partial<Survey>): void {
    this.draftObservable.update(current => ({
      ...current,
      ...updates,
    }));
  }

  subscribe(listener: Listener<Survey>): () => void {
    return this.draftObservable.subscribe(listener);
  }

  subscribeToCurrentId(listener: Listener<string | null>): () => void {
    return this.currentIdObservable.subscribe(listener);
  }

  // Get all drafts
  getAll(): DraftsMap {
    return loadDraftsFromStorage();
  }

  // Get drafts sorted by most recently updated
  getList(): Array<{ id: string; meta: DraftMeta }> {
    const drafts = loadDraftsFromStorage();
    return Object.entries(drafts)
      .map(([id, meta]) => ({ id, meta }))
      .sort((a, b) => b.meta.updatedAt - a.meta.updatedAt);
  }

  // Load a specific draft
  load(draftId: string): void {
    const drafts = loadDraftsFromStorage();
    if (drafts[draftId]) {
      this.currentIdObservable.set(draftId);
      saveCurrentDraftId(draftId);
      this.draftObservable.set(drafts[draftId].config);
    }
  }

  // Start a new draft
  new(): void {
    this.currentIdObservable.set(null);
    saveCurrentDraftId(null);
    this.draftObservable.set({});
  }

  // Delete a draft
  delete(draftId: string): void {
    const drafts = loadDraftsFromStorage();
    delete drafts[draftId];
    saveDraftsToStorage(drafts);

    if (this.currentIdObservable.get() === draftId) {
      this.new();
    }
  }

  // Clear current draft
  clear(): void {
    const draftId = this.currentIdObservable.get();
    if (draftId) {
      this.delete(draftId);
    } else {
      this.new();
    }
  }

  private generateId(draft: Survey): string {
    if (draft.title && draft.title.trim()) {
      const slug = slugify(draft.title);
      return `${slug}-${Date.now()}`;
    }
    return `draft-${Date.now()}`;
  }

  private saveCurrent(draft: Survey): void {
    let draftId = this.currentIdObservable.get();
    const now = Date.now();
    const drafts = loadDraftsFromStorage();

    if (!draftId) {
      draftId = this.generateId(draft);
      this.currentIdObservable.set(draftId);
      saveCurrentDraftId(draftId);
    }

    const existingMeta = drafts[draftId];

    drafts[draftId] = {
      config: draft,
      createdAt: existingMeta?.createdAt || now,
      updatedAt: now,
    };

    saveDraftsToStorage(drafts);
  }
}