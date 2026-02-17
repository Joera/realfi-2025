import { typograhyStyles } from '../../styles/shared-typograhy-styles.js'
import { colourStyles } from '../../styles/shared-colour-styles.js'
import { buttonStyles } from '../../styles/shared-button-styles.js'
import type { QuestionGroup, Question } from '../../types.js'
import './question-card.js'

class QuestionGroupElement extends HTMLElement {
    private _group: QuestionGroup | null = null
    private _groupIndex: number = 0
    private _collapsed: boolean = false

    static get observedAttributes() {
        return ['group-index']
    }

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, colourStyles, buttonStyles]
    }

    connectedCallback() {
        this.render()
        this.attachEventListeners()
    }

    attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
        if (name === 'group-index') {
            this._groupIndex = parseInt(newValue) || 0
        }
    }

    set group(value: QuestionGroup) {
        this._group = value
        if (this.isConnected) {
            this.render()
            this.attachEventListeners()
            this.updateQuestionCards()
        }
    }

    get group(): QuestionGroup | null {
        return this._group
    }

    private toggleCollapse() {
        this._collapsed = !this._collapsed
        const container = this.shadowRoot?.querySelector('#questions-container') as HTMLElement
        const addBtn = this.shadowRoot?.querySelector('#add-question') as HTMLElement
        const collapseBtn = this.shadowRoot?.querySelector('#collapse-btn')
        
        if (container) {
            container.style.display = this._collapsed ? 'none' : 'block'
        }
        if (addBtn) {
            addBtn.style.display = this._collapsed ? 'none' : 'block'
        }
        if (collapseBtn) {
            collapseBtn.textContent = this._collapsed ? '▼' : '▶'
        }
    }

    private render() {
        if (!this.shadowRoot || !this._group) return

        const questionCount = this._group.questions.length

        this.shadowRoot.innerHTML = `
        <style>
            :host {
                --green: rgb(42.9834254144, 112.6165745856, 98.0022099448);
                display: block;
                margin-bottom: 1.5rem;
            }

            .group-card {
                display: flex;
                gap: 0.25rem;
            }

            .collapse-btn {
                background: transparent;
                border: none;
                color: var(--green);
                cursor: pointer;
                font-size: 0.75rem;
                padding: 0.25rem;
                width: 1.5rem;
                height: 1.5rem;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                margin-top: 0.25rem;
            }

            .collapse-btn:hover {
                background: rgba(42, 112, 98, 0.1);
                border-radius: 4px;
            }

            .group-content {
                flex: 1;
            }

            .group-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
                gap: 0.5rem;
                border-left: 3px solid var(--green);
                padding: 0 .75rem;
            }

            .group-title-input {
                flex: 1;
                font-size: 1.1rem;
                font-weight: 600;
                border: 1px solid transparent;
                background: transparent;
                padding: 0.5rem;
                border-radius: 6px;
                margin: 0;
            }

            .group-title-input:hover,
            .group-title-input:focus {
                border-color: #d1d5db;
                background: white;
            }

            .group-title-input::placeholder {
                color: white;
                font-style: italic;
                font-weight: normal;
            }

            .group-actions {
                display: flex;
                gap: 0.5rem;
                flex-shrink: 0;
            }

            .btn-icon {
                color: var(--green);
                cursor: pointer;
                background: transparent;
                border: none;
                width: 2rem;
                height: 2rem;
                font-size: 1.5rem;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .btn-icon:hover {
                background: rgba(42, 112, 98, 0.1);
                border-radius: 4px;
            }

            #copy-group {
                font-size: 2rem;
            }

            .questions-container {
                margin-bottom: 1rem;
                padding: 1rem 0;
                min-height: 2rem;
            }

            .questions-container.drag-over {
                background: rgba(42, 112, 98, 0.05);
                border-radius: 8px;
            }

            .add-question-select {
                width: auto;
                padding: .75rem 1.5rem;
                font-size: 1rem;
                border: none;
            }
        </style>

        <div class="group-card">
            <button class="collapse-btn" id="collapse-btn" title="Collapse/expand group">▶</button>
            <div class="group-content">
                <div class="group-header">
                    <input 
                        type="text" 
                        class="group-title-input" 
                        id="group-title"
                        value="${this._group.title}" 
                        placeholder="Group title (optional)"
                    />
                    <div class="group-actions">
                        <button class="btn-icon" id="copy-group" title="Copy group">⧉</button>
                        <button class="btn-icon" id="remove-group" title="Remove group">✕</button>
                        
                    </div>
                </div>

                <div class="questions-container" id="questions-container">
                    ${this._group.questions.map((_, qIndex) => `
                        <question-card 
                            group-index="${this._groupIndex}" 
                            question-index="${qIndex}"
                        ></question-card>
                    `).join('')}
                </div>

                <select class="add-question-select btn-primary" id="add-question">
                    <option value="">+ Add question...</option>
                    <option value="radio">Radio (Single Choice)</option>
                    <option value="checkbox">Checkbox (Multiple Choice)</option>
                    <option value="scale">Scale</option>
                    <option value="text">Text Input</option>
                </select>
            </div>
        </div>
        `
    }

    private updateQuestionCards() {
        if (!this._group) return

        const cards = this.shadowRoot?.querySelectorAll('question-card')
        cards?.forEach((card, index) => {
            // Update both the attribute and the property
            card.setAttribute('question-index', String(index))
            ;(card as any).question = this._group!.questions[index]
        })
    }

    private attachEventListeners() {
        // Collapse toggle
        this.shadowRoot?.querySelector('#collapse-btn')?.addEventListener('click', () => {
            this.toggleCollapse()
        })

        // Group title
        this.shadowRoot?.querySelector('#group-title')?.addEventListener('input', (e) => {
            this.dispatchEvent(new CustomEvent('group-update', {
                detail: {
                    groupIndex: this._groupIndex,
                    field: 'title',
                    value: (e.target as HTMLInputElement).value
                },
                bubbles: true,
                composed: true
            }))
        })

        // Copy group
        this.shadowRoot?.querySelector('#copy-group')?.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('group-copy', {
                detail: { groupIndex: this._groupIndex },
                bubbles: true,
                composed: true
            }))
        })

        // Remove group
        this.shadowRoot?.querySelector('#remove-group')?.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('group-remove', {
                detail: { groupIndex: this._groupIndex },
                bubbles: true,
                composed: true
            }))
        })

        // Add question
        this.shadowRoot?.querySelector('#add-question')?.addEventListener('change', (e) => {
            const type = (e.target as HTMLSelectElement).value as Question['type']
            if (type) {
                this.dispatchEvent(new CustomEvent('question-add', {
                    detail: {
                        groupIndex: this._groupIndex,
                        type
                    },
                    bubbles: true,
                    composed: true
                }))
                ;(e.target as HTMLSelectElement).value = ''
            }
        })

        // Drag and drop zone - listen on the host element for better shadow DOM compatibility
        const container = this.shadowRoot?.querySelector('#questions-container') as HTMLElement
        
        // We need to listen for dragover on the actual question-card elements
        this.addEventListener('dragover', (e) => {
            e.preventDefault()
            if (e.dataTransfer) {
                e.dataTransfer.dropEffect = 'move'
            }
            container?.classList.add('drag-over')
        })

        this.addEventListener('dragleave', (e) => {
            const relatedTarget = e.relatedTarget as Node
            if (!this.contains(relatedTarget)) {
                container?.classList.remove('drag-over')
            }
        })

        this.addEventListener('drop', (e) => {
            e.preventDefault()
            container?.classList.remove('drag-over')

            const data = e.dataTransfer?.getData('text/plain')
            if (!data) return

            const { groupIndex: fromGroupIndex, questionIndex: fromIndex } = JSON.parse(data)
            
            // Calculate drop position based on mouse position relative to question cards
            const cards = [...(this.shadowRoot?.querySelectorAll('question-card') || [])]
            let toIndex = cards.length // Default to end
            
            for (let i = 0; i < cards.length; i++) {
                const card = cards[i]
                const rect = card.getBoundingClientRect()
                const midY = rect.top + rect.height / 2
                
                if (e.clientY < midY) {
                    toIndex = i
                    break
                }
            }

            // Don't dispatch if nothing changed
            if (fromGroupIndex === this._groupIndex && (fromIndex === toIndex || fromIndex === toIndex - 1)) {
                return
            }

            this.dispatchEvent(new CustomEvent('question-reorder', {
                detail: {
                    fromGroupIndex,
                    fromIndex,
                    toGroupIndex: this._groupIndex,
                    toIndex
                },
                bubbles: true,
                composed: true
            }))
        })
    }

    private getDragAfterElement(container: HTMLElement, y: number): Element | null {
        const draggableElements = [...container.querySelectorAll('question-card')]

        return draggableElements.reduce((closest: { offset: number, element: Element | null }, child) => {
            const box = child.getBoundingClientRect()
            const offset = y - box.top - box.height / 2
            
            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child }
            } else {
                return closest
            }
        }, { offset: Number.NEGATIVE_INFINITY, element: null }).element
    }
}

customElements.define('question-group', QuestionGroupElement)

export { QuestionGroupElement }