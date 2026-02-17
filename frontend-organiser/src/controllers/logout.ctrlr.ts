
import { router } from "../router.js";
import { IServices } from "../services/container.js";

export class LogoutController {
    private reactiveViews: any[] = [];
    services: IServices

    constructor(services: IServices) {

        this.services  = services;

    }

    private renderTemplate() {
        const app = document.querySelector('#app');
        if (!app) return;
    
        app.innerHTML = `
          <div>goodbye!</div>
        `;
    }
    
    
    async process() {

        await this.services.waap.logout();
        router.navigate('/')
        
      
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