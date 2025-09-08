import { NextRequest, NextResponse } from "next/server";
import { computeFeatures } from "@/lib/featureEngineering/computeFeatures";

export async function POST(req: NextRequest) {
  try {
    const { profile } = await req.json(); // normalized onchain profile

    // Compute features for Dobby
    const dobbyInput = computeFeatures(profile);

    // System prompt enforcing structured Markdown resume
   const systemPrompt = `
You are Dobby AI. Generate a professional blockchain resume.

Always format the output in this exact Markdown structure, preserving headers:

## Summary
## Highlights
## Wallet History
## Tokens & DeFi
## NFT Holdings
## Evaluation Comments

Rules:
- You MUST start each section with '##' and separate sections with a blank line.
- Use bullet points (-) for Highlights, Tokens & DeFi, and NFT collections.
- Summarize only the top 10 items for tokens, NFTs, and DeFi.
- Write **Summary** and **Highlights** in your own voice — add a professional, friendly narrative style.
- Keep formatting readable and concise.
- Use the numeric data exactly as provided in the input JSON.

Input JSON:
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
