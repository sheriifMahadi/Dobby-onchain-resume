"use client";

import { useState } from "react";
import ResumeCard from "@/components/ResumeCard";
import { shareToX } from "@/lib/shareToX/shareToX";

export default function Home() {
  const [wallet, setWallet] = useState("");
  const [resume, setResume] = useState<string | null>(null); // allow null
  const [loading, setLoading] = useState(false);

  const generateResume = async () => {
    if (!wallet) return;

    // Hide previous resume while generating
    setResume(null);
    setLoading(true);

    try {
      // 1️⃣ Fetch onchain data
      const fetchRes = await fetch(`/api/fetch/all?address=${wallet}`);
      const profile = await fetchRes.json();

      // 2️⃣ Generate resume with Dobby
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
          Dobby Onchain Resume
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

        {/* Loading card */}
        {loading && (
          <div className="p-6 bg-white rounded-xl shadow-lg text-center text-gray-600">
            Generating resume...
          </div>
        )}

        {/* Resume card */}
        {resume && !loading && (
        <div className="relative space-y-4" id="resume">
          <ResumeCard resumeText={resume} />
          <div className="flex justify-end">
            <button
              onClick={() =>
                shareToX(wallet)
              }
              className="bg-black hover:bg-gray-800 text-white font-medium px-4 py-2 rounded-lg shadow-md transition"
            >
              Share
            </button>
          </div>
        </div>
      )}
      </div>
    </main>
  );
}
