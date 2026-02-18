
import { IServices } from "../services/container.js";
import { store } from "../state/store.js";
import { reactive } from "../utils/reactive.js";
import '../components/survey-detail-responses.js';
import '../components/survey-detail-config.js';
import '../components/survey-forms/survey-form-questions.js';
import '../components/survey-forms/survey-form-batches.js';
import { router } from "../router.js";
import { fetchSurvey } from "../factories/survey.factory.js";

export class SurveyController {
    private reactiveViews: any[] = [];
    private services: IServices;
    private surveyId: string;
    private survey: any;

    constructor(services: IServices, surveyId: string) {

        this.services = services;
        this.surveyId = surveyId;
    }

    private renderTemplate() {
        const app = document.querySelector('#app');
        if (!app) return;

        app.innerHTML = `
            <style>
                :root {
                    --green: rgb(42.9834254144, 112.6165745856, 98.0022099448)
                }

                .survey-header {
                    width: 100%;
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-start;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .tabs-container {
                    border-bottom: 1px solid var(--green);
                    margin-bottom: 2rem;
                    width: 100%;
                }

                .tabs {
                    display: flex;
                    gap: 0;
                    margin: 0 auto -1px auto;
                    padding: 0 1.5rem;
                }

                .tab {
                    padding: 1rem 1.5rem;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: 500;
                    color: var(--green);
                    transition: all 0.2s;
                }

                .tab:hover {
                    color: black;
                }

                .tab.active {
                    color: var(--green);
                    border-bottom-color: white;
                    border-left: 1px solid var(--green);
                    border-top: 1px solid var(--green);
                    border-right: 1px solid var(--green);
                    border-bottom: 1px solid #7ccdbc;
                }

                .back-btn {
                    background: none;
                    border: none;
                    color: var(--green);
                    cursor: pointer;
                    font-size: 2rem;
                }

                .back-btn:hover {
                    text-decoration: underline;
                }
            </style>

            <div class="container container-large centered">
                <div class="survey-header">
                    <button class="back-btn" id="back-btn"><</button>
                    <h2 id="survey-title">Loading...</h2>
                </div>

                <div class="tabs-container">
                    <div class="tabs" id="tabs-container">
                        <button class="tab active" data-tab="results">Results</button>
                        <button class="tab" data-tab="intro">Config</button>
                        <button class="tab" data-tab="questions">Questions</button>
                        <button class="tab" data-tab="batches">Batches</button>
                    </div>
                </div>

                <div id="survey-container" class="container container-large centered"></div>
            </div>
        `;

        // Reactive survey title
        const titleView = reactive('#survey-title', () => {

            console.log("should update", this.survey)
            return this.survey?.title || 'Loading...';
        });

        if (titleView) {
            titleView.bind('surveys');
            this.reactiveViews.push(titleView);
        }

        // Reactive tabs active state
        const tabsView = reactive('#tabs-container', () => {
            const { resultTab } = store.ui;
            
            return `
                <button class="tab ${resultTab === 'results' ? 'active' : ''}" data-tab="results">Results</button>
                <button class="tab ${resultTab === 'config' ? 'active' : ''}" data-tab="config">Config</button>
                <button class="tab ${resultTab === 'questions' ? 'active' : ''}" data-tab="questions">Questions</button>
                <button class="tab ${resultTab === 'batches' ? 'active' : ''}" data-tab="batches">Batches</button>

            `;
        });

        if (tabsView) {
            tabsView.bind('ui');
            this.reactiveViews.push(tabsView);
        }

        // Reactive survey content
        const view = reactive('#survey-container', () => {
            const { resultTab } = store.ui;

            console.log("tab", resultTab)

            switch (resultTab) {
                case 'results':
                    return `<survey-detail-responses class="container" survey-id="${this.surveyId}"></survey-detail-responses>`
                case 'config':
                    return `<survey-detail-config class="container" survey-id="${this.surveyId}"></survey-detail-config>`;
                case 'questions':
                    return `<survey-form-questions class="container" survey-id="${this.surveyId}"></survey-form-questions>`;
                case 'batches':
                    return `<survey-form-batches class="container" survey-id="${this.surveyId}"></survey-form-batches>`;
                default: 
                    return ``;
            }
        });

        if (view) {
        view.bind('ui');
        this.reactiveViews.push(view);
        }

        this.setListeners();
    }
    
    
    async process() {

        this.survey = store.surveys.find((s: any) => s.id === this.surveyId);

         if (!this.survey) {
            console.log('Survey not in store, fetching...');
            
            const authContext = await this.services.lit.createAuthContext(this.services.waap.getWalletClient());
            this.survey = await fetchSurvey(this.services, authContext, this.surveyId)
            console.log(this.survey)
            store.addSurvey(this.survey);
        }

        // const nillDid = await this.services.nillion.getDid();

        // const message = `Request delegation for ${nillDid.didString}`;
        // const signature = await this.services.viem.signMessage(message);

        // let nillDelegation: any  = await fetch(`${import.meta.env.VITE_BACKEND}/api/request-delegation`, { // or directly get results 
        //   method: 'POST',
        //   headers: {
        //       'Content-Type': 'application/json', 
        //   },
        //   body: JSON.stringify({ 
        //       surveyId: this.surveyId,
        //       nillDid,
        //       signature,     
        //       message  
        //   })
        // });
    }

    async render() {

        this.renderTemplate();
        this.process();
    }

    destroy() {
        this.reactiveViews.forEach(view => view.destroy());
        this.reactiveViews = [];
    }

    setListeners() {

        document.querySelector('#back-btn')?.addEventListener('click', () => {
            router.navigate('/results');
        });

        // Use event delegation on the parent container
        document.querySelector('#tabs-container')?.addEventListener('click', (e) => {
            const tab = (e.target as HTMLElement).closest('.tab');
            if (!tab) return;
            
            const tabName = (tab as HTMLElement).dataset.tab as 'results' | 'config' | 'questions';
            console.log("click", tabName);
            store.setUI({ resultTab: tabName });
        });

        document.addEventListener('batch-create', async (e) => {
            const event = e as CustomEvent
            const { batch, index } = event.detail
            // ...
            // Register on contract
            // const contractBatchId = await this.registerBatchOnContract(batch)
            
            // // Generate invitations
            // await this.generateInvitations(contractBatchId, batch.amount)
            
            // Update UI
            // const batchesForm = document.querySelector('survey-form-batches') as any
            // batchesForm.markBatchCreated(index, contractBatchId)
        })


    }

    
}