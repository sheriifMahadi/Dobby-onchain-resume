import axios from "axios";
import { Alchemy, Network } from "alchemy-sdk";
import { resolveAddress } from "./utils";

// Initialize Alchemy
const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY!,
  network: Network.ETH_MAINNET,
});

export async function fetchNFTs(addressOrEns: string, first: number = 10) {
  const address = await resolveAddress(addressOrEns);

  // --- 1️⃣ Try Zapper first ---
  try {
    const zapperQuery = `
      query NFTBalances($addresses: [Address!]!, $first: Int) {
        portfolioV2(addresses: $addresses) {
          nftBalances {
            byToken(first: $first) {
              edges {
                node {
                  lastReceived
                  token {
                    tokenId
                    name
                    description
                    estimatedValue {
                      valueUsd
                      denomination {
                        symbol
                        network
                      }
                    }
                    collection {
                      name
                      address
                      medias {
                        logo {
                          originalUri
                        }
                      }
                    }
                    mediasV3 {
                      images {
                        edges {
                          node {
                            originalUri
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const res = await axios.post(
      "https://public.zapper.xyz/graphql",
      {
        query: zapperQuery,
        variables: { addresses: [address], first },
      },
      { headers: { "Content-Type": "application/json", "x-zapper-api-key": process.env.ZAPPER_API_KEY } }
    );

    const edges = res.data?.data?.portfolioV2?.[0]?.nftBalances?.byToken?.edges || [];
    const nfts = edges.map((edge: any) => {
      const token = edge.node.token;
      return {
        contract: token.collection.address,
        collection: token.collection.name,
        tokenId: token.tokenId,
        name: token.name,
        description: token.description,
        image: token.mediasV3?.images?.edges?.[0]?.node.originalUri || token.collection.medias.logo.originalUri,
        valueUsd: token.estimatedValue?.valueUsd || 0,
        network: token.estimatedValue?.denomination?.network || "ethereum",
        symbol: token.estimatedValue?.denomination?.symbol || "ETH",
        lastReceived: edge.node.lastReceived ? new Date(edge.node.lastReceived).toISOString() : "",
      };
    });

    if (nfts.length > 0) return nfts;
  } catch (err) {
    console.warn("Zapper fetch failed, falling back to Alchemy:", err.message);
  }

  // --- 2️⃣ Fallback to Alchemy ---
  try {
    const alchemyNfts = await alchemy.nft.getNftsForOwner(address);
    const ownedNfts = alchemyNfts?.ownedNfts ?? [];

    const nfts = ownedNfts.map((nft: any) => ({
      contract: nft.contract.address,
      collection: nft.contract.name || nft.title || "Unknown",
      tokenId: nft.tokenId,
      name: nft.title || `#${nft.tokenId}`,
      description: nft.description || "",
      image: nft.media?.[0]?.gateway || "",
      valueUsd: 0, // Alchemy doesn’t provide USD estimate
      network: "ethereum",
      symbol: "ETH",
      lastReceived: "", // Alchemy doesn’t provide timestamp
    }));

    return nfts;
  } catch (err: any) {
    console.error("Alchemy fetch failed:", err.message);
    return [];
  }
}
