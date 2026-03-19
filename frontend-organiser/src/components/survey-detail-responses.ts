import { buttonStyles, layoutStyles, typograhyStyles } from '@s3ntiment/shared/assets'
import { store } from '../state/store.js'
import { router } from '../router.js';
import { Survey, SurveyResultsTally } from '@s3ntiment/shared';
import './survey-results/radio-results';
import './survey-results/checkbox-results';
import './survey-results/scale-results';
import './survey-results/scored-single-results';

class SurveyDetailResponses extends HTMLElement {
    private unsubscribe?: () => void;
    private surveyId!: string;
    private survey!: Survey;
    private total!: number;

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, layoutStyles, buttonStyles]

       
    }

    connectedCallback() {

        this.surveyId = this.getAttribute('survey-id') || '';

        // Subscribe to store changes
        this.unsubscribe = store.subscribe('surveys', (surveys) => {
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
        
        this.survey = surveys.find(s => s.id === this.surveyId);

        this.shadowRoot.innerHTML = `
        <style>
            .survey-header {
                margin-bottom: 2rem;
            }

            .loading {
                text-align: center;
                padding: 2rem;
                color: #6b7280;
            }
        </style>

        <div class="container container-large centered">
            
            ${!this.survey ? `
                <loading-spinner message="decrypting survey"></loading-spinner>
            ` : `
                <loading-spinner message="collecting results"></loading-spinner>
            `}
        </div>
        `;

        if(this.survey && this.survey.results) {

           
            this.renderResults();
            this.attachListeners()
        }
    }

     private renderResults() {
        if (!this.shadowRoot) return;

        const groupsHTML = this.survey.groups && this.survey.groups.length > 0
            ? this.renderGrouped()
            : this.renderFlat();

        this.shadowRoot.innerHTML = `
            <style>
                .responses-container {
                    
                    width: 100%;
                    color: var(--color-too-dark);
                    display: flex;
                    flex-direction: column;

                    span {
                        align-self: flex-end;
                    }
                }

                .group-section {
                    
                    margin-bottom: 2rem;
                    padding-left: 2rem;

                }

                .group-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                    gap: 0.5rem;
                    border-left: 2px solid var(--color-too-dark);
                    padding: 0 1.5rem;
                }

                .result-item {
               
                    padding: 1.5rem 2rem 1.5rem 1.75rem;
              
                }

                .result-item h3 {
                    margin: 0 0 1rem 0;
                    font-size: 1rem;
                    font-weight: 400;
                    color: black;
                }

                .result-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.5rem 0;
                    border-bottom: 1px solid white;
                }

                .result-row:last-child {
                    border-bottom: none;
                }
                
                .text-responses ul {
                    list-style: none;
                    padding: 0;
                    margin: 0.5rem 0 0;
                }

                .text-responses li {
                    padding: 0.75rem;
                    background: white;
                    margin-bottom: 0.5rem;
                    border-radius: 2px;
                }

                .top-container {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    align-items: center;
                    width: calc(100% - 3rem);
                    margin: 0.75rem 1.5rem;
                }


            </style>

            <div class="container centered">
                <div class="top-container">
                    <span>(${this.total} responses)</span>
                    <button id="btn-refresh" class="btn-primary">Refresh</button>
                    
                </div>
                <div class="responses-container">
                    ${groupsHTML}
                </div>
            </div>
        `;

        requestAnimationFrame(() => {
            Object.entries(this.survey.results!).forEach(([questionId, tally]) => {
                const radioEl = this.shadowRoot!.querySelector(`#radio-${questionId}`) as any;
                if (radioEl) radioEl.tally = tally;
                const checkboxEl = this.shadowRoot!.querySelector(`#checkbox-${questionId}`) as any;
                if (checkboxEl) checkboxEl.tally = tally;
                const scaleEl = this.shadowRoot!.querySelector(`#scale-${questionId}`) as any;
                if (scaleEl) scaleEl.tally = tally;
                const scoredEl = this.shadowRoot!.querySelector(`#scored-${questionId}`) as any;
                if (scoredEl) scoredEl.tally = tally;
            });
        });
    }

    private renderGrouped(): string {
        return this.survey.groups!.map(group => `
            <div class="group-section">
                <div class="group-header">
                    <h3>${group.title}</h3>
                </div>
                ${group.questions.map(question => {
                    const tally = this.survey.results![question.id];
                    return tally ? this.renderResultItem(tally, question.id) : '';
                }).join('')}
            </div>
        `).join('');
    }

    private renderFlat(): string {
        return Object.entries(this.survey.results!).map(([questionId, tally]) =>
            this.renderResultItem(tally,questionId)
        ).join('');
    }

    private renderResultItem(tally: SurveyResultsTally[string], questionId: string): string {
        return `
            <div class="result-item">
                <h3>${tally.question}</h3>
                ${this.renderByType(tally, questionId)}
            </div>
        `;
    }

    private renderByType(tally: SurveyResultsTally[string], questionId: string): string {
        switch (tally.type) {
            case 'text':
                return `
                    <div class="text-responses">
                        <p>${tally.responses.length} responses</p>
                        <ul>
                            ${tally.responses.map(r => `<li>${this.escapeHtml(r)}</li>`).join('')}
                        </ul>
                    </div>
                `;
            
            case 'radio':
                return `
                    <radio-results id="radio-${questionId}"></radio-results>
                `;
            case 'scale':
                return `
                   <!-- <scale-results id="scale-${questionId}"></scale-results> -->
                    <div class="scale-results">
                        <div class="result-row">
                            <span>Average</span>
                            <strong>${tally.average}</strong>
                        </div>
                        <div class="result-row">
                            <span>Responses</span>
                            <span>${tally.responses} / ${tally.total}</span>
                        </div>
                    </div>
                `;
            
            case 'checkbox':
                    return `
                    <checkbox-results id="checkbox-${questionId}"></checkbox-results>
                `;

            case 'scored-single':
                return `
                    <scored-single-results id="scored-${questionId}"></scored-single-results>
                `;
            
            default:
                return '';
        }

      
    }

    private escapeHtml(text: string): string {
        const map: { [key: string]: string } = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    private attachListeners() {


        this.shadowRoot?.querySelector('#btn-refresh')?.addEventListener('click', () => {
            
            this.dispatchEvent(new CustomEvent('refresh-responses', {
                detail: { },
                bubbles: true,
                composed: true
            }))
        });
    }


}

customElements.define('survey-detail-responses', SurveyDetailResponses)

export { SurveyDetailResponses }
