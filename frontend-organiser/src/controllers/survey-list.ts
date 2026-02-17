
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

                if (isCid(s[0]) && surveyId == "b51b3ebc-b278-47c3-a66e-6e5e58d77a35") {

                    // const encData = await this.services.lit.encrypt("kippenkoppen", alwaysTrue);

                  const encData = {
                    ciphertext: 'tI9fSD69/08FL3TvLhj+Dz7BMkXIViKWNvYSEsGRj/9b4fDulCsOP/XR2ga2BOsyaQ0C1OLX1eQ1ZM6/nS2o24vwDvS5NHD8MuPjovwcSlIgCQOVrkZYkA1ljK0q+WA4Tvh6AQtWtMNk88PXIvtDQ/gC',
                    dataToEncryptHash: 'df46219531cb5d522d0845901978dccfa286a5b0437f4f9cd4e485064f6b632c',
                    metadata: { dataType: 'string' }

                        
                  }

                  const accs = accsForOwnerOrUser(surveyId, import.meta.env.VITE_SURVEYSTORE_CONTRACT);

                  console.log(accs);

                  const data = await this.services.lit.decrypt(encData, authContext, accs);
                  console.log(data)

               
        //           let c = JSON.parse(await this.services.ipfs.fetchFromPinata(s[0]));
                
        //           console.log(c);
                  

        //           if (isDid(c.nilDid) && c.surveyId !== undefined) {

        //             // console.log("sid", surveyId)


        //             const accs = alwaysTrue; // accsForOwnerOrUser(surveyId, import.meta.env.VITE_SURVEYSTORE_CONTRACT);



               

                    
        //             try {
        //               d = await this.services.lit.decrypt(sc, authContext, accs);
        //               console.log("decrypted", c.collectionID || c.collectioniD)
        //             } catch (error){
        //                 console.log(error);
        //             }
        //           }

        //           return {
        //             id: surveyId,
        //             createdAt: s[2],
        //             collectionID: c.collectionID || c.collectioniD,
        //             ...d
        //           }
                }
            })
        );

        // surveys = surveys.filter( s => s.groups != undefined && s.groups.length > 0);

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