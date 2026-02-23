import { reactive } from '../utils/reactive.js';

import '../components/loading-spinner.js';
import '../components/survey.js';
import { IServices } from '../services.js';
import surveyStore from 's3ntiment-contracts/deployments/base/S3ntimentSurveyStore.json' with { type: 'json' }
import { fetchAndDecryptSurvey } from '@s3ntiment/shared';
import { capabilityDelegation } from '../cap.js';



export class SurveyController {
  private reactiveViews: any[] = [];
  documentId: any;
  services: IServices;
  surveyId: string;

  constructor(services: IServices, surveyId: string) {

    this.services = services;
    this.surveyId = surveyId;
  }


  private renderTemplate() {
    const app = document.querySelector('#app');
    if (!app) return;

    app.innerHTML = `
      <div id="survey-content"></div>
    `;

    const view = reactive('#survey-content', () => {
      
        return `<survey-questions survey-id=${this.surveyId}></survey-questions>`;
        
    });

    if (view) {
    //   view.bind(uiStore);
    //   view.bind(userStore);       
      this.reactiveViews.push(view);
    }
  }


  async process() {
    
  }

  async render() {

    const survey = await fetchAndDecryptSurvey(this.services, surveyStore, this.surveyId, capabilityDelegation)
    console.log("SURVEY", survey)

    this.renderTemplate();
    
  }

  destroy() {
    this.reactiveViews.forEach(view => view.destroy());
    this.reactiveViews = [];
  }


  async setSurveyListener(surveyId: string) {
    document.addEventListener('survey-complete', async (event: any) => {
      console.log('Survey completed!');
      console.log('event:', event);

      const seed = await this.services.waap.createNillDBSeed()
      await this.services.nillDB.init(seed);
      
      if (event.detail.documentId != undefined) {
        await this.services.nillDB.update(event.detail.answers, surveyId, event.detail.documentId);
      } else {
        await this.services.nillDB.store(event.detail.answers, surveyId);
      }
    });
  }
}