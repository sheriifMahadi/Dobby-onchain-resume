export interface Resume {
  address: string;
  ens?: string;
  summary: string; // generated later by Dobby
  tokens: Token[];
  nfts: NFT[];
  defi: DefiPosition[];
  governance: GovernanceVote[];
}

export interface Token {
  symbol: string;
  name: string;
  balance: string;
  logo?: string;
}

export interface NFT {
  contract: string;
  collection: string;
  tokenId: string;
  image?: string;
}

export interface DefiPosition {
  protocol: string;
  asset: string;
  balance: string;
  usdValue?: number;
}

export interface GovernanceVote {
  proposalId: string;
  proposalTitle: string;
  choice: string;
  date: string;
}
