
import { accsForSurveyOwner } from "../accs";
import { IServices } from "../services/container";
import { store } from "../state/store.js";
import { reactive } from "../utils/reactive";
import '../components/survey-results-list.js';

export class ResultsController {
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
          const { landingStep } = store.ui;
    
          switch (landingStep) {
            case 'register':
              return `
                <survey-results-list></survey-results-list>
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

        const userAddress = this.services.viem.getAddress();
        const _surveys = await this.services.viem.readSurveyContract('getOwnerSurveys',[userAddress]);
      

      //  const authContext = await this.services.lit.createAuthContext() // moet dit niet 
        
        const surveys = await Promise.all(
            _surveys.map(async (surveyId: string) => {
                let s = await this.services.viem.readSurveyContract('getSurvey', [surveyId]);
                let c = JSON.parse(await this.services.ipfs.fetchFromPinata(s[0]));
                const accs = accsForSurveyOwner(surveyId);
              //  let d = await this.services.lit.decrypt(c.surveyConfig,  authContext, accs)
                
                return {
              
                  id: surveyId,
                  createdAt: s[2],
                  collectionID: c.collectionID || c.collectioniD 
                }
            })
        );

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