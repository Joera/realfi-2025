// src/controllers/landing.controller.ts

import { store } from '../services/store.service';
import { reactive } from '../utils/reactive';
import { CardData, parseCardURL } from "../card.factory"
import { createKey } from '../oprf.factory';
import { PermissionlessSafeService } from '../services/permissionless.safe.service';
import { decimalToHex } from '../utils.factory';
import { cardValidatorAbi } from '../abi.factory';
import { CosmosWalletService } from '../services/cosmos.service';
import '../components/security-questions.js';
import '../components/loading-spinner.js';
import '../components/survey.js';
// import { NillionService } from '../services/nilldb.service';

const CARDVALIDATOR = "0x39b865Cbc7237888BC6FD58B9C256Eab39661f95"

export class LandingController {
  private reactiveViews: any[] = [];
  evmChain: any;
  cosmos: any;
  nillion: any;

  private renderTemplate() {
    const app = document.querySelector('#app');
    if (!app) return;

    app.innerHTML = `
      <div id="landing-content"></div>
    `;

    // Create reactive view that responds to UI state changes
    const view = reactive('#landing-content', () => {
      const { currentStep } = store.ui;

      // if (isLoading) {
      //   return `
      //     <div class="spinner">
      //       <span class="loader"></span>
      //     </div>
      //   `;
      // }

      switch (currentStep) {
        case 'onboarding':
          return `<security-questions-form></security-questions-form>`;
        
        case 'wallet-creation':
          return `
            <loading-spinner 
              message="Creating your account" 
              size="120" 
              color="#2d6b5e">
            </loading-spinner>
          `;
        
        case 'survey':
          return `
           <survey-questions></survey-questions>
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

  async process(card: any, fresh: boolean) {

        // Store card data
      
        console.log("fresh", fresh);

        await customElements.whenDefined('security-questions-form');
        const form = document.querySelector('security-questions-form');
    
        if (form) {
          form.addEventListener('security-questions-complete', async (e: any) => {
            const { formattedInput } = e.detail;

            // Get the security questions form element
            const securityForm = form as any; // Cast to access custom methods
            const selectedQuestions = securityForm.getSelectedQuestions();
            
            // Save the question IDs to store
            store.setUser({ questions: selectedQuestions });
            store.persistUser();
         
            // Update UI state
            store.setUI({ currentStep: 'wallet-creation' });
            
            try {
              const key = await createKey(card.nullifier + '|' + formattedInput);
              let hexKey = decimalToHex(key);

              const oldSigner = store.user.signerAddress;
              const signerAddress = await this.evmChain.updateSigner(hexKey);``
              console.log("signer", signerAddress)
              store.setUser( { signerAddress})
              store.persistUser();
              let nillionAddress = await this.cosmos.initialize(hexKey);
              store.setUser( { nillionAddress })
              // this.nillion = new NillionService(hexKey.slice(2)); 
              // await this.nillion.init();
              
              const evmSafeAddress = await this.evmChain.connectToFreshSafe(
                store.user.batchId || card.batchId
              );

              let success = false;

              if(fresh) {

                const txResponse = await this.evmChain.genericTx(
                  CARDVALIDATOR, 
                  JSON.stringify(cardValidatorAbi), 
                  'validateCard', 
                  [card.nullifier, card.signature, card.batchId], 
                  { waitForReceipt: true }
                );

                console.log(txResponse);
                if (txResponse.receipt?.status === 'success') {
                  success = true;
                } else {
                  alert('❌ card validation failed');
                }
              } else {

                  console.log(oldSigner,signerAddress)
                  if (oldSigner == signerAddress) {

                    success = true;
                    console.log("existing user authenticated")

                  } else {

                    alert("incorrect answers to auth existing user")
                  }
              }
              
              if(success) {
              
           
                await this.evmChain.connectToExistingSafe(evmSafeAddress);
                // console.log(2)
                
                // Update store with success
                store.setUser({ safeAddress: evmSafeAddress });
                store.setUI({ currentStep: 'survey' });
              } 
    
            } catch (error) {
              console.error(error);
              alert('An error occurred');
              store.setUI({ currentStep: 'onboarding' });
            }
          });
        }

  }

  async render() {
    this.renderTemplate();
    
    const card: CardData | null = parseCardURL();
    this.evmChain = new PermissionlessSafeService(84532);
   
    this.cosmos = new CosmosWalletService({
      rpcEndpoint: import.meta.env.VITE_COSMOS_RPC_URL!,
      prefix: "cosmos",
      gasPrice: "0.025uatom"
    });

    if (card) {
      console.log(card);

      const cardIsUsed = await this.evmChain.genericRead(
        CARDVALIDATOR, 
        JSON.stringify(cardValidatorAbi), 
        "isNullifierUsed", 
        [card.nullifier, card.batchId]
      );
      
      const phoneIsUsed = store.user.nullifier && store.user.nullifier !== card.nullifier;

      if (cardIsUsed && card.nullifier !== store.user.nullifier) {
        alert("card was used on another phone")
      } 
 
      else if (cardIsUsed && card.nullifier === store.user.nullifier) {

        const user = store.user;
        this.process({
          nullifier: user.nullifier,
          batchId: user.batchId,
        }, false)
      }

      else {

        if (!cardIsUsed && phoneIsUsed) {
            alert("another card was used on this phone. Click ok to continue")
            store.clear();
        }
        store.setUser({
          nullifier: card.nullifier,
          batchId: card.batchId
        });
        store.persistUser();
        this.process(card, true)
      }
      
    }
  }

  destroy() {
    // Clean up subscriptions when leaving the page
    this.reactiveViews.forEach(view => view.destroy());
    this.reactiveViews = [];
  }
}