import { UIStore } from './ui.store.js';
import { DraftsStore } from './drafts.store.js';
import { SurveysStore } from './surveys.store.js';
import { Listener } from './observable.js';
import { UIState, DraftMeta, DraftsMap } from './types.js';
import { SurveyConfig } from '../types.js';

class Store {
  private uiStore: UIStore;
  private draftsStore: DraftsStore;
  private surveysStore: SurveysStore;

  constructor() {
    this.uiStore = new UIStore();
    this.draftsStore = new DraftsStore();
    this.surveysStore = new SurveysStore();
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
  get surveyDraft(): SurveyConfig {
    return this.draftsStore.draft;
  }

  get currentDraftId(): string | null {
    return this.draftsStore.currentId;
  }

  updateSurveyDraft(updates: Partial<SurveyConfig>): void {
    this.draftsStore.update(updates);
  }

  subscribeSurveyDraft(listener: Listener<SurveyConfig>): () => void {
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
  get surveys(): SurveyConfig[] {
    return this.surveysStore.all;
  }

  setSurveys(surveys: SurveyConfig[]): void {
    this.surveysStore.set(surveys);
  }

  addSurvey(survey: SurveyConfig): void {
    this.surveysStore.add(survey);
  }

  subscribeSurveys(listener: Listener<SurveyConfig[]>): () => void {
    return this.surveysStore.subscribe(listener);
  }

  // ============ Global ============
  clear(): void {
    this.uiStore.reset();
    this.surveysStore.clear();
  }

  // Legacy subscribe method for backwards compatibility
  subscribe<K extends 'ui' | 'surveys' | 'surveyDraft'>(
    key: K,
    listener: Listener<K extends 'ui' ? UIState : K extends 'surveys' ? SurveyConfig[] : SurveyConfig>
  ): () => void {
    switch (key) {
      case 'ui':
        return this.uiStore.subscribe(listener as Listener<UIState>);
      case 'surveys':
        return this.surveysStore.subscribe(listener as Listener<SurveyConfig[]>);
      case 'surveyDraft':
        return this.draftsStore.subscribe(listener as Listener<SurveyConfig>);
      default:
        throw new Error(`Unknown store key: ${key}`);
    }
  }
}

export const store = new Store();123