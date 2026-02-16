import { Observable, Listener } from './observable.js';
import { SurveyConfig } from '../types.js';

export class SurveysStore {
  private observable: Observable<SurveyConfig[]>;

  constructor() {
    this.observable = new Observable<SurveyConfig[]>([]);
  }

  get all(): SurveyConfig[] {
    return this.observable.get();
  }

  set(surveys: SurveyConfig[]): void {
    this.observable.set(surveys);
  }

  add(survey: SurveyConfig): void {
    this.observable.update(current => [...current, survey]);
  }

  remove(index: number): void {
    this.observable.update(current => current.filter((_, i) => i !== index));
  }

  clear(): void {
    this.observable.set([]);
  }

  subscribe(listener: Listener<SurveyConfig[]>): () => void {
    return this.observable.subscribe(listener);
  }
}