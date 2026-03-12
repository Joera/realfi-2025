
import { router } from "../router.js";
import { IServices } from "../services/services.js";

export class AccountController {
    private reactiveViews: any[] = [];
    services: IServices

    constructor(services: IServices) {

        this.services  = services;
    }

    private renderTemplate(userAddress: string) {

        const app = document.querySelector('#app');
        if (!app) return;
    
        app.innerHTML = `
          <div>Your s3ntiment address: ${userAddress}</div>
          <div><a href="/logout" data-navigo>Logout</a></div> 
        `;
    }
    
    
    async process() {

       
        
    
    }

    async render() {

        const userAddress = this.services.safe.getSignerAddress();

        this.renderTemplate(userAddress);
        this.process();
    }

    destroy() {
        this.reactiveViews.forEach(view => view.destroy());
        this.reactiveViews = [];
    }
}