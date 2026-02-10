// src/controllers/landing.controller.ts


import { bytesToHex } from 'viem';
import '../components/survey-config-form.js';
import LITCtrlr from '../lit.ctrlr.js';
import { PinataService } from '../pinata.service.js';
import { generateCardSecrets } from '../services/invitation.factory.js';
import { PermissionlessSafeService } from '../services/permissionless.safe.service.js';
import { store } from '../services/store.service.js';
import { ViemService } from '../services/viem.service.js';
import { randomBytes } from '../utils/random.js';
import { reactive } from '../utils/reactive.js';
import slugify  from 'slugify';

const BACKEND = "http://localhost:8080"; 
const SURVEYSTORE = "0x4CAfD69E3D7a9c37beCbFaF3D3D5C542F7b5fF6c"


export class LandingController {
  private reactiveViews: any[] = [];
  pinata: any;
  lit: any;
  safe: any;
  viem: any;

  constructor() {

    this.pinata = new PinataService(
      // @ts-ignore
      import.meta.env.VITE_PINATA_KEY,
      // @ts-ignore
      import.meta.env.VITE_PINATA_SECRET
    )

    this.lit = new LITCtrlr();
    this.safe = new PermissionlessSafeService('base');
    this.viem = new ViemService('base')
  }

  private renderTemplate() {
    const app = document.querySelector('#app');
    if (!app) return;

    app.innerHTML = `
      <div id="landing-content"></div>
    `;

    const view = reactive('#landing-content', () => {
      const { currentStep } = store.ui;

      switch (currentStep) {
        case 'register':
          return `
            <survey-config-form></survey-config-form>
          `;
        
        default:
          return '';
      }
    });

    if (view) {
      view.bind('ui');
      this.reactiveViews.push(view);
    }
  }


  async process() {
   
    // @ts-ignore
    const signer = await this.lit.init(import.meta.env.VITE_ETHEREUM_PRIVATE_KEY); 

    console.log("initialized lit with ", signer)

    await customElements.whenDefined('survey-config-form');
    const form = document.querySelector('survey-config-form');

    if (form) {

        this.setSurveyListener();

    }
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
        
    
    document.addEventListener('survey-config-generated', async (event: any) => {

      // console.log(event.detail.config)

      const randomHex = bytesToHex(randomBytes(4));
      const surveyId = `${this.viem.walletClient.account.address.slice(0, 8)}${Date.now()}${randomHex}`; 

      let delegation: any  = await fetch(`${BACKEND}/api/request-delegation`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json', 
          },
          body: JSON.stringify({ 
              surveyId,
              requestorDid,
              signature,     
              message  
          })
      });
                           
      let res: any  = await fetch(`${BACKEND}/api/create-survey`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json', 
          },
          body: JSON.stringify({ 
              authContext: await this.lit.createAuthContext(),
              signerAddress: this.lit.getAddress(),
              surveyId,
              surveyConfig: event.detail.config
          })
      });

      const info = await res.json();

      console.log(info)

      // check if combination owner + survey title was used before ! 

     
      const abi = [{"inputs":[{"internalType":"string","name":"surveyId","type":"string"},{"internalType":"string","name":"ipfsCid","type":"string"}],"name":"createSurvey","outputs":[],"stateMutability":"nonpayable","type":"function"}]
      const args = [surveyId, info.surveyCid.toString()]



            // if (event.detail.multisig) {

              // await this.safe.connectToFreshSafe('s3ntiment_survey_' + surveySlug);
              // await this.safe.updateSigner(import.meta.env.VITE_ETHEREUM_PRIVATE_KEY)
           
              // const tx = await this.safe.genericTx(contract, abi, 'createSurvey', args, false, false )

              // console.log(tx)

            // } else {

      const receipt = await this.viem.genericTx(SURVEYSTORE, abi, 'createSurvey', args)
      console.log(receipt)

      const batchId = "original";
      // create qr codes 
      await generateCardSecrets(this.viem, batchId, event.detail.batchSize, surveyId);

      const test = await generateCardSecrets(this.viem, "test", 1, surveyId);

          // include one qr code for testing .. excluded from not counted , no nullifier , batchid =test 
      console.log(test)


            // }
            

            // hoe ingewikkeld is het om consensus te krijgen voor inzien resultaten??
            //  Het lit-eip-7579-module repo van Lit zelf demonstreert precies deze integratie.

            // fund nilKey, pkp ? 

            // how to keep track of my surveys ? zonder frontend 

    });
  }
}