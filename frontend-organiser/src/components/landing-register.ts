import { typograhyStyles } from '../styles/shared-typograhy-styles.js'
import { colourStyles } from '../styles/shared-colour-styles.js'
import { buttonStyles } from '../styles/shared-button-styles.js'
import { store } from '../state/store.js'
import { router } from '../router.js';
import { layoutStyles } from '../styles/shared-layout-styles.js';

class LandingRegister extends HTMLElement {
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
            <button id="login-btn" class="btn-primary">Login</button>
        </div>
        `;

        this.attachListeners()
    }


    private attachListeners() {
       
        this.shadowRoot?.querySelector('#login-btn')?.addEventListener('click', () => {
            
            this.dispatchEvent(new CustomEvent('ready-to-login', {
                detail: { },
                bubbles: true,
                composed: true
            }))
        });

   
    }


}

customElements.define('landing-register', LandingRegister)

export { LandingRegister }