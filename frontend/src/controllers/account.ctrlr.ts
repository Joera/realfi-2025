// src/controllers/account.controller.ts

import { store } from '../services/store.service';
import { reactive } from '../utils/reactive';

export class AccountController {
  private reactiveViews: any[] = [];

  async render() {
    const app = document.querySelector('#app');
    if (!app) return;

    app.innerHTML = `
      <div class="account-page">
        <h1>Account</h1>
        <div id="account-info"></div>
      </div>
    `;

    // Reactive account info
    const view = reactive('#account-info', () => {
      const { user, wallet } = store;
      
      if (!user.nullifier) {
        return '<p>No account found. Please scan a card first.</p>';
      }

      return `
        <div class="account-details">
          <h3>User Info</h3>
          <p><strong>Nullifier:</strong> ${user.nullifier}</p>
          <p><strong>Batch ID:</strong> ${user.batchId || 'N/A'}</p>
          <p><strong>Safe Address:</strong> ${user.safeAddress || 'Not created yet'}</p>
          
          <h3>Wallet</h3>
          <p><strong>EVM:</strong> ${wallet.evmAddress || 'N/A'}</p>
          <p><strong>Cosmos:</strong> ${wallet.cosmosAddress || 'N/A'}</p>
        </div>
      `;
    });

    if (view) {
      view.bind('user').bind('wallet');
      this.reactiveViews.push(view);
    }
  }

  destroy() {
    this.reactiveViews.forEach(view => view.destroy());
    this.reactiveViews = [];
  }
}