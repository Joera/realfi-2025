import { reactive } from '../utils/reactive.js';
import '@s3ntiment/shared/components';
import { IServices } from '../services.js';
import { store } from '../state/store.js';
import surveyStore from 's3ntiment-contracts/deployments/base/S3ntimentSurveyStore.json' with { type: 'json' };

import { router } from '../router.js';
import { base } from 'viem/chains';
import { authenticate } from '../auth.factory.js';


export class UsedCardController {

    private reactiveViews: any[] = [];
    private services: IServices;
    private surveyId: string;

    constructor(services: IServices, surveyId: string
    ) {
        this.services = services;
        this.surveyId = surveyId
    }

    private renderTemplate() {
        const app = document.querySelector('#app');
        console.log(app)
        if (!app) return;

        app.innerHTML = `<div id="used-card-content" class="centered"></div>`;

        const view = reactive('#used-card-content', () => {

            return `
                <div class="onboarding-message">
                    <h2>Used card</h2>
                    <p>This invite has already been used. If that was you, you can sign back in with your e-mail</p>
                    <button id="sign-in-btn" class="btn-primary" style="margin-top: 1.5rem">Sign in</button>
                </div>
            `;
        });

        if (view) {
            view.bind(store.ui$);
            this.reactiveViews.push(view);
        }
    }

    async render() {
        
        this.renderTemplate();
        this.attachListeners();

    }

    attachListeners () {
        
        const btn = document.getElementById("sign-in-btn");

        btn?.addEventListener("click", async () => {
           
            const isParticipant = await authenticate(this.services, this.surveyId)
            if (isParticipant) {
                router.navigate(`/surveys/${this.surveyId}`)
            } else {
                alert("You did not register for this survey")
            }
        });
    }


    destroy() {
        this.reactiveViews.forEach(view => view.destroy());
        this.reactiveViews = [];
    }
}