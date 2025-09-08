// src/app/api/resume/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchNFTs } from "@/lib/fetchers/fetchNFTs";
import { fetchTokens } from "@/lib/fetchers/fetchTokens";
import { fetchDefi } from "@/lib/fetchers/fetchDefi";
import { fetchGovernance } from "@/lib/fetchers/fetchGovernance";
import { resolveAddress } from "@/lib/fetchers/utils";

export async function GET(req: NextRequest) {
  const input = req.nextUrl.searchParams.get("address") || "";

  if (!input) {
    return NextResponse.json({ error: "No address or ENS provided" }, { status: 400 });
  }

  try {
    // 1️⃣ Resolve ENS to address
    const resolvedAddress = await resolveAddress(input);
    if (!resolvedAddress) {
      return NextResponse.json({ error: "Unable to resolve ENS or address" }, { status: 400 });
    }
    console.log("Resolved address:", resolvedAddress);

    // Fetch all data concurrently
    const [tokensRaw, nftsRaw, defiRaw, govRaw] = await Promise.all([
      fetchTokens(resolvedAddress).catch(() => []),
      fetchNFTs(resolvedAddress).catch(() => []),
      fetchDefi(resolvedAddress).catch(() => []),
      fetchGovernance(resolvedAddress).catch(() => []),
    ]);

    console.log("NFTs fetched:", nftsRaw.length);

    // Generate a basic summary for Dobby
    const summary = `Address ${resolvedAddress} holds ${tokensRaw.length} tokens, ${nftsRaw.length} NFTs, and has ${defiRaw.length} DeFi positions.`;

    // Return normalized JSON
    return NextResponse.json({
      summary,
      tokens: tokensRaw,
      nfts: nftsRaw,
      defi: defiRaw,
      governance: govRaw,
    });
  } catch (err: any) {
    console.error("Resume fetch failed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
