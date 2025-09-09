export type Token = {
  name: string;
  balance: number;
  valueUsd: number;
  symbol?: string;
  contractName?: string;
};

export type NFT = {
  collection: string;
  name: string;
  valueUsd: number;
  tokenId?: string | number;
};

export type DeFiPosition = {
  appName: string;
  balanceUSD: number;
  network?: string;
};

export type Activity = {
  firstTx?: string;
  lastTx?: string;
  txCount: number;
  walletAgeDays?: number;
};

export type OnchainProfile = {
  tokens: Token[];
  nfts: {
    totalCount: number;
    totalUSD: number;
    ethMetadata: NFT[];
  };
  defi: {
    protocols: string[];
    balance: number[];
    network?: string[];
  };
  activity: Activity;
};

export function normalizeOnchainData({
  wallet,
  rawTokens,
  rawNFTs,
  rawDefi,
  rawGovernance,
  rawActivity,
}: {
  wallet: string;
  rawTokens?: any[];
  rawNFTs?: any[];
  rawDefi?: any[];
  rawGovernance?: any[];
  rawActivity?: { txCount: number; firstTx: string; lastTx: string };
}): OnchainProfile {
  return {
    wallet,
    tokens: Array.isArray(rawTokens)
      ? rawTokens.map((t) => ({
          name: t.name || t.symbol || "Unknown",
          symbol: t.symbol,
          balance: t.balance || 0,
          valueUsd: t.valueUsd || 0,
        }))
      : [],
    nfts: {
      totalCount: Array.isArray(rawNFTs) ? rawNFTs.length : 0,
      totalUSD: Array.isArray(rawNFTs)
        ? rawNFTs.reduce((sum, n) => sum + (n.valueUsd || 0), 0)
        : 0,
      ethMetadata: Array.isArray(rawNFTs)
        ? rawNFTs.map((n) => ({
            name: n.name || `#${n.tokenId}`,
            collection: n.collection || "Unknown Collection",
            valueUsd: n.valueUsd || 0,
          }))
        : [],
    },
    defi: {
      protocols: Array.isArray(rawDefi) ? rawDefi.map((d) => d.protocol || "Unknown") : [],
      roles: Array.isArray(rawDefi) ? rawDefi.map((d) => d.role || "Unknown") : [],
      balance: Array.isArray(rawDefi) ? rawDefi.map((d) => d.balanceUSD || 0) : [],
    },
    governance: Array.isArray(rawGovernance)
      ? { votes: rawGovernance.length, daos: rawGovernance.map((g) => g.dao) }
      : { votes: 0, daos: [] },
    activity: {
      ...rawActivity,
      walletAgeDays: rawActivity ? Math.floor(
        (new Date().getTime() - new Date(rawActivity.firstTx).getTime()) / (1000 * 60 * 60 * 24)
      ) : 0,
    },
  };
}
