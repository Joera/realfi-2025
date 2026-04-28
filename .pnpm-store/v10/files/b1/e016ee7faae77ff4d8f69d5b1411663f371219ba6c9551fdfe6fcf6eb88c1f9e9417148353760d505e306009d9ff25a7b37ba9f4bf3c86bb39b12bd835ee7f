# WaaP SDK

[npm link](https://www.npmjs.com/package/@human.tech/waap-sdk)

## Installation

```bash
npm install @human.tech/waap-sdk
# or
yarn add @human.tech/waap-sdk
# or
pnpm add @human.tech/waap-sdk
```

## Usage

### Basic Integration (Default Modal Mode)

By default, the wallet renders as a centered modal with a backdrop overlay:

```javascript
import { initWaaP } from '@human.tech/waap-sdk'

// Initialize Human Wallet. This will set window.waap with all necessary methods
initWaaP()

// Request accounts (prompts user to connect)
const accounts = await window.waap.request({ method: 'eth_requestAccounts' })
console.log('Connected accounts:', accounts)

// Send a transaction
const txHash = await window.waap.request({
  method: 'eth_sendTransaction',
  params: [
    {
      from: accounts[0],
      to: '0xRecipientAddress',
      value: '0x123' // hex value in wei
    }
  ]
})
```

### Basic Integration

```javascript
import { initWaap } from '@human.tech/waap-sdk'

// Initialize Human Wallet. This will set window.silk with all necessary methods
initWaap()

// Request accounts (prompts user to connect)
const accounts = await window.waap.request({ method: 'eth_requestAccounts' })
console.log('Connected accounts:', accounts)

// Send a transaction
const txHash = await window.waap.request({
  method: 'eth_sendTransaction',
  params: [
    {
      from: accounts[0],
      to: '0xRecipientAddress',
      value: '0x123' // hex value in wei
    }
  ]
})
```

### Configuration Options

`initWaaP` accepts the following configuration options:

````javascript
// WaaP (recommended)
initWaaP({
  // Optional: Your WalletConnect project ID (REQUIRED for WalletConnect functionality)
  walletConnectProjectId: 'YOUR_WALLETCONNECT_PROJECT_ID',

  // Optional: Human Wallet points referral code
  referralCode: 'YOUR_REFERRAL_CODE',

  // Optional: Custom UI configuration
  config: {
    // See documentation or the Developer Portal for more style options
    authenticationMethods: [],
    allowedSocials: [],
    styles: {
      darkMode: true
    },
    showSecured: true // Controls the display of 'Secured by human.tech' at the footer
  },

  // Optional: Project configuration
  project: {
    name: 'Your App Name', // Project name used throughout the SDK
    entryTitle: 'Log in to Your App', // Optional: Custom title (defaults to "Sign In")
    logo: 'Your app logo in base64 (see docs or portal)',
    authSuccessUrl: '' // The URL to redirect to after a successfull oauth login
    termsOfServiceUrl: '' // Terms of Service URL (will display at the footer)
    privacyPolicyUrl: '' // Privacy Policy URL (will display at the footer)
    projectId: '' // See documentation or the Developer Portal to learn how to set up a gastank for your users
  },

  // Optional: If you want to accept external wallets (by passing 'wallet' to the authenticationMethods array)
  walletConnectProjectId: ''
})


### WalletConnect Support

To use WalletConnect functionality, you **must** provide a WalletConnect project ID. This ID can be obtained from [WalletConnect Cloud](https://cloud.walletconnect.com/).

You can provide the project ID in several ways (in order of precedence):

1. **Pass it directly when initializing** (recommended):

   ```javascript
   // WaaP
   initWaaP({
     walletConnectProjectId: 'YOUR_WALLETCONNECT_PROJECT_ID'
   })
````

2. **Set it programmatically**:

   ```javascript
   // WaaP
   import { initWaaP, WaaPWalletConnect } from '@silk-wallet/silk-wallet-sdk'

   WaaPWalletConnect.setProjectId('YOUR_WALLETCONNECT_PROJECT_ID')
   initWaaP()
   ```

3. **Set it as an environment variable**:
   - Set `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` in your .env.local file (Next.js)
   - Or set `WALLET_CONNECT_PROJECT_ID` for other environments

### API Reference

The SDK implements the standard Ethereum Provider API (EIP-1193) with some additional methods. `window.waap` provides the following interface:

- `enable()`: Alias for `request({ method: 'eth_requestAccounts' })`
- `isConnected()`: Returns whether the provider is connected
- `login()`: Prompt the user to connect an external wallet
- `logout()`: Disconnect the current session
- `getLoginMethod()`: Returns the current login method ('waap', 'injected', 'walletconnect', or null)
- `requestEmail()`: Request the user's email address
- `requestSBT(type)`: Request a Soulbound Token of the specified type
- `toggleDarkMode()`: Toggle between light and dark mode

### Auto-Connect Functionality

The SDK automatically attempts to reconnect users when they refresh the page or return to your application. This works seamlessly in the background when you call `eth_requestAccounts`.

#### How Auto-Connect Works

1. When a user successfully logs in via `login()`, their choice is remembered
2. On subsequent page loads, calling `eth_requestAccounts` (before `login()`) will automatically attempt to reconnect using their previous method
3. If the previous method is no longer available or connected, the auto-connect will fail gracefully

#### Checking the Current Login Method

You can check which login method is currently active without triggering a connection:

```javascript
// WaaP
const loginMethod = window.waap.getLoginMethod()

if (loginMethod === 'waap') {
  console.log('User is connected via WaaP')
} else if (loginMethod === 'injected') {
  console.log('User is connected via injected wallet (e.g., MetaMask)')
} else if (loginMethod === 'walletconnect') {
  console.log('User is connected via WalletConnect')
} else {
  console.log('User is not connected')
}
```

**Note**: `getLoginMethod()` verifies that the connection is actually still valid. If the wallet extension is disabled, WalletConnect session expired, or any other connection issue exists, it will return `null` and automatically clean up the stored state.

#### Implementing Auto-Connect

```javascript
// WaaP
import { initWaaP } from '@silk-wallet/silk-wallet-sdk'

initWaaP()

try {
  const accounts = await window.waap.request({
    method: 'eth_requestAccounts'
  })
  console.log('Auto-connected with accounts:', accounts)

  if (accounts.length === 0) {
    await window.waap.login()
  }
} catch (error) {
  console.log('Auto-connect failed, user needs to login again')
}
```

#### Logout and Cleanup

When you call `logout()`, the stored login method is automatically cleared:

```javascript
// WaaP
await window.waap.logout()
console.log(window.waap.getLoginMethod()) // Returns null
```

## Error Handling

```javascript
// WaaP
try {
  const accounts = await window.waap.request({ method: 'eth_requestAccounts' })
} catch (error) {
  console.error('Error connecting:', error)
}
```

## Events

Both providers emit the same events you can listen to:

```javascript
// WaaP
window.waap.on('connect', () => {
  console.log('Connected')
})

window.waap.on('accountsChanged', (accounts) => {
  console.log('Active account changed:', accounts[0])
})

window.waap.on('chainChanged', (chainId) => {
  console.log('Chain changed to:', chainId)
})
```

## TypeScript Support

The SDK includes TypeScript definitions. You can import them like this:

```typescript
// WaaP
import { initWaaP, WaaPProvider } from '@silk-wallet/silk-wallet-sdk'

const waap: WaaPProvider = initWaaP()
```

## Support

If you encounter any issues or have questions, please reach out to our support team or file an issue in our GitHub repository.
