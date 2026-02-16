
import { IServices } from "../services/container.js";
import { store } from "../state/store.js";
import { reactive } from "../utils/reactive.js";
import '../components/survey-result.js';
import '../components/survey-config.js';
import '../components/survey-questions.js';
import { router } from "../router.js";

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
                .tabs-container {
                    border-bottom: 2px solid #e5e7eb;
                    margin-bottom: 2rem;
                }

                .tabs {
                    display: flex;
                    gap: 0;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                }

                .tab {
                    padding: 1rem 1.5rem;
                    background: none;
                    border: none;
                    border-bottom: 3px solid transparent;
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: 500;
                    color: #6b7280;
                    transition: all 0.2s;
                }

                .tab:hover {
                    color: #374151;
                }

                .tab.active {
                    color: #6366f1;
                    border-bottom-color: #6366f1;
                }

                .back-btn {
                    background: none;
                    border: none;
                    color: #fff;
                    cursor: pointer;
                    font-size: 1rem;
                    margin-bottom: 1rem;
                }

                .back-btn:hover {
                    text-decoration: underline;
                }

            </style>

            <button class="back-btn" id="back-btn">← Back to Surveys</button>

            <div class="tabs-container">
                <div class="tabs">
                    <button class="tab active" data-tab="results">Results</button>
                    <button class="tab" data-tab="config">Config</button>
                    <button class="tab" data-tab="questions">Questions</button>
                </div>
            </div>

            <div id="survey-result"></div>
        `;
    
        const view = reactive('#survey-result', () => {
            
            const { resultTab } = store.ui;

            console.log("tab", resultTab)

            switch (resultTab) {
                case 'results':
                    return `<survey-result survey-id="${this.surveyId}"></survey-result>`
                case 'config':
                    return `<survey-config survey-id="${this.surveyId}"></survey-config>`;
                case 'questions':
                    return `<survey-questions survey-id="${this.surveyId}"></survey-questions>`;
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
            
            const s = await this.services.viem.readSurveyContract('getSurvey', [this.surveyId]);
            const c = JSON.parse(await this.services.ipfs.fetchFromPinata(s[0]));
            
            this.survey = {
                id: this.surveyId,
                createdAt: s[2],
                collectionID: c.collectionID || c.collectioniD
            };

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

        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                console.log("click", e)
            const tabName = (e.currentTarget as HTMLElement).dataset.tab as 
                'results' | 'config' | 'questions';
            
                console.log(tabName)
            store.setUI({ resultTab: tabName });  // ← Update resultTab
            });
        });
    }
}