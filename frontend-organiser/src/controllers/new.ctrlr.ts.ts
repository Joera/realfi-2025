/// <reference types="vite/client" />


import { Batch, Survey } from '@s3ntiment/shared';
import '../components/draft-survey-editor.js';
import { createBatch, createInvitations } from '../factories/survey.factory.js';
import { IServices } from '../services/services.js';
import surveyStore from 's3ntiment-contracts/deployments/base/S3ntimentSurveyStore.json' assert { type: 'json' }
import { authenticate } from '../factories/auth.factory.js';
import { store } from '../state/store.js';
import { router } from '../router.js';

export class NewSurveyController {
  private reactiveViews: any[] = [];
  private services: IServices;

  constructor(services: IServices) {
    this.services = services;
  }

  private renderTemplate() {
    const app = document.querySelector('#app');
    if (!app) return;

    app.innerHTML = `
      <div id="new-survey" class="container centered">
        <draft-survey-editor class="container centered"></draft-survey-editor>
      </div>
    `;

    this.setSurveyListener();
  }

  async process() {
    // @ts-ignore
 
  }

  async render() {
    this.renderTemplate();
    this.process();
  }

  destroy() {
    this.reactiveViews.forEach(view => view.destroy());
    this.reactiveViews = [];
  }

  async setSurveyListener() {

    document.addEventListener('survey-submit', async (event: any) => {
      const survey = event.detail.survey;
      console.log("ready to submit", survey)

      const surveyId = crypto.randomUUID();
      const safeAddress =  await this.services.safe.connectToFreshSafe(surveyId); 
      console.log("safeAddress", safeAddress)
  
      const config = {
        safe: safeAddress,
        chainId: import.meta.env.VITE_L2 == 'base' ? 8543 : 1,
        litNetwork: import.meta.env.VITE_LIT_NETWORK
      }

      console.log(config)

      const surveyConfig: Survey =  {
            id: surveyId,
            title: survey.title,
            introduction: survey.introduction,
            groups: survey.groups,
            batches: survey.batches,
            config,
            // createdAt: BigInt(Math.floor(Date.now() / 1000))
          }

      let res: any = await fetch(`${import.meta.env.VITE_BACKEND}/api/surveys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({   
          surveyId,      
          surveyConfig,
          safeAddress
        })
      });

      const surveyCid = await res.text();
  
      for (let batch of survey.batches) {
        batch = await createBatch(this.services, batch, surveyId);
         console.log(JSON.stringify(batch.cards.map( (c: any ) => c.url)));
      }

      const args = [surveyId, surveyCid.toString(), survey.batches.map( (b: Batch) => b.id)];

      const receipt = await this.services.safe.write(surveyStore.address, surveyStore.abi, 'createSurvey', args, { waitForReceipt: true});
      console.log(receipt);


      for (let batch of survey.batches) {
        batch = await createInvitations(batch);
      }

      store.addSurvey(surveyConfig);

      router.navigate("/surveys")
      
    });
  }
}