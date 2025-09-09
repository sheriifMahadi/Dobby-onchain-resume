import { NextRequest, NextResponse } from "next/server";
import { resolveAddress } from "@/lib/fetchers/utils";
import { fetchTokens } from "@/lib/fetchers/fetchTokens";
import { fetchNFTs } from "@/lib/fetchers/fetchNFTs";
import { fetchDefi } from "@/lib/fetchers/fetchDefi";
import { fetchActivity } from "@/lib/fetchers/fetchActivity";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ source: string }> } // Correct Next.js type
) {
  try {
    const { source } = await params;

    const addressOrEns = req.nextUrl.searchParams.get("address") || "";
    const address = await resolveAddress(addressOrEns);

    let rawTokens: any[] = [];
    let rawNFTs: any[] = [];
    let nftSummary = { totalCount: 0, totalUSD: 0 };
    let rawDefi: any[] = [];
    let rawActivity: any = {};

    // Fetch Tokens
    if (source === "tokens" || source === "all") {
      try {
        const result = await fetchTokens(address);
        rawTokens = Array.isArray(result) ? result : [];
      } catch (err) {
        console.warn("Failed to fetch tokens:", err);
      }
    }

    // Fetch NFTs
    if (source === "nfts" || source === "all") {
      try {
        const result = await fetchNFTs(address);
        if (result) {
          // Normalize NFTs into an array
          rawNFTs = Array.isArray(result) ? result : result.ethNFTs ?? [];
          nftSummary.totalCount = result.totalCount ?? 0;
          nftSummary.totalUSD = result.totalUsd ?? 0;
        }
      } catch (err) {
        console.warn("Failed to fetch NFTs:", err);
      }
    }

    // Fetch DeFi
    if (source === "defi" || source === "all") {
      try {
        const result = await fetchDefi(address);
        rawDefi = Array.isArray(result) ? result : [];
      } catch (err) {
        console.warn("Failed to fetch DeFi:", err);
      }
    }

    // Fetch Activity
    if (source === "activity" || source === "all") {
      try {
        rawActivity = await fetchActivity(address);
      } catch (err) {
        console.warn("Failed to fetch activity:", err);
      }
    }

    // Compute Dobby input safely
    const dobbyInput = {
      tokenCount: rawTokens.length,
      tokenTotalUSD: rawTokens.reduce((sum, t) => sum + (t.valueUsd || 0), 0),
      nftTotalCount: nftSummary.totalCount,
      nftTotalUSD: nftSummary.totalUSD,
      defiCount: rawDefi.length,
      defiTotalUSD: rawDefi.reduce((sum, d) => sum + (d.balanceUSD || 0), 0),
      activity: rawActivity,
    };

    // Slice arrays for frontend display (top 10)
    const normalized = {
      wallet: address,
      tokens: rawTokens
        .filter((t: any) => t.balance > 0 || t.valueUsd > 0)
        .slice(0, 10)
        .map((t: any) => ({
          name: t.symbol || t.contractName || t.name || "Unknown",
          balance: t.balance || t.balanceRaw || 0,
          valueUsd: t.valueUsd || 0,
        })),
      nfts: {
        totalCount: nftSummary.totalCount,
        totalUSD: nftSummary.totalUSD,
        ethMetadata: rawNFTs.slice(0, 10).map((n: any) => ({
          collection: n.collection || "Unknown Collection",
          name: n.name || `#${n.tokenId}`,
          valueUsd: n.valueUsd || 0,
        })),
      },
      defi: {
        protocols: rawDefi.slice(0, 10).map((d: any) => d.appName || "Unknown"),
        balance: rawDefi.slice(0, 10).map((d: any) => d.balanceUSD || 0),
        network: rawDefi.slice(0, 10).map((d: any) => d.network || "Unknown"),
      },
      activity: rawActivity,
      dobbyInput,
    };

    return NextResponse.json(normalized);
  } catch (err: any) {
    console.error("API fetch route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
