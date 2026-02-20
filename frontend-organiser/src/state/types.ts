import { Survey } from "../types";

export interface DraftMeta {
  config: Survey;
  createdAt: number;
  updatedAt: number;
}

export interface DraftsMap {
  [id: string]: DraftMeta;
}

export interface UIState {
  landingStep: 'welcome' | 'register' | 'choice';
  newStep: 'intro' | 'questions' | 'batches';
  resultTab: 'results' | 'config' | 'questions' | 'batches';
}

export interface AppState {
  ui: UIState;
  surveys: Survey[];
  surveyDraft: Survey;
  currentDraftId: string | null;
}