// src/controllers/landing.controller.ts


import '../components/create-survey-form.js';
import '../components/survey-config-form.js';
import { createSessionSignatures } from '../lit.ctrlr.js';
import { PinataService } from '../pinata.service.js';
import { store } from '../services/store.service.js';
import { reactive } from '../utils/reactive.js';

const BACKEND = "http://localhost:8080"; 


export class LandingController {
  private reactiveViews: any[] = [];
  pinata: any;

  constructor() {

    this.pinata = new PinataService(
      import.meta.env.VITE_PINATA_KEY,
      import.meta.env.VITE_PINATA_SECRET
    )
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
    console.log('Processing');

    await customElements.whenDefined('create-survey-form');
    const form = document.querySelector('create-survey-form');

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

        const capacityToken = import.meta.env.VITE_CAPACITY_TOKEN;
    
        const { sessionSig, signerAddress } = await createSessionSignatures(capacityToken)

        const surveyName = event.detail.config.title;

        const res = await this.pinata.uploadJSON(event.detail.config);

        const surveyCid = event.detail.formattedInput.surveyCid;

        if(surveyName) {

            console.log(surveyName, surveyCid)

            let res = await fetch(`${BACKEND}/api/create-survey`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', 
                },
                body: JSON.stringify({ 
                    sessionSig, 
                    signerAddress,
                    surveyName,
                    surveyCid
                })
            });

            console.log(res) 
        }
    });
  }
}