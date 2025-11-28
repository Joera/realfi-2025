// src/controllers/landing.controller.ts

import { store } from '../services/store.service';
import { reactive } from '../utils/reactive';
import { CardData, parseCardURL } from "../card.factory"
import { createKey } from '../oprf.factory';
import { PermissionlessSafeService } from '../services/permissionless.safe.service';
import { decimalToHex } from '../utils.factory';
import { cardValidatorAbi } from '../abi.factory';
import '../components/security-questions.js';
import '../components/loading-spinner.js';
import '../components/survey.js';
import { NillionService } from '../services/nilldb.service';
import { surveyStoreAbi } from '../abi';
import { fromPinata } from '../ipfs.factory';

const CARDVALIDATOR = "0x39b865Cbc7237888BC6FD58B9C256Eab39661f95";
const SURVEYSTORE = "0x1FaC59fBD1d4eb6EA268894F5AFE81E3219a28EC"

// Card usage states
export enum CardUsageState {
  FIRST_TIME = 'first-time',
  RETURNING_SAME_CARD = 'returning',
  NEW_CARD_SAME_PHONE = 'new-card',
  CARD_USED_ELSEWHERE = 'card-conflict'
}

export interface CardUsageContext {
  state: CardUsageState;
  requiresValidation: boolean;
  requiresAuth: boolean;
  message?: string;
}

export class LandingController {
  private reactiveViews: any[] = [];
  evmChain: any;
  nillion: any;
  documentId: any;

  private detectCardUsageState(card: CardData, cardIsUsed: boolean): CardUsageContext {
    const storedNullifier = store.user.nullifier;
    
    if (cardIsUsed && card.nullifier !== storedNullifier) {
      return {
        state: CardUsageState.CARD_USED_ELSEWHERE,
        requiresValidation: false,
        requiresAuth: false,
        message: "This card was used on another phone"
      };
    }
    
    if (cardIsUsed && card.nullifier === storedNullifier) {
      return {
        state: CardUsageState.RETURNING_SAME_CARD,
        requiresValidation: false,
        requiresAuth: true,
        message: "Welcome back! Please verify your security questions"
      };
    }
    
    if (!cardIsUsed && storedNullifier && storedNullifier !== card.nullifier) {
      return {
        state: CardUsageState.NEW_CARD_SAME_PHONE,
        requiresValidation: true,
        requiresAuth: false,
        message: "New card detected. Your previous data will be cleared."
      };
    }
    
    return {
      state: CardUsageState.FIRST_TIME,
      requiresValidation: true,
      requiresAuth: false,
      message: "Welcome! Let's set up your account"
    };
  }

  private renderTemplate(config: string | undefined, slug: string | undefined) {
    const app = document.querySelector('#app');
    if (!app) return;

    app.innerHTML = `
      <div id="landing-content"></div>
    `;

    const view = reactive('#landing-content', () => {
      const { currentStep, cardUsageState } = store.ui;

      switch (currentStep) {
        case 'nocard':
          return `
          <div class="onboarding-message returning">
            <h2>Sorry</h2>
            <p>You need the link from a unique card or QR code to participate in the survey. RealFi Hack judges may find a few QR codes in the project materials (github repo -> qrs-to-demo). Please be aware that those codes are unique and may have been used by someone else. Try until you find one that still works.</p>
          </div>
            
          `;
        case 'onboarding':
          return `
            ${this.renderOnboardingMessage(cardUsageState)}
            <security-questions-form></security-questions-form>
          `;
        
        case 'wallet-creation':
          return `
            <loading-spinner 
              message="Creating your account" 
              size="120" 
              color="#2b7062">
            </loading-spinner>
          `;
        
        case 'survey':
          return `<survey-questions config=${config} slug=${slug}></survey-questions>`;
        
        default:
          return '';
      }
    });

    if (view) {
      view.bind('ui');
      this.reactiveViews.push(view);
    }
  }

  private renderOnboardingMessage(state: CardUsageState | undefined): string {
    switch (state) {
      
      case CardUsageState.RETURNING_SAME_CARD:
        return `
          <div class="onboarding-message returning">
            <h2>Welcome back</h2>
            <p>Please answer your security question to connect your wallet.</p>
          </div>
        `;
      
      case CardUsageState.FIRST_TIME:
        return `
          <div class="onboarding-message first-time">
            <h2>Welcome</h2>
            <p>You're about to fill out an anonymous survey. 
            To keep your answers private, a wallet will be created for you 
            using the ID from your card and your answer to one security question. 
            Just pick a question and we'll handle the rest.</p>
          </div>
        `;
      // USING THE LOCAL STORAGE AS PROTECTION IS BS
      // IT SHOULDNT MATTER WHAT CARD YOU BRING
      // THERE IS JUST NEW CARD AND USED CARD 
      case CardUsageState.NEW_CARD_SAME_PHONE:
        return `
          <div class="onboarding-message new-card">
            <h2>New card detected</h2>
            <p>Set up a new security question for this card.</p>
          </div>
        `;
      
      default:
        return `
          <div class="onboarding-message">
            <h2>Account setup</h2>
            <p>Choose a security question to get started.</p>
          </div>
        `;
    }
  }

  async process(card: any, context: CardUsageContext) {
    console.log('Processing with context:', context);

    // Store context in UI state for reactive rendering
    store.setUI({ cardUsageState: context.state });

    await customElements.whenDefined('security-questions-form');
    const form = document.querySelector('security-questions-form');

    if (form) {
      form.addEventListener('security-questions-complete', async (e: any) => {
        const { formattedInput } = e.detail;

        const securityForm = form as any;
        const selectedQuestions = securityForm.getSelectedQuestions();
        
        store.setUser({ questions: selectedQuestions });
        store.persistUser();
     
        store.setUI({ currentStep: 'wallet-creation' });
        
        try {
          const key = await createKey(card.nullifier + '|' + formattedInput);
          let hexKey = decimalToHex(key);

          const oldSigner = store.user.signerAddress;
          const signerAddress = await this.evmChain.updateSigner(hexKey);
          console.log("signer", signerAddress);
          
          store.setUser({ signerAddress });
          store.persistUser();
          
          this.nillion = new NillionService(hexKey.slice(2)); 
          await this.nillion.init();
          store.setService('nillion', this.nillion); // Store it
          
          const evmSafeAddress = await this.evmChain.connectToFreshSafe(
            store.user.batchId || card.batchId
          );

          let success = false;

          if (context.requiresValidation) {
            console.log('🔐 Validating card on-chain...');
            // success = true;
            
            const txResponse = await this.evmChain.genericTx(
              CARDVALIDATOR, 
              JSON.stringify(cardValidatorAbi), 
              'validateCard', 
              [card.nullifier, card.signature, card.batchId], 
              { waitForReceipt: true }
            );

            if (txResponse.receipt?.status === 'success') {
              success = true;
              console.log('✅ Card validated');
            } else {
              alert('❌ Card validation failed');
            }
          } 
          else if (context.requiresAuth) {
            console.log('🔑 Authenticating returning user...');
            
            if (oldSigner === signerAddress) {
              success = true;
              console.log('✅ Authentication successful');
            } else {
              alert('❌ Incorrect security answers');
            }
          }
          
          if (success) {

            this.setSurveyListener(card);
            await this.evmChain.connectToExistingSafe(evmSafeAddress);
            
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

    
    const card: CardData | null = parseCardURL();

    if (card) {

      this.evmChain = new PermissionlessSafeService(84532);
      const surveyInfo = await this.evmChain.genericRead(SURVEYSTORE, surveyStoreAbi, 'getSurvey',[card.surveyOwner, card.surveySlug]);
      const surveyCid = surveyInfo[0]
      const surveyDiD = surveyInfo[1]

      this.renderTemplate(surveyCid, card.surveySlug);
    
      console.log('📇 Card detected:', card);

      const cardIsUsed = await this.evmChain.genericRead(
        CARDVALIDATOR, 
        JSON.stringify(cardValidatorAbi), 
        "isNullifierUsed", 
        [card.nullifier, card.batchId]
      );
      
      const context = this.detectCardUsageState(card, cardIsUsed);
      console.log('📊 Card usage context:', context);

      switch (context.state) {
        case CardUsageState.CARD_USED_ELSEWHERE:
          alert(context.message);
          return;
          
        case CardUsageState.NEW_CARD_SAME_PHONE:
          if (confirm(context.message + '\n\nClick OK to continue')) {
            store.clear();
            store.setUser({
              nullifier: card.nullifier,
              batchId: card.batchId
            });
            store.persistUser();
            this.process(card, context);
          }
          break;
          
        case CardUsageState.RETURNING_SAME_CARD:
          const user = store.user;
          this.process({
            nullifier: user.nullifier,
            batchId: user.batchId,
          }, context);
          break;
          
        case CardUsageState.FIRST_TIME:
          store.setUser({
            nullifier: card.nullifier,
            batchId: card.batchId
          });
          store.persistUser();
          this.process(card, context);
          break;
      }
    } else {

      store.setUI({ currentStep: 'nocard' });
      this.renderTemplate(undefined, undefined);
    }
  }

  destroy() {
    this.reactiveViews.forEach(view => view.destroy());
    this.reactiveViews = [];
  }

  async setSurveyListener(card: CardData) {
    document.addEventListener('survey-complete', async (event: any) => {
      console.log('Survey completed!');
      console.log('event:', event);
      
      if (event.detail.documentId != undefined) {
        await this.nillion.update(event.detail.answers, card.surveySlug, event.detail.documentId);
      } else {
        await this.nillion.store(event.detail.answers, card.surveySlug);
      }
    });
  }
}