import { ethers } from "ethers";

export async function resolveAddress(input: string): Promise<string> {
  // if it's already a hex address
  if (ethers.isAddress(input)) return input;

  // otherwise assume ENS
  const provider = new ethers.JsonRpcProvider(
    `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
  );
  const address = await provider.resolveName(input);

  if (!address) throw new Error(`Could not resolve ENS: ${input}`);
  return address;
}
