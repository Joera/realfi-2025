// import { reactive } from '../utils/reactive.js';
// import { Card, parseCardURL } from "../card.factory.js";
// import '@s3ntiment/shared/components';
// import '../components/survey-questions.js';
// import { IServices } from '../services.js';
// import { store } from '../state/store.js';
// import { base } from 'viem/chains';
// import { router } from '../router.js';
// import { CardData } from '@s3ntiment/shared';

// export enum CardState {
//     FIRST_TIME = 'first-time',
//     RETURNING  = 'returning',
//     BLOCKED    = 'blocked',
// }

// export class LandingController {

//     private reactiveViews: any[] = [];
//     private services: IServices;

//     constructor(services: IServices) {
//         this.services = services;
//     }

//     private detectCardState(card: CardData, cardIsUsed: boolean): CardState {
//         const storedNullifier = store.nullifier;

//         if (cardIsUsed && card.nullifier !== storedNullifier) {
//             return CardState.BLOCKED;
//         }

//         if (storedNullifier === card.nullifier) {
//             return CardState.RETURNING;
//         }

//         return CardState.FIRST_TIME;
//     }

//     private renderTemplate(surveyId: string) {
//         const app = document.querySelector('#app');
//         if (!app) return;

//         app.innerHTML = `<div id="landing-content" class="centered"></div>`;

//         const view = reactive('#landing-content', () => {

//             switch (store.cardView) {

//                 // case 'validation':
//                 //     return `
//                 //         <loading-spinner message="validating <br/>your invite" color="rgb(32, 85, 74)"></loading-spinner>
//                 //         </div>
//                 //     `;


//                 // case 'login':
//                 //     return `
//                 //         <div class="onboarding-message">
//                 //             <h2>Welcome</h2>
//                 //             <p>Use your e-mail to sign in</p>
//                 //         </div>
//                 //     `;

//                 // case 'welcomeback':
//                 //     return `
//                 //         <loading-spinner message="decrypting the survey" color="rgb(32, 85, 74)"></loading-spinner>
                     
//                 //         </div>
//                 //     `;

//                 // case 'nocard':
//                 //     return `
//                 //         <div class="onboarding-message">
//                 //             <h2>Sorry</h2>
//                 //             <p>You need the link from a unique card or QR code to participate.</p>
//                 //         </div>
//                 //     `;
//                 // case 'blocked':
//                 //     return `
//                 //         <div class="onboarding-message">
//                 //             <h2>Card already used</h2>
//                 //             <p>This card was activated on another device.</p>
//                 //         </div>
//                 //     `;
//                 // case 'survey':
//                 //     return `<survey-questions survey-id=${surveyId} class="centered"></survey-questions>`;
//                 // default:
//                 //     return '';
//             }
//         });

//         if (view) {
//             view.bind(store.ui$);
//             this.reactiveViews.push(view);
//         }
//     }

//     async render() {

//         store.setUI({ cardView: 'validation' });   

//         const cardData: CardData | null = await parseCardURL();

//         if (!cardData) {
//             store.setUI({ cardView: 'nocard' });
//             this.renderTemplate("");
//             return;
//         }

//         console.log('📇 Card detected:', cardData);

//         const card = new Card(cardData);
//         this.renderTemplate(card.surveyId);

//         const cardIsUsed = await card.isUsed(this.services);
//         const state = this.detectCardState(cardData, cardIsUsed);

//         console.log('📊 Card state:', state);

//         switch (state) {

//             case CardState.BLOCKED:
//                 store.setUI({ cardView: 'blocked' });
//                 break;

//             case CardState.RETURNING:
//                 store.setUI({ cardView: 'welcomeback' });
//                 await this.services.waap.login(base);
//                 await this.services.account.updateSignerWithWaap(this.services.waap.walletClient);
//                 router.navigate('/surveys/' + card.surveyId);
//                 break;

//             case CardState.FIRST_TIME:
//                 store.setUI({ cardView: 'login' });
//                 if (store.nullifier && store.nullifier !== card.nullifier) {
//                     store.resetUI();
//                     // is new card 
//                     // what if email has been used within this survey 
//                 }
//                 store.setUser({ nullifier: card.nullifier, batchId: card.batchId });
//                 store.persistUser();
//                 await this.services.waap.login(base);
//                 await this.services.account.updateSignerWithWaap(this.services.waap.walletClient);
//                 const tx = await card.register(this.services);
//                 if (tx.receipt?.status === 'success') {
//                     router.navigate('/surveys/' + card.surveyId);
//                 } else {
//                     alert('❌ Card validation failed');
//                 }
//                 break;
//         }
//     }

//     destroy() {
//         this.reactiveViews.forEach(view => view.destroy());
//         this.reactiveViews = [];
//     }
// }