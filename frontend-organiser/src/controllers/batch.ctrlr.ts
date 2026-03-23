
import { IServices } from "../services/services.js";
import { store } from "../state/store.js";
import { reactive } from "../utils/reactive.js";

import { router } from "../router.js";
import surveyStore from 's3ntiment-contracts/deployments/base/S3ntimentSurveyStore.json' assert { type: 'json' }
import {  Batch, Card, CardData, Pool, Survey } from "@s3ntiment/shared";
import '@s3ntiment/shared/components';



export class BatchController {
    private reactiveViews: any[] = [];
    private services: IServices;
    private poolId: string;
    private batchId: string;
    private pool!: Pool;
    private batch!: Batch;

    constructor(services: IServices, poolId: string, batchId: string) {

        this.services = services;
        this.poolId = poolId;
        this.batchId = batchId;
    }

    private renderTemplate() {
        const app = document.querySelector('#app');
        if (!app) return;

        app.innerHTML = `
            <style>

                .actions-container {
                    margin-bottom: 1.5rem;
                }
           
     
                .back-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 2rem;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex: 0;

                    svg {
                        height: 2.5rem;
                        width: 2.5rem;
                        fill: var(--color-too-dark)
                    }
                }

                .back-btn:hover {
                    text-decoration: underline;
                }

                .card svg {

                    width: 100%;/
                    height: auto;
                }

                .card.used {
                    opacity: .1
                }


            </style>

            <div class="container container-large centered">
              
                <div class="actions-container">
                    <button class="btn-primary" id="btn-refresh">Refresh</button>
                </div>
                <div id="card-container" class="container container-large centered">
                    ${this.batch.cards!.map( (c: CardData) => 
                        `<div class="card${c.isUsed ? ' used' : ''}">${c.svgString}</div>` )}
                </div>
               
            </div>
        `;

        this.setListeners();
    }

    async discardUsedCards() {
        let changed = false;
        
        console.log('b4 discard');

        for (const c of this.batch.cards!) {
            c.batchId = this.batchId;
            c.isUsed = false;
            const card = new Card(c);
            try {
                const used = await card.isUsed(this.services, surveyStore);
                if (used && !c.isUsed) {
                    c.isUsed = true;
                    changed = true;
                }
            } catch (e) {
                console.log(e);
            }
        }

        if (changed) {
            store.addBatch(this.batch);
        }
    }
    
    
    async process() {

        const p  = store.getPool(this.poolId);
        if (p) this.pool = p
        const b = store.getBatch(this.batchId);
        if (b)  {
            this.batch = b
        } else {
            const bb = p?.batches.filter((b:any) => typeof b == 'object').find( (b:any) => b.id == this.batchId)
            if (typeof bb === 'object' && 'id' in bb) this.batch = bb
        }

        this.discardUsedCards();

        // await this.services.safe.connectToExistingSafe(this.pool.safeAddress || "") 
    }

    async render() {

        this.process();
        this.renderTemplate();

        this.reactiveViews.push(
            store.subscribeBatches(() => {
                const updated = store.batches.find(b => b.id === this.batchId);
                if (updated) {
                    this.batch = updated;
                    this.renderTemplate();
                }
            })
        );
    }

    destroy() {
        this.reactiveViews.forEach(view => view.destroy());
        this.reactiveViews = [];
    }

    setListeners() {

        document.querySelector('#back-btn')?.addEventListener('click', () => {
            router.navigate(`/pool/${this.poolId}`);
        });

        document?.querySelector('#btn-refresh')?.addEventListener('click', () => {
          
           this.discardUsedCards();
        });

    }
}