// src/controllers/landing.controller.ts


import '../components/create-survey-form.js';
import '../components/survey-config-form.js';
import LITCtrlr from '../lit.ctrlr.js';
import { PinataService } from '../pinata.service.js';
import { PermissionlessSafeService } from '../services/permissionless.safe.service.js';
import { store } from '../services/store.service.js';
import { ViemService } from '../services/viem.service.js';
import { reactive } from '../utils/reactive.js';
import slugify  from 'slugify';

const BACKEND = "http://localhost:8080"; 


export class LandingController {
  private reactiveViews: any[] = [];
  pinata: any;
  lit: any;
  safe: any;
  viem: any;

  constructor() {

    this.pinata = new PinataService(
      import.meta.env.VITE_PINATA_KEY,
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

        const surveySlug = slugify(event.detail.config.title);

        const surveyCid = (await this.pinata.uploadJSON(event.detail.config)).IpfsHash;

        if(surveySlug) {

            console.log(surveySlug, surveyCid)

            const { sessionSig, signerAddress } = await this.lit.createSessionSignatures() 

            let res: any  = await fetch(`${BACKEND}/api/create-survey`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', 
                },
                body: JSON.stringify({ 
                    sessionSig, 
                    signerAddress,
                    surveySlug,
                    surveyCid
                })
            });

            console.log(res) 

            const { nilDid, encryptedNilKey} = res; 
            const contract = "0x6Ab10D4705041408b2ED049F12cc0606B735dF0e";
            const abi = [{"inputs":[{"internalType":"string","name":"surveyId","type":"string"},{"internalType":"string","name":"ipfsCid","type":"string"},{"internalType":"string","name":"didNil","type":"string"},{"internalType":"string","name":"encryptedNilKey","type":"string"}],"name":"createSurvey","outputs":[],"stateMutability":"nonpayable","type":"function"}]

            const args = [surveySlug, surveyCid, nilDid, encryptedNilKey]

            if (event.detail.config.multisig) {

              await this.safe.connectToFreshSafe('s3ntiment_survey_' + surveySlug);
              await this.safe.updateSigner(import.meta.env.VITE_ETHEREUM_PRIVATE_KEY)
           
              const tx = await this.safe.genericTx(contract, abi, 'createSurvey', args, false, false )

              console.log(tx)

            } else {

              const receipt = this.viem.genericTx(contract, abi, 'createSurvey', args)
              console.log(receipt)
            }
            

            // hoe ingewikkeld is het om consensus te krijgen voor inzien resultaten??
            //  Het lit-eip-7579-module repo van Lit zelf demonstreert precies deze integratie.

            // fund nilKey, pkp ? 

            // how to keep track of my surveys ? zonder frontend 
        }
    });
  }
}