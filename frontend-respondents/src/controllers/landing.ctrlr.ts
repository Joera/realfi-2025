import { reactive } from '../utils/reactive.js';
import { Card, CardData, parseCardURL } from "../card.factory.js";
import '../components/loading-spinner.js';
import '../components/survey-questions.js';
import { IServices } from '../services.js';
import { uiStore, userStore } from '../state/store.js';
import { base } from 'viem/chains';
import { router } from '../router.js';

export enum CardState {
    FIRST_TIME = 'first-time',
    RETURNING  = 'returning',
    BLOCKED    = 'blocked',
}

export class LandingController {

    private reactiveViews: any[] = [];
    private services: IServices;

    constructor(services: IServices) {
        this.services = services;
    }

    private detectCardState(card: CardData, cardIsUsed: boolean): CardState {
        const storedNullifier = userStore.nullifier;

        if (cardIsUsed && card.nullifier !== storedNullifier) {
            return CardState.BLOCKED;
        }

        if (storedNullifier === card.nullifier) {
            return CardState.RETURNING;
        }

        return CardState.FIRST_TIME;
    }

    private renderTemplate(surveyId: string) {
        const app = document.querySelector('#app');
        if (!app) return;

        app.innerHTML = `<div id="landing-content"></div>`;

        const view = reactive('#landing-content', () => {
            const { cardView } = uiStore.state;

            switch (cardView) {
                case 'nocard':
                    return `
                        <div class="onboarding-message">
                            <h2>Sorry</h2>
                            <p>You need the link from a unique card or QR code to participate.</p>
                        </div>
                    `;
                case 'blocked':
                    return `
                        <div class="onboarding-message">
                            <h2>Card already used</h2>
                            <p>This card was activated on another device.</p>
                        </div>
                    `;
                case 'survey':
                    return `<survey-questions survey-id=${surveyId}></survey-questions>`;
                default:
                    return '';
            }
        });

        if (view) {
            view.bind(uiStore);
            this.reactiveViews.push(view);
        }
    }

    async render() {

        const cardData: CardData | null = await parseCardURL();

        if (!cardData) {
            uiStore.set({ cardView: 'nocard' });
            this.renderTemplate("");
            return;
        }

        console.log('📇 Card detected:', cardData);

        const card = new Card(cardData);
        this.renderTemplate(card.surveyId);

        const cardIsUsed = await card.isUsed(this.services);
        const state = this.detectCardState(cardData, cardIsUsed);

        console.log('📊 Card state:', state);

        switch (state) {

            case CardState.BLOCKED:
                uiStore.set({ cardView: 'blocked' });
                break;

            case CardState.RETURNING:
                await this.services.waap.login(base);
                await this.services.account.updateSigner(this.services.waap.walletClient);
                router.navigate('/surveys/' + card.surveyId);
                break;

            case CardState.FIRST_TIME:
                if (userStore.nullifier && userStore.nullifier !== card.nullifier) {
                    userStore.clear();
                }
                userStore.set({ nullifier: card.nullifier, batchId: card.batchId });
                userStore.persist();
                await this.services.waap.login(base);
                await this.services.account.updateSigner(this.services.waap.walletClient);
                const tx = await card.validate(this.services);
                if (tx.receipt?.status === 'success') {
                    router.navigate('/surveys/' + card.surveyId);
                } else {
                    alert('❌ Card validation failed');
                }
                break;
        }
    }

    destroy() {
        this.reactiveViews.forEach(view => view.destroy());
        this.reactiveViews = [];
    }
}