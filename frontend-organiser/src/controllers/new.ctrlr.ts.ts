/// <reference types="vite/client" />

import { bytesToHex } from 'viem';
import '../components/draft-survey-editor.js';
import { generateCardSecrets } from '../services/invitation.factory.js';
import { store } from '../state/store.js';
import { randomBytes } from '../utils/random.js';
import { reactive } from '../utils/reactive.js';
import { IServices } from '../services/container.js';
import { randomUUID } from 'crypto';

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
        <draft-survey-editor class="container container-small centered"></draft-survey-editor>
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

      const surveyId = randomUUID();

      const nillDid = this.services.nillion.getDid();

      let res: any = await fetch(`${import.meta.env.VITE_BACKEND}/api/create-survey`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({          
          surveyConfig: {
            id: surveyId,
            title: survey.title,
            introduction: survey.introduction,
            groups: survey.groups,
          }
        })
      });

      const surveyCid = await res.text();
      console.log(surveyCid);

      // check if combination owner + survey id was used before ! .. update pattern 

      // predict safe for survey 
      await this.services.safe.connectToFreshSafe(surveyId)

      const abi = [{ "inputs": [{ "internalType": "string", "name": "surveyId", "type": "string" }, { "internalType": "string", "name": "ipfsCid", "type": "string" }], "name": "createSurvey", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];
      const args = [surveyId, surveyCid.toString()];

      // register survey and deploy safe 
      const receipt = await this.services.safe.write(import.meta.env.VITE_SURVEYSTORE_CONTRACT, JSON.stringify(abi), 'createSurvey', args, true, true);
      console.log(receipt);

      // const batchId = survey.batchName || "original";
      // const batchSize = parseInt(survey.batchSize) || 10;

      // // create qr codes 
      // await generateCardSecrets(this.services.viem, batchId, batchSize, surveyId);

      // // include one qr code for testing .. excluded from not counted, no nullifier, batchid=test 
      // const test = await generateCardSecrets(this.services.viem, "test", 1, surveyId);
      // console.log(test);

      // // Clear draft after successful submission
      // store.clearSurveyDraft();

      // Navigate back or show success
      // store.setUI({ ... })
    });
  }
}