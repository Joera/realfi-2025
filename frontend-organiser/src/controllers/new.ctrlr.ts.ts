/// <reference types="vite/client" />


import { Batch, CardData } from '@s3ntiment/shared';
import { capabilityDelegation } from '../cap.js';
import '../components/draft-survey-editor.js';
import { createBatchWallet } from '../factories/invitation.factory.js';
import { createBatch, createInvitations, deploySafe} from '../factories/survey.factory.js';
import { IServices } from '../services/services.js';
import surveyStore from 's3ntiment-contracts/deployments/base/S3ntimentSurveyStore.json' assert { type: 'json' }


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

      // const authContext = this.services.lit.createAuthContext(await this.services.waap.getWalletClient(), capabilityDelegation, window.location.host);

       const safeAddress = import.meta.env.VITE_USE_SAFE == 'true' ? await this.services.safe.predictSafeAddress(surveyId) : "";
  
      const config = {
        safe: safeAddress,
        chainId: import.meta.env.VITE_L2 == 'base' ? 8543 : 1,
        litNetwork: import.meta.env.VITE_LIT_NETWORK
      }

      console.log(config)

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
          surveyConfig,
          smartAccountAddress: this.services.account.getAddress()
        })
      });

      const surveyCid = await res.text();
  
      for (let batch of survey.batches) {
        batch = await createBatch(this.services, batch, surveyId);
         console.log(JSON.stringify(batch.cards.map( (c: any ) => c.url)));
      }

      const args = [surveyId, surveyCid.toString(), survey.batches.map( (b: Batch) => b.id)];

      
      if(import.meta.env.VITE_USE_SAFE == 'true') {
        // check if combination owner + survey id was used before ! .. update pattern 

        const _safeAddress = await deploySafe(this.services, surveyId);
        console.log('deployed safe', safeAddress, _safeAddress)
        if (safeAddress != _safeAddress) { console.log('deployed wrong safe', safeAddress, _safeAddress); return; }
        await this.services.safe.connectToExistingSafe(safeAddress);
        const receipt = await this.services.safe.write(surveyStore.address, surveyStore.abi, 'createSurvey', args, { waitForReceipt: true});
        console.log(receipt);
      } else {
        const receipt = await this.services.account.write(surveyStore.address, surveyStore.abi, 'createSurvey', args, { waitForReceipt: true});
        console.log(receipt);
      }

      for (let batch of survey.batches) {
        batch = await createInvitations(batch);
       
      }
    });
  }
}