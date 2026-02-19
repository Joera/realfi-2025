import { typograhyStyles } from '../../styles/shared-typograhy-styles.js'
import { colourStyles } from '../../styles/shared-colour-styles.js'
import { buttonStyles } from '../../styles/shared-button-styles.js'
import { store } from '../../state/store.js'
import type { Batch } from '../../types.js'

class SurveyFormBatches extends HTMLElement {
    private _existingBatches: Batch[] = []  // from contract, read-only
    private _newBatches: Batch[] = []  // editable drafts
    private _mode: 'draft' | 'existing' = 'draft'
    private _surveyId: string = ''

    static get observedAttributes() {
        return ['survey-id', 'mode']
    }

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, colourStyles, buttonStyles]
    }

    connectedCallback() {
        // In draft mode, ensure there's always one batch to fill in
        if (this._mode === 'draft' && this._newBatches.length === 0) {
            this._newBatches.push({
                id: crypto.randomUUID(),
                name: '',
                amount: 50,
                medium: 'zip-file',
                createdAt: Date.now()
            })
        }
        this.render()
        this.attachEventListeners()
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === 'mode' && oldValue !== newValue) {
            this._mode = newValue as 'draft' | 'existing'
            this.render()
            this.attachEventListeners()
        }
        
        if (name === 'survey-id' && oldValue !== newValue) {
            this._surveyId = newValue
            this._mode = 'existing'  // survey-id implies existing survey
            const survey = store.surveys.find((s: any) => s.id === newValue)
            if (survey) {
                this._existingBatches = survey.batches || []
                this._newBatches = []
                this.render()
                this.attachEventListeners()
            }
        }
    }

    // For draft editor - sets new batches being created
    set batches(value: Batch[]) {
        this._newBatches = value
        
        // In draft mode, ensure there's always one batch
        if (this._mode === 'draft' && this._newBatches.length === 0) {
            this._newBatches.push({
                id: crypto.randomUUID(),
                name: '',
                amount: 50,
                medium: 'zip-file',
                createdAt: Date.now()
            })
        }
        
        this.render()
        this.attachEventListeners()
    }

    get batches(): Batch[] {
        return this._newBatches
    }

    // For loading existing batches from contract
    set existingBatches(value: Batch[]) {
        this._existingBatches = value
        this.render()
        this.attachEventListeners()
    }

    get existingBatches(): Batch[] {
        return this._existingBatches
    }

    private emitChange() {
        this.dispatchEvent(new CustomEvent('batches-change', {
            detail: { value: this._newBatches },
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
                padding: 1.5rem;
                width: 100%;
            }

            .section-title {
                font-size: 0.875rem;
                font-weight: 600;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: 1rem;
            }

            .batch-card {
                border: 1px solid var(--green);
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 1rem;
                position: relative;
            }

            .batch-card.existing {
                background: #f9fafb;
                border-style: solid;
            }

            .batch-card.new {
                border-style: dashed;
            }

            .remove-btn {
                background: none;
                border: none;
                color: #dc2626;
                cursor: pointer;
                font-size: 1.25rem;
                padding: 0.25rem;
            }

            .remove-btn:hover {
                color: #b91c1c;
            }

            .form-row {
                display: flex;
                gap: 1rem;
                margin-bottom: 0.5rem;
            }

            .form-group {
                flex: 1;
            }

            .form-group.small {
                flex: 0 0 120px;
            }

            label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 500;
                font-size: 1rem;
                color: var(--green);
            }

            input[type="text"],
            input[type="number"],
            select {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                font-size: 1rem;
                font-family: inherit;
                box-sizing: border-box;
            }

            input:focus,
            select:focus {
                outline: none;
                border-color: var(--green);
            }

            input:disabled,
            select:disabled {
                background: #f3f4f6;
                color: #6b7280;
                cursor: not-allowed;
            }

            .readonly-value {
                padding: 0.75rem;
                background: #f3f4f6;
                border-radius: 8px;
                font-size: 1rem;
                color: #374151;
            }

            .empty-state {
                text-align: center;
                padding: 2rem;
                color: #9ca3af;
                border: 2px dashed #e5e7eb;
                border-radius: 12px;
                margin-bottom: 1rem;
            }

            .add-batch-btn {
                margin-top: 0.5rem;
            }

            .batch-actions {
                display: flex;
                justify-content: flex-start;
                gap: 0.5rem;
                margin-top: 1.5rem;
            }

            .create-btn {
                background: var(--green);
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
            }

            .create-btn:hover {
                opacity: 0.9;
            }

            .create-btn:disabled {
                background: #9ca3af;
                cursor: not-allowed;
            }
        </style>

        <div class="form-container">
            ${this._existingBatches.length > 0 ? `
                <div class="section-title">Existing Batches</div>
                ${this._existingBatches.map((batch) => `
                    <div class="batch-card existing">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Name</label>
                                <div class="readonly-value">${batch.name}</div>
                            </div>
                            <div class="form-group small">
                                <label>Amount</label>
                                <div class="readonly-value">${batch.amount}</div>
                            </div>
                            <div class="form-group small">
                                <label>Medium</label>
                                <div class="readonly-value">${batch.medium === 'zip-file' ? 'QR Code' : 'CDN Link'}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            ` : ''}

            ${this._mode === 'existing' && this._newBatches.length === 0 && this._existingBatches.length === 0 ? `
                <div class="empty-state">
                    <p>No batches yet. Add a batch to create invitations.</p>
                </div>
            ` : ''}

            ${this._newBatches.map((batch, index) => `
                <div class="batch-card new" data-index="${index}">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Name</label>
                            <input type="text" data-field="name" data-index="${index}" 
                                   value="${batch.name}" placeholder="e.g., ETH Denver 2025" />
                        </div>
                        <div class="form-group small">
                            <label>Amount</label>
                            <input type="number" data-field="amount" data-index="${index}" 
                                   value="${batch.amount}" min="1" placeholder="50" />
                        </div>
                        <div class="form-group small">
                            <label>Medium</label>
                            <select data-field="medium" data-index="${index}">
                                <option value="qr-code" ${batch.medium === 'zip-file' ? 'selected' : ''}>ZIP File</option>
                                <option value="cdn" ${batch.medium === 'cdn' ? 'selected' : ''}>CDN Link</option>
                            </select>
                        </div>
                    </div>
                    ${this._mode === 'existing' ? `
                        <div class="batch-actions">
                            <button class="create-btn" data-action="create" data-index="${index}">
                                Create Batch
                            </button>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
            
            ${this._mode === 'existing' ? `
                <button class="btn-secondary add-batch-btn" id="add-batch">+ Add Batch</button>
            ` : ''}
        </div>
        `
    }

    private attachEventListeners() {
        // Add batch
        this.shadowRoot?.querySelector('#add-batch')?.addEventListener('click', () => {
            this._newBatches.push({ 
                id: crypto.randomUUID(),
                name: '', 
                amount: 50, 
                medium: 'zip-file',
                createdAt: Date.now()
            })
            this.emitChange()
            this.render()
            this.attachEventListeners()
        })

        // Remove batch
        this.shadowRoot?.querySelectorAll('[data-action="remove"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt((e.target as HTMLElement).dataset.index!)
                this._newBatches.splice(index, 1)
                this.emitChange()
                this.render()
                this.attachEventListeners()
            })
        })

        // Create batch - only in existing mode
        this.shadowRoot?.querySelectorAll('[data-action="create"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt((e.target as HTMLElement).dataset.index!)
                const batch = this._newBatches[index]
                
                // Validate before dispatching
                if (!batch.name.trim()) {
                    alert('Please enter a batch name')
                    return
                }
                if (!batch.amount || batch.amount <= 0) {
                    alert('Please enter a valid amount')
                    return
                }

                this.dispatchEvent(new CustomEvent('batch-create', {
                    detail: { batch, index, surveyId: this._surveyId },
                    bubbles: true,
                    composed: true
                }))
            })
        })

        // Field changes
        this.shadowRoot?.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', (e) => {
                const target = e.target as HTMLInputElement | HTMLSelectElement
                const index = parseInt(target.dataset.index!)
                const field = target.dataset.field as keyof Batch

                if (field === 'amount') {
                    this._newBatches[index][field] = parseInt(target.value) || 0
                } else if (field === 'medium') {
                    this._newBatches[index][field] = target.value as 'zip-file' | 'cdn'
                } else if (field === 'name') {
                    this._newBatches[index][field] = target.value
                }
                
                this.emitChange()
            })
        })
    }

    // Call this after successful contract registration
    markBatchCreated(index: number) {
        const batch = this._newBatches[index]
        if (batch) {
            // Move from new to existing
            this._existingBatches.push(batch)
            this._newBatches.splice(index, 1)
            this.emitChange()
            this.render()
            this.attachEventListeners()
        }
    }

    validate(): string[] {
        const errors: string[] = []
        
        // Only validate if no existing batches and no new batches
        if (this._existingBatches.length === 0 && this._newBatches.length === 0) {
            errors.push('Add at least one batch')
            return errors
        }

        this._newBatches.forEach((batch, index) => {
            if (!batch.name.trim()) {
                errors.push(`New Batch ${index + 1}: Name is required`)
            }
            if (!batch.amount || batch.amount <= 0) {
                errors.push(`New Batch ${index + 1}: Amount must be positive`)
            }
        })
        
        return errors
    }
}

customElements.define('survey-form-batches', SurveyFormBatches)

export { SurveyFormBatches }