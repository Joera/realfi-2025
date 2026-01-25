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

export interface LitEncrypted {
  ciphertext: string
  dataToEncryptHash: string
  metadata: any
}

export interface SurveyConfigRaw {
  nilDid: any,
  encryptedNilKey : LitEncrypted,
  collectioniD: string
  surveyConfig: LitEncrypted
}

export interface SurveyConfig {
  title: string
  description?: string
  questions: SurveyQuestion[]
}