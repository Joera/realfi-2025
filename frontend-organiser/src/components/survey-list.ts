import { breakpoints, layoutStyles, tableStyles, typograhyStyles } from '@s3ntiment/shared/assets'

import { buttonStyles } from '@s3ntiment/shared/assets'
import '@s3ntiment/shared/components';
import { store } from '../state/store.js';
import { router } from '../router.js';
import { Survey } from '@s3ntiment/shared';

class SurveyList extends HTMLElement {
   
    private unsubscribe?: () => void;

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, buttonStyles, layoutStyles, tableStyles]
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

            :host {
                display: flex;
                container-type: inline-size;
            }

            .table {
                grid-template-columns: 2fr 2fr;
            }

            @container (min-width: ${breakpoints.md}px) {           
                .table {
                    grid-template-columns: 2fr 2fr 1fr auto;
                }
            }
           
        </style>

        <div class="container container-large">
           

        <h2 class"bordered-header">surveys</h2>
            
             ${surveys.length === 0 ? `
             <div>no surveys stored</div>
    ` : `
        
        <div class="table">
            <!-- Header Row -->
            <div class="table-header">Title</div>
            <div class="table-header">ID</div>
            <div class="table-header hide-sm">Created</div>
            <div class="table-header hide-sm"></div>

            
            <!-- Data Rows -->
            ${surveys.map(survey => `
                <div class="table-row" data-survey-id="${survey.id}">
                    <div class="table-cell">${survey.title}</div>
                    <div class="table-cell"><copy-hash>${survey.id}</copy-hash></div>
                    <div class="table-cell hide-sm">${new Date(Number(survey.createdAt) * 1000).toLocaleDateString()}</div>
                    <div class="table-cell caret hide-sm">
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
    this.shadowRoot?.querySelectorAll('.table .table-row').forEach(row => {
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