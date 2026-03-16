import { Survey } from "@s3ntiment/shared";

export interface DraftMeta {
  config: Survey;
  createdAt: number;
  updatedAt: number;
}

export interface DraftsMap {
  [id: string]: DraftMeta;
}

export interface SurveysMap {
  [id: string]: Survey;
}

export interface UIState {
  landingStep: 'welcome' | 'register' | 'choice';
  newStep: 'intro' | 'questions' | 'batches';
  resultTab: 'spinner' | 'results' | 'access' | 'questions' | 'batches';
}

export interface AppState {
  ui: UIState;
  surveys: Survey[];
  surveyDraft: Survey;
  currentDraftId: string | null;
}