"use client";

type ResumeCardProps = {
  resumeText: string;
  id?: string;
};

export default function ResumeCard({ resumeText, id }: ResumeCardProps) {
  // Split into sections by markdown headers (##)
  const sections = resumeText
    .split(/^##\s+/m) // split when "## " appears
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div id={id} className="p-8 rounded-2xl bg-white shadow-2xl space-y-8">
      {sections.map((section, idx) => {
        const [header, ...rest] = section.split("\n");
        const content = rest.join("\n").trim();

        return (
          <div key={idx} className="space-y-3">
            <h2 className="text-2xl font-semibold text-[#FFB07C]">
              {header}
            </h2>

            {content.includes("- ") ? (
              <ul className="list-disc list-inside space-y-1 text-black">
                {content.split("\n").map((line, i) =>
                  line.startsWith("-") ? (
                    <li key={i}>{line.replace(/^- /, "").trim()}</li>
                  ) : (
                    <p key={i}>{line}</p>
                  )
                )}
              </ul>
            ) : (
              <p className="text-black whitespace-pre-line leading-relaxed">
                {content}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
