import axios from "axios";
import { resolveAddress } from "./utils";

export async function fetchSnapshot(addressOrEns: string) {
  const address = await resolveAddress(addressOrEns);

  const query = `
    query Votes($voter: String!) {
      votes(where: { voter: $voter }, first: 20, orderBy: "created", orderDirection: desc) {
        id
        choice
        created
        proposal {
          id
          title
          state
          space {
            id
            name
          }
        }
      }
    }
  `;

  try {
    const res = await axios.post(
      "https://hub.snapshot.org/graphql",
      { query, variables: { voter: address } },
      { headers: { "Content-Type": "application/json" } }
    );

    return res.data.data?.votes?.map((vote: any) => ({
      proposalId: vote.proposal.id,
      proposalTitle: vote.proposal.title,
      dao: vote.proposal.space.name,
      state: vote.proposal.state,
      choice: vote.choice,
      created: new Date(vote.created * 1000).toISOString(),
    })) || [];
  } catch (err: any) {
    console.error("Snapshot fetch failed:", err.message);
    return [];
  }
}

// Tally: on-chain governance
export async function fetchTally(addressOrEns: string) {
  const address = await resolveAddress(addressOrEns);

  try {
    const res = await axios.get(
      `https://api.tally.xyz/v1/votes?voter=${address}`,
      { headers: { "Api-Key": process.env.TALLY_API_KEY } }
    );

    return res.data?.votes?.map((vote: any) => ({
      proposalId: vote.proposalId,
      proposalTitle: vote.proposal.title,
      dao: vote.organization.name,
      support: vote.support,
      weight: vote.weight,
      created: vote.created,
    })) || [];
  } catch (err: any) {
    console.error("Tally fetch failed:", err.message);
    return [];
  }
}

// Combined Governance Fetcher 
export async function fetchGovernance(addressOrEns: string) {
  const [snapshot, tally] = await Promise.all([
    fetchSnapshot(addressOrEns),
    fetchTally(addressOrEns),
  ]);

  return {
    snapshot,
    tally,
  };
}
