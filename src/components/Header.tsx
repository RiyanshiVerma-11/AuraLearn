import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  Sparkles,
  SlidersHorizontal,
  Share2,
  Layers,
  ArrowRight,
  Compass,
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  User,
  CheckCircle2,
  ExternalLink,
  LogIn,
  LogOut,
  Flame,
  Download,
  PlaySquare,
  HelpCircle,
  Zap,
} from "lucide-react";
import { LearningRoadmap, UserProfile, AuthUser, RoadmapStep } from "../types";
import { calculateRoadmapStats } from "../utils/helpers";
import { BrandLogo } from "./BrandLogo";
import { pwaService } from "../services/pwaService";

export interface HeaderProps {
  activeTab: "landing" | "roadmap" | "dashboard" | "profile" | "chat" | "resources";
  setActiveTab: (tab: "landing" | "roadmap" | "dashboard" | "profile" | "chat" | "resources") => void;
  roadmap: LearningRoadmap | null;
  profile: UserProfile;
  authUser: AuthUser | null;
  selectedStep?: RoadmapStep | null;
  onClearSelectedStep?: () => void;
  onToggleMobileSidebar: () => void;
  onOpenAdaptModal: () => void;
  onOpenExportModal: () => void;
  onOpenNewPathModal: () => void;
  onOpenAuthModal: (mode?: "signin" | "signup") => void;
  onSignOut: () => void;
}

const LANDING_NAV_LINKS = [
  { id: "how-it-works", label: "How It Works" },
  { id: "features", label: "Features" },
  { id: "archetypes", label: "Archetypes" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
  { id: "feedback", label: "Feedback" },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  roadmap,
  profile,
  authUser,
  selectedStep,
  onClearSelectedStep,
  onToggleMobileSidebar,
  onOpenAdaptModal,
  onOpenExportModal,
  onOpenNewPathModal,
  onOpenAuthModal,
  onSignOut,
}) => {
  const stats = calculateRoadmapStats(roadmap);
  const [canInstall, setCanInstall] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [isMobileLandingMenuOpen, setIsMobileLandingMenuOpen] = useState(false);
  const isClickScrollingRef = useRef(false);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsub = pwaService.subscribeInstallState((installable) => {
      setCanInstall(installable);
    });
    return unsub;
  }, []);

  // Optimized active section scroll spy using Intersection Observer
  useEffect(() => {
    if (activeTab !== "landing") return;

    const sectionIds = [
      "hero",
      "how-it-works",
      "features",
      "before-vs-after",
      "archetypes",
      "pricing",
      "faq",
      "feedback",
    ];

    const elements: HTMLElement[] = [];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) elements.push(el);
    });

    if (elements.length === 0) return;

    const visibleEntries = new Map<string, IntersectionObserverEntry>();

    const calculateActiveSection = () => {
      if (isClickScrollingRef.current) return;

      // Hero / top of page threshold
      if (window.scrollY < 100) {
        setActiveSection("");
        return;
      }

      // Bottom of page threshold (activates last section)
      const isAtBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60;
      if (isAtBottom) {
        setActiveSection("faq");
        return;
      }

      // Find best intersecting element near upper viewport zone
      let bestId = "";
      let minTopDistance = Infinity;

      elements.forEach((el) => {
        const entry = visibleEntries.get(el.id);
        if (entry && entry.isIntersecting) {
          const rect = entry.boundingClientRect;
          const dist = Math.abs(rect.top - 60);
          if (rect.top <= 280 && dist < minTopDistance) {
            minTopDistance = dist;
            bestId = el.id;
          }
        }
      });

      if (!bestId) {
        let maxRatio = 0;
        visibleEntries.forEach((entry, id) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            bestId = id;
          }
        });
      }

      if (bestId) {
        if (bestId === "before-vs-after") {
          setActiveSection("features");
        } else if (bestId === "hero") {
          setActiveSection("");
        } else {
          setActiveSection(bestId);
        }
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibleEntries.set(entry.target.id, entry);
        });
        calculateActiveSection();
      },
      {
        root: null,
        rootMargin: "-60px 0px -45% 0px",
        threshold: [0, 0.15, 0.3, 0.5, 0.75, 1.0],
      }
    );

    elements.forEach((el) => observer.observe(el));

    const handleScrollFallback = () => {
      if (isClickScrollingRef.current) return;

      if (window.scrollY < 100) {
        setActiveSection("");
        return;
      }

      const isAtBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60;
      if (isAtBottom) {
        setActiveSection("faq");
        return;
      }

      calculateActiveSection();
    };

    window.addEventListener("scroll", handleScrollFallback, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScrollFallback);
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, [activeTab]);

  const handlePwaInstall = async () => {
    await pwaService.promptInstall();
  };

  const handleScrollToSection = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    setIsMobileLandingMenuOpen(false);

    // 1. Instantly update active link highlighting
    setActiveSection(sectionId);

    // 2. Lock scroll spy during smooth scroll transition
    isClickScrollingRef.current = true;
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = setTimeout(() => {
      isClickScrollingRef.current = false;
    }, 850);

    // 3. Perform smooth scrolling
    const scrollTarget = () => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.pushState(null, "", `#${sectionId}`);
      }
    };

    if (activeTab !== "landing") {
      setActiveTab("landing");
      setTimeout(scrollTarget, 60);
    } else {
      scrollTarget();
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "roadmap":
        return "Learning Path & Deliverables";
      case "dashboard":
        return "Skill Radar & Diagnostics";
      case "chat":
        return "AI Career Architect Advisor (Aura)";
      case "resources":
        return "High-Yield Curated Resource Hub";
      case "profile":
        return "Learner Profile & Calibration";
      case "landing":
        return "AuraLearn Platform";
      default:
        return "Roadmap Engine";
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md text-slate-200 border-b border-slate-800 shadow-md transition-all">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-3">
          {/* Left: Brand Logo or Mobile Menu Button & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Show mobile sidebar toggle only in app tabs when user is logged in */}
            {activeTab !== "landing" && (
              <button
                onClick={onToggleMobileSidebar}
                className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden focus:outline-hidden cursor-pointer"
                aria-label="Toggle navigation drawer"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {/* Brand logo (shown only on landing page to avoid duplication with sidebar when inside app) */}
            {activeTab === "landing" && (
              <div
                onClick={() => {
                  setActiveTab("landing");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center cursor-pointer mr-2 flex-shrink-0"
                title="AuraLearn Home"
              >
                <BrandLogo size="sm" showWordmark={true} badgeText="PWA" glow={true} theme="dark" />
              </div>
            )}

            {/* Breadcrumb Context (when in app mode) */}
            {activeTab !== "landing" && (
              <div className="min-w-0 flex items-center gap-2">
                {selectedStep ? (
                  <div className="flex items-center gap-2 truncate">
                    <button
                      onClick={onClearSelectedStep}
                      className="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Roadmap</span>
                    </button>
                    <span className="text-slate-600">/</span>
                    <span className="text-xs font-bold text-blue-400 truncate max-w-[180px] sm:max-w-[320px]">
                      {selectedStep.title}
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="text-xs font-bold text-white tracking-tight truncate hidden sm:inline">
                      {getTabTitle()}
                    </span>
                    <span className="text-xs font-bold text-white tracking-tight truncate sm:hidden">
                      {getTabTitle().split("&")[0]}
                    </span>

                    {roadmap && (
                      <>
                        <span className="text-slate-600 hidden sm:inline">•</span>
                        <span className="text-xs text-blue-400 font-semibold truncate hidden md:inline">
                          {roadmap.targetRole}
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Center: Landing Page Nav Links with Smooth Scrolling */}
          {activeTab === "landing" && (
            <nav className="hidden md:flex items-center gap-1 lg:gap-1.5" aria-label="Landing Page Navigation">
              {LANDING_NAV_LINKS.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <a
                    key={link.id}
                    id={`nav-link-${link.id}`}
                    href={`#${link.id}`}
                    onClick={(e) => handleScrollToSection(e, link.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "text-blue-400 bg-slate-800 font-bold shadow-xs border border-blue-500/30"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent"
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
            </nav>
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* PWA Install Button in Header */}
            {canInstall && (
              <button
                id="btn-header-install-pwa"
                onClick={handlePwaInstall}
                title="Install AuraLearn App to Home Screen"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
            )}

            {activeTab === "landing" ? (
              <div className="flex items-center gap-2 sm:gap-2.5">
                {authUser ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab("roadmap")}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-xs cursor-pointer"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={onSignOut}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      id="btn-header-signin"
                      onClick={() => onOpenAuthModal("signin")}
                      className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-transparent hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      Sign In
                    </button>
                    <button
                      id="btn-header-signup"
                      onClick={() => onOpenAuthModal("signup")}
                      className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Mobile menu toggle for Landing Page */}
                <button
                  id="btn-landing-mobile-menu"
                  onClick={() => setIsMobileLandingMenuOpen(!isMobileLandingMenuOpen)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg md:hidden transition-colors cursor-pointer ml-1"
                  aria-label="Toggle navigation menu"
                >
                  {isMobileLandingMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              </div>
            ) : (
              <>
                {/* Progress Pill */}
                {roadmap && (
                  <div
                    onClick={() => setActiveTab("dashboard")}
                    className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-800/80 border border-slate-700/80 rounded-lg text-xs cursor-pointer hover:border-slate-600 transition-colors"
                    title="View Progress & Diagnostic Radar"
                  >
                    <span className="text-slate-400 font-medium">Progress:</span>
                    <span className="text-blue-400 font-bold">
                      {stats.percentComplete}% ({stats.completedSteps}/{stats.totalSteps})
                    </span>
                  </div>
                )}

                {/* Calibrate Quick Button */}
                <button
                  id="btn-header-calibrate"
                  onClick={onOpenAdaptModal}
                  title="Calibrate roadmap with custom feedback"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Calibrate</span>
                </button>

                {/* Export Button */}
                <button
                  id="btn-header-export"
                  onClick={onOpenExportModal}
                  title="Export roadmap to JSON/Markdown"
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {/* User Info / Sign Out Button */}
                {authUser ? (
                  <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
                    <div
                      onClick={() => setActiveTab("profile")}
                      className="flex items-center gap-2 cursor-pointer p-1 rounded-lg hover:bg-slate-800 transition-colors"
                      title={`${authUser.name} (${authUser.roleTitle})`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        {authUser.name ? authUser.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <span className="text-xs font-semibold text-slate-200 hidden xl:inline">
                        {authUser.name.split(" ")[0]}
                      </span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => onOpenAuthModal("signin")}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer ml-1"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Landing Dropdown Menu */}
        {activeTab === "landing" && isMobileLandingMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-1">
              {LANDING_NAV_LINKS.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <a
                    key={link.id}
                    id={`mobile-nav-link-${link.id}`}
                    href={`#${link.id}`}
                    onClick={(e) => handleScrollToSection(e, link.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                      isActive
                        ? "text-blue-400 bg-slate-800 font-bold border border-blue-500/30"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent"
                    }`}
                  >
                    <span>{link.label}</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isActive ? "text-blue-400" : "text-slate-500"}`} />
                  </a>
                );
              })}

              {canInstall && (
                <button
                  onClick={() => {
                    setIsMobileLandingMenuOpen(false);
                    handlePwaInstall();
                  }}
                  className="mt-2 w-full py-2 px-3 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Install AuraLearn App (PWA)</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

