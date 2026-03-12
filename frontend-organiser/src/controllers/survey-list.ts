
import { IServices } from "../services/services.js";
import { reactive } from "../utils/reactive.js";
import '../components/survey-results-list.js';
import '../components/add-survey-input.js';
import '../components/access-request.js';

export class SurveyListController {
    private reactiveViews: any[] = [];
    services: IServices

    constructor(services: IServices) {

        this.services  = services;
    }

    private renderTemplate() {

        const app = document.querySelector('#app');
        if (!app) return;
    
        app.innerHTML = `
          <survey-results-list class="centered"></survey-results-list>
          <add-survey-input class="container container-large"></add-survey-input>
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
    }
}