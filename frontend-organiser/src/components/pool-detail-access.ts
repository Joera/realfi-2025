import { typograhyStyles } from '../../../shared/src/assets/styles/typography-styles.js'
import { buttonStyles } from '@s3ntiment/shared/assets'
import { formStyles } from '@s3ntiment/shared/assets'
import { store } from '../state/store.js'
import { router } from '../router.js';
import { Pool } from '@s3ntiment/shared';

class PoolDetailAccess extends HTMLElement {
    private unsubscribe?: () => void;
    private poolId!: string;

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, buttonStyles, formStyles]
    }

    connectedCallback() {

        this.poolId = this.getAttribute('pool-id') || '';

        // Subscribe to store changes
        this.unsubscribe = store.subscribePools((pools) => {
            console.log("subscription comes in")
            this.render(pools);
        });

        // Initial render
        this.render(store.pools);
    }

    disconnectedCallback() {
        // Cleanup if needed
         this.unsubscribe?.();
    }

    private render(pools: Pool[]) {

        if (!this.shadowRoot) return;
        
        let pool = pools.find(p => p.id === this.poolId);

        this.shadowRoot.innerHTML = `
        <style>
            /* ...existing styles... */

            .access-container {
            
                padding: 1.5rem;
                
            }

            .readonly {
            
                color: var(--color-too-dark);
                margin: .75rem 0;
            }

            .co-organiser-section {
                margin-top: 2rem;
                padding-top: 1.5rem;
                border-top: 1px solid var(--color-border, #333);
            }

            .add-row {
                display: flex;
                gap: 1rem;
                align-items: flex-end;
                margin-top: 1rem;
            }

            .add-row input {
                flex: 1;
                margin-bottom: 0;
            }

            .role-select {
                flex: 0 0 140px;
                margin-bottom: 0;
            }

            .owner-list {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
            }

            .owner-pill {
                background: var(--color-too-dark);
                color: white;
                border-radius: 6px;
                padding: 0.25rem 0.6rem;
            }


        </style>

        ${!pool ? `
            <div class="loading">Loading survey...</div>
        ` : `
            <div class="access-container">

                <div class="readonly">
                    <label>Pool ID:</label>
                    <copy-string>${pool.id}</copy-string>
                </div>

                <div class="readonly">
                    <label>Safe:</label>
                    <copy-string>${pool.safeAddress || '—'}</copy-string>
                </div>

                <div class="readonly">
                    <label>Owners:</label>
                    <div class="owner-list">
                        ${pool.owners?.map((addr: string) => `
                        <copy-hash class="owner-pill" value="${addr}"></copy-hash>
                        `).join('') || '—'}
                    </div>
                </div>

                <div class="co-organiser-section">
                    <label>Add co-organiser</label>
                    <div class="add-row">
                        <input 
                            type="text" 
                            id="co-organiser-address" 
                            placeholder="0x address"
                        />
                        <select id="co-organiser-role" class="role-select">
                            <option value="owner">Owner</option>
                            <option value="proposer">Proposer</option>
                        </select>
                        <button class="btn-primary" id="add-co-organiser">Add</button>
                    </div>
                </div>

            </div>
        `}
        `;

        this.attachListeners();
    }


    private attachListeners() {

        this.shadowRoot?.querySelector('#add-co-organiser')?.addEventListener('click', () => {
            const address = (this.shadowRoot?.querySelector('#co-organiser-address') as HTMLInputElement)?.value.trim();
            const role = (this.shadowRoot?.querySelector('#co-organiser-role') as HTMLSelectElement)?.value as 'owner' | 'proposer';

            if (!address) return;

            this.dispatchEvent(new CustomEvent('add-co-organiser', {
                detail: { address, role, poolId: this.poolId },
                bubbles: true,
                composed: true
            }));
        });

    }


}

customElements.define('pool-detail-access', PoolDetailAccess)

export { PoolDetailAccess }