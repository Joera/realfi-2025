import { Observable } from './observable.js';
import { CardState } from '../controllers/landing.ctrlr.js';
import { Survey } from '@s3ntiment/shared';

export interface SurveyEntry extends Survey {
    answeredQuestions: number[];
    cardState?: CardState;
}

type SurveyMap = Record<string, SurveyEntry>;

class SurveysStore {

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
                [surveyId]: { id: surveyId, answeredQuestions: [] },
            }));
        }
    }

    setData(surveyId: string, data: Survey) {
        this.observable.update(current => ({
            ...current,
            [surveyId]: { ...current[surveyId], ...data, id: surveyId },
        }));
    }

    getData(surveyId: string): Survey | null {
        return this.all[surveyId] ?? null;
    }

    update(surveyId: string, update: Partial<Omit<SurveyEntry, 'id'>>) {
        this.observable.update(current => ({
            ...current,
            [surveyId]: { ...current[surveyId], ...update, id: surveyId },
        }));
    }

    get(surveyId: string): SurveyEntry | null {
        return this.all[surveyId] ?? null;
    }

    subscribe(listener: (value: SurveyMap) => void): () => void {
        return this.observable.subscribe(listener);
    }

    persist() {
        const stripped = Object.fromEntries(
            Object.entries(this.all).map(([k, v]) => {
                const { groups, batches, config, title, introduction, ...rest } = v;
                return [k, rest];
            })
        );
        localStorage.setItem('surveys', JSON.stringify(stripped));
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

export const surveysStore = new SurveysStore();