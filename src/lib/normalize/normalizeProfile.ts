export type OnchainProfile = {
  wallet: string;
  tokens: string[];
  nfts: string[];
  defi: { protocols: string[]; roles: string[] };
  governance: { votes: number; daos: string[] };
  activity: { txCount: number; firstTx: string; lastTx: string };
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
    tokens: Array.isArray(rawTokens) ? rawTokens.map((t) => t.symbol || t.name) : [],
    nfts: Array.isArray(rawNFTs) ? rawNFTs.map((n) => n.name) : [],
    defi: {
      protocols: Array.isArray(rawDefi) ? rawDefi.map((d) => d.protocol) : [],
      roles: Array.isArray(rawDefi) ? rawDefi.map((d) => d.role) : [],
    },
    governance: Array.isArray(rawGovernance)
      ? { votes: rawGovernance.length, daos: rawGovernance.map((g) => g.dao) }
      : { votes: 0, daos: [] },
    activity: rawActivity || { txCount: 0, firstTx: "", lastTx: "" },
  };
}
