import { AuthenticationMethod, initWaaP } from "@human.tech/waap-sdk";

declare global {
    interface Window {
        waap: {
            login: () => Promise<'waap' | 'injected' | 'walletconnect' | null>;
            request: () => Promise<any>;
        };
    }
}

const initConfig = {
  config: {
    allowedSocials: [],
    authenticationMethods: ['email', 'phone'] as AuthenticationMethod[],
    styles: { darkMode: false },
  },
  useStaging: false,
  walletConnectProjectId: "<PROJECT_ID>", // Required if 'wallet' in authenticationMethods
  referralCode: "", // Optional
};


export class WaapService { 

    constructor() {

        this.initWaap(); 
    }

    async initWaap() { 
        await initWaaP(initConfig);
    }

    async login() {

        try {
            // Open the WaaP login modal
            const loginType = await window.waap.login();
            // loginType: 'human' | 'walletconnect' | 'injected' | null
            
            // Get the user's wallet addresses
            const accounts = await window.waap.request(); // { method: 'eth_requestAccounts' }
            const address = accounts[0];
        } catch (error) {
            console.error(error)
        }

    }
}


