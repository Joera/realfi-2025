
import { accsForOwnerOrUser, accsForSurveyOwner, alwaysTrue } from "../accs.js";
import { IServices } from "../services/container.js";
import { store } from "../state/store.js";
import { reactive } from "../utils/reactive.js";
import '../components/survey-results-list.js';
import { isCid, isDid } from "../utils/regex.js";
import { fetchSurvey } from "../factories/survey.factory.js";

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

        const userAddress = this.services.waap.getAddress();
        console.log("useraddress", userAddress)

        // who owns the surveys now/   signer or safe? 
        const _surveys = await this.services.viem.readSurveyContract('getOwnerSurveys',[userAddress]);

        const authContext = await this.services.lit.createAuthContext(this.services.waap.getWalletClient());

        // console.log("AUTHCONTEXT",authContext)

        let surveys = await Promise.all(
            _surveys.map(async (surveyId: string) => {
               return await fetchSurvey(this.services, authContext, surveyId)
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