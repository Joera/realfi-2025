// src/controllers/landing.controller.ts


import { bytesToHex } from 'viem';
import '../components/register-flow.js';
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
      <div id="landing-content" class="centered"></div>
    `;

    const view = reactive('#landing-content', () => {
      const { landingStep } = store.ui;

      switch (landingStep) {
        case 'register':
          return `
            <register-flow class="centered"></register-flow>
          `;
        
        default:
          return '';
      }
    });

    if (view) {
      view.bind('ui');
      this.reactiveViews.push(view);
    }

    this.setButtonListener();
  }


  async process() {

    
   
    // @ts-ignore
    // const signer = await this.lit.init(import.meta.env.VITE_ETHEREUM_PRIVATE_KEY); 

    // console.log("initialized lit with ", signer)

    // await customElements.whenDefined('survey-config-form');
    // const form = document.querySelector('survey-config-form');

    // if (form) {

    //     this.setListeners();

    //}


      

  }

  async setButtonListener() {
        
    document.addEventListener('ready-to-login', async (event: any) => {

        const { walletClient, address } = await this.services.waap.login();

        if (walletClient && address) {

          console.log("logged in")

        }

    });

  }

  async render() {
    this.renderTemplate();
    this.process();
  }

  destroy() {
    this.reactiveViews.forEach(view => view.destroy());
    this.reactiveViews = [];
  }

  async setListeners() {
        
 

  }
}