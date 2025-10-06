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
      const { user } = store;
      
      if (!user.nullifier) {
        return '<p>No account found. Please scan a card first.</p>';
      }

      return `
        <div class="account-details">
          <p><strong>Signer:</strong> ${user.signerAddress || 'Not created yet'}</p>
          <p><strong>Safe:</strong> ${user.safeAddress || 'Not created yet'}</p>
          <p><strong>Nillion:</strong> ${user.nillionAddress || 'N/A'}</p>
        </div>
      `;
    });

    if (view) {
      view.bind('user');
      this.reactiveViews.push(view);
    }
  }

  destroy() {
    this.reactiveViews.forEach(view => view.destroy());
    this.reactiveViews = [];
  }
}