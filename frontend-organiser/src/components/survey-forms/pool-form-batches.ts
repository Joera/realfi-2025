import { typograhyStyles, tableStyles, buttonStyles, breakpoints} from '@s3ntiment/shared/assets'

import { store } from '../../state/store.js'
import type { Batch } from '@s3ntiment/shared'
import { router } from '../../router.js'

class PoolFormBatches extends HTMLElement {
    private _existingBatches: Batch[] = []  // from contract, read-only
    private _newBatches: Batch[] = []  // editable drafts
    private _mode: 'draft' | 'existing' = 'draft'
    private _poolId: string = ''

    static get observedAttributes() {
        return ['pool-id', 'mode','new-pool']
    }

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, buttonStyles, tableStyles]
    }

    connectedCallback() {
        // In draft mode, ensure there's always one batch to fill in
        if (this._mode === 'draft' && this._newBatches.length === 0) {
            this._newBatches.push({
                id: '',
                name: '',
                survey: '',
                pool: '',
                amount: 20,
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
        
        if (name === 'pool-id' && oldValue !== newValue) {
            this._poolId = newValue
            this._mode = 'existing'  // pool-id implies existing pool
            const pool = store.pools.find((p: any) => p.id === newValue)
            if (pool) {

                const directBatches = pool.batches.filter(
                    (b: Batch | string): b is Batch => typeof b === 'object'
                );
                const resolvedBatches = Object.values(store.batches)
                    // .filter((b: Batch | string): b is string => typeof b === 'string')
                    // .map(s => store.batches.find(b => b.id === s))
                    // .filter((b): b is Batch => b !== undefined);

                this._existingBatches = [...directBatches, ...resolvedBatches];


                this._newBatches = []
                this.render()
                this.attachEventListeners()
            }
        }
    }

    private get _poolSurveys(): Array<{ id: string; title: string }> {
        return store.surveys
            .filter((s: any) => s.poolId === this._poolId || s.pool === this._poolId)
            .map((s: any) => ({ id: s.id, title: s.title }))
    }

    // For draft editor - sets new batches being created
    set batches(value: Batch[]) {
        this._newBatches = value
        
        // In draft mode, ensure there's always one batch
        if (this._mode === 'draft' && this._newBatches.length === 0) {
            this._newBatches.push({
                id: '',
                name: '',
                survey: '',
                pool: '',
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

        const poolSurveys = this._poolSurveys;

        this.shadowRoot.innerHTML = `
        <style>
            :host {
                --green: #3473ab;
                display: block;
            }

            .form-container {
                padding: .75rem 0;
                width: 100%;

                @media (min-width: ${breakpoints.lg}px) {
                    padding: 1.5rem;
                }
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
                border: none;
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
                flex-direction: column;

                @media (min-width: ${breakpoints.lg}px) {
                    flex-direction: row;
                }
            }

            .form-group {
                flex: 1;
            }

            .form-group.small {
                
                @media (min-width: ${breakpoints.lg}px) {
                    flex: 0 0 120px;
                }
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
                font-size: 1rem;
                color: var(--green);
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


            .table {
                grid-template-columns: 2fr 2fr 1fr;
            }

            @container (min-width: ${breakpoints.md}px) {           
                .table {
                    grid-template-columns: 2fr 2fr 1fr 1fr auto;
                }
            }

        </style>

        <div class="form-container">
            ${this._existingBatches.length > 0 ? `

                <div class="table">
                    <div class="table-header">Name</div>
                    <div class="table-header">Survey</div>
                    <div class="table-header">Amount</div>
                    <div class="table-header hide-sm">Medium</div>
                    <div class="table-header hide-sm"></div>

                ${this._existingBatches.map((batch) => `
                    <div class="table-row" data-batch-id="${batch.id}">
                        <div class="table-cell">${batch.name}"</div>
                        <div class="table-cell">${poolSurveys.find((s: any) => s.id === batch.survey)?.title || batch.survey || '—'}</div>
                        <div class="table-cell hide">${batch.amount}</div>
                        <div class="table-cell hide-sm">${batch.medium === 'zip-file' ? 'QR Code' : 'CDN Link'}</div>
                        <div class="table-cell caret hide-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 93">
                                <path d="M3.132 2.567l51.68 42.285-54.812 44.852V2.567z" fill-rule="evenodd"/>
                            </svg>
                        </div>
                    </div>
                `).join('')}
            </div>` : ''}

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
                                   value="${batch.name}" placeholder="e.g., ETH Denver 2026" />
                        </div>
                        ${this._poolId !== "" ? `
                            <div class="form-group">
                                <label>Survey</label>
                                <select data-field="survey" data-index="${index}">
                                    <option value="">Select survey…</option>
                                    ${poolSurveys.map((s: any) => `
                                        <option value="${s.id}" ${batch.survey === s.id ? 'selected' : ''}>${s.title || s.id}</option>
                                    `).join('')}
                                </select>
                            </div>
                        ` : ''}
                        <div class="form-group small">
                            <label>Amount</label>
                            <input type="number" data-field="amount" data-index="${index}" 
                                   value="${batch.amount}" min="1" placeholder="50" />
                        </div>
                        <div class="form-group small">
                            <label>Medium</label>
                            <select data-field="medium" data-index="${index}">
                                <option value="zip-file" ${batch.medium === 'zip-file' ? 'selected' : ''}>ZIP File</option>
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

        this.shadowRoot?.querySelectorAll('.table .table-row').forEach(row => {
            row.addEventListener('click', (e) => {
                const batchId = (e.currentTarget as HTMLElement).dataset.batchId;
                router.navigate(`/batch/${this._poolId}/${batchId}`);
            });
        });
        
        // Add batch
        this.shadowRoot?.querySelector('#add-batch')?.addEventListener('click', () => {
            this._newBatches.push({ 
                id: '',
                name: '', 
                pool: this._poolId,
                survey: '',
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
                
                if (!batch.name.trim()) {
                    alert('Please enter a batch name')
                    return
                }
                if (!batch.survey) {
                    alert('Please select a survey')
                    return
                }
                if (!batch.amount || batch.amount <= 0) {
                    alert('Please enter a valid amount')
                    return
                }

                this.dispatchEvent(new CustomEvent('batch-create', {
                    detail: { batch, index, poolId: this._poolId, surveyId: batch.survey },
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
                } else if (field === 'survey') {
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
            this._existingBatches.push(batch)
            this._newBatches.splice(index, 1)
            this.emitChange()
            this.render()
            this.attachEventListeners()
        }
    }

    validate(): string[] {
        const errors: string[] = []
        
        if (this._existingBatches.length === 0 && this._newBatches.length === 0) {
            errors.push('Add at least one batch')
            return errors
        }

        this._newBatches.forEach((batch, index) => {
            if (!batch.name.trim()) {
                errors.push(`New Batch ${index + 1}: Name is required`)
            }
            if (!batch.survey) {
                errors.push(`New Batch ${index + 1}: Survey is required`)
            }
            if (!batch.amount || batch.amount <= 0) {
                errors.push(`New Batch ${index + 1}: Amount must be positive`)
            }
        })
        
        return errors
    }
}

customElements.define('pool-form-batches', PoolFormBatches)

export { PoolFormBatches }