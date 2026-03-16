import { reactive } from '../utils/reactive.js';
import '@s3ntiment/shared/components';
import { IServices } from '../services.js';
import { store } from '../state/store.js';

import { router } from '../router.js';


export class CompletedController {

    private reactiveViews: any[] = [];
    private services: IServices;
    private surveyId: string;
    private score: any;

    constructor(services: IServices, surveyId: string) {
        this.services = services;
        this.surveyId = surveyId;
    }

    private renderTemplate() {
        const app = document.querySelector('#app');
        if (!app) return;

        app.innerHTML = `<div id="completed-content" class="centered"></div>`;

        const view = reactive('#completed-content', () => {

            return `
                <div class="completed-container">score<span>/</span><span>x</span></div>
                <div class="onboarding-message">
                 <h2>Thank you for your feedback</h2>
                 <p>You can close the app now.</p>
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

        const signer = this.services.account.getSignerAddress();
        const signature = await this.services.account.signMessage(`s3ntiment:score:${this.surveyId}`)

        const response = await fetch(`${backendUrl}/api/surveys/${this.surveyId}/score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ signer, signature })
        });

        console.log(response);

        if (response.ok) {

            const r: any = await response.json();
            console.log(r);
            this.score = r.score;
            console.log(this.score)

        } else {

            console.log("ERROR", response);
        }



        this.renderTemplate();

    }

    destroy() {
        this.reactiveViews.forEach(view => view.destroy());
        this.reactiveViews = [];
    }
}