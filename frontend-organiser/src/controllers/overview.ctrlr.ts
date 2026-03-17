
import { IServices } from "../services/services.js";
import { reactive } from "../utils/reactive.js";
import '../components/pool-list.js';
import '../components/add-pool.js';
import '../components/survey-list.js';
import '../components/add-survey.js';
import '../components/access-request.js';

export class OverviewController {
    private reactiveViews: any[] = [];
    services: IServices

    constructor(services: IServices) {

        this.services  = services;
    }

    private renderTemplate() {

        const app = document.querySelector('#app');
        if (!app) return;
    
        app.innerHTML = `
          <pool-list class="centered"></pool-list>
          <add-pool class="container container-large"></add-pool>
          <survey-list class="centered"></survey-list>
          <add-survey class="container container-large"></add-survey>
        `;
    }
    
    
    async process() {}

    async render() {
        
        this.renderTemplate();
        this.process();
    }

    destroy() {
        this.reactiveViews.forEach(view => view.destroy());
        this.reactiveViews = [];
    }

    setListeners() {

        document.addEventListener('access-request', async (e) => {
            const event = e as CustomEvent
            const { surveyId } = event.detail;
            console.log(surveyId);
        })

        document.addEventListener('import-pool', async (e) => {
            const event = e as CustomEvent
            const { poolId } = event.detail;
            console.log(poolId);
        })
        

        document.addEventListener('import-survey', async (e) => {
            const event = e as CustomEvent
            const { surveyId } = event.detail;
            console.log(surveyId);
        })
        
    }
}