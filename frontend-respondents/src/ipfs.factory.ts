const gateway_url = "https://neutralpress.mypinata.cloud/ipfs/"

export const fromPinata = async (cid: string) => {
  const ipfsApiUrl = `${gateway_url}${cid}`;

  const response = await fetch(ipfsApiUrl);

  console.log(response)

  if (!response.ok) {
    throw new Error(
      `IPFS retrieval failed: ${response.status} ${response.statusText}`,
    );
  }

  const result = await response.text();

  console.log(result)
  return result;
};

