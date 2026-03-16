
import { IServices } from "../services/services.js";
import { store } from "../state/store.js";
import { reactive } from "../utils/reactive.js";
import '../components/survey-detail-responses.js';
import '../components/survey-detail-access.js';
// import '../components/survey-forms/survey-form-questions.js';
import '../components/survey-forms/survey-form-batches.js';
import '../components/registered-questions-editor.js';
import { router } from "../router.js";
import { createBatch, createInvitations } from "../factories/survey.factory.js";
import surveyStore from 's3ntiment-contracts/deployments/base/S3ntimentSurveyStore.json' assert { type: 'json' }
import {  fetchAndDecryptSurveyWithOwner, Survey } from "@s3ntiment/shared";
import { renderIcon } from "@s3ntiment/shared/assets";
import { authenticate } from "../factories/auth.factory.js";


export class SurveyController {
    private reactiveViews: any[] = [];
    private services: IServices;
    private surveyId: string;
    private survey!: Survey;

    constructor(services: IServices, surveyId: string) {

        this.services = services;
        this.surveyId = surveyId;
    }

    private renderTemplate() {
        const app = document.querySelector('#app');
        if (!app) return;

        app.innerHTML = `
            <style>
           
                .survey-header {
                    width: 100%;
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-start;
                    align-items: center;
                }

                .tabs-container {
                    // border-bottom: 1px solid var(--color-too-dark);
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
                    font-weight: 400;
                    color: var(--color-too-dark);
                    transition: all 0.2s;
                    border-bottom: 2px solid var(--color-too-dark);
                    border-radius: 0;
                }

                .tab:hover {
                    color: black;
                }

                .tab.active {
                    color: var(--color-too-dark);
                    border-bottom-color: white;
                    border-left: 2px solid var(--color-too-dark);
                    border-top: 2px solid var(--color-too-dark);
                    border-right: 2px solid var(--color-too-dark);
                    border-bottom: 2px solid var(--color-bg);
                }

                .back-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 2rem;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex: 0;

                    svg {
                        height: 2.5rem;
                        width: 2.5rem;
                        fill: var(--color-too-dark)
                    }
                }

                .back-btn:hover {
                    text-decoration: underline;
                }
            </style>

            <div class="container container-large centered">
                <div class="survey-header">
                    <button class="back-btn" id="back-btn">${renderIcon('caret')}</button>
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

            // console.log("should update", this.survey)
            return this.survey?.title || '...';
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
                <button class="tab ${resultTab === 'access' ? 'active' : ''}" data-tab="access">Access</button>
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

            switch (resultTab) {
                case 'results':
                    return `<survey-detail-responses class="container" survey-id="${this.surveyId}"></survey-detail-responses>`
                case 'access':
                    return `<survey-detail-access class="container" survey-id="${this.surveyId}"></survey-detail-access>`;
                case 'questions':
                    return `<registered-questions-editor class="container" survey-id="${this.surveyId}"></registered-questions-editor>`
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

        const survey = store.surveys.find((s: any) => s.id === this.surveyId);

         if (survey && survey !== undefined) {
            this.survey = survey;
         } 

        const capabilityDelegation = await store.ensureCapabilityDelegation(
            import.meta.env.VITE_BACKEND,
            this.services.safe
        );

        const authContext = await this.services.lit.createAuthContext(this.services.safe.getSigner(), capabilityDelegation, window.location.host);
        this.survey = await fetchAndDecryptSurveyWithOwner(this.services, surveyStore, this.surveyId, authContext,"")
        console.log("Survey: ",this.survey)

        await this.services.safe.connectToExistingSafe(this.survey.config?.safe || "") 


        // const nillDid = await this.services.nillion.getDid();

        // const message = `Request delegation for ${nillDid.didString}`;
        // const signature = await this.services.viem.signMessage(message);

        // let nillDelegation: any  = await fetch(`${import.meta.env.VITE_BACKEND}/api/surveys/${this.surveyId}/delegation`, { // or directly get results 
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

        const response = await fetch(`${import.meta.env.VITE_BACKEND}/api/surveys/${this.surveyId}/results`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                surveyId: this.survey.id,
                groups: this.survey.groups   
            })
        });

        const talliedResults = await response.json();

        this.survey.results = talliedResults.results;

        console.log("RESULTS", this.survey.results)
        store.addSurvey(this.survey);
        
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
            router.navigate('/surveys');
        });

        // Use event delegation on the parent container
        document.querySelector('#tabs-container')?.addEventListener('click', (e) => {
            const tab = (e.target as HTMLElement).closest('.tab');
            if (!tab) return;
            
            const tabName = (tab as HTMLElement).dataset.tab as 'results' | 'access' | 'questions';
            console.log("click", tabName);
            store.setUI({ resultTab: tabName });
        });

        document.addEventListener('batch-create', async (e) => {
            const event = e as CustomEvent
            const { batch, index, surveyId } = event.detail;

            console.log(batch, surveyId)

            const b = await createBatch(this.services, batch, surveyId)

            const receipt = await this.services.safe.write(surveyStore.address, surveyStore.abi, 'registerBatch', [surveyId, b.id], { waitForReceipt: true});
            console.log(receipt);

            await createInvitations(b);
            
        })

        document.addEventListener('add-co-organiser', async (e: Event) => {
            const { address, role, surveyId } = (e as CustomEvent).detail;

            if (role == 'owner') {
                await this.services.safe.addOwner(address);
            }
        });

        document.addEventListener('survey-save', async (e: Event) => {
            const { surveyId, groups } = (e as CustomEvent).detail

            await this.services.safe.connectToExistingSafe(this.survey.config?.safe || "");

            // old state !
            const existing = store.surveys.find((s: any) => s.id === surveyId)
            if (existing) {

                const surveyConfig: Survey = { ...existing, groups };
        
                let res: any = await fetch(`${import.meta.env.VITE_BACKEND}/api/surveys/${surveyId}`, {
                    method: 'PUT',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({   
                        surveyId,      
                        surveyConfig,
                        safeAddress: this.survey.config?.safe
                    })
                });

                const result = JSON.parse(await res.text());

                if (this.services.ipfs.isCID(result.cid)) {

                    const args = [surveyId, result.cid.toString()];

                    const receipt = await this.services.safe.write(surveyStore.address, surveyStore.abi, 'updateSurvey', args, { waitForReceipt: true});
                    console.log(receipt);

                    store.addSurvey(surveyConfig)

                } else {

                    console.log("IPFS upload failed", result.cid)
                }

            }

            console.log('save groups', surveyId, groups)
        });
    }
}