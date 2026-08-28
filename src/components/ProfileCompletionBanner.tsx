import React from "react";
import { Sparkles, SlidersHorizontal, ArrowRight, X, User } from "lucide-react";
import { UserProfile } from "../types";

interface ProfileCompletionBannerProps {
  profile: UserProfile;
  onOpenProfileTab: () => void;
  onOpenWelcomeModal: () => void;
  onDismiss: () => void;
}

export const ProfileCompletionBanner: React.FC<ProfileCompletionBannerProps> = ({
  profile,
  onOpenProfileTab,
  onOpenWelcomeModal,
  onDismiss,
}) => {
  return (
    <div className="mb-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-4.5 border border-blue-800/80 shadow-sm relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
                Personalization Tip
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                Welcome, {profile.name || "Learner"}! You're viewing default curriculum settings.
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">
              Currently configured for <strong>{profile.targetRole}</strong> at{" "}
              <strong>{profile.weeklyCommitmentHours} hrs/week</strong>. Rate your current skills (1 to 5) and customize your baseline so AI can tailor prerequisites and timeline forecasts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 self-start md:self-center">
          <button
            onClick={onOpenWelcomeModal}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
            <span>Quick Setup</span>
          </button>

          <button
            onClick={onOpenProfileTab}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <span>Edit Profile & Skills</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onDismiss}
            title="Dismiss reminder"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
