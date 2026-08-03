let lastLogo = "";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Invalid logo image"));
    img.src = src;
  });
}

function squareIcon(src: string, size: number, fillRatio = 0.78): Promise<string> {
  return loadImage(src).then((img) => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    const box = size * fillRatio;
    const scale = Math.min(box / img.naturalWidth, box / img.naturalHeight);
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
    return canvas.toDataURL("image/png");
  });
}

let patchedManifestUrl: string | null = null;

async function patchManifestIcons(logo: string): Promise<void> {
  const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
  if (!link || !link.href) return;
  try {
    const res = await fetch(link.href, { cache: "no-store" });
    if (!res.ok) return;
    const manifest = await res.json();
    manifest.icons = [
      { src: await squareIcon(logo, 192), sizes: "192x192", type: "image/png", purpose: "any" },
      { src: await squareIcon(logo, 512), sizes: "512x512", type: "image/png", purpose: "any" },
      { src: await squareIcon(logo, 512, 0.6), sizes: "512x512", type: "image/png", purpose: "maskable" },
    ];
    const blob = new Blob([JSON.stringify(manifest)], { type: "application/manifest+json" });
    if (patchedManifestUrl) URL.revokeObjectURL(patchedManifestUrl);
    patchedManifestUrl = URL.createObjectURL(blob);
    link.href = patchedManifestUrl;
  } catch {
    // Manifest patching is best-effort; favicon still updates.
  }
}

export async function applyStoreLogo(logo: string | undefined | null): Promise<void> {
  if (!logo || logo === lastLogo) return;
  lastLogo = logo;
  try {
    const favicon = await squareIcon(logo, 64);
    document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]').forEach((link) => {
      link.type = "image/png";
      link.href = favicon;
    });
    const apple = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
    if (apple) apple.href = await squareIcon(logo, 180);
    await patchManifestIcons(logo);
  } catch {
    // best-effort
  }
}

export async function patchCurrentManifest(): Promise<void> {
  if (!lastLogo) return;
  await patchManifestIcons(lastLogo);
}
