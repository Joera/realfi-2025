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
       

            h2 { 
                color: var(--color-too-dark);
                border-bottom: 3px solid var(--color-too-dark);
                line-height: 1.3;
            }

            .pool-table {
                display: grid;
                grid-template-columns: 3fr 2fr 1fr 1fr 1fr auto;
                gap: 0;
                overflow: hidden;
            }

            .table-header {
                padding: .75rem;
                border-bottom: 1px solid white;
            }

            .table-header:first-child {
                padding: .75rem  .75rem .75rem 0;
            }

            .table-cell {
                padding: .75rem;
                border-bottom: 1px solid white;
            }
            
            .table-cell:first-child {
                padding: .75rem  .75rem .75rem 0;
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

            .caret {
                display: flex;
                align-items: center;
                color: var(--color-too-dark);
                opacity: 0;
                transition: opacity 0.2s ease;
                margin-top: -.5rem;

                svg {
                    width: .75rem;
                    height: auto;
                    fill: var(--color-too-dark);
                }
            }

            .table-row:hover .caret {
                opacity: 1;
            }

            .table-row:hover .table-cell {
                color: var(--color-too-dark);
                --copy-hash-color: var(--color-too-dark);
            }

        </style>

        <div class="container container-large">

            <h2>pools</h2>
            ${pools.length === 0 ? `
                <div>no pools stored</div>
            ` : `
                
                <div class="pool-table">
                    <div class="table-header">Name</div>
                    <div class="table-header">ID</div>
                    <div class="table-header">Created</div>
                    <div class="table-header">Batches</div>
                    <div class="table-header">Safe</div>
                    <div class="table-header"></div>
                    
                    ${pools.map(pool => `
                        <div class="table-row" data-pool-id="${pool.id}">
                            <div class="table-cell">
                                <input type="text" class="name-input" value="${pool.name}" data-pool-id="${pool.id}" />
                            </div>
                            <div class="table-cell"><copy-hash>${pool.id}</copy-hash></div>
                            <div class="table-cell">${new Date(pool.createdAt * 1000).toLocaleDateString()}</div>
                            <div class="table-cell">${pool.batches.length}</div>
                            <div class="table-cell"><copy-hash>${pool.safeAddress}</copy-hash></div>
                            <div class="table-cell caret">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 93">
                                    <path d="M3.132 2.567l51.68 42.285-54.812 44.852V2.567z" fill-rule="evenodd"/>
                                </svg>
                            </div>
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