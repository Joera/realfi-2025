// src/controllers/landing.controller.ts


import '../components/create-survey-form.js';
import { createSessionSignatures } from '../lit.ctrlr.js';
import { store } from '../services/store.service.js';
import { reactive } from '../utils/reactive.js';

const BACKEND = "http://localhost:8080"; 


export class LandingController {
  private reactiveViews: any[] = [];
  evmChain: any;
  cosmos: any;
  nillion: any;
  documentId: any;

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
    
            <create-survey-form></create-survey-form>
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
        
    
    document.addEventListener('create-survey-form-submitted', async (event: any) => {

        const capacityToken = import.meta.env.VITE_CAPACITY_TOKEN;
    
        const { sessionSig, signerAddress } = await createSessionSignatures(capacityToken)

        const surveyName = event.detail.formattedInput.surveyName;
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