import { typograhyStyles } from '../../styles/shared-typograhy-styles.js'
import { colourStyles } from '../../styles/shared-colour-styles.js'
import { buttonStyles } from '../../styles/shared-button-styles.js'
import type { Question, QuestionGroup } from '../../types.js'
import './question-group.js'
import { store } from '../../state/store.js'

class SurveyFormQuestions extends HTMLElement {
    private _groups: QuestionGroup[] = []

    static get observedAttributes() { return ['survey-id'] }

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, colourStyles, buttonStyles]
    }

    connectedCallback() {
        this.render()
        this.attachEventListeners()
    }

    attributeChangedCallback(name: string, _: string, newVal: string) {
        if (name === 'survey-id' && newVal) {
            const survey = store.surveys.find( (s: any)  => s.id === newVal);
            if (survey) {
                this.groups = survey.groups || [];
            }
        }
    }

    set groups(value: QuestionGroup[]) {
        // Only update if data actually changed (compare by reference for external updates)
        // Internal updates modify _groups directly, external updates pass new array
        if (value !== this._groups) {
            this._groups = this.deepCloneGroups(value)
            if (this.isConnected) {
                this.renderGroups()
            }
        }
    }

    get groups(): QuestionGroup[] {
        return this._groups
    }

    private deepCloneGroups(groups: QuestionGroup[]): QuestionGroup[] {
        return groups.map(g => ({
            ...g,
            questions: g.questions.map((q: any) => ({
                ...q,
                options: q.options ? [...q.options] : undefined,
                scaleRange: q.scaleRange ? { ...q.scaleRange } : undefined
            }))
        }))
    }

    private emitChange() {
        this.dispatchEvent(new CustomEvent('groups-change', {
            detail: { value: this._groups },
            bubbles: true,
            composed: true
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
                padding: 1.5rem 3rem 1.5rem 1.5rem;
                width: 100%;
                max-height: calc(100vh - 24rem);
                overflow-y: auto;
            }

            .empty-state {
                text-align: center;
                padding: 3rem;
                color: #9ca3af;
                border: 2px dashed #e5e7eb;
                border-radius: 12px;
                margin-bottom: 1.5rem;
            }

            .add-group-btn {
                margin-top: 1rem;
            }
        </style>

        <div class="form-container">
            <div id="groups-container"></div>
            <button class="btn-secondary add-group-btn" id="add-group">+ New Group</button>
        </div>
        `

        this.renderGroups()
    }

    private renderGroups() {
        const container = this.shadowRoot?.querySelector('#groups-container')
        if (!container) return

        if (this._groups.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No question groups yet. Click "+ New Group" to get started.</p>
                </div>
            `
            return
        }

        container.innerHTML = this._groups.map((_, gIndex) => `
            <question-group group-index="${gIndex}"></question-group>
        `).join('')

        // Set group data via property
        const groupElements = container.querySelectorAll('question-group')
        groupElements.forEach((el, index) => {
            (el as any).group = this._groups[index]
        })
    }

    private attachEventListeners() {
        // Add group button
        this.shadowRoot?.querySelector('#add-group')?.addEventListener('click', () => this.addGroup())

        // Listen for events from child components
        this.shadowRoot?.addEventListener('group-update', ((e: CustomEvent) => {
            const { groupIndex, field, value } = e.detail
            if (field === 'title') {
                this._groups[groupIndex].title = value
            }
            this.emitChange()
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
            this.emitChange()
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
            this.emitChange()
        }) as EventListener)

        this.shadowRoot?.addEventListener('option-update', ((e: CustomEvent) => {
            const { groupIndex, questionIndex, optionIndex, value } = e.detail
            this.updateOption(groupIndex, questionIndex, optionIndex, value)
            this.emitChange()
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

    // Group operations
    private addGroup() {
        const group: QuestionGroup = {
            id: `group_${Date.now()}`,
            title: '',
            questions: []
        }
        this._groups.push(group)
        this.emitChange()
        this.renderGroups()
    }

    private copyGroup(groupIndex: number) {
        const original = this._groups[groupIndex]
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
        this._groups.splice(groupIndex + 1, 0, copy)
        this.emitChange()
        this.renderGroups()
    }

    private removeGroup(groupIndex: number) {
        this._groups.splice(groupIndex, 1)
        this.emitChange()
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

        this._groups[groupIndex].questions.push(question)
        this.emitChange()
        this.renderGroups()
    }

    private updateQuestion(groupIndex: number, questionIndex: number, field: string, value: any) {
        const question = this._groups[groupIndex].questions[questionIndex]

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
        this._groups[groupIndex].questions.splice(questionIndex, 1)
        this.emitChange()
        this.renderGroups()
    }

    private reorderQuestion(fromGroupIndex: number, fromIndex: number, toGroupIndex: number, toIndex: number) {
        const [question] = this._groups[fromGroupIndex].questions.splice(fromIndex, 1)

        let adjustedToIndex = toIndex
        if (fromGroupIndex === toGroupIndex && fromIndex < toIndex) {
            adjustedToIndex--
        }

        this._groups[toGroupIndex].questions.splice(adjustedToIndex, 0, question)
        this.emitChange()
        this.renderGroups()
    }

    // Option operations
    private addOption(groupIndex: number, questionIndex: number) {
        this._groups[groupIndex].questions[questionIndex].options?.push('')
        this.emitChange()
        this.renderGroups()
    }

    private updateOption(groupIndex: number, questionIndex: number, optionIndex: number, value: string) {
        const options = this._groups[groupIndex].questions[questionIndex].options
        if (options) {
            options[optionIndex] = value
        }
    }

    private removeOption(groupIndex: number, questionIndex: number, optionIndex: number) {
        this._groups[groupIndex].questions[questionIndex].options?.splice(optionIndex, 1)
        this.emitChange()
        this.renderGroups()
    }

    // Validation
    validate(): string[] {
        const errors: string[] = []

        if (this._groups.length === 0) {
            errors.push('Please add at least one question group')
            return errors
        }

        this._groups.forEach((group, gIndex) => {
            if (group.questions.length === 0) {
                const groupName = group.title || `Group ${gIndex + 1}`
                errors.push(`${groupName}: Please add at least one question`)
            }

            group.questions.forEach((q: any, qIndex: number) => {
                const prefix = group.title
                    ? `"${group.title}" Q${qIndex + 1}`
                    : `Group ${gIndex + 1} Q${qIndex + 1}`

                if (!q.question.trim()) {
                    errors.push(`${prefix}: Question text is required`)
                }

                if ((q.type === 'radio' || q.type === 'checkbox') &&
                    (!q.options || q.options.filter((o: any) => o.trim()).length === 0)) {
                    errors.push(`${prefix}: At least one option required`)
                }
            })
        })

        return errors
    }
}

customElements.define('survey-form-questions', SurveyFormQuestions)

export { SurveyFormQuestions }