"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function handleGenerate() {
    setStatus("loading");
    const res = await fetch("/api/health");
    const json = await res.json();
    setStatus(`API OK @ ${json.time}`);
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-4">Onchain Resume — Demo</h1>

      <div className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter wallet address or ENS (e.g. alice.eth)"
          className="flex-1 p-2 border rounded"
        />
        <button onClick={handleGenerate} className="px-4 py-2 bg-indigo-600 text-white rounded">
          Generate
        </button>
      </div>

      <div className="mt-6">
        <strong>Status:</strong> {status ?? "idle"}
      </div>
    </main>
  );
}
