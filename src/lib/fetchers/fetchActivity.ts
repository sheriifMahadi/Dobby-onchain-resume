import axios from "axios";
import { resolveAddress } from "./utils";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

export async function fetchActivity(addressOrEns: string) {
  const address = await resolveAddress(addressOrEns);

  try {
    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10000&sort=asc&apikey=${ETHERSCAN_API_KEY}`;
    const res = await axios.get(url);
    const txs = res.data.result;

    if (!Array.isArray(txs) || txs.length === 0) {
      return { txCount: 0, firstTx: "", lastTx: "", walletAgeDays: 0 };
    }

    const txCount = txs.length;
    const firstTx = new Date(parseInt(txs[0].timeStamp, 10) * 1000)
      .toISOString()
      .slice(0, 10);
    const lastTx = new Date(parseInt(txs[txs.length - 1].timeStamp, 10) * 1000)
      .toISOString()
      .slice(0, 10);

    const walletAgeDays = Math.floor(
      (Date.now() - new Date(firstTx).getTime()) / (1000 * 60 * 60 * 24)
    );

    return { txCount, firstTx, lastTx, walletAgeDays };
  } catch (err: any) {
    console.error("Etherscan fetchActivity failed:", err.message);
    return { txCount: 0, firstTx: "", lastTx: "", walletAgeDays: 0 };
  }
}
