import { SurveyConfig } from "../types";

export interface DraftMeta {
  config: SurveyConfig;
  createdAt: number;
  updatedAt: number;
}

export interface DraftsMap {
  [id: string]: DraftMeta;
}

export interface UIState {
  landingStep: 'welcome' | 'register' | 'choice';
  newStep: 'intro' | 'questions' | 'outro';
  resultTab: 'results' | 'config' | 'questions';
}

export interface AppState {
  ui: UIState;
  surveys: any[];
  surveyDraft: SurveyConfig;
  currentDraftId: string | null;
}