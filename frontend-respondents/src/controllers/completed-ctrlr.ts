import { reactive } from '../utils/reactive.js';
import '@s3ntiment/shared/components';
import { IServices } from '../services.js';
import { store } from '../state/store.js';

import { router } from '../router.js';


export class CompletedController {

    private reactiveViews: any[] = [];
    private services: IServices;
    private surveyId: string;
    private docId: string;
    private score: any;

    constructor(services: IServices, surveyId: string, docId: string) {
        this.services = services;
        this.surveyId = surveyId;
        this.docId = docId;
    }

    private renderTemplate() {
        const app = document.querySelector('#app');
        if (!app) return;

        app.innerHTML = `<div id="completed-content" class="centered"></div>`;

        const view = reactive('#completed-content', () => {

            return `
                <div> You scored</div>
                <div class="completed-container score"><div><span class="large">${this.score.score}<span></div><div><span>out of ${this.score.max}</span></div></div>
                <div class="onboarding-message">
                 <h3>Thank you for your feedback</h3>
                 <button id="btn-close" class="btn-primary">Close</button>
                </div>
            `;
        });

        if (view) {
            view.bind(store.ui$);
            this.reactiveViews.push(view);
        }
    }

    async render() {

        const backendUrl = import.meta.env.VITE_BACKEND;

        if (store.activeSurvey?.isScored) {

            const signer = this.services.account.getSignerAddress();
            const signature = await this.services.account.signMessage(`s3ntiment:score:${this.surveyId}`)

            const response = await fetch(`${backendUrl}/api/surveys/${this.surveyId}/score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ docId: this.docId , signer, signature })
            });

            if (response.ok) {

                const r: any = await response.json();
                this.score = r.score;
            } else {

                console.log("ERROR", response);
            }
        }



        this.renderTemplate();

        this.attachListeners();

    }

    destroy() {
        this.reactiveViews.forEach(view => view.destroy());
        this.reactiveViews = [];
    }

    attachListeners () {
            
            const btn = document.getElementById("btn-close");
    
            btn?.addEventListener("click", async () => {
                window.close();
            });
        }
    
}