import axios from "axios";
import { resolveAddress } from "./utils";

export async function fetchDefi(addressOrEns) {
  const address = await resolveAddress(addressOrEns);

  const query = `
    query AppBalances($addresses: [Address!]!, $first: Int = 10) {
      portfolioV2(addresses: $addresses) {
        appBalances {
          totalBalanceUSD
          byApp(first: $first) {
            edges {
              node {
                balanceUSD
                app {
                  displayName
                  imgUrl
                  description
                  category { name }
                }
                network { name chainId }
                positionBalances(first: 10) {
                  edges {
                    node {
                      ... on AppTokenPositionBalance {
                        type
                        symbol
                        balance
                        balanceUSD
                        price
                        groupLabel
                        displayProps { label images }
                      }
                      ... on ContractPositionBalance {
                        type
                        balanceUSD
                        groupLabel
                        tokens {
                          metaType
                          token {
                            ... on BaseTokenPositionBalance {
                              symbol
                              balance
                              balanceUSD
                            }
                          }
                        }
                        displayProps { label images }
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

  try {
    const res = await axios.post(
      "https://public.zapper.xyz/graphql",
      {
        query,
        variables: { addresses: [address], first: 5 },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-zapper-api-key": process.env.ZAPPER_API_KEY,
        },
      }
    );

    const edges = res.data?.data?.portfolioV2?.appBalances?.byApp?.edges || [];
    // Normalize into array of simplified DeFi positions
    const defiPositions = edges.map(edge => {
      const node = edge.node;
      return {
        appName: node.app?.displayName || "Unknown",
        balanceUSD: node.balanceUSD || 0,
        network: node.network?.name || "ethereum",
        chainId: node.network?.chainId || null,
        positions: node.positionBalances?.edges?.map(pEdge => {
          const pNode = pEdge.node;
          if (pNode.type === "AppTokenPositionBalance") {
            return {
              type: pNode.type,
              symbol: pNode.symbol,
              balance: pNode.balance,
              balanceUSD: pNode.balanceUSD,
              price: pNode.price,
              groupLabel: pNode.groupLabel,
              displayProps: pNode.displayProps,
            };
          } else if (pNode.type === "ContractPositionBalance") {
            return {
              type: pNode.type,
              balanceUSD: pNode.balanceUSD,
              groupLabel: pNode.groupLabel,
              tokens: pNode.tokens?.map(t => ({
                metaType: t.metaType,
                symbol: t.token?.symbol,
                balance: t.token?.balance,
                balanceUSD: t.token?.balanceUSD,
              })) || [],
              displayProps: pNode.displayProps,
            };
          } else {
            return {};
          }
        }) || [],
      };
    });

    return defiPositions;
  } catch (err) {
    console.error("Zapper DeFi fetch failed:", err.message);
    return [];
  }
}
