import { typograhyStyles } from '../../../shared/src/assets/styles/typography-styles.js'
import { colourStyles } from '../styles/shared-colour-styles.js'
import { buttonStyles } from '../styles/shared-button-styles.js'
import { store } from '../state/store.js'
import { router } from '../router.js';

class SurveyDetailAccess extends HTMLElement {
    private unsubscribe?: () => void;
    private surveyId!: string;

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, colourStyles, buttonStyles]
    }

    connectedCallback() {

        this.surveyId = this.getAttribute('survey-id') || '';

        // Subscribe to store changes
        this.unsubscribe = store.subscribe('surveys', (surveys) => {
            console.log("subscription comes in")
            this.render(surveys);
        });

        // Initial render
        this.render(store.surveys);
    }

    disconnectedCallback() {
        // Cleanup if needed
         this.unsubscribe?.();
    }

    private render(surveys: any[]) {

        if (!this.shadowRoot) return;
        
        const survey = surveys.find(s => s.id === this.surveyId);

        this.shadowRoot.innerHTML = `
        <style>
            /* ...existing styles... */

            .co-organiser-section {
                margin-top: 2rem;
                padding-top: 1.5rem;
                border-top: 1px solid var(--color-border, #333);
            }

            .add-row {
                display: flex;
                gap: 1rem;
                align-items: flex-end;
                margin-top: 1rem;
            }

            .add-row input {
                flex: 1;
                margin-bottom: 0;
            }

            .role-select {
                flex: 0 0 140px;
                margin-bottom: 0;
            }
        </style>

        ${!survey ? `
            <div class="loading">Loading survey...</div>
        ` : `
            <div class="access-container">

                <div class="readonly">
                    <label>Survey ID:</label>
                    <span>${survey.id}</span>
                </div>

                <div class="readonly">
                    <label>Safe:</label>
                    <span>${survey.config.safe || '—'}</span>
                </div>

                <div class="readonly">
                    <label>Owners:</label>
                    <span>${survey.owners?.join(', ') || '—'}</span>
                </div>

                <div class="readonly">
                    <label>Readers:</label>
                    <span>${survey.readers?.join(', ') || '—'}</span>
                </div>

                <div class="co-organiser-section">
                    <label>Add co-organiser</label>
                    <div class="add-row">
                        <input 
                            type="text" 
                            id="co-organiser-address" 
                            placeholder="0x address"
                        />
                        <select id="co-organiser-role" class="role-select">
                            <option value="owner">Owner</option>
                            <option value="proposer">Proposer</option>
                        </select>
                        <button class="btn-primary" id="add-co-organiser">Add</button>
                    </div>
                </div>

            </div>
        `}
        `;

        this.attachListeners();
    }


    private attachListeners() {

        this.shadowRoot?.querySelector('#add-co-organiser')?.addEventListener('click', () => {
            const address = (this.shadowRoot?.querySelector('#co-organiser-address') as HTMLInputElement)?.value.trim();
            const role = (this.shadowRoot?.querySelector('#co-organiser-role') as HTMLSelectElement)?.value as 'owner' | 'proposer';

            if (!address) return;

            this.dispatchEvent(new CustomEvent('add-co-organiser', {
                detail: { address, role, surveyId: this.surveyId },
                bubbles: true,
                composed: true
            }));
        });

    }


}

customElements.define('survey-detail-access', SurveyDetailAccess)

export { SurveyDetailAccess }