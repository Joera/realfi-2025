import { typograhyStyles } from '../../../shared/src/assets/styles/typography-styles.js'
import { colourStyles } from '../styles/shared-colour-styles.js'
import { buttonStyles } from '../styles/shared-button-styles.js'
import '@s3ntiment/shared/components';
import { store } from '../state/store.js';
import { router } from '../router.js';
import { layoutStyles } from '../styles/shared-layout-styles.js';
import { Pool } from '@s3ntiment/shared';

class PoolList extends HTMLElement {
   
    private unsubscribe?: () => void;

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, colourStyles, buttonStyles, layoutStyles]
    }

    connectedCallback() {
        const pools = store.pools;
        this.render(pools);

        this.unsubscribe = store.subscribePools((pools: Pool[]) => {
            const sorted = [...pools].sort((a, b) => b.createdAt - a.createdAt);
            this.render(sorted);
        });
    }

    disconnectedCallback() {
        this.unsubscribe?.();
    }

    private render(pools: Pool[]) {
        if (!this.shadowRoot) return

        this.shadowRoot.innerHTML = `
        <style>
            :host {
                --green: #3473ab;
            }

            h1 { 
                color: var(--green)
            }

            .pool-table {
                display: grid;
                grid-template-columns: 3fr 2fr 1fr 1fr 1fr;
                gap: 0;
                border: 1px solid var(--green);
                border-radius: 8px;
                overflow: hidden;
            }

            .table-header {
                padding: 1rem;
                border-bottom: 1px solid var(--green);
            }

            .table-cell {
                padding: 1rem;
                border-bottom: 1px solid var(--green);
            }

            .table-row {
                display: contents;
                cursor: pointer;

                &:last-of-type .table-cell {
                    border-bottom: none
                }
            }

            .name-input {
                background: transparent;
                border: 1px solid transparent;
                color: inherit;
                font: inherit;
                padding: 0.25rem;
                width: 100%;
                border-radius: 4px;
                box-sizing: border-box;
            }

            .name-input:hover {
                border-color: var(--green);
            }

            .name-input:focus {
                outline: none;
                border-color: var(--green);
            }
        </style>

        <div class="container container-large">
            ${pools.length === 0 ? `
                <div>no pools stored</div>
            ` : `
                <h1>My pools</h1>
                <div class="pool-table">
                    <div class="table-header">Name</div>
                    <div class="table-header">ID</div>
                    <div class="table-header">Created</div>
                    <div class="table-header">Batches</div>
                    <div class="table-header">Safe</div>
                    
                    ${pools.map(pool => `
                        <div class="table-row" data-pool-id="${pool.id}">
                            <div class="table-cell">
                                <input type="text" class="name-input" value="${pool.name}" data-pool-id="${pool.id}" />
                            </div>
                            <div class="table-cell">${pool.id}</div>
                            <div class="table-cell">${new Date(pool.createdAt * 1000).toLocaleDateString()}</div>
                            <div class="table-cell">${pool.batches.length}</div>
                            <div class="table-cell">${pool.safeAddress}</div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
        `

        this.attachRowListeners()
    }

    private attachRowListeners() {
        this.shadowRoot?.querySelectorAll('.pool-table .table-row').forEach(row => {
            row.addEventListener('click', (e) => {
                const poolId = (e.currentTarget as HTMLElement).dataset.poolId;
                router.navigate(`/pool/${poolId}`);
            });
        });

        this.shadowRoot?.querySelectorAll('.name-input').forEach(input => {
            input.addEventListener('click', (e) => e.stopPropagation());

            const save = (e: Event) => {
                const el = e.target as HTMLInputElement;
                const poolId = el.dataset.poolId!;
                const pool = store.getPool(poolId);
                if (pool && pool.name !== el.value) {
                    store.addPool({ ...pool, name: el.value });
                }
            };

            input.addEventListener('blur', save);
            input.addEventListener('keydown', (e) => {
                if ((e as KeyboardEvent).key === 'Enter') {
                    (e.target as HTMLInputElement).blur();
                }
            });
        });
    }
}

customElements.define('pool-list', PoolList)

export { PoolList }