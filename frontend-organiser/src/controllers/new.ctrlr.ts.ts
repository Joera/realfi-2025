/// <reference types="vite/client" />


import { Batch, Survey } from '@s3ntiment/shared';
import '../components/draft-survey-editor.js';
import { createBatch, createInvitations } from '../factories/survey.factory.js';
import { IServices } from '../services/services.js';
import surveyStore from 's3ntiment-contracts/deployments/base/S3ntimentSurveyStore.json' assert { type: 'json' }
import { authenticate } from '../factories/auth.factory.js';
import { store } from '../state/store.js';
import { router } from '../router.js';

const BACKENDURL = import.meta.env.VITE_PROD ? import.meta.env.VITE_BACKEND_PROD : import.meta.env.VITE_BACKEND_DEV;

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
      const poolId = survey.pool ?? crypto.randomUUID();
      const isNewPool = !survey.pool;
      let safeAddress; 
      if (isNewPool) {
        safeAddress = await this.services.safe.connectToFreshSafe(poolId);
      } else {
          const pool = store.getPool(poolId);
          safeAddress = pool!.safeAddress;
          await this.services.safe.connectToExistingSafe(safeAddress);
      }

      console.log("safeAddress", safeAddress)
  
      const config = {
        safe: safeAddress,
        chainId: import.meta.env.VITE_L2 == 'base' ? 8543 : 1,
        litNetwork: import.meta.env.VITE_LIT_NETWORK
      }

      const surveyConfig: Survey =  {
            id: surveyId,
            title: survey.title,
            pool: poolId,
            introduction: survey.introduction,
            groups: survey.groups,
            batches: survey.batches,
            config,
            // createdAt: BigInt(Math.floor(Date.now() / 1000))
          }

      console.log(surveyConfig)


      let res: any = await fetch(`${BACKENDURL}/api/surveys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({   
          surveyId,  
          poolId,
          surveyConfig,
          safeAddress
        })
      });

      const result = await res.json();

      console.log(result);

      if (this.services.ipfs.isCID(result.cid)) {

        let batchIds = [];

        if (isNewPool) {
  
          for (let batch of survey.batches) {
              batch = await createBatch(this.services, batch, poolId, surveyId);
              console.log(JSON.stringify(batch.cards.map((c: any) => c.url)));
          }

          batchIds = survey.batches.map((b: Batch) => b.id)
        }

        const args = [surveyId, poolId, result.cid.toString(), batchIds];

        const receipt = await this.services.safe.write(surveyStore.address, surveyStore.abi, 'createSurvey', args, { waitForReceipt: true });
        console.log(receipt);

        if (isNewPool) {
          for (let batch of survey.batches) {
            batch = await createInvitations(batch);
          }
        }

        store.addSurvey(surveyConfig);

        if (isNewPool) {
          store.addPool({
              id: poolId,
              name: surveyConfig.title ?? poolId,
              safeAddress,
              batches: survey.batches,
              createdAt: Math.floor(Date.now() / 1000)
          });
        }

        router.navigate("/surveys")
      }
    });
  }
}