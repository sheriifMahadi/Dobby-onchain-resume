import axios from "axios";
import { resolveAddress } from "./utils";

export async function fetchTokens(addressOrEns: string) {
  const address = await resolveAddress(addressOrEns);

  try {
    const url = `https://api.covalenthq.com/v1/1/address/${address}/balances_v2/`;
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${process.env.COVALENT_KEY}` },
    });

    // Extract items array
    const tokens = res.data?.data?.items?.map((t: any) => ({
      symbol: t.contract_ticker_symbol,
      name: t.contract_name,
      balance: Number(t.balance) / 10 ** t.contract_decimals, // normalize
      valueUsd: t.quote || 0,
      address: t.contract_address,
    })) ?? [];

    return tokens; // always an array
  } catch (err) {
    console.error("fetchTokens failed:", err.message);
    return [];
  }
}
