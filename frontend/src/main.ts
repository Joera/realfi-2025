import './styles/main.scss';
import { CardData, parseCardURL } from "./card.factory.js"
import { promptDeviceAuthentication } from './webauthn.factory.js'
import './security-questions.js'
import { createKey } from './oprf.factory.js';
import { PermissionlessSafeService } from './permissionless.safe.service';
import { decimalToHex } from './utils.factory';
import { cardValidatorAbi } from './abi.factory';
import { CosmosWalletService } from './cosmos.service';

let currentStep: 'questions' | 'wallet-creation' | 'complete' = 'questions';

const CARDVALIDATOR = "0x39b865Cbc7237888BC6FD58B9C256Eab39661f95"

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
    const evmChain = new PermissionlessSafeService(84532)
    const cosmos = new CosmosWalletService( {
        rpcEndpoint: import.meta.env.VITE_COSMOS_RPC_URL!,
        prefix: "cosmos",
        gasPrice: "0.025uatom"
    });

    if(card) {

        console.log(card);

        const storedNullifier = localStorage.getItem('nullifer')
        const storedBatchId = localStorage.getItem('batchId')

        const cardIsUsed = await evmChain.genericRead(CARDVALIDATOR, JSON.stringify(cardValidatorAbi), "isNullifierUsed", [card.nullifier, card.batchId]);
        const phoneIsUsed = (storedNullifier != undefined && storedNullifier != card.nullifier) ? true : false;
   
        console.log("isUsed", cardIsUsed) 
        console.log("phone is used", phoneIsUsed)
        
        if (cardIsUsed && card.nullifier == storedNullifier) {

            // you can view safe and surveys? 
            // sign txs with 2 control questions
        }
            
        else if (cardIsUsed && card.nullifier != storedNullifier) {
            alert("card was used on another phone")
        } 

        else if (!cardIsUsed && phoneIsUsed) {
            alert("another card has previosuly been used on this phone")

            // ask to clear ? 
        } 

        else {

            localStorage.setItem('cardSecret', card.nullifier)
            localStorage.setItem('batchId', card.batchId)

            await customElements.whenDefined('security-questions-form');

            const form = document.querySelector('security-questions-form');
        
            if(form) {
        
                form.addEventListener('security-questions-complete',  async (e: any) => {
                    const { answers, formattedInput } = e.detail
                    console.log('Ready for Human Network:', formattedInput)
                    const key = await createKey(card.nullifier + '|' + formattedInput)
                    console.log("key", key)
                    currentStep = 'wallet-creation'
                    showStep(currentStep);
                    let hexKey = decimalToHex(key)
                    await evmChain.updateSigner(hexKey);
                    await cosmos.initialize(hexKey);
                    const evmSafeAddress = await evmChain.connectToFreshSafe(storedBatchId ? storedBatchId : card.batchId);
                    console.log("predicted address",evmSafeAddress)
                    const txResponse = await evmChain.genericTx(CARDVALIDATOR , JSON.stringify(cardValidatorAbi), 'validateCard', [card.nullifier, card.signature, card.batchId], { waitForReceipt: true });
                    console.log(txResponse)
                    if (txResponse.receipt?.status === 'success') {
                        console.log('✅ safe deployment confirmed');
                        await evmChain.connectToExistingSafe(evmSafeAddress);
                        currentStep = 'complete'
                        showStep(currentStep);

                    } else {
                        alert('❌ card validation failed');
                
                    }
                })
            }
        }


    }
                

}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main)
} else {
    main()
}