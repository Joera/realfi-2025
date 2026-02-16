export interface Question {
  id: string
  question: string
  type: 'radio' | 'checkbox' | 'text' | 'scale'
  options: string[]
  scaleRange?: { min: number; max: number; minLabel: string; maxLabel: string }
  required?: boolean
}

export interface SurveyAnswer {
  questionId: string
  questionText: string
  questionType: 'radio' | 'checkbox' | 'text' | 'scale'
  answer: string | string[] | number
  scaleRange?: { min: number; max: number; minLabel: string; maxLabel: string }
}

export interface QuestionGroup {
    id: string
    title: string
    questions: Question[]
}

export interface SurveyConfig {
  id: string,
  title: string
  introduction?: string
  groups: QuestionGroup[]
}