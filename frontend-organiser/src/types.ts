export interface SurveyQuestion {
  id: string
  question: string
  type: 'radio' | 'checkbox' | 'text' | 'scale'
  options?: string[]
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

export interface Question {
    id: string
    question: string
    type: 'radio' | 'checkbox' | 'scale' | 'text'
    options?: string[]
    scaleRange?: {
        min: number
        max: number
        minLabel: string
        maxLabel: string
    }
    required: boolean
}

export interface QuestionGroup {
    id: string
    title: string
    questions: Question[]
}

export interface Batch {
    id: string
    name: string
    amount: number
    medium: 'zip-file' | 'cdn'
    createdAt: number
}

export interface Config {
    safe?: string
    chainId?: number
    litNetwork?: string
}

export interface Survey {
    id?: string
    title?: string
    introduction?: string
    groups?: QuestionGroup[]
    batches?: Batch[]
    config?: Config
}

// Event detail types
export interface QuestionUpdateDetail {
    groupIndex: number
    questionIndex: number
    field: string
    value: any
}

export interface OptionUpdateDetail {
    groupIndex: number
    questionIndex: number
    optionIndex: number
    value: string
}

export interface AddOptionDetail {
    groupIndex: number
    questionIndex: number
}

export interface RemoveOptionDetail {
    groupIndex: number
    questionIndex: number
    optionIndex: number
}

export interface RemoveQuestionDetail {
    groupIndex: number
    questionIndex: number
}

export interface AddQuestionDetail {
    groupIndex: number
    type: Question['type']
}

export interface GroupUpdateDetail {
    groupIndex: number
    field: string
    value: any
}

export interface ReorderQuestionsDetail {
    groupIndex: number
    fromIndex: number
    toIndex: number
}
