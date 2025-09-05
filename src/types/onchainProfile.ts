// src/lib/types/onchainProfile.ts
export type OnchainProfile = {
  wallet: string;
  tokens: Array<{ symbol: string; balance: number; valueUsd: number }>;
  nfts: Array<{ name: string; tokenId: string; image?: string }>;
  defi: {
    protocols: string[];
    roles: string[];
  };
  governance: {
    votes: number;
    daos: string[];
  };
  activity: {
    txCount: number;
    firstTx: string;
    lastTx: string;
  };
};
