import { useState, useEffect } from "react";
import { Smartphone, Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { patchCurrentManifest } from "@/lib/store-logo";

interface InstallButtonProps {
  admin?: boolean;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

type InstallPromptEvent = Event & {
  prompt: () => void;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function getPlatform() {
  const ua = navigator.userAgent;
  const isIOS =
    /iphone|ipad|ipod/i.test(ua) ||
    (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
  const isAndroid = /android/i.test(ua);
  return { isIOS, isAndroid, isDesktop: !isIOS && !isAndroid };
}

export function InstallButton({ admin, className, variant = "outline", size = "sm" }: InstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as InstallPromptEvent);
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

  // Directly invoke the browser's native "Add to Home Screen / Install app"
  // prompt. Falls back to platform instructions when the browser does not
  // support the native prompt (e.g. iOS Safari).
  const handleInstall = async () => {
    if (isInstalled) return;

    if (deferredPrompt) {
      if (admin) {
        const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
        if (link) {
          link.href = "/manifest-admin.json";
          await patchCurrentManifest();
        }
      }
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }

    setShowHelp(true);
  };

  const { isIOS, isAndroid, isDesktop } = getPlatform();

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleInstall}
        disabled={isInstalled}
        title={isInstalled ? "App installed" : "Install app / Add to Home Screen"}
        className={className}
      >
        {isInstalled ? (
          <Check className="h-4 w-4" />
        ) : (
          <>
            <Smartphone className="h-4 w-4 shrink-0" />
            <Download className="h-3 w-3 shrink-0" />
          </>
        )}
        <span className="whitespace-nowrap">
          {isInstalled ? "Installed" : admin ? "Install Admin" : "Install App"}
        </span>
      </Button>

      <Dialog
        open={showHelp}
        onClose={() => setShowHelp(false)}
        title="Add to Home Screen"
        description="Install this app on your device for quick access and a full-screen experience."
      >
        {isIOS ? (
          <ol className="space-y-4 text-sm">
            <Step n={1} title="Tap the Share button">
              Tap the <b>Share</b> icon (square with an up arrow) in the Safari toolbar at the bottom of the screen.
            </Step>
            <Step n={2} title="Choose “Add to Home Screen”">
              Scroll the share menu and tap <b>Add to Home Screen</b>.
            </Step>
            <Step n={3} title="Confirm">
              Tap <b>Add</b> in the top-right corner. The app icon will appear on your home screen.
            </Step>
          </ol>
        ) : isAndroid ? (
          <ol className="space-y-4 text-sm">
            <Step n={1} title="Open the browser menu">
              Tap the <b>⋮</b> menu button in the top-right corner of your browser.
            </Step>
            <Step n={2} title="Install the app">
              Tap <b>Add to Home screen</b> or <b>Install app</b>.
            </Step>
            <Step n={3} title="Confirm">
              Tap <b>Add</b> / <b>Install</b>. The app icon will appear on your home screen.
            </Step>
          </ol>
        ) : (
          <ol className="space-y-4 text-sm">
            <Step n={1} title="Use the browser install icon">
              Click the <b>install icon</b> in the address bar of your browser (Chrome, Edge, or Safari).
            </Step>
            <Step n={2} title="Install">
              Click <b>Install</b> to add {admin ? "the Admin Panel" : "the app"} to your desktop.
            </Step>
          </ol>
        )}
        {isDesktop && (
          <p className="mt-4 text-xs text-muted-foreground">
            Tip: if no install icon appears, look for <b>Install app</b> or <b>Add to Home Screen</b> in your browser menu.
          </p>
        )}
      </Dialog>
    </>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
        {n}
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 text-muted-foreground leading-relaxed">{children}</p>
      </div>
    </li>
  );
}
