import { NextRequest, NextResponse } from "next/server";
import { resolveAddress } from "@/lib/fetchers/utils";
import { fetchTokens } from "@/lib/fetchers/fetchTokens";
import { fetchNFTs } from "@/lib/fetchers/fetchNFTs";
import { fetchDefi } from "@/lib/fetchers/fetchDefi";
import { fetchActivity } from "@/lib/fetchers/fetchActivity";

export async function GET(req: NextRequest, context: { params: { source: string } }) {
  try {
    const params = await context.params;
    const source = params.source;

    const addressOrEns = req.nextUrl.searchParams.get("address") || "";
    const address = await resolveAddress(addressOrEns);

    let rawTokens: any[] = [];
    let rawNFTs: any[] = [];
    let nftSummary: { totalCount: number; totalUSD: number } = { totalCount: 0, totalUSD: 0 };
    let rawDefi: any[] = [];
    let rawActivity: any = {};

    // Tokens
    if (source === "tokens" || source === "all") {
      const result = await fetchTokens(address);
      rawTokens = Array.isArray(result) ? result : [];
    }

    // NFTs
    if (source === "nfts" || source === "all") {
      const result = await fetchNFTs(address);
      if (result) {
        rawNFTs = result.ethNFTs || [];
        nftSummary.totalCount = result.totalCount || 0;
        nftSummary.totalUSD = result.totalUSD || 0;
      }
    }

    // DeFi
    if (source === "defi" || source === "all") {
      const result = await fetchDefi(address);
      rawDefi = Array.isArray(result) ? result : [];
    }

    // Activity
    if (source === "activity" || source === "all") {
      rawActivity = await fetchActivity(address);
    }

    // --- Prepare data for Dobby ---
    const dobbyInput = {
      tokenCount: rawTokens.length,
      tokenTotalUSD: rawTokens.reduce((sum, t) => sum + (t.valueUsd || 0), 0),
      nftTotalCount: nftSummary.totalCount,
      nftTotalUSD: nftSummary.totalUSD,
      defiCount: rawDefi.length,
      defiTotalUSD: rawDefi.reduce((sum, d) => sum + (d.balanceUSD || 0), 0),
      activity: rawActivity,
    };

    // Slice arrays for frontend display (10 each)
    const normalized = {
      wallet: address,
      tokens: rawTokens
        .filter((t: any) => t.balance > 0 || t.valueUsd > 0)
        .slice(0, 10)
        .map((t: any) => ({
          name: t.symbol || t.contractName || t.name,
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
        protocols: rawDefi.slice(0, 10).map((d: any) => d.appName),
        balance: rawDefi.slice(0, 10).map((d: any) => d.balanceUSD),
        network: rawDefi.slice(0, 10).map((d: any) => d.network),
      },
      activity: rawActivity,
      dobbyInput, // Send totals for summary/commentary
    };

    return NextResponse.json(normalized);
  } catch (err: any) {
    console.error("API fetch route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
