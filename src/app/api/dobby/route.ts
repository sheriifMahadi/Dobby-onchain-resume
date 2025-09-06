import { NextRequest, NextResponse } from "next/server";
import { computeFeatures } from "@/lib/featureEngineering/computeFeatures";

export async function POST(req: NextRequest) {
  try {
    const { profile } = await req.json(); // normalized onchain profile

    // Compute features for Dobby
    const dobbyInput = computeFeatures(profile);

    // System prompt enforcing structured resume
    const systemPrompt = `
You are Dobby AI. Generate a professional blockchain resume in EXACTLY the format below.
Do NOT deviate. Fill in numeric values and top 10 items from the input JSON.

**Summary:**
Active blockchain user with a wallet holding $<tokenTotalUSD> in tokens and <nftTotalCount> NFTs. Involved in <defiCount> DeFi protocols with a total balance of $<defiTotalUSD>. <txCount> transactions since <firstTx>.

**Highlights:**
- Holds <topTokens> tokens.
- NFT collector with <nftTotalCount> assets across collections like <topNFTCollections>.
- Utilizes <topDefiProtocols> DeFi protocols on Ethereum and other chains.
- <userActivityLevel> with <txCount> transactions over <walletAgeDays> days.

**Wallet History:**
- First transaction: <firstTx>
- Last transaction: <lastTx>
- Total transactions: <txCount>

**Tokens & DeFi:**
- <tokenDetails> (e.g., "ETH: 0.1 ($12.3)")
- DeFi protocols: <defiDetails> (e.g., "Uniswap ($5), Aave ($10)")

**NFT Holdings:**
- Total count: <nftTotalCount>
- Total value: $<nftTotalUSD>
- Collections: <topNFTCollections>

**Evaluation Comments:**
- <evaluationComments>

Instructions:
- Always follow this format exactly.
- Only summarize top 10 items for tokens, NFTs, DeFi.
- Provide professional, concise evaluation comments.
`;

    // Call Fireworks API with Dobby model
    const resumeText = await callDobbyAI({
      input: dobbyInput,
      systemPrompt,
    });

    return NextResponse.json({ resumeText });
  } catch (err: any) {
    console.error("Dobby API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * Fireworks AI / Dobby model call
 */
async function callDobbyAI({
  input,
  systemPrompt,
}: {
  input: any;
  systemPrompt: string;
}) {
  const res = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.DOBBY_API_KEY}`,
    },
    body: JSON.stringify({
      model: "accounts/sentientfoundation/models/dobby-unhinged-llama-3-3-70b-new",
      max_tokens: 4096,
      top_p: 1,
      top_k: 40,
      presence_penalty: 0,
      frequency_penalty: 0,
      temperature: 0.6,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(input) },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fireworks API failed: ${text}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "No resume returned";
}
