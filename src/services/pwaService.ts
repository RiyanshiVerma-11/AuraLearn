/**
 * PWA Service
 * Handles Service Worker registration, offline events, and app installation prompts.
 */

type InstallPromptCallback = (canInstall: boolean) => void;

class PWAService {
  private deferredPrompt: any = null;
  private listeners: Set<InstallPromptCallback> = new Set();
  private isOffline = !navigator.onLine;

  constructor() {
    if (typeof window !== "undefined") {
      this.init();
    }
  }

  private init() {
    // Register Service Worker
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("[PWA Service] ServiceWorker registered with scope:", reg.scope);
          })
          .catch((err) => {
            console.warn("[PWA Service] ServiceWorker registration failed:", err);
          });
      });
    }

    // Capture install prompt event
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.notifyListeners(true);
    });

    // Monitor app installed
    window.addEventListener("appinstalled", () => {
      console.log("[PWA Service] AuraLearn app was installed successfully!");
      this.deferredPrompt = null;
      this.notifyListeners(false);
    });

    // Online/Offline network monitoring
    window.addEventListener("online", () => {
      this.isOffline = false;
    });

    window.addEventListener("offline", () => {
      this.isOffline = true;
    });
  }

  public subscribeInstallState(callback: InstallPromptCallback): () => void {
    this.listeners.add(callback);
    callback(!!this.deferredPrompt);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(canInstall: boolean) {
    this.listeners.forEach((cb) => cb(canInstall));
  }

  public async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      this.notifyListeners(false);
      return choiceResult.outcome === "accepted";
    } catch (err) {
      console.error("[PWA Service] Error prompting install:", err);
      return false;
    }
  }

  public getCanInstall(): boolean {
    return !!this.deferredPrompt;
  }

  public getIsOffline(): boolean {
    return this.isOffline;
  }
}

export const pwaService = new PWAService();
