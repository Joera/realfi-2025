// src/controllers/landing.controller.ts

// import '../components/landing-welcome.js';
import '../components/landing-register.js';
import '../components/landing-choice.js';
import { store } from '../services/store.service.js';
import { reactive } from '../utils/reactive.js';
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

      console.log("switch")

      switch (landingStep) {
        case 'welcome':
          return ``;
        
        case 'register':
          return `
            <landing-register class="centered"></landing-register>
          `;

        case 'choice':
          return `
            
            <landing-choice class="centered"></landing-choice>
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

    const ready = this.services.isInitialized()
  
    if(ready) {
      // happens too fast
      console.log("ADDR", this.services.waap.address)
      if (this.services.waap.address == undefined) {
        console.log(0)
        store.setUI({ landingStep: 'register'})
      } else {
        console.log(1)
        store.setUI({ landingStep: 'choice'})
      }
    }

    // console.log('2', await window.waap.request({ method: 'eth_requestAccounts' }))

    // console.log(address);

  
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