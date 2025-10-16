
import { formStyles } from '../styles/shared-form-styles.js'
import { typograhyStyles } from '../styles/shared-typograhy-styles.js'
import { colourStyles } from '../styles/shared-colour-styles.js'
import { buttonStyles } from '../styles/shared-button-styles'
import { store } from '../services/store.service';


class CreateSurveyForm extends HTMLElement {

    private currentStep = 0
    previousDocument: any;

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, colourStyles, buttonStyles]
    }

    async connectedCallback() {
        
        this.render()
        this.attachEventListeners()
    }


    private render() {
        if (!this.shadowRoot) return

        this.shadowRoot.innerHTML = `
        <style>
            form {
                padding: 1.5rem;
                display: flex;
                flex-direction: column;

            }

            h1 {
            margin: 0 0 0.5rem 0;
            font-size: 1.75rem;
            font-weight: 700;
            color: #000;
            }

            @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
            }


            label {
            // display: flex;
            // flex-direction: row;
            // align-items: center;
            // padding: 1rem;
            // background: var(--bg-lightest);
            // cursor: pointer;
            // transition: all 0.2s;
            // border-radius: 12px;
                margin-bottom: .75rem;
            }

            label:hover {
            border-color: #6366f1;
            background: #f9fafb;
            }

            input[type="radio"],
            input[type="checkbox"] {
            margin-right: 0.75rem;
            width: 20px;
            height: 20px;
            cursor: pointer;
            }

            input[type="text"],
            textarea {
                width: 100%;
                padding: 1rem;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 1rem;
                font-family: inherit;
                transition: border-color 0.2s;
                box-sizing: border-box;
                margin-bottom: 1.5rem;
            }

            input[type="text"]:focus,
            textarea:focus {
            outline: none;
            border-color: #6366f1;
            }

            textarea {
            min-height: 120px;
            resize: vertical;
            }

            a {
            color: white;
            text-decoration: none;
            border-bottom: 1px solid white;
            }
            

        </style>

        <form id="create-survey-form">
            <label for="surveyName">Survey Name:</label>
            <input id="surveyName" name="surveyName" type="text" placeholder="Enter survey name" required />
            <input id="surveyCid" name="surveyCid" type="text" placeholder="Enter cid of survey config" required />
            <button type="submit" class="btn-primary" >Create Survey</button>
        </form>

            
        </div>
        `
    }

    attachEventListeners() {
        const form = this.shadowRoot?.querySelector('#create-survey-form');
        form?.addEventListener('submit', (e) => {
            e.preventDefault();

            const surveyNameInput = this.shadowRoot?.querySelector('#surveyName') as HTMLInputElement;
            const surveyName = surveyNameInput?.value;

            const surveyCidInput = this.shadowRoot?.querySelector('#surveyCid') as HTMLInputElement;
            const surveyCid = surveyCidInput?.value;

            // Emit custom event with data
            this.dispatchEvent(new CustomEvent('create-survey-form-submitted', {
            detail: {
                formattedInput: { surveyName, surveyCid }
            },
            bubbles: true, // important: allows it to bubble up to document or parent
            composed: true // allows it to cross shadow DOM boundaries
            }));
        });
    }
}


customElements.define('create-survey-form', CreateSurveyForm)

export { CreateSurveyForm }

