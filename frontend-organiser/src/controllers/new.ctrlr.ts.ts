/// <reference types="vite/client" />


import { Batch, Survey } from '@s3ntiment/shared';
import '../components/draft-survey-editor.js';
import { createBatch } from '../factories/survey.factory.js';
import { IServices } from '../services/services.js';
import surveyStore from 's3ntiment-contracts/deployments/base/S3ntimentSurveyStore.json' assert { type: 'json' }
import { store } from '../state/store.js';
import { router } from '../router.js';

const BACKENDURL = import.meta.env.VITE_PROD == "true" ? import.meta.env.VITE_BACKEND_PROD : import.meta.env.VITE_BACKEND_DEV;

export class NewSurveyController {
  private reactiveViews: any[] = [];
  private services: IServices;

  constructor(services: IServices) {
    this.services = services;
   // this.handleSurveySubmit = this.handleSurveySubmit.bind(this);
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
    document.removeEventListener('survey-submit', this.handleSurveySubmit);
    this.reactiveViews.forEach(view => view.destroy());
    this.reactiveViews = [];
  }

  private handleSurveySubmit = async (event: any) => {


    store.setUI({ newStep: 'creating-pool' });

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

    let poolResponse: any = await fetch(`${BACKENDURL}/api/pools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({    
        poolId,
        safeAddress
      })
    });

    if (!poolResponse.ok) store.setUI({ newStep: 'error' });

    const { pkpId, pkpDid, groupId, delegation }  = await poolResponse.json();

    store.setUI({ newStep: 'creating-survey' });

    const config = {
      safe: safeAddress,
      pkpId,
      pkpDid,
      groupId,
      delegation,
      chainId: import.meta.env.VITE_L2 == 'base' ? 8453 : 1,
      litNetwork: import.meta.env.VITE_LIT_NETWORK
    }

    const surveyConfig: Survey =  {
      id: surveyId,
      title: survey.title,
      pool: poolId,
      introduction: survey.introduction,
      groups: survey.groups,
      batches: survey.batches,
      config
      // createdAt: BigInt(Math.floor(Date.now() / 1000))
    }

    console.log(surveyConfig)

    let surveyResponse: any = await fetch(`${BACKENDURL}/api/surveys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({  
        surveyConfig
      })
    });

    if (!surveyResponse.ok) store.setUI({ newStep: 'error' });

    const { cid }  = await surveyResponse.json();


    // run create survey in action 


    store.setUI({ newStep: 'creating-invites' });

    if (this.services.ipfs.isCID(cid)) {

      let batchIds = [];

      if (isNewPool) {
        survey.batches = await Promise.all(
          survey.batches.map((batch: Batch) => createBatch(this.services, batch, poolId, surveyId))
        );
        
        batchIds = survey.batches.map((b: Batch) => b.id);
      }

      const args = [surveyId, poolId, cid.toString(), batchIds];
      const res = await this.services.safe.write(surveyStore.address, surveyStore.abi, 'createSurvey', args, { waitForReceipt: true });
      
      // console.log(res);
      console.log("Survey created", survey)

      if (res.receipt?.status == "success") {

        // if (isNewPool) {
          // survey.batches = await Promise.all(
          //   survey.batches.map((batch: Batch) => createInvitations(batch))
          // );

        surveyConfig.batches = survey.batches;
        
        for (const batch of survey.batches) {
          store.addBatch(batch);
        }
        // }

        store.addSurvey(surveyConfig);

        if (isNewPool) {
          store.addPool({
                id: poolId,
                name: surveyConfig.title ?? poolId,
                safeAddress,
                batches: survey.batches.map( (b:any) => b.id),
                createdAt: Math.floor(Date.now() / 1000)
            });
        }

        console.log("ready")

        router.navigate(`/batch/${survey.batches[0].pool}/${survey.batches[0].id}`)
      }

      else {
        alert('create survey tx failed ' +  res.txHash)
        store.setUI({ newStep: 'error' });
      }
    }
  };

  async setSurveyListener() {
    document.addEventListener('survey-submit', this.handleSurveySubmit);
  }
}
