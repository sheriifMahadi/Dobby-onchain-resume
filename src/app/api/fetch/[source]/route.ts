import { NextRequest, NextResponse } from "next/server";
import { resolveAddress } from "@/lib/fetchers/utils";
import { fetchTokens } from "@/lib/fetchers/fetchTokens";
import { fetchNFTs } from "@/lib/fetchers/fetchNFTs";
import { fetchDefi } from "@/lib/fetchers/fetchDefi";

export async function GET(req: NextRequest, context: { params: { source: string } }) {
  try {
    // Await context.params if Next.js requires it
    const params = await context.params; // ✅ await here
    const source = params.source;

    const addressOrEns = req.nextUrl.searchParams.get("address") || "";
    const address = await resolveAddress(addressOrEns);

    let rawTokens: any[] = [];
    let rawNFTs: any[] = [];
    let rawDefi: any[] = [];

    if (source === "tokens" || source === "all") {
      const result = await fetchTokens(address);
      rawTokens = Array.isArray(result) ? result : [];
    }
    if (source === "nfts" || source === "all") {
      const result = await fetchNFTs(address);
      rawNFTs = Array.isArray(result) ? result : [];
    }
    if (source === "defi" || source === "all") {
      const result = await fetchDefi(address);
      rawDefi = Array.isArray(result) ? result : [];

    }

    const normalized = {
      wallet: address,
      tokens: rawTokens
    .filter((t: any) => t.balance > 0 || t.valueUsd > 0) // only tokens with value
    .map((t: any) => ({
      name: t.symbol || t.contractName || t.name,
      balance: t.balance || t.balanceRaw || 0,
      valueUsd: t.valueUsd,
    })),
    nfts: rawNFTs.map((n: any) => ({
        collection: n.collection || "Unknown Collection",
        description: n.description || "",
        valueUsd: n.valueUsd || 0,
      })),      
  defi: {
        protocols: rawDefi.map((d: any) => d.appName),
        balance: rawDefi.map((d: any) => d.balanceUSD),
        network: rawDefi.map((d: any) => d.network),
      },
    };

    return NextResponse.json(normalized);
  } catch (err: any) {
    console.error("API fetch route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

