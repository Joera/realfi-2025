
import { IServices } from "../services/services.js";
import { reactive } from "../utils/reactive.js";
import '../components/pool-list.js';
import '../components/import-pool.js';
import '../components/survey-list.js';
import '../components/import-survey.js';
import '../components/access-request.js';
import { getPoolInfo } from "../factories/pool.factory.js";
import { store } from "../state/store.js";
import { router } from "../router.js";

export class OverviewController {
    private reactiveViews: any[] = [];
    services: IServices

    constructor(services: IServices) {

        this.services  = services;
    }

    private renderTemplate() {

        const app = document.querySelector('#app');
        if (!app) return;
    
        app.innerHTML = `
          <pool-list class="container centered"></pool-list>
          <div class="container container-large flex-row" style="margin-top:1.5rem; margin-bottom: 3rem;">
            <import-pool></import-pool>
          </div>
          <survey-list class="container centered"></survey-list>
          <div class="container container-large flex-row" style="margin-top:1.5rem; margin-bottom: 3rem;">
            <import-survey ></import-survey>
            <button id="btn-new" class="btn-primary">New</button>
          </div>
        `;
    }
    
    
    async process() {}

    async render() {
        
        this.renderTemplate();
        this.process();
        this.setListeners();
    }

    destroy() {
        this.reactiveViews.forEach(view => view.destroy());
        this.reactiveViews = [];
    }

    setListeners() {

        const button = document.getElementById("btn-new");

        console.log(onabort,button)

        button?.addEventListener('click', () => {
            console.log("NEW")
            router.navigate("/new")
        })

        document.addEventListener('access-request', async (e) => {
            const event = e as CustomEvent
            const { surveyId } = event.detail;
            console.log(surveyId);
        })

        document.addEventListener('import-pool', async (e) => {
            const event = e as CustomEvent
            const { poolId } = event.detail;
        
            // get infor from contract
            const pool = await getPoolInfo(this.services, poolId)
            store.addPool(pool)
        })
        

        document.addEventListener('import-survey', async (e) => {
            const event = e as CustomEvent
            const { surveyId } = event.detail;
            console.log(surveyId);
        })
        
    }
}