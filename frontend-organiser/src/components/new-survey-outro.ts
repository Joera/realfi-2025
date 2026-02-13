import { typograhyStyles } from '../styles/shared-typograhy-styles.js'
import { colourStyles } from '../styles/shared-colour-styles.js'
import { buttonStyles } from '../styles/shared-button-styles.js'
import { store } from '../state/store.js'

class NewSurveyFormOutro extends HTMLElement {
    private questions: any[] = []

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, colourStyles, buttonStyles]
    }

    connectedCallback() {
        this.render()
        this.attachEventListeners()
    }

    private render() {
        if (!this.shadowRoot) return

        this.shadowRoot.innerHTML = `
        <style>


            :host {
                --green: rgb(42.9834254144, 112.6165745856, 98.0022099448)
            }


            .form-container {
                padding: 1.5rem;
                width: 100%;
            }

            input[type="text"],
            textarea,
            select {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #fff;
                border-radius: 8px;
                font-size: 1rem;
                font-family: inherit;
                transition: border-color 0.2s;
                box-sizing: border-box;
                margin-bottom: 1rem;
            }

            input[type="text"]:focus,
            textarea:focus,
            select:focus {
                outline: none;
                border-color: var(--green);
            }

    

            .form-actions {
                display: flex;
                gap: 1rem;
                margin-top: 2rem;
            }

        </style>

        <div class="form-container">

            <div>
               <label for="batch-name">Batch name:</label>
                <input id="batch-name" type="text" placeholder="Enter a name for the batch" required />
                <label for="batch-size">Nr of invitations:</label>
                <input id="batch-size" type="text" placeholder="Enter number of invitations" required />
            </div>

            <div class="form-actions">
                <button class="btn-secondary" id="back-btn">< Back</button>
                <button class="btn-primary" id="create-survey">Create survey</button>
            </div>

        </div>
        `
    }

    private attachEventListeners() {

        this.shadowRoot?.querySelector('#back-btn')?.addEventListener('click', () => {
            // this.saveDraft()
            store.setUI({ newStep: 'questions' })
        })
     
        const downloadBtn = this.shadowRoot?.querySelector('#create-survey')
        downloadBtn?.addEventListener('click', () => this.generateJSON())
    }


    private generateJSON() {

        const batchSize = (this.shadowRoot?.querySelector('#batch-size') as HTMLTextAreaElement)?.value

        // store.updateSurveyDraft({ batchSize})

   
        this.dispatchEvent(new CustomEvent('survey-config-generated', {
            detail: { batchSize },
            bubbles: true,
            composed: true
        }))
    }

}

customElements.define('new-survey-form-outro', NewSurveyFormOutro)

export { NewSurveyFormOutro }