// src/controllers/landing.controller.ts


import { bytesToHex } from 'viem';
import '../components/survey-config-form.js';
import { generateCardSecrets } from '../services/invitation.factory.js';
import { store } from '../services/store.service.js';
import { randomBytes } from '../utils/random.js';
import { reactive } from '../utils/reactive.js';
import slugify  from 'slugify';
import { IServices } from '../services/container.js';

export class LandingController {
  private reactiveViews: any[] = [];
  private services: IServices;

  constructor(services: IServices) {

    this.services = services;
  }

  private renderTemplate() {
    const app = document.querySelector('#app');
    if (!app) return;

    app.innerHTML = `
      <div id="landing-content"></div>
    `;

    const view = reactive('#landing-content', () => {
      const { landingStep } = store.ui;

      switch (landingStep) {
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

      const randomHex = bytesToHex(randomBytes(4));
      const surveyId = `${this.services.viem.walletClient.account.address.slice(0,8)}${Date.now()}${randomHex}`; 

      const nillDid = this.services.nillion.getDid();
                    
      let res: any  = await fetch(`${import.meta.env.VITE_BACKEND}/api/create-survey`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json', 
          },
          body: JSON.stringify({ 
              authContext: {}, // await this.lit.createAuthContext(),
              signerAddress: this.services.lit.getAddress(),
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

      const receipt = await this.services.viem.writeContract(import.meta.env.VITE_SURVEYSTORE_CONTRACT, abi, 'createSurvey', args)
      console.log(receipt)

      const batchId = "original";
      // create qr codes 
      await generateCardSecrets(this.services.viem, batchId, event.detail.batchSize, surveyId);

      // include one qr code for testing .. excluded from not counted , no nullifier , batchid =test 
      const test = await generateCardSecrets(this.services.viem, "test", 1, surveyId);

      
      console.log(test)


            // }
            

            // hoe ingewikkeld is het om consensus te krijgen voor inzien resultaten??
            //  Het lit-eip-7579-module repo van Lit zelf demonstreert precies deze integratie.

            // fund nilKey, pkp ? 

            // how to keep track of my surveys ? zonder frontend 

    });
  }
}