import html2canvas from "html2canvas";

export async function shareToX(element: HTMLElement) {
  if (!element) return alert("Resume element not found!");

  // Render the element to canvas
  const canvas = await html2canvas(element, { scale: 2 });

  // Convert canvas to blob
  canvas.toBlob((blob) => {
    if (!blob) return;

    // 1️⃣ Trigger download
    const file = new File([blob], "resume.png", { type: "image/png" });
    const url = URL.createObjectURL(file);

    const a = document.createElement("a");
    a.href = url;
    a.download = "onchain_resume.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // 2️⃣ Open X with pre-filled tweet
    const tweetUrl = `https://twitter.com/intent/tweet?text=Check out my onchain resume!&url=${encodeURIComponent(url)}`;
    window.open(tweetUrl, "_blank");
  });
}
