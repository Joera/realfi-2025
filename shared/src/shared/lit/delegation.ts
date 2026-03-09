export async function fetchPaymentDelegation(backendUrl: string, userAddr: string, signature: string) {
  const response = await fetch(`${backendUrl}/api/lit-payment-delegation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userAddr, signature })
  });

  const { paymentDelegationAuthSig } = await response.json();
  return paymentDelegationAuthSig;
}