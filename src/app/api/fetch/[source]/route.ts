import { NextRequest, NextResponse } from "next/server";
import { resolveAddress } from "@/lib/fetchers/utils";
import { fetchTokens } from "@/lib/fetchers/fetchTokens";
import { fetchNFTs } from "@/lib/fetchers/fetchNFTs";
import { fetchDefi } from "@/lib/fetchers/fetchDefi";
import { fetchActivity } from "@/lib/fetchers/fetchActivity";

export async function GET(
  req: NextRequest,
  { params } : { params: Promise<{source: string}> }
) {
  try {
    // Await params for dynamic routes
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
          rawNFTs = result.ethNFTs || [];
          nftSummary.totalCount = result.totalCount || 0;
          nftSummary.totalUSD = result.totalUsd || 0;
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
      tokenCount: rawTokens?.length || 0,
      tokenTotalUSD: (rawTokens || []).reduce(
        (sum, t) => sum + (t.valueUsd || 0),
        0
      ),
      nftTotalCount: nftSummary.totalCount || 0,
      nftTotalUSD: nftSummary.totalUSD || 0,
      defiCount: rawDefi?.length || 0,
      defiTotalUSD: (rawDefi || []).reduce(
        (sum, d) => sum + (d.balanceUSD || 0),
        0
      ),
      activity: rawActivity || {},
    };

    // Slice arrays for frontend display (top 10)
    const normalized = {
      wallet: address,
      tokens: (rawTokens || [])
        .filter((t: any) => t.balance > 0 || t.valueUsd > 0)
        .slice(0, 10)
        .map((t: any) => ({
          name: t.symbol || t.contractName || t.name || "Unknown",
          balance: t.balance || t.balanceRaw || 0,
          valueUsd: t.valueUsd || 0,
        })),
      nfts: {
        totalCount: nftSummary.totalCount || 0,
        totalUSD: nftSummary.totalUSD || 0,
        ethMetadata: (rawNFTs || [])
          .slice(0, 10)
          .map((n: any) => ({
            collection: n.collection || "Unknown Collection",
            name: n.name || `#${n.tokenId}`,
            valueUsd: n.valueUsd || 0,
          })),
      },
      defi: {
        protocols: (rawDefi || [])
          .slice(0, 10)
          .map((d: any) => d.appName || "Unknown"),
        balance: (rawDefi || [])
          .slice(0, 10)
          .map((d: any) => d.balanceUSD || 0),
        network: (rawDefi || [])
          .slice(0, 10)
          .map((d: any) => d.network || "Unknown"),
      },
      activity: rawActivity || {},
      dobbyInput,
    };

    return NextResponse.json(normalized);
  } catch (err: any) {
    console.error("API fetch route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
