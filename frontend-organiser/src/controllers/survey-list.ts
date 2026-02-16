
import { accsForSurveyOwner } from "../accs.js";
import { IServices } from "../services/container.js";
import { store } from "../state/store.js";
import { reactive } from "../utils/reactive.js";
import '../components/survey-results-list.js';
import { isCid, isDid } from "../utils/regex.js";

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
        console.log("useraddress", userAddress)

        // who owns the surveys now/   signer or safe? 
        const _surveys = await this.services.viem.readSurveyContract('getOwnerSurveys',[userAddress]);

        const authContext = await this.services.lit.createAuthContext(this.services.waap.getWalletClient());
        console.log(authContext.account.address)
        
        let surveys = await Promise.all(
            _surveys.map(async (surveyId: string) => {
                let s = await this.services.viem.readSurveyContract('getSurvey', [surveyId]);
                let d = {}

                if (isCid(s[0])) {

                  // console.log(s);
                  let c = JSON.parse(await this.services.ipfs.fetchFromPinata(s[0]));
                
                  // console.log(c);

                  if (isDid(c.nilDid) && c.nilDid == 'did:key:zQ3shdyNAT2kcfnxUMzta3zwhTRbQ5krcBRay2GfTRd3w9cgG') {

                    console.log("sid", surveyId)


                    const accs = accsForSurveyOwner(surveyId);

                    console.log(c.surveyConfig)
                    
                    try {
                      d = await this.services.lit.decrypt(c.surveyConfig, authContext, accs);
                      console.log("decrypted", c.collectionID || c.collectioniD)
                    } catch (error){
                        console.log(error);
                    }
                  }

                  return {
                    id: surveyId,
                    createdAt: s[2],
                    collectionID: c.collectionID || c.collectioniD,
                    ...d
                  }
                }
            })
        );

        // surveys = surveys.filter( s => s.groups != undefined && s.groups.length > 0);

        // console.log("SS", surveys);

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