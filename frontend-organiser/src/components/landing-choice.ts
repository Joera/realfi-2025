import { typograhyStyles } from '../styles/shared-typograhy-styles.js'
import { colourStyles } from '../styles/shared-colour-styles.js'
import { buttonStyles } from '../styles/shared-button-styles.js'
import { store } from '../services/store.service.js'
import { router } from '../router.js';
import { layoutStyles } from '../styles/shared-layout-styles.js';

class LandingChoice extends HTMLElement {
    private unsubscribe?: () => void;
    private surveyId!: string;

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, colourStyles, buttonStyles, layoutStyles]
    }

    connectedCallback() {


        // Subscribe to store changes
        // this.unsubscribe = store.subscribe('surveys', (surveys) => {
        //     console.log("subscription comes in")
        //     this.render(surveys);
        // });

        // Initial render
        this.render();
    }

    disconnectedCallback() {
        // Cleanup if needed
         this.unsubscribe?.();
    }

    private render() {
        if (!this.shadowRoot) return;
        

        this.shadowRoot.innerHTML = `
        <style>
 
        </style>

        <div class="centered button-group">
            <button id="new-btn" class="btn-secondary">New</button>
            <button id="surveys-btn" class="btn-secondary">My surveys</button>
        </div>
        `;

        this.attachListeners()
    }


    private attachListeners() {
       
        this.shadowRoot?.querySelector('#new-btn')?.addEventListener('click', () => {
            
            router.navigate('new')
        });

        this.shadowRoot?.querySelector('#urveys-btn')?.addEventListener('click', () => {
            
            router.navigate('surveys')
        });

   
    }


}

customElements.define('landing-choice', LandingChoice)

export { LandingChoice }