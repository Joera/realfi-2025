// src/controllers/landing.controller.ts

import { store } from '../services/store.service';
import { reactive } from '../utils/reactive';
import { CardData, parseCardURL } from "../card.factory"
import { createKey } from '../oprf.factory';
import { PermissionlessSafeService } from '../permissionless.safe.service';
import { decimalToHex } from '../utils.factory';
import { cardValidatorAbi } from '../abi.factory';
import { CosmosWalletService } from '../cosmos.service';
import '../security-questions.js'

const CARDVALIDATOR = "0x39b865Cbc7237888BC6FD58B9C256Eab39661f95"

export class LandingController {
  private reactiveViews: any[] = [];

  private renderTemplate() {
    const app = document.querySelector('#app');
    if (!app) return;

    app.innerHTML = `
      <div id="landing-content"></div>
    `;

    // Create reactive view that responds to UI state changes
    const view = reactive('#landing-content', () => {
      const { currentStep, isLoading } = store.ui;

      if (isLoading) {
        return `
          <div class="spinner">
            <span class="loader"></span>
          </div>
        `;
      }

      switch (currentStep) {
        case 'questions':
          return `<security-questions-form></security-questions-form>`;
        
        case 'wallet-creation':
          return `
            <div class="spinner">
              <span class="loader"></span>
              <p>Creating your wallet...</p>
            </div>
          `;
        
        case 'complete':
          return `
            <div class="success">
              <h2>Success!</h2>
              <p>Your wallet has been created.</p>
              <p>Safe Address: ${store.user.safeAddress || '...'}</p>
            </div>
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

  async render() {
    this.renderTemplate();
    
    const card: CardData | null = parseCardURL();
    const evmChain = new PermissionlessSafeService(84532)
    const cosmos = new CosmosWalletService({
      rpcEndpoint: import.meta.env.VITE_COSMOS_RPC_URL!,
      prefix: "cosmos",
      gasPrice: "0.025uatom"
    });

    if (card) {
      console.log(card);

      const cardIsUsed = await evmChain.genericRead(
        CARDVALIDATOR, 
        JSON.stringify(cardValidatorAbi), 
        "isNullifierUsed", 
        [card.nullifier, card.batchId]
      );
      
      const phoneIsUsed = store.user.nullifier && store.user.nullifier !== card.nullifier;
 
      if (cardIsUsed && card.nullifier === store.user.nullifier) {
        // Existing user
      }
      else if (cardIsUsed && card.nullifier !== store.user.nullifier) {
        alert("card was used on another phone")
      } 
      else if (!cardIsUsed && phoneIsUsed) {
        alert("another card has previously been used on this phone")
      } 
      else {
        // Store card data
        store.setUser({
          nullifier: card.nullifier,
          batchId: card.batchId
        });
        store.persistUser();

        await customElements.whenDefined('security-questions-form');
        const form = document.querySelector('security-questions-form');
    
        if (form) {
          form.addEventListener('security-questions-complete', async (e: any) => {
            const { formattedInput } = e.detail;
            
            // Update UI state
            store.setUI({ currentStep: 'wallet-creation', isLoading: true });
            
            try {
              const key = await createKey(card.nullifier + '|' + formattedInput);
              let hexKey = decimalToHex(key);
              
              await evmChain.updateSigner(hexKey);
              await cosmos.initialize(hexKey);
              
              const evmSafeAddress = await evmChain.connectToFreshSafe(
                store.user.batchId || card.batchId
              );
              
              const txResponse = await evmChain.genericTx(
                CARDVALIDATOR, 
                JSON.stringify(cardValidatorAbi), 
                'validateCard', 
                [card.nullifier, card.signature, card.batchId], 
                { waitForReceipt: true }
              );
              
              if (txResponse.receipt?.status === 'success') {
                await evmChain.connectToExistingSafe(evmSafeAddress);
                
                // Update store with success
                store.setUser({ safeAddress: evmSafeAddress });
                store.setUI({ currentStep: 'complete', isLoading: false });
              } else {
                alert('❌ card validation failed');
                store.setUI({ isLoading: false });
              }
            } catch (error) {
              console.error(error);
              alert('An error occurred');
              store.setUI({ currentStep: 'questions', isLoading: false });
            }
          });
        }
      }
    }
  }

  destroy() {
    // Clean up subscriptions when leaving the page
    this.reactiveViews.forEach(view => view.destroy());
    this.reactiveViews = [];
  }
}