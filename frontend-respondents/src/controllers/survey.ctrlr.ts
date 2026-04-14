import { reactive } from '../utils/reactive.js';
import '@s3ntiment/shared/components';

import '../components/survey-questions.js';
import { IServices } from '../services.js';
import surveyStore from 's3ntiment-contracts/deployments/base/S3ntimentSurveyStore.json' with { type: 'json' }
import { fetchAndDecryptSurveyWithRespondent, fetchNillionDelegation, getDecryptForRespondentAction, getDelegationAction, isScored, Survey, withRetry } from '@s3ntiment/shared';

import { store } from '../state';
import { createUserDataObject } from '@s3ntiment/shared'
import { router } from '../router.js';

const BACKENDURL = import.meta.env.VITE_PROD == "true" ? import.meta.env.VITE_BACKEND_PROD : import.meta.env.VITE_BACKEND_DEV;


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

  private renderLoading() {
    const app = document.querySelector('#app');
    if (!app) return;

    app.innerHTML = `
      <div id="survey-content" class="container centered">
        <loading-spinner color="rgb(32, 85, 74)" message="decrypting<br/>survey"></loading-spinner>
      </div>
    `;
  }

  private renderWarning(msg: string) {
    const app = document.querySelector('#app');
    if (!app) return;

    app.innerHTML = `
      <div id="survey-content" class="container centered">Decryption failed: <br/> ${msg}</div>
    `;
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

  async process() {}

  async render() {

    const surveyFromStore = store.getSurveyData(this.surveyId);

    if(surveyFromStore && surveyFromStore.pool) { 

      this.renderLoading();

      try {
        const survey = await fetchAndDecryptSurveyWithRespondent(
          this.services, surveyStore, this.surveyId, BACKENDURL
        );

        this.config = survey;
        survey.isScored = isScored(survey.groups);
        store.setSurveyData(this.surveyId, survey);
        store.persistSurveys();
        this.renderTemplate();
        this.setSurveyListener();

      } catch (e: any) {
        console.error('Failed to load survey:', e.message);
        this.renderWarning(e.message); // show the actual reason
      }
    }
        
    else {
      alert("survey and pool not found")
    }
  }

  destroy() {
    this.reactiveViews.forEach(view => view.destroy());
    this.reactiveViews = [];
  }

  async setSurveyListener() {

    document.addEventListener('survey-complete', async (event: any) => {
      console.log('Survey completed!');
      console.log('event:', event);

      console.log("FROM STORE", store.activeSurvey)

      const seed = await this.services.account.createNillDBSeed();
      await this.services.nillDB.init(seed);

      // new / update? 
      const docIUd = crypto.randomUUID();

      // replace with pool issued lit action 
      const signature = await this.services.account.signMessage(`s3ntiment:submit:${this.surveyId}`);

      const params = { 
        pkpId: this.config?.config?.pkpId,
        pkpDid: this.config?.config?.pkpDid,
        userDid: this.services.nillDB.userDidString,
        builderDelegation: this.config?.config?.delegation
      }

      const userDelegationResult: any = await this.services.lit.executeAction(this.config?.pool!, getDelegationAction, params)
      const userDelegation = userDelegationResult.response.delegation;

      console.log(userDelegation)

      const result = await this.services.nillDB.storeOwned(docIUd, this.config!, event.detail.answers, this.surveyId, userDelegation)


      console.log(result)

      if (result.ok) {

        router.navigate(`complete/${this.surveyId}/${docIUd}`)

      } else {  

        // let r = result;

        // if (r.error == "UNAUTHORISED") {
        //   console.log("isValidSignature", r.isValidSignature)
        //   console.log("isRespondent", r.isRespondent)
        // } else {
        //   console.log("other error - network?")
        // }

      }

      // FLOW AS DESIGNED FOR OWNED COLLECTIONS
      // const delegationToken = await this.services.nillDB.getUserDelegationToken("", this.surveyId, BACKENDURL);

      // if (event.detail.documentId != undefined) {
      //   await this.services.nillDB.updateOwned(this.config!, event.detail.answers, this.surveyId, delegationToken, event.detail.documentId);
      // } else {
      //   await this.services.nillDB.storeOwned(this.config!, event.detail.answers, this.surveyId, delegationToken);
      // }
    });
  }
}