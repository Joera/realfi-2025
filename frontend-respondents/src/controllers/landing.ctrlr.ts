import { reactive } from '../utils/reactive.js';
import { Card, parseCardURL } from "../card.factory.js";
import '../components/loading-spinner.js';
import '../components/survey-questions.js';
import { IServices } from '../services.js';
import { uiStore, userStore } from '../state/store.js';
import { base } from 'viem/chains';
import { router } from '../router.js';
import { CardData } from '@s3ntiment/shared';

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

        app.innerHTML = `<div id="landing-content" class="centered"></div>`;

        const view = reactive('#landing-content', () => {
            const { cardView } = uiStore.state;

            switch (cardView) {
                case 'login':
                    return `
                        <div class="onboarding-message">
                            <h2>Welcome</h2>
                            <p>Use your e-mail to sign in</p>
                        </div>
                    `;

                case 'welcomeback':
                    return `
                        <div class="onboarding-message">
                            <h2>Welcome back!</h2>
                            <p>We're taking you to the survey ... </p>
                        </div>
                    `;

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
                    return `<survey-questions survey-id=${surveyId} class="centered"></survey-questions>`;
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
                uiStore.set({ cardView: 'welcomeback' });
                await this.services.waap.login(base);
                await this.services.account.updateSigner(this.services.waap.walletClient);
                router.navigate('/surveys/' + card.surveyId);
                break;

            case CardState.FIRST_TIME:
                uiStore.set({ cardView: 'login' });
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