import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BrandLogo } from "./BrandLogo";
import { Sparkles, ArrowRight, ShieldCheck, Wifi, Download, Zap } from "lucide-react";
import { pwaService } from "../services/pwaService";

interface SplashScreenProps {
  onComplete: () => void;
  isManualPreview?: boolean;
}

const SPLASH_STEPS = [
  { text: "Initializing Aura Neural Engine...", progress: 22 },
  { text: "Loading Diagnostic Skill Vectors...", progress: 48 },
  { text: "Mounting Offline PWA Service...", progress: 75 },
  { text: "Calibrating Career Milestones...", progress: 92 },
  { text: "System Ready!", progress: 100 },
];

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  isManualPreview = false,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const unsub = pwaService.subscribeInstallState((installable) => {
      setCanInstall(installable);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < SPLASH_STEPS.length - 1) {
          const nextIndex = prev + 1;
          setProgress(SPLASH_STEPS[nextIndex].progress);
          return nextIndex;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 600);
          return prev;
        }
      });
    }, 650);

    return () => clearInterval(interval);
  }, [onComplete]);

  const handleInstallClick = async () => {
    await pwaService.promptInstall();
  };

  return (
    <AnimatePresence>
      <motion.div
        id="splashscreen-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-between p-6 sm:p-10 bg-white text-slate-900 overflow-hidden select-none"
      >
        {/* Background Glowing Subtle Gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-50/70 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl" />
          <div className="absolute top-10 left-10 w-72 h-72 bg-sky-50/50 rounded-full blur-3xl" />
          
          {/* Subtle Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Top Bar Status */}
        <div className="relative z-10 w-full max-w-xl flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold text-slate-800">PWA Ready</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">v2.4.0</span>
          </div>

          {canInstall && (
            <button
              id="splash-install-btn"
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}
        </div>

        {/* Center Hero: Fantastic Logo & Dynamic Aura Waves */}
        <div className="relative z-10 flex flex-col items-center text-center my-auto max-w-md w-full">
          {/* Multi-layered Pulsing Orbital Rings */}
          <div className="relative mb-8 flex items-center justify-center">
            {/* Outer Energy Pulse Ring */}
            <motion.div
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -inset-8 rounded-full border border-blue-200"
            />
            
            {/* Mid Energy Pulse Ring */}
            <motion.div
              animate={{
                scale: [1.1, 0.95, 1.1],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -inset-4 rounded-full border border-indigo-200"
            />

            {/* Main Brand Logo Graphic */}
            <motion.div
              initial={{ scale: 0.8, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <BrandLogo size="splash" showWordmark={false} glow={false} animated={true} />
            </motion.div>
          </div>

          {/* App Title & Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 flex items-center justify-center gap-2">
              Aura<span className="text-blue-600">Learn</span>
              <Sparkles className="w-6 h-6 text-blue-600 animate-spin" style={{ animationDuration: "6s" }} />
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-medium max-w-sm mx-auto">
              Autonomous AI Learning & Career Architect
            </p>
          </motion.div>

          {/* Dynamic Progress Loader */}
          <div className="w-full max-w-xs mt-8 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-blue-700 flex items-center gap-1.5 truncate">
                <Zap className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 animate-bounce" />
                {SPLASH_STEPS[currentStepIndex].text}
              </span>
              <span className="text-slate-500 tabular-nums">{progress}%</span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5 shadow-inner">
              <motion.div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${progress}%` }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>

            <div className="flex items-center justify-center gap-4 pt-1 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> End-to-End Prereqs
              </span>
              <span className="flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 text-blue-600" /> Offline Cached
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Motivational Quote & Quick Skip Button */}
        <div className="relative z-10 w-full max-w-xl flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 text-xs text-slate-500">
          <p className="text-center sm:text-left text-slate-600 italic">
            "Your personalized roadmap is calibrated for high-leverage outcomes."
          </p>

          <button
            id="splash-skip-btn"
            onClick={onComplete}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-semibold transition-all group flex-shrink-0 cursor-pointer shadow-2xs"
          >
            <span>{isManualPreview ? "Close Preview" : "Launch App"}</span>
            <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
