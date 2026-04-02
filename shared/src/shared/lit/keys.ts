export async function fetchLitApiKey(
  backendUrl: string,
  userAddr: string,
  signature: string,
  poolId: string
): Promise<any> {
  const response: any = await fetch(`${backendUrl}/api/lit/usage-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userAddr, signature, poolId })
  });

  console.log(response);

  if (!response.ok) {
    const { msg } = await response.json();
    throw new Error(msg ?? 'fetchLitApiKey: unauthorized');
  }

  const { apiKey } = await response.json();
  return apiKey;
}