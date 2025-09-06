"use client";

import { useState } from "react";
import ResumeCard from "@/components/ResumeCard"; // adjust path if needed

export default function Home() {
  const [wallet, setWallet] = useState("");
  const [resume, setResume] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!wallet) return;

    setLoading(true);
    setStatus("Fetching on-chain data...");
    setResume(null);

    try {
      // 1️⃣ Fetch all on-chain data
      const fetchRes = await fetch(`/api/fetch/all?address=${wallet}`);
      if (!fetchRes.ok) throw new Error("Failed to fetch on-chain data");
      const profile = await fetchRes.json();

      setStatus("Generating resume with Dobby AI...");

      // 2️⃣ Send normalized data to Dobby
      const dobbyRes = await fetch("/api/dobby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });

      if (!dobbyRes.ok) throw new Error("Dobby AI generation failed");
      const { resumeText } = await dobbyRes.json();

      setResume(resumeText);
      setStatus("Resume generated successfully!");
    } catch (err: any) {
      console.error(err);
      setStatus("Error: " + err.message);
      setResume(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-4">Onchain Resume — Demo</h1>

      <div className="flex gap-2 mb-4">
        <input
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          placeholder="Enter wallet address or ENS (e.g. alice.eth)"
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={handleGenerate}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Resume"}
        </button>
      </div>

      <div className="mb-4">
        <strong>Status:</strong> {status ?? "idle"}
      </div>

      {resume && <ResumeCard resumeText={resume} />}
    </main>
  );
}
