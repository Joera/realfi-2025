import { CardState } from '../controllers/landing.ctrlr.js';

export interface UserState {
    nullifier: string | null;
    batchId: string | null;
    address: string | null;
}

export interface SurveyState {
    surveyId: string | null;
    questions: number[];
    cardState?: CardState;
}

export type CardView = 'nocard' | 'blocked' | 'survey' | 'welcomeback' | 'login';

export interface UIState {
    cardView: CardView;
}
