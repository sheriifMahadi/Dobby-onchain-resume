import axios from "axios";
import { resolveAddress } from "./utils";

// Alchemy endpoints per chain
const ALCHEMY_ENDPOINTS = {
  ethereum: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  arbitrum: `https://arb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  polygon: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  optimism: `https://opt-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  base: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  bnb: `https://bnb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  berachain: `https://berachain-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
};

export async function fetchNFTs(addressOrEns: string) {
  const address = await resolveAddress(addressOrEns);

  let totalCount = 0;
  let totalUsd = 0; // Alchemy does not provide NFT USD value directly
  const ethNFTs: any[] = [];

  // Step 1 — Iterate all chains to get total NFT count
  for (const [chain, endpoint] of Object.entries(ALCHEMY_ENDPOINTS)) {
    try {
      const res = await axios.get(`${endpoint}/getNFTsForOwner/`, {
        params: { owner: address, pageSize: 1 }, // we only need count
      });

      const count = res.data.totalCount ?? (res.data.ownedNfts?.length ?? 0);
      totalCount += count;

    } catch (err) {
      console.warn(`Alchemy fetch failed on ${chain}:`, err.message);
    }
  }

  // Step 2 — Fetch Ethereum mainnet NFT metadata
  try {
    const res = await axios.get(`${ALCHEMY_ENDPOINTS.ethereum}/getNFTsForOwner/`, {
      params: { owner: address, pageSize: 100 },
    });

    const nfts = res.data.ownedNfts ?? [];
    nfts.forEach((nft) => {
      ethNFTs.push({
        contract: nft.contract.address,
        collection: nft.contract.name || nft.title || "Unknown",
        tokenId: nft.id.tokenId,
        name: nft.title || `#${nft.id.tokenId}`,
        description: nft.description || "",
        image: nft.media?.[0]?.gateway || "",
        network: "ethereum",
      });
    });
  } catch (err) {
    console.error("Alchemy ETH metadata fetch failed:", err.message);
  }
  return {
    totalCount,
    totalUsd,
    ethNFTs,
  };
}
