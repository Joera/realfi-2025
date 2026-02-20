import { typograhyStyles } from '../styles/shared-typograhy-styles.js'
import { colourStyles } from '../styles/shared-colour-styles.js'
import { buttonStyles } from '../styles/shared-button-styles.js'
import '../components/ui/loading-spinner.js'
import { store } from '../state/store.js';
import { router } from '../router.js';

class SurveyResultsList extends HTMLElement {
   
    private unsubscribe?: () => void;

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, colourStyles, buttonStyles]
    }

    connectedCallback() {


        this.unsubscribe = store.subscribeSurveys((surveys: any[]) => {
            this.render(surveys);
        });
        
        this.render(store.surveys);

        
    }

    disconnectedCallback() {

         this.unsubscribe?.();
    }

    private render(surveys: any[]) {
        console.log


        if (!this.shadowRoot) return

        this.shadowRoot.innerHTML = `
        <style>

            :host {
                --green: rgb(42.9834254144, 112.6165745856, 98.0022099448)
            }

            h1 { 
                color: var(--green)
            }

            .survey-table {
                display: grid;
                grid-template-columns: 1fr 2fr 1fr 1fr 1fr;  /* Survey ID | Date | Collection */
                gap: 0;
                border: 1px solid var(--green);
                border-radius: 8px;
                overflow: hidden;
            }

            .table-header {
                padding: 1rem;
                border-bottom: 1px solid var(--green);
            }

            .table-cell {
                padding: 1rem;
                border-bottom: 1px solid var(--green);
            }

            .table-row {
                display: contents;  /* Makes children participate in parent grid */
                cursor: pointer;

                &:last-of-type  .table-cell {
                border-bottom: none
                }
            }
           
        </style>

        <div class="container">
           
            
             ${surveys.length === 0 ? `
        <loading-spinner></loading-spinner>
    ` : `
        <h1>My surveys</h1>
        <div class="survey-table">
            <!-- Header Row -->
            <div class="table-header">Name</div>
            <div class="table-header">ID</div>
            <div class="table-header">Created</div>
            <div class="table-header">Lit Network</div>
            <div class="table-header">Safe</div>
            
            
            <!-- Data Rows -->
            ${surveys.map(survey => `
                <div class="table-row" data-survey-id="${survey.id}">
                    <div class="table-cell">${survey.title}...</div>
                    <div class="table-cell">${survey.id}</div>
                    <div class="table-cell">${new Date(Number(survey.createdAt) * 1000).toLocaleDateString()}</div>
                    <div class="table-cell">${survey.config.litNetwork}</div>
                    <div class="table-cell">${survey.config.safe}</div>
                    
                </div>
            `).join('')}
        </div>
    `}
        </div>
        `

        this.attachRowListeners()
    }

    private attachRowListeners() {
    this.shadowRoot?.querySelectorAll('.survey-table .table-row').forEach(row => {
        row.addEventListener('click', (e) => {
            const surveyId = (e.currentTarget as HTMLElement).dataset.surveyId;
            console.log("clicked", surveyId)
            // Navigate using Navigo
            router.navigate(`/survey/${surveyId}`);
        });
    });
}


}

customElements.define('survey-results-list', SurveyResultsList)

export { SurveyResultsList }