import { layoutStyles, typograhyStyles, tableStyles, buttonStyles, breakpoints } from '@s3ntiment/shared/assets'
import '@s3ntiment/shared/components';
import { store } from '../state/store.js';
import { router } from '../router.js';
import { Pool } from '@s3ntiment/shared';

class PoolList extends HTMLElement {
   
    private unsubscribe?: () => void;

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, buttonStyles, layoutStyles, tableStyles]
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

                display: flex;
                container-type: inline-size;
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

            .table {
                grid-template-columns: 3fr 2fr 1fr;
            }

            @container (min-width: ${breakpoints.md}px) {           
                .table {
                    grid-template-columns: 3fr 2fr 1fr 1fr 1fr auto;
                }
            }

        </style>

        <div class="container container-large">

            <h2 class="bordered-header">pools</h2>
            ${pools.length === 0 ? `
                <div>no pools stored</div>
            ` : `
                
                <div class="table">
                    <div class="table-header">Name</div>
                    <div class="table-header">ID</div>
                    
                    <div class="table-header hide-sm">Created</div>
                    <div class="table-header hide-sm">Batches</div>
                    <div class="table-header">Safe</div>
                    <div class="table-header hide-sm"></div>

                    ${pools.map(pool => `
                        <div class="table-row" data-pool-id="${pool.id}">
                            <div class="table-cell">
                                <input type="text" class="name-input" value="${pool.name}" data-pool-id="${pool.id}" />
                            </div>
                            <div class="table-cell"><copy-hash>${pool.id}</copy-hash></div>
                            <div class="table-cell hide-sm">${new Date(pool.createdAt * 1000).toLocaleDateString()}</div>
                            <div class="table-cell hide-sm">${pool.batches.length}</div>
                            <div class="table-cell"><copy-hash>${pool.safeAddress}</copy-hash></div>
                            <div class="table-cell caret hide-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 93">
                                    <path d="M3.132 2.567l51.68 42.285-54.812 44.852V2.567z" fill-rule="evenodd"/>
                                </svg>
                            </div>
                        </div>
                    `).join('') 
                    }
                        
                </div>
            `}
        </div>
        `

        this.attachRowListeners()
    }

    private attachRowListeners() {
        this.shadowRoot?.querySelectorAll('.table .table-row').forEach(row => {
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