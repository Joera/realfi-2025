import { reactive } from '../utils/reactive.js';
import '@s3ntiment/shared/components';

import '../components/survey-questions.js';
import { IServices } from '../services.js';
import surveyStore from 's3ntiment-contracts/deployments/base/S3ntimentSurveyStore.json' with { type: 'json' }
import { fetchAndDecryptSurveyWithRespondent, Survey } from '@s3ntiment/shared';

import { store } from '../state';
import { createUserDataObject } from '@s3ntiment/shared'

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
      <div id="survey-content" class="container centered"></div>
    `;

    const view = reactive('#survey-content', () => {
        return `<survey-questions class="container container-small" survey-id="${this.surveyId}"></survey-questions>`;
    });

    if (view) {
      view.bind(store.surveys$);       
      this.reactiveViews.push(view);
    }
  }


  async process() {
    
  }

  async render() {


    const capabilityDelegation = await store.ensureCapabilityDelegation(
      import.meta.env.VITE_BACKEND,
      this.services.account
    );

    const authContext = await this.services.lit.createAuthContext(this.services.account.getSigner(), capabilityDelegation, window.location.host);
    const survey = await fetchAndDecryptSurveyWithRespondent(this.services, surveyStore, this.surveyId, authContext)
    this.config = survey;
    console.log("SURVEY", survey)
    store.setSurveyData(this.surveyId, survey)
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

      const seed = await this.services.account.createNillDBSeed();
      await this.services.nillDB.init(seed);

      const userData = createUserDataObject(crypto.randomUUID(), event.detail.answers, this.config!);
      const signature = await this.services.account.signMessage(`s3ntiment:submit:${this.surveyId}`);
      const s = this.services.account.getSignerAddress();

      const result = await this.services.nillDB.storeStandard(import.meta.env.VITE_BACKEND, this.surveyId, userData, signature, s!);
      console.log(result)
  

      // FLOW AS DESIGNED FOR OWNED COLLECTIONS    
      // const delegationToken = await this.services.nillDB.getUserDelegationToken("", this.surveyId, import.meta.env.VITE_BACKEND);

      // if (event.detail.documentId != undefined) {
      //   await this.services.nillDB.updateOwned(this.config!, event.detail.answers, this.surveyId, delegationToken, event.detail.documentId);
      // } else {
      //   await this.services.nillDB.storeOwned(this.config!, event.detail.answers, this.surveyId, delegationToken);
      // }
    });
  }
}