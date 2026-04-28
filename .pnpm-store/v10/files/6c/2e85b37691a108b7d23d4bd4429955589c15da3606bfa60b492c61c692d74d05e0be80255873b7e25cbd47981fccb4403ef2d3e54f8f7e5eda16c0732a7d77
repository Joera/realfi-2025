import { SilkProvider } from './lib/provider/types.js'

declare global {
  interface Window {
    silk: SilkProvider | undefined
    waap: SilkProvider | undefined // WaaP alias for backwards compatibility
    ethereum: any
  }

  // TypeScript support for the <waap-wallet> custom element in JSX/TSX
  namespace JSX {
    interface IntrinsicElements {
      'waap-wallet': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >
    }
  }
}

// Also support in HTMLElementTagNameMap for querySelector etc.
declare global {
  interface HTMLElementTagNameMap {
    'waap-wallet': HTMLElement
  }
}
