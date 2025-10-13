export const ERROR_MESSAGES = {
  INVALID_SIGNATURE: {
    title: '⚠️ Invalid Card',
    message: 'This card appears to be counterfeit or corrupted. Please contact support.',
    severity: 'error'
  },
  ALREADY_USED: {
    title: 'ℹ️ Card Already Used',
    message: 'This card has already been redeemed and cannot be used again.',
    severity: 'info'
  },
  NETWORK_ERROR: {
    title: '🔄 Connection Issue',
    message: 'Unable to connect to the network. Please check your connection and try again.',
    severity: 'warning'
  },
  UNKNOWN: {
    title: '❓ Validation Failed',
    message: 'An unexpected error occurred. Please try again or contact support.',
    severity: 'error'
  }
}