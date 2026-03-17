import { UIStore } from './ui.store.js';
import { DraftsStore } from './drafts.store.js';
import { SurveysStore } from './surveys.store.js';
import { PoolStore } from './pool.store.js';
import { Listener } from './observable.js';
import { UIState, DraftMeta, DraftsMap } from './types.js';
import { Pool, Survey } from '@s3ntiment/shared';
import { CapabilityDelegationStore } from './capabilities.store.js';

class Store {
  private uiStore: UIStore;
  private draftsStore: DraftsStore;
  private surveysStore: SurveysStore;
  private poolStore: PoolStore;
  private capabilityDelegationStore: CapabilityDelegationStore;

  constructor() {
    this.uiStore = new UIStore();
    this.draftsStore = new DraftsStore();
    this.surveysStore = new SurveysStore();
    this.poolStore = new PoolStore();
    this.capabilityDelegationStore = new CapabilityDelegationStore();
  }

  get observables() {
    return {
        ui: this.uiStore,
        surveys: this.surveysStore,
        surveyDraft: this.draftsStore,
        pools: this.poolStore,
    } as const;
  }

  // ============ UI ============
  get ui(): UIState {
    return this.uiStore.state;
  }

  setUI(update: Partial<UIState>): void {
    this.uiStore.set(update);
  }

  subscribeUI(listener: Listener<UIState>): () => void {
    return this.uiStore.subscribe(listener);
  }

  // ============ Survey Draft ============
  get surveyDraft(): Survey {
    return this.draftsStore.draft;
  }

  get currentDraftId(): string | null {
    return this.draftsStore.currentId;
  }

  updateSurveyDraft(updates: Partial<Survey>): void {
    this.draftsStore.update(updates);
  }

  subscribeSurveyDraft(listener: Listener<Survey>): () => void {
    return this.draftsStore.subscribe(listener);
  }

  getAllDrafts(): DraftsMap {
    return this.draftsStore.getAll();
  }

  getDraftsList(): Array<{ id: string; meta: DraftMeta }> {
    return this.draftsStore.getList();
  }

  loadDraft(draftId: string): void {
    this.draftsStore.load(draftId);
  }

  newDraft(): void {
    this.draftsStore.new();
  }

  deleteDraft(draftId: string): void {
    this.draftsStore.delete(draftId);
  }

  clearSurveyDraft(): void {
    this.draftsStore.clear();
  }

  // ============ Surveys ============
  get surveys(): Survey[] {
    return this.surveysStore.all;
  }

  setSurveys(surveys: Survey[]): void {
    this.surveysStore.set(surveys);
  }

  addSurvey(survey: Survey): void {
    this.surveysStore.add(survey);
  }

  // ============= Pools ============

   get pools(): Pool[] {
    return this.poolStore.all;
  }

  subscribePools(listener: Listener<Pool[]>): () => void {
    return this.poolStore.subscribe(listener);
  }

  setPools(pools: Pool[]): void {
    this.poolStore.set(pools);
  }

  addPool(pool: Pool): void {
    this.poolStore.add(pool);
  }

  getPool(id: string): Pool | undefined {
    return this.poolStore.get(id);
  }

  subscribeSurveys(listener: Listener<Survey[]>): () => void {
    return this.surveysStore.subscribe(listener);
  }


  get capabilityDelegation(): any | null {
    return this.capabilityDelegationStore.delegation;
  }

  async ensureCapabilityDelegation(backendUrl: string, account: any): Promise<any> {
    return this.capabilityDelegationStore.ensure(backendUrl, account);
  }

  subscribeCapabilityDelegation(listener: Listener<any | null>): () => void {
    return this.capabilityDelegationStore.subscribe(listener);
  }

  clearCapabilityDelegation(): void {
    this.capabilityDelegationStore.clear();
  }

  // ============ Global ============
  clear(): void {
    this.uiStore.reset();
    this.surveysStore.clear();
  }

  // Legacy subscribe method for backwards compatibility
  subscribe<K extends 'ui' | 'surveys' | 'surveyDraft' | 'pools'>(
    key: K,
    listener: Listener<K extends 'ui' ? UIState : K extends 'surveys' ? Survey[] : K extends 'pools' ? Pool[] : Survey>
  ): () => void {
    switch (key) {
      case 'ui':
        return this.uiStore.subscribe(listener as Listener<UIState>);
      case 'surveys':
        return this.surveysStore.subscribe(listener as Listener<Survey[]>);
      case 'surveyDraft':
        return this.draftsStore.subscribe(listener as Listener<Survey>);
      case 'pools':
            return this.poolStore.subscribe(listener as Listener<Pool[]>);
      default:
        throw new Error(`Unknown store key: ${key}`);
    }
  }
}

export const store = new Store();