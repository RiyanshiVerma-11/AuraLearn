import React from "react";
import {
  Compass,
  LayoutDashboard,
  User,
  MessageSquare,
  BookOpen,
  Sparkles,
  SlidersHorizontal,
  Share2,
  Layers,
  ChevronLeft,
  ChevronRight,
  Target,
  CheckCircle2,
  X,
  Zap,
  TrendingUp,
  HelpCircle,
  LogOut,
  FolderGit2,
  Flame,
  ShieldCheck,
  LogIn,
  Download,
} from "lucide-react";
import { LearningRoadmap, UserProfile, AuthUser, OnboardingStatus } from "../types";
import { calculateRoadmapStats } from "../utils/helpers";
import { BrandLogo } from "./BrandLogo";

interface SidebarProps {
  activeTab: "landing" | "roadmap" | "dashboard" | "profile" | "chat" | "resources";
  setActiveTab: (tab: "landing" | "roadmap" | "dashboard" | "profile" | "chat" | "resources") => void;
  roadmap: LearningRoadmap | null;
  profile: UserProfile;
  authUser: AuthUser | null;
  onboardingStatus?: OnboardingStatus;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenAdaptModal: () => void;
  onOpenExportModal: () => void;
  onOpenNewPathModal: () => void;
  onOpenAuthModal: () => void;
  onSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  roadmap,
  profile,
  authUser,
  onboardingStatus,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onOpenAdaptModal,
  onOpenExportModal,
  onOpenNewPathModal,
  onOpenAuthModal,
  onSignOut,
}) => {
  const stats = calculateRoadmapStats(roadmap);

  const navItems = [
    {
      id: "roadmap" as const,
      label: "Learning Path",
      icon: Compass,
      badge: roadmap ? `${stats.completedSteps}/${stats.totalSteps}` : undefined,
      isCompleted: stats.completedSteps > 0,
      badgeTitle: `${stats.completedSteps} of ${stats.totalSteps} milestones verified`,
    },
    {
      id: "dashboard" as const,
      label: "Skill Radar",
      icon: LayoutDashboard,
      badge: roadmap ? `${stats.percentComplete}%` : undefined,
      badgeTitle: `${stats.percentComplete}% role readiness`,
    },
    {
      id: "chat" as const,
      label: "AI Advisor (Aura)",
      icon: MessageSquare,
      pulse: true,
    },
    {
      id: "resources" as const,
      label: "Resource Hub",
      icon: BookOpen,
      badge: roadmap
        ? `${roadmap.steps.reduce((acc, s) => acc + (s.resources?.length || 0), 0)}`
        : undefined,
    },
    {
      id: "profile" as const,
      label: "Learner Profile",
      icon: User,
    },
    {
      id: "landing" as const,
      label: "Product Overview & FAQs",
      icon: Sparkles,
      highlight: true,
    },
  ];

  const handleNavClick = (tab: "landing" | "roadmap" | "dashboard" | "profile" | "chat" | "resources") => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 border-r border-slate-800 select-none shadow-xs">
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800/80 min-h-[64px]">
        <div
          onClick={() => handleNavClick("roadmap")}
          className="flex items-center gap-3 cursor-pointer group min-w-0"
        >
          {isCollapsed ? (
            <BrandLogo size="sm" showWordmark={false} glow={true} theme="dark" />
          ) : (
            <BrandLogo size="md" showWordmark={true} badgeText="PWA" glow={true} theme="dark" />
          )}
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Primary Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Active Workspace
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                title={isCollapsed ? (item.badgeTitle ? `${item.label} (${item.badgeTitle})` : item.label) : item.badgeTitle}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative group cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive
                      ? "text-white"
                      : item.highlight
                      ? "text-blue-400"
                      : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.pulse && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                    )}
                    {item.badge && !item.pulse && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-colors ${
                          isActive
                            ? "bg-blue-700/80 text-blue-100"
                            : item.isCompleted
                            ? "bg-emerald-950/90 text-emerald-300 border border-emerald-800"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Track Status Widget (when expanded) */}
        {!isCollapsed && roadmap && (
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                <Target className="w-3.5 h-3.5 text-blue-400" />
                Active Track
              </div>
              <span className="text-[10px] font-extrabold text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded border border-blue-800">
                {stats.percentComplete}%
              </span>
            </div>

            <div>
              <div className="text-xs font-bold text-white truncate" title={roadmap.targetRole}>
                {roadmap.targetRole}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {stats.completedSteps} of {stats.totalSteps} milestones verified
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${stats.percentComplete}%` }}
              />
            </div>

            {/* Quick Actions inside Widget */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={() => {
                  onOpenAdaptModal();
                  onCloseMobile();
                }}
                className="px-2 py-1.5 bg-slate-700/60 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                title="Calibrate Path"
              >
                <SlidersHorizontal className="w-3 h-3 text-blue-400" />
                <span>Calibrate</span>
              </button>
              <button
                onClick={() => {
                  onOpenNewPathModal();
                  onCloseMobile();
                }}
                className="px-2 py-1.5 bg-slate-700/60 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                title="Switch Archetype"
              >
                <Layers className="w-3 h-3 text-indigo-400" />
                <span>Presets</span>
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Action Plan Readiness Widget (when expanded) */}
        {!isCollapsed && onboardingStatus && (
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Action Plan
              </div>
              <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                {onboardingStatus.completedCount}/{onboardingStatus.totalCount} Done
              </span>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-200">
                {onboardingStatus.progressPercent === 100 ? "All Actions Ready! 🚀" : "Onboarding Readiness"}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {onboardingStatus.completedCount} of {onboardingStatus.totalCount} actions verified ({onboardingStatus.progressPercent}%)
              </div>
            </div>

            {/* Action plan progress bar */}
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${onboardingStatus.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Quick Utility Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Tools & Workspace
            </div>
          )}
          <button
            onClick={() => {
              onOpenExportModal();
              onCloseMobile();
            }}
            title={isCollapsed ? "Export Roadmap" : undefined}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
            {!isCollapsed && <span>Export Path (MD/JSON)</span>}
          </button>
          <button
            onClick={() => {
              onOpenNewPathModal();
              onCloseMobile();
            }}
            title={isCollapsed ? "Career Archetypes" : undefined}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <Layers className="w-4 h-4 text-slate-400 flex-shrink-0" />
            {!isCollapsed && <span>Browse Archetypes</span>}
          </button>
        </div>
      </div>

      {/* User Footer Profile & Auth Actions */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/90 space-y-2">
        {authUser ? (
          <div className="space-y-2">
            <div
              onClick={() => handleNavClick("profile")}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                {authUser.name ? authUser.name.charAt(0).toUpperCase() : "U"}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">
                      {authUser.name}
                    </span>
                    <span className="text-[9px] font-extrabold text-blue-400 bg-blue-950 px-1 py-0.2 rounded border border-blue-900">
                      {authUser.plan.split(" ")[0]}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {authUser.weeklyHours || profile.weeklyCommitmentHours} hrs/wk • {authUser.streakDays || 1}d Streak 🔥
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <div className="flex items-center justify-between px-2 pt-1 border-t border-slate-800 text-xs">
                <button
                  onClick={onOpenAuthModal}
                  className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Switch Account
                </button>
                <button
                  onClick={onSignOut}
                  className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                  title="Sign out of workspace"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <LogIn className="w-3.5 h-3.5" />
            {!isCollapsed && <span>Sign In to Account</span>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block sticky top-0 h-screen z-30 transition-all duration-200 flex-shrink-0 ${
          isCollapsed ? "w-18" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 transform transition-transform duration-200 ease-in-out md:hidden shadow-2xl border-r border-slate-800 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
