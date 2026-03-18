import { typograhyStyles } from '../../../shared/src/assets/styles/typography-styles.js'
import { colourStyles } from '../styles/shared-colour-styles.js'
import { buttonStyles } from '../styles/shared-button-styles.js'
import '@s3ntiment/shared/components';
import { store } from '../state/store.js';
import { router } from '../router.js';
import { layoutStyles } from '../styles/shared-layout-styles.js';
import { Survey } from '@s3ntiment/shared';

class SurveyList extends HTMLElement {
   
    private unsubscribe?: () => void;

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, colourStyles, buttonStyles, layoutStyles]
    }

    connectedCallback() {

        const surveys = store.surveys; // or however you fetch current state
        console.log("Store surveys", store.surveys)
        this.render(surveys);

        this.unsubscribe = store.subscribeSurveys((surveys: any[]) => {
        const sorted = surveys
            .filter(s => s != undefined)
            .sort((a: Survey, b: Survey) => {
            if (b.createdAt! > a.createdAt!) return 1;
            if (b.createdAt! < a.createdAt!) return -1;
            return 0;
            });
        this.render(sorted);
        });
           
    }

    disconnectedCallback() {

         this.unsubscribe?.();
    }

    private render(surveys: any[]) {

        if (!this.shadowRoot) return

        this.shadowRoot.innerHTML = `
        <style>


            h2 {
                color: var(--color-too-dark);
                border-bottom: 2px solid var(--color-too-dark);
            }

            .survey-table {
            width: 100%;
                display: grid;
                grid-template-columns: 2fr 2fr 1fr auto;  /* Survey ID | Date | Collection */
                gap: 0;
                overflow: hidden;
            }

            .table-header {
                padding: .75rem;
                border-bottom: 1px solid white;
            }

            .table-header:first-child {
                padding: .75rem  .75rem .75rem 0;
            }

            .table-cell {
                padding: .75rem;
                border-bottom: 1px solid white;
            }
            
            .table-cell:first-child {
                padding: .75rem  .75rem .75rem 0;
            }

            .table-row {
                display: contents;  /* Makes children participate in parent grid */
                cursor: pointer;

                &:last-of-type  .table-cell {
                border-bottom: none
                }
            }

            .caret {
                display: flex;
                align-items: center;
                color: var(--color-too-dark);
                
                

                svg {
                    margin-top: -.5rem;
                    transition: opacity 0.2s ease;
                    opacity: 0;
                    width: .75rem;
                    height: auto;
                    fill: var(--color-too-dark);
                }
            }

            .table-row:hover .caret svg {
                opacity: 1;
            }

            .table-row:hover .table-cell {
                color: var(--color-too-dark);
                --copy-hash-color: var(--color-too-dark);
            }
           
        </style>

        <div class="container container-large">
           

        <h2>surveys</h2>
            
             ${surveys.length === 0 ? `
             <div>no surveys stored</div>
    ` : `
        
        <div class="survey-table">
            <!-- Header Row -->
            <div class="table-header">Title</div>
            <div class="table-header">ID</div>
            <div class="table-header">Created</div>
            <div class="table-header"></div>

            
            <!-- Data Rows -->
            ${surveys.map(survey => `
                <div class="table-row" data-survey-id="${survey.id}">
                    <div class="table-cell">${survey.title}</div>
                    <div class="table-cell"><copy-hash>${survey.id}</copy-hash></div>
                    <div class="table-cell">${new Date(Number(survey.createdAt) * 1000).toLocaleDateString()}</div>
                    <div class="table-cell caret">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 93">
                            <path d="M3.132 2.567l51.68 42.285-54.812 44.852V2.567z" fill-rule="evenodd"/>
                        </svg>
                    </div>
                    
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

customElements.define('survey-list', SurveyList)

export { SurveyList }