import { QuestionGroup } from "../survey/index.js";

export interface TallyResult {
    question: string;
    type: 'radio' | 'checkbox' | 'scale' | 'text' | 'scored-single';
}

export interface TextTally extends TallyResult {
    type: 'text';
    responses: string[];
    count: number;
}

export interface RadioTally extends TallyResult {
    type: 'radio';
    options?: string[];
    counts: Record<number, number>;
    total: number;
}

export interface ScaleTally extends TallyResult {
    type: 'scale';
    range?: { min: number; max: number; minLabel: string; maxLabel: string };
    average: string | number;
    responses: number;
    total: number;
}

export interface CheckboxTally extends TallyResult {
    type: 'checkbox';
        options?: string[];
    counts: Record<number, number>;
    total: number;
}

export interface ScoredSingleTally extends TallyResult {
    type: 'scored-single';
    options?: string[];
    counts: Record<number, number>;
    total: number;
    correctAnswer: number;
}

export interface SurveyDetailResponsesProps {
    results: SurveyResultsTally;
    groups?: QuestionGroup[];
    total: number;
}

export type SurveyResultsTally = Record<string, TextTally | RadioTally | ScaleTally | CheckboxTally | ScoredSingleTally>;