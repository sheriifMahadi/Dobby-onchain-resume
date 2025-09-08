import { OnchainProfile } from "../normalize/normalizeProfile";

export function computeFeatures(profile: OnchainProfile) {
  const nftThreshold = 5;
  const highValueThreshold = 10000; // $10k

  // Totals
  const totalTokenValue = profile.tokens.reduce((acc, t) => acc + (t.valueUsd || 0), 0);
  const totalNFTValue = profile.nfts.totalUSD || 0;
  const totalNFTCount = profile.nfts.totalCount || 0;
  const totalDeFiValue = profile.defi.balance.reduce((acc, b) => acc + (b || 0), 0);
  const totalDeFiCount = profile.defi.protocols.length;

  // Top 10 items
  const topTokens = profile.tokens.slice(0, 10).map(t => t.name);
  const topNFTCollections = profile.nfts.ethMetadata.slice(0, 10).map(n => n.collection);
  const topDefiProtocols = profile.defi.protocols.slice(0, 10);
  const tokenDetails = profile.tokens
    .slice(0, 10)
    .map(t => `${t.name}: ${t.balance} ($${t.valueUsd?.toFixed(2) || 0})`);
  const defiDetails = profile.defi.protocols
    .slice(0, 10)
    .map((p, i) => `${p} ($${profile.defi.balance[i]?.toFixed(2) || 0})`);

  // Signals
  const signals = {
    earlyAdopter: profile.activity.firstTx
      ? new Date(profile.activity.firstTx) < new Date("2020-01-01")
      : false,
    nftCollector: totalNFTCount >= nftThreshold,
    highNetWorth: totalTokenValue + totalNFTValue >= highValueThreshold,
    activeUser:
      profile.activity.txCount < 100
        ? "casual"
        : profile.activity.txCount < 1000
        ? "steady"
        : "power",
    protocolDiversity: totalDeFiCount,
    nftValueScore: totalNFTValue,
  };

  // Compose Dobby-ready input
  const dobbyInput = {
    tokenCount: profile.tokens.length,
    tokenTotalUSD: totalTokenValue.toFixed(2),
    nftTotalCount: totalNFTCount,
    nftTotalUSD: totalNFTValue.toFixed(2),
    defiCount: totalDeFiCount,
    defiTotalUSD: totalDeFiValue.toFixed(2),
    txCount: profile.activity.txCount,
    firstTx: profile.activity.firstTx,
    lastTx: profile.activity.lastTx,
    walletAgeDays: profile.activity.walletAgeDays,
    topTokens,
    topNFTCollections,
    topDefiProtocols,
    tokenDetails,
    defiDetails,
    signals,
  };

  return dobbyInput;
}
