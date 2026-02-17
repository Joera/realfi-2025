/// <reference types="vite/client" />


import '../components/draft-survey-editor.js';
import { IServices } from '../services/container.js';

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

      const surveyId = crypto.randomUUID();

      const nillDid = this.services.nillion.getDid();

      const authContext = this.services.lit.createAuthContext(await this.services.waap.getWalletClient())

      let res: any = await fetch(`${import.meta.env.VITE_BACKEND}/api/create-survey`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          authContext,         
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
      await this.services.safe.connectToFreshSafe(surveyId);



      const abi = [{ "inputs": [{ "internalType": "string", "name": "surveyId", "type": "string" }, { "internalType": "string", "name": "ipfsCid", "type": "string" }], "name": "createSurvey", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];
      const args = [surveyId, surveyCid.toString()];

      // register survey and deploy safe 
      // const receipt = await this.services.safe.writeWithWaapSigning(import.meta.env.VITE_SURVEYSTORE_CONTRACT, JSON.stringify(abi), 'createSurvey', args);
      // console.log(receipt);

      const receipt = await this.services.waap.write(import.meta.env.VITE_SURVEYSTORE_CONTRACT as any, abi, 'createSurvey', args, {});
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