// src/controllers/landing.controller.ts


import '../components/create-survey-form.js';
import { createSessionSignatures } from '../lit.ctrlr.js';
import { store } from '../services/store.service.js';
import { reactive } from '../utils/reactive.js';

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

        // console.log('form completed!');
        // console.log('event:', event);
    
        const { sessionSig, signerAddress } = await createSessionSignatures()

        const surveyName = event.detail.formattedInput.surveyName;

        if(surveyName) {

            console.log(surveyName)

            await fetch('/api/create-survey', {
                method: 'POST',
                body: JSON.stringify({ 
                    sessionSig, 
                    signerAddress,
                    surveyName,
                    surveyCid: "bafy",
                })
            });
        }
    });
  }
}