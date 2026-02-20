/// <reference types="vite/client" />


import '../components/draft-survey-editor.js';
import { createBatch} from '../factories/survey.factory.js';
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

      const authContext = this.services.lit.createAuthContext(await this.services.waap.getWalletClient());

      // predict safe for survey 
      const safeAddress = ""; // await this.services.safe.connectToFreshSafe(surveyId);

      const config = {
        safe: safeAddress,
        chainId: import.meta.env.VITE_L2 == 'base' ? 8543 : 1,
        litNetwork: import.meta.env.VITE_LIT_NETWORK
      }

      const surveyConfig =  {
            id: surveyId,
            title: survey.title,
            introduction: survey.introduction,
            groups: survey.groups,
            batches: survey.batches,
            config
          }

      let res: any = await fetch(`${import.meta.env.VITE_BACKEND}/api/create-survey`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          authContext,         
          surveyConfig
        })
      });

      const surveyCid = await res.text();
      console.log(surveyCid);

      // check if combination owner + survey id was used before ! .. update pattern 

      const abi = [{ "inputs": [{ "internalType": "string", "name": "surveyId", "type": "string" }, { "internalType": "string", "name": "ipfsCid", "type": "string" }], "name": "createSurvey", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];
      const args = [surveyId, surveyCid.toString()];

      const receipt = await this.services.waap.write(import.meta.env.VITE_SURVEYSTORE_CONTRACT as any, abi, 'createSurvey', args, {});
      console.log(receipt);

      for (const batch of survey.batches) {

        await createBatch(this.services, batch, surveyId)

      }
  
    });
  }
}