
import { IServices } from "../services/services.js";
import { store } from "../state/store.js";
import { reactive } from "../utils/reactive.js";
import '../components/survey-results-list.js';
import { capabilityDelegation } from "../cap.js";
import surveyStore from 's3ntiment-contracts/deployments/base/S3ntimentSurveyStore.json' assert { type: 'json' }
import { fetchAndDecryptSurvey } from "@s3ntiment/shared";


export class SurveyListController {
    private reactiveViews: any[] = [];
    services: IServices

    constructor(services: IServices) {

        this.services  = services;

    }

    private renderTemplate() {
        const app = document.querySelector('#app');
        if (!app) return;
    
        app.innerHTML = `
          <div id="survey-results"></div>
        `;
    
        const view = reactive('#survey-results', () => {
          // const { landingStep } = store.ui;
    
          // switch (landingStep) {
          //   case 'register':
              return `
                <survey-results-list></survey-results-list>
              `;
            
          //   default:
          //     return '';
          // }
        });
    
        if (view) {
          view.bind('ui');
          this.reactiveViews.push(view);
        }
    }
    
    
    async process() {

        const accountAddress = this.services.account.getAddress();

        let _surveys = await this.services.viem.read(surveyStore.address as `0x${string}`, surveyStore.abi,'getOwnerSurveys',[accountAddress]);
        // _surveys = _surveys.filter( (s: string) => s == '3fd2377d-ba7d-4066-8401-efd89e1275c0');

        const authContext = await this.services.lit.createAuthContext(this.services.waap.getWalletClient(), capabilityDelegation, window.location.host);

        let surveys = await Promise.all(
            _surveys.map(async (surveyId: string) => {
               return await fetchAndDecryptSurvey(this.services, surveyStore, surveyId, authContext)
            })
        );

        surveys = surveys.filter( s => s != undefined);

        console.log("SS", surveys);

        store.setSurveys(surveys);

    }

    async render() {
        this.renderTemplate();
        this.process();
    }

    destroy() {
        this.reactiveViews.forEach(view => view.destroy());
        this.reactiveViews = [];
    }
}