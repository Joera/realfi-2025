import { Observable } from './observable.js';
import { CardState } from '../controllers/landing.ctrlr.js';

export interface SurveyEntry {
    surveyId: string;
    questions: number[];
    cardState?: CardState;
}

type SurveyMap = Record<string, SurveyEntry>;

class SurveyStore {

    private observable: Observable<SurveyMap>;
    private _activeSurveyId: string | null = null;

    constructor() {
        this.observable = new Observable<SurveyMap>(
            JSON.parse(localStorage.getItem('surveys') || '{}')
        );
    }

    get all()            { return this.observable.get(); }
    get activeSurveyId() { return this._activeSurveyId; }

    get active(): SurveyEntry | null {
        if (!this._activeSurveyId) return null;
        return this.all[this._activeSurveyId] ?? null;
    }

    setActive(surveyId: string) {
        this._activeSurveyId = surveyId;
        if (!this.all[surveyId]) {
            this.observable.update(current => ({
                ...current,
                [surveyId]: { surveyId, questions: [] },
            }));
        }
    }

    update(surveyId: string, update: Partial<Omit<SurveyEntry, 'surveyId'>>) {
        this.observable.update(current => ({
            ...current,
            [surveyId]: { ...current[surveyId], ...update, surveyId },
        }));
    }

    get(surveyId: string): SurveyEntry | null {
        return this.all[surveyId] ?? null;
    }

    subscribe(listener: (value: SurveyMap) => void): () => void {
        return this.observable.subscribe(listener);
    }

    persist() {
        localStorage.setItem('surveys', JSON.stringify(this.all));
    }

    clear(surveyId?: string) {
        if (surveyId) {
            this.observable.update(current => {
                const next = { ...current };
                delete next[surveyId];
                return next;
            });
        } else {
            this.observable.set({});
            this._activeSurveyId = null;
            localStorage.removeItem('surveys');
        }
        this.persist();
    }
}

export const surveyStore = new SurveyStore();