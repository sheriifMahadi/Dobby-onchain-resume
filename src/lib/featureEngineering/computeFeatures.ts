import { OnchainProfile } from "../normalize/normalizeProfile";

export function computeFeatures(profile: OnchainProfile) {
  const nftThreshold = 5;
  const highValueThreshold = 10000; // $10k

  const totalTokenValue = profile.tokens.reduce((acc, t) => acc + (t.valueUsd || 0), 0);
  const totalNFTValue = profile.nfts.totalUSD || 0;

  const signals = {
    earlyAdopter: profile.activity.firstTx
      ? new Date(profile.activity.firstTx) < new Date("2020-01-01")
      : false,
    nftCollector: profile.nfts.totalCount >= nftThreshold,
    highNetWorth: totalTokenValue + totalNFTValue >= highValueThreshold,
    activeUser:
      profile.activity.txCount < 100
        ? "casual"
        : profile.activity.txCount < 1000
        ? "steady"
        : "power",
    protocolDiversity: profile.defi.protocols.length,
    nftValueScore: totalNFTValue,
  };

  return { profile, signals };
}
