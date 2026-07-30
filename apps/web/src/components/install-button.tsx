import { useState, useEffect } from "react";
import { Smartphone, Download } from "lucide-react";

interface InstallButtonProps {
  admin?: boolean;
  className?: string;
}

export function InstallButton({ admin, className }: InstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    if (admin) {
      const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
      if (link) link.href = "/manifest-admin.json";
    }

    (deferredPrompt as any).prompt();
    await (deferredPrompt as any).userChoice;
    setDeferredPrompt(null);
  };

  if (isInstalled || !deferredPrompt) return null;

  return (
    <button
      onClick={handleInstall}
      className={className || "flex items-center gap-2 text-sm hover:text-primary transition-colors"}
    >
      <Smartphone className="h-4 w-4" />
      <Download className="h-3 w-3" />
      {admin ? "Install Admin" : "Install App"}
    </button>
  );
}
