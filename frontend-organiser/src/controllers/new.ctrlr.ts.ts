/// <reference types="vite/client" />


import '../components/draft-survey-editor.js';
import { createZipFile, generateCardSecrets } from '../factories/invitation.factory.js';
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
      console.log("ready to submit", survey)

      const surveyId = crypto.randomUUID();

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
            batches: survey.batches
          }
        })
      });

      const surveyCid = await res.text();
      console.log(surveyCid);

      // check if combination owner + survey id was used before ! .. update pattern 

      // predict safe for survey 
      // await this.services.safe.connectToFreshSafe(surveyId);

      const abi = [{ "inputs": [{ "internalType": "string", "name": "surveyId", "type": "string" }, { "internalType": "string", "name": "ipfsCid", "type": "string" }], "name": "createSurvey", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];
      const args = [surveyId, surveyCid.toString()];

      // const receipt = await this.services.waap.write(import.meta.env.VITE_SURVEYSTORE_CONTRACT as any, abi, 'createSurvey', args, {});
      // console.log(receipt);

      for (const batch of survey.batches) {

          const cards: any[] = await generateCardSecrets(this.services.viem, batch.id, batch.amount, surveyId);

          if (batch.medium == 'zip-file') {

              await createZipFile(cards, surveyId)
          }
      }

      const test = await generateCardSecrets(this.services.viem, "test", 1, surveyId);

      console.log(test)
  
    });
  }
}