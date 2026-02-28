import { reactive } from '../utils/reactive.js';

import '../components/loading-spinner.js';
import '../components/survey-questions.js';
import { IServices } from '../services.js';
import surveyStore from 's3ntiment-contracts/deployments/base/S3ntimentSurveyStore.json' with { type: 'json' }
import { fetchAndDecryptSurvey, Survey } from '@s3ntiment/shared';
import { capabilityDelegation } from '../cap.js';
import { surveysStore } from '../state/surveys.store.js';

export class SurveyController {
  private reactiveViews: any[] = [];
  documentId: any;
  services: IServices;
  surveyId: string;
  config?: Survey;

  constructor(services: IServices, surveyId: string) {

    this.services = services;
    this.surveyId = surveyId;
  }


  private renderTemplate() {
    const app = document.querySelector('#app');
    if (!app) return;

    app.innerHTML = `
      <div id="survey-content" class="container"></div>
    `;

    const view = reactive('#survey-content', () => {
        return `<survey-questions class="container constainer-small" survey-id="${this.surveyId}"></survey-questions>`;
    });

    if (view) {
      view.bind(surveysStore);       
      this.reactiveViews.push(view);
    }
  }


  async process() {
    
  }

  async render() {

    const authContext = await this.services.lit.createAuthContext(this.services.waap.getWalletClient(), capabilityDelegation, window.location.host);
    const survey = await fetchAndDecryptSurvey(this.services, surveyStore, this.surveyId, authContext)
    this.config = survey;
    console.log("SURVEY", survey)
    surveysStore.setData(this.surveyId, survey)
    this.renderTemplate();
    this.setSurveyListener();
    
  }

  destroy() {
    this.reactiveViews.forEach(view => view.destroy());
    this.reactiveViews = [];
  }


  async setSurveyListener() {
    document.addEventListener('survey-complete', async (event: any) => {
      console.log('Survey completed!');
      console.log('event:', event);

      const seed = await this.services.waap.createNillDBSeed();
      await this.services.nillDB.init(seed);
          
      const delegationToken = await this.services.nillDB.getUserDelegationToken("", this.surveyId, import.meta.env.VITE_BACKEND);

      if (event.detail.documentId != undefined) {
        await this.services.nillDB.update(this.config!, event.detail.answers, this.surveyId, delegationToken, event.detail.documentId);
      } else {
        await this.services.nillDB.store(this.config!, event.detail.answers, this.surveyId, delegationToken);
      }
    });
  }
}