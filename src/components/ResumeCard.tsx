"use client";
import { useState } from "react";

export default function ResumeGenerator() {
  const [wallet, setWallet] = useState("");
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(false);

  const generateResume = async () => {
    if (!wallet) return;

    setLoading(true);

    try {
      // 1️⃣ Fetch all onchain data first
      const fetchRes = await fetch(`/api/fetch/all?address=${wallet}`);
      const profile = await fetchRes.json();

      // 2️⃣ Send normalized data to Dobby
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
    <div className="p-6">
      <input
        type="text"
        placeholder="Enter wallet or ENS"
        value={wallet}
        onChange={(e) => setWallet(e.target.value)}
        className="border p-2 mr-2"
      />
      <button
        onClick={generateResume}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Generating..." : "Generate Resume"}
      </button>

      {resume && (
        <div id="resume" className="mt-6 p-4 border rounded bg-gray-50">
          <pre>{resume}</pre>
        </div>
      )}
    </div>
  );
}
