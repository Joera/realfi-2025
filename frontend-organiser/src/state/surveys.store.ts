import { Observable, Listener } from './observable.js';
import { Survey } from '@s3ntiment/shared';
import { loadSurveysFromStorage, saveSurveysToStorage } from './storage.js';

export class SurveysStore {
  private observable: Observable<Survey[]>;

  constructor() {
    const stored = loadSurveysFromStorage();
    const surveys = Object.values(stored).filter(Boolean) as Survey[];
    this.observable = new Observable<Survey[]>(surveys);

    // Auto-save on changes
    this.observable.subscribe((surveys) => {
      const map = Object.fromEntries(surveys.map(s => [s.id, s]));
      saveSurveysToStorage(map);
    });
  }

  get all(): Survey[] {
    return this.observable.get();
  }

  set(surveys: Survey[]): void {
    this.observable.set(surveys);
  }

  add(survey: Survey): void {
    this.observable.update(current => {
      const index = current.findIndex(s => s.id === survey.id);
      if (index === -1) return [...current, survey];
      const updated = [...current];
      updated[index] = survey;
      return updated;
    });
  }

  remove(id: string): void {
    this.observable.update(current => current.filter(s => s.id !== id));
  }

  clear(): void {
    this.observable.set([]);
  }

  subscribe(listener: Listener<Survey[]>): () => void {
    return this.observable.subscribe(listener);
  }
}