import { Observable, Listener } from './observable.js';
import { Survey } from '@s3ntiment/shared';

export class SurveysStore {
  private observable: Observable<Survey[]>;

  constructor() {
    this.observable = new Observable<Survey[]>([]);
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
      if (index === -1) {
        return [...current, survey];
      }
      const updated = [...current];
      updated[index] = survey;
      return updated;
    });
  }

  remove(index: number): void {
    this.observable.update(current => current.filter((_, i) => i !== index));
  }

  clear(): void {
    this.observable.set([]);
  }

  subscribe(listener: Listener<Survey[]>): () => void {
    return this.observable.subscribe(listener);
  }
}