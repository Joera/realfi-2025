import { typograhyStyles } from '../styles/shared-typograhy-styles.js'
import { colourStyles } from '../styles/shared-colour-styles.js'
import { buttonStyles } from '../styles/shared-button-styles.js'
import type { Question, QuestionGroup } from '../types.js'
import { store } from '../state/store.js'
import './question-group.js'

class NewSurveyFormQuestions extends HTMLElement {
    private groups: QuestionGroup[] = []
    private unsubscribe: (() => void) | null = null

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, colourStyles, buttonStyles]
    }

    connectedCallback() {
        this.loadFromStore()
        this.render()
        this.attachEventListeners()

        // Subscribe to store changes to reload when navigating back
        this.unsubscribe = store.subscribe('surveyDraft', (draft) => {
            // Only reload if groups changed externally (e.g., from another step)
            const draftGroups = draft.groups || []
            if (JSON.stringify(draftGroups) !== JSON.stringify(this.groups)) {
                this.groups = this.deepCloneGroups(draftGroups)
                this.renderGroups()
            }
        })
    }

    disconnectedCallback() {
        if (this.unsubscribe) {
            this.unsubscribe()
            this.unsubscribe = null
        }
    }

    private loadFromStore() {
        const draft = store.surveyDraft
        if (draft.groups && draft.groups.length > 0) {
            // Deep clone to avoid mutating store directly
            this.groups = this.deepCloneGroups(draft.groups)
        } else {
            this.groups = []
        }
    }

    private deepCloneGroups(groups: QuestionGroup[]): QuestionGroup[] {
        return groups.map(g => ({
            ...g,
            questions: g.questions.map(q => ({
                ...q,
                options: q.options ? [...q.options] : undefined,
                scaleRange: q.scaleRange ? { ...q.scaleRange } : undefined
            }))
        }))
    }

    private render() {
        if (!this.shadowRoot) return

        this.shadowRoot.innerHTML = `
        <style>
            :host {
                --green: rgb(42.9834254144, 112.6165745856, 98.0022099448);
                display: block;
            }

            .form-container {
                padding: 1.5rem;
                width: 100%;
                max-height: calc(100vh - 9rem);
                overflow-y: auto;
            }

            .form-actions {
                display: flex;
                gap: 1rem;
                margin-top: 2rem;
            }

            .empty-state {
                text-align: center;
                padding: 3rem;
                color: #9ca3af;
                border: 2px dashed #e5e7eb;
                border-radius: 12px;
                margin-bottom: 1.5rem;
            }
        </style>

        <div class="form-container">
            <div id="groups-container"></div>

            <div class="form-actions">
                <button class="btn-secondary" id="back-btn">< Back</button>
                <button class="btn-secondary" id="add-group">+ New Group</button>
                <button class="btn-secondary" id="next-btn">Next ></button>
            </div>
        </div>
        `

        this.renderGroups()
    }

    private renderGroups() {
        const container = this.shadowRoot?.querySelector('#groups-container')
        if (!container) return

        if (this.groups.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No question groups yet. Click "+ New Group" to get started.</p>
                </div>
            `
            return
        }

        container.innerHTML = this.groups.map((_, gIndex) => `
            <question-group group-index="${gIndex}"></question-group>
        `).join('')

        // Set group data via property
        const groupElements = container.querySelectorAll('question-group')
        groupElements.forEach((el, index) => {
            (el as any).group = this.groups[index]
        })
    }

    private attachEventListeners() {
        // Back button
        this.shadowRoot?.querySelector('#back-btn')?.addEventListener('click', () => {
            this.saveDraft()
            store.setUI({ newStep: 'intro' })
        })

        // Add group button
        this.shadowRoot?.querySelector('#add-group')?.addEventListener('click', () => this.addGroup())

        // Next button
        this.shadowRoot?.querySelector('#next-btn')?.addEventListener('click', () => this.handleNext())

        // Listen for events from child components
        this.shadowRoot?.addEventListener('group-update', ((e: CustomEvent) => {
            const { groupIndex, field, value } = e.detail
            if (field === 'title') {
                this.groups[groupIndex].title = value
            }
            this.saveDraft()
        }) as EventListener)

        this.shadowRoot?.addEventListener('group-copy', ((e: CustomEvent) => {
            this.copyGroup(e.detail.groupIndex)
        }) as EventListener)

        this.shadowRoot?.addEventListener('group-remove', ((e: CustomEvent) => {
            this.removeGroup(e.detail.groupIndex)
        }) as EventListener)

        this.shadowRoot?.addEventListener('question-add', ((e: CustomEvent) => {
            const { groupIndex, type } = e.detail
            this.addQuestion(groupIndex, type)
        }) as EventListener)

        this.shadowRoot?.addEventListener('question-update', ((e: CustomEvent) => {
            const { groupIndex, questionIndex, field, value } = e.detail
            this.updateQuestion(groupIndex, questionIndex, field, value)
            this.saveDraft()
        }) as EventListener)

        this.shadowRoot?.addEventListener('question-remove', ((e: CustomEvent) => {
            const { groupIndex, questionIndex } = e.detail
            this.removeQuestion(groupIndex, questionIndex)
        }) as EventListener)

        this.shadowRoot?.addEventListener('question-reorder', ((e: CustomEvent) => {
            const { fromGroupIndex, fromIndex, toGroupIndex, toIndex } = e.detail
            this.reorderQuestion(fromGroupIndex, fromIndex, toGroupIndex, toIndex)
        }) as EventListener)

        this.shadowRoot?.addEventListener('scale-update', ((e: CustomEvent) => {
            const { groupIndex, questionIndex, field, value } = e.detail
            this.updateQuestion(groupIndex, questionIndex, field, value)
            this.saveDraft()
        }) as EventListener)

        this.shadowRoot?.addEventListener('option-update', ((e: CustomEvent) => {
            const { groupIndex, questionIndex, optionIndex, value } = e.detail
            this.updateOption(groupIndex, questionIndex, optionIndex, value)
            this.saveDraft()
        }) as EventListener)

        this.shadowRoot?.addEventListener('option-add', ((e: CustomEvent) => {
            const { groupIndex, questionIndex } = e.detail
            this.addOption(groupIndex, questionIndex)
        }) as EventListener)

        this.shadowRoot?.addEventListener('option-remove', ((e: CustomEvent) => {
            const { groupIndex, questionIndex, optionIndex } = e.detail
            this.removeOption(groupIndex, questionIndex, optionIndex)
        }) as EventListener)
    }

    // Save current state to store
    private saveDraft() {
        store.updateSurveyDraft({ groups: this.groups })
    }

    // Group operations
    private addGroup() {
        const group: QuestionGroup = {
            id: `group_${Date.now()}`,
            title: '',
            questions: []
        }
        this.groups.push(group)
        this.saveDraft()
        this.renderGroups()
    }

    private copyGroup(groupIndex: number) {
        const original = this.groups[groupIndex]
        const copy: QuestionGroup = {
            id: `group_${Date.now()}`,
            title: original.title ? `${original.title} (copy)` : '',
            questions: original.questions.map(q => ({
                ...q,
                id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                options: q.options ? [...q.options] : undefined,
                scaleRange: q.scaleRange ? { ...q.scaleRange } : undefined
            }))
        }
        this.groups.splice(groupIndex + 1, 0, copy)
        this.saveDraft()
        this.renderGroups()
    }

    private removeGroup(groupIndex: number) {
        this.groups.splice(groupIndex, 1)
        this.saveDraft()
        this.renderGroups()
    }

    // Question operations
    private addQuestion(groupIndex: number, type: Question['type']) {
        const question: Question = {
            id: `question_${Date.now()}`,
            question: '',
            type,
            required: true
        }

        if (type === 'radio' || type === 'checkbox') {
            question.options = ['']
        } else if (type === 'scale') {
            question.scaleRange = { min: 1, max: 10, minLabel: '', maxLabel: '' }
        }

        this.groups[groupIndex].questions.push(question)
        this.saveDraft()
        this.renderGroups()
    }

    private updateQuestion(groupIndex: number, questionIndex: number, field: string, value: any) {
        const question = this.groups[groupIndex].questions[questionIndex]
        
        if (field.startsWith('scaleRange.')) {
            const scaleField = field.split('.')[1]
            if (!question.scaleRange) {
                question.scaleRange = { min: 1, max: 10, minLabel: '', maxLabel: '' }
            }
            (question.scaleRange as any)[scaleField] = value
        } else {
            (question as any)[field] = value
        }
    }

    private removeQuestion(groupIndex: number, questionIndex: number) {
        this.groups[groupIndex].questions.splice(questionIndex, 1)
        this.saveDraft()
        this.renderGroups()
    }

    private reorderQuestion(fromGroupIndex: number, fromIndex: number, toGroupIndex: number, toIndex: number) {
        // Remove from original position
        const [question] = this.groups[fromGroupIndex].questions.splice(fromIndex, 1)
        
        // Adjust toIndex if moving within same group and after the original position
        let adjustedToIndex = toIndex
        if (fromGroupIndex === toGroupIndex && fromIndex < toIndex) {
            adjustedToIndex--
        }
        
        // Insert at new position
        this.groups[toGroupIndex].questions.splice(adjustedToIndex, 0, question)
        
        this.saveDraft()
        this.renderGroups()
    }

    // Option operations
    private addOption(groupIndex: number, questionIndex: number) {
        this.groups[groupIndex].questions[questionIndex].options?.push('')
        this.saveDraft()
        this.renderGroups()
    }

    private updateOption(groupIndex: number, questionIndex: number, optionIndex: number, value: string) {
        const options = this.groups[groupIndex].questions[questionIndex].options
        if (options) {
            options[optionIndex] = value
        }
    }

    private removeOption(groupIndex: number, questionIndex: number, optionIndex: number) {
        this.groups[groupIndex].questions[questionIndex].options?.splice(optionIndex, 1)
        this.saveDraft()
        this.renderGroups()
    }

    // Validation and navigation
    private handleNext() {
        const errors = this.validateQuestions()
        if (errors.length > 0) {
            alert(`Please fix:\n${errors.join('\n')}`)
            return
        }

        this.saveDraft()
        
        // Dispatch event for any external listeners
        this.dispatchEvent(new CustomEvent('survey-config-generated', {
            detail: { config: { groups: this.groups } },
            bubbles: true,
            composed: true
        }))

        // Navigate to next step
        store.setUI({ newStep: 'outro' })
    }

    private validateQuestions(): string[] {
        const errors: string[] = []

        if (this.groups.length === 0) {
            errors.push('Please add at least one question group')
            return errors
        }

        this.groups.forEach((group, gIndex) => {
            if (group.questions.length === 0) {
                const groupName = group.title || `Group ${gIndex + 1}`
                errors.push(`${groupName}: Please add at least one question`)
            }

            group.questions.forEach((q, qIndex) => {
                const prefix = group.title 
                    ? `"${group.title}" Q${qIndex + 1}` 
                    : `Group ${gIndex + 1} Q${qIndex + 1}`

                if (!q.question.trim()) {
                    errors.push(`${prefix}: Question text is required`)
                }

                if ((q.type === 'radio' || q.type === 'checkbox') &&
                    (!q.options || q.options.filter(o => o.trim()).length === 0)) {
                    errors.push(`${prefix}: At least one option required`)
                }
            })
        })

        return errors
    }
}

customElements.define('new-survey-form-questions', NewSurveyFormQuestions)

export { NewSurveyFormQuestions }