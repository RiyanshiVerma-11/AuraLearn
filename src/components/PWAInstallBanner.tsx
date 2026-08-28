import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Sparkles, WifiOff, CheckCircle2 } from "lucide-react";
import { pwaService } from "../services/pwaService";
import { BrandLogo } from "./BrandLogo";

export const PWAInstallBanner: React.FC = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Check local storage dismissal
    const wasDismissed = sessionStorage.getItem("pwa_install_dismissed") === "true";
    if (wasDismissed) {
      setDismissed(true);
    }

    const unsub = pwaService.subscribeInstallState((installable) => {
      setCanInstall(installable);
    });

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOffline(!navigator.onLine);

    return () => {
      unsub();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleInstall = async () => {
    const success = await pwaService.promptInstall();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        setDismissed(true);
      }, 3000);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("pwa_install_dismissed", "true");
  };

  if (isOffline) {
    return (
      <div
        id="offline-status-banner"
        className="w-full bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between z-30"
      >
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <WifiOff className="w-4 h-4 text-amber-600 flex-shrink-0 animate-pulse" />
          <span>
            <strong>Offline Mode Active</strong>: AuraLearn cached resources and active roadmap remain fully interactive.
          </span>
        </div>
      </div>
    );
  }

  if (dismissed || !canInstall) {
    return null;
  }

  return (
    <div
      id="pwa-install-banner"
      className="w-full bg-white border-b border-slate-200 px-4 py-3 text-sm z-30 shadow-xs transition-all"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-1.5 rounded-xl bg-blue-50 border border-blue-100 flex-shrink-0">
            <BrandLogo size="sm" showWordmark={false} glow={false} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">Download AuraLearn App</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                PWA
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Install onto your desktop or home screen for offline study, instant access, and full flashscreen launch.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {installSuccess ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Installed Successfully!</span>
            </div>
          ) : (
            <>
              <button
                id="pwa-install-action-btn"
                onClick={handleInstall}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 flex-shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
              <button
                id="pwa-dismiss-btn"
                onClick={handleDismiss}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
