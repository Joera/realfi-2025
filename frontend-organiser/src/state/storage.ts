import { DraftsMap } from './types.js';

const DRAFTS_STORAGE_KEY = 'surveyDrafts';
const CURRENT_DRAFT_KEY = 'currentDraftId';

export function loadDraftsFromStorage(): DraftsMap {
  try {
    const stored = localStorage.getItem(DRAFTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load survey drafts from localStorage:', e);
  }
  return {};
}

export function saveDraftsToStorage(drafts: DraftsMap): void {
  try {
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
  } catch (e) {
    console.warn('Failed to save survey drafts to localStorage:', e);
  }
}

export function loadCurrentDraftId(): string | null {
  try {
    return localStorage.getItem(CURRENT_DRAFT_KEY);
  } catch (e) {
    return null;
  }
}

export function saveCurrentDraftId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(CURRENT_DRAFT_KEY, id);
    } else {
      localStorage.removeItem(CURRENT_DRAFT_KEY);
    }
  } catch (e) {
    console.warn('Failed to save current draft id:', e);
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}