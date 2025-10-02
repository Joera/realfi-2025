import './styles/main.scss';
import { CardData, parseCardURL } from "./card.factory.js"
import { promptDeviceAuthentication } from './webauthn.factory.js'
import './security-questions.js'
import { createKey } from './oprf.factory.js';
import { PermissionlessSafeService } from './permissionless.safe.service';
import { decimalToHex } from './utils.factory';

let currentStep: 'questions' | 'wallet-creation' | 'complete' = 'questions'


const showStep = (step: typeof currentStep) => {
  // Hide all components
  document.querySelectorAll('[data-step]').forEach(el => {
    (el as HTMLElement).style.display = 'none'
  })
  
  // Show current step
  const element = document.querySelector(`[data-step="${step}"]`)
  if (element) {
    (element as HTMLElement).style.display = 'block'
  }
}

const main = async () => {


    const card: CardData | null = parseCardURL();
    const baseSepolia = new PermissionlessSafeService(84532)

    if(card) {

        console.log(card);

        const storedSecret = localStorage.getItem('cardSecret')
        const storedBatchId = localStorage.getItem('batchId')

        if(storedSecret != undefined && storedSecret != card.secret) {
            alert("You have already used this phone with another card")
        }

        localStorage.setItem('cardSecret', card.secret)
        localStorage.setItem('batchId', card.batchId)

        await customElements.whenDefined('security-questions-form');

        const form = document.querySelector('security-questions-form');
        
        if(form) {
    
            form.addEventListener('security-questions-complete',  async (e: any) => {
                const { answers, formattedInput } = e.detail
                console.log('Ready for Human Network:', formattedInput)
                const key = await createKey(card.secret + '|' + formattedInput)
                console.log("key", key)
                currentStep = 'wallet-creation'
                showStep(currentStep);
                let hexKey = decimalToHex(key)
                baseSepolia.updateSigner(hexKey);
                const evmSafeAddress = await baseSepolia.connectToFreshSafe(storedBatchId ? storedBatchId : card.batchId);
                console.log(evmSafeAddress)
                const el  = document.getElementById("safe-address")
                el!.innerText = evmSafeAddress

            })
        }


    }
                

}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main)
} else {
    main()
}