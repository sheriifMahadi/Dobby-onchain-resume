"use client";

import { useState } from "react";
import ResumeCard from "@/components/ResumeCard";

export default function Home() {
  const [wallet, setWallet] = useState("");
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(false);

  const generateResume = async () => {
    if (!wallet) return;
    setLoading(true);

    try {
      const fetchRes = await fetch(`/api/fetch/all?address=${wallet}`);
      const profile = await fetchRes.json();

      const dobbyRes = await fetch("/api/dobby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });

      const { resumeText } = await dobbyRes.json();
      setResume(resumeText);
    } catch (err) {
      console.error(err);
      setResume("Failed to generate resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fdf5e6] flex flex-col items-center p-8">
      <div className="max-w-3xl w-full space-y-6">
        <h1 className="text-3xl font-semibold text-slate-800">
          Dobyy Onchain Resume
        </h1>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter wallet or ENS"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            className="flex-1 border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-peach-400"
          />
          <button
            onClick={generateResume}
            disabled={loading}
            className="bg-[#ffccaa] hover:bg-[#ffb380] text-slate-900 font-medium px-4 py-2 rounded-lg shadow-md transition disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Resume"}
          </button>
        </div>

        {resume && <ResumeCard resumeText={resume} />}
      </div>
    </main>
  );
}
