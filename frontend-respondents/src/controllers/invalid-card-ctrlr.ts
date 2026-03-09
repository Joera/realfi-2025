import { reactive } from '../utils/reactive.js';
import '@s3ntiment/shared/components';
import { IServices } from '../services.js';
import { store } from '../state/store.js';

import { router } from '../router.js';


export class InvalidCardController {

    private reactiveViews: any[] = [];
    private services: IServices;

    constructor(services: IServices) {
        this.services = services;
    }

    private renderTemplate() {
        const app = document.querySelector('#app');
        if (!app) return;

        app.innerHTML = `<div id="invalid-card-content" class="centered"></div>`;

        const view = reactive('#invalid-card-content', () => {

        
            return `
                <div class="onboarding-message">
                 <h2>Invalid card</h2>
                 <p>You need a valid invitation to partake in the survey.</p>
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

    }

    destroy() {
        this.reactiveViews.forEach(view => view.destroy());
        this.reactiveViews = [];
    }
}