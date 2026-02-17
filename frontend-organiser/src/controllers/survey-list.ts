
import { accsForOwnerOrUser, accsForSurveyOwner, alwaysTrue } from "../accs.js";
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

        const userAddress = this.services.waap.getAddress();
        console.log("useraddress", userAddress)

        // who owns the surveys now/   signer or safe? 
        const _surveys = await this.services.viem.readSurveyContract('getOwnerSurveys',[userAddress]);

        const authContext = await this.services.lit.createAuthContext(this.services.waap.getWalletClient(), this.services.viem.account);
        console.log("authcontext address", authContext.account.address)
        
        let surveys = await Promise.all(
            _surveys.map(async (surveyId: string) => {
                let s = await this.services.viem.readSurveyContract('getSurvey', [surveyId]);
                let d = {}

                if (isCid(s[0]) && surveyId == "ea859a4a-c6a2-44ab-ba92-b13bfa3e7d75") {

               
                  let c = JSON.parse(await this.services.ipfs.fetchFromPinata(s[0]));
                
                  console.log(c);
                  

                  if (isDid(c.nilDid) && c.surveyId !== undefined) {

                    // console.log("sid", surveyId)


                    const accs = alwaysTrue; // accsForOwnerOrUser(surveyId, import.meta.env.VITE_SURVEYSTORE_CONTRACT);

                    console.log(authContext)
                    console.log(JSON.stringify(accs, null, 2));


                    // console.log(c.surveyConfig)

                    const sc = {
                      ciphertext: 'r60gZAWYX1iZRd4FICHmKGXFLEJMr4YyiGxOY7kgRDsqG7dl5xfWyeYh8AvZrN65uUmy2EECw/T31nlczsEwDdKZPMNAMKn33r/yVaHlTDYgOjjoniSdJPM8FZFcM3vhnEuB3Y1eMep44ECLhfGG/xIC',
                      dataToEncryptHash: 'f7fedc1ce8904aa57054e7d1315d03ece5247b2c90a643b7264fabf10e4af177',
                      metadata: { dataType: 'string' }
                    }
                                      

                    
                    try {
                      d = await this.services.lit.decrypt(sc, authContext, accs);
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