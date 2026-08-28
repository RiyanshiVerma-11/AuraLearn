import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowRight,
  Target,
  Compass,
  MessageSquare,
  BookOpen,
  SlidersHorizontal,
  Zap,
  ChevronDown,
  ChevronUp,
  X,
  Play,
  Check,
  Flame,
  Award,
} from "lucide-react";
import { LearningRoadmap, UserProfile, AuthUser, OnboardingStatus } from "../types";

interface NextStepsGuideProps {
  roadmap: LearningRoadmap | null;
  profile: UserProfile;
  authUser: AuthUser | null;
  onboardingStatus: OnboardingStatus;
  onToggleAction: (actionId: string) => void;
  onNavigateToTab: (tab: "roadmap" | "dashboard" | "profile" | "chat" | "resources") => void;
  onOpenCalibrate: () => void;
}

export const NextStepsGuide: React.FC<NextStepsGuideProps> = ({
  roadmap,
  profile,
  authUser,
  onboardingStatus,
  onToggleAction,
  onNavigateToTab,
  onOpenCalibrate,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  if (isDismissed) return null;

  const { items: guideSteps, completedCount, progressPercent } = onboardingStatus;

  return (
    <div className="mb-6 rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Banner Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-4 border-b border-slate-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight truncate">
                Onboarding & Action Plan: Next Steps for {authUser?.name || profile.name || "You"}
              </h2>
              <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                {completedCount} of {guideSteps.length} Actions Done ({progressPercent}%)
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              Complete these recommended actions to maximize your learning velocity and verify competencies.
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
          >
            <span className="hidden md:inline">{isExpanded ? "Collapse Guide" : "Expand Guide"}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            title="Dismiss Guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Content Body */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Linear Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-slate-600">
              <span className="font-semibold text-slate-700">Action Plan Execution Progress</span>
              <span className="text-blue-600 font-bold">
                {completedCount} of {guideSteps.length} action items completed ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Action Step Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 pt-2">
            {guideSteps.map((step) => (
              <div
                key={step.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                  step.isCompleted
                    ? "bg-white border-emerald-200 text-slate-800 shadow-2xs"
                    : step.highlight
                    ? "bg-white border-blue-300 text-slate-900 shadow-xs"
                    : "bg-white border-slate-200 text-slate-800 hover:border-slate-300 shadow-2xs"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      STEP {step.stepNumber}
                    </span>
                    <button
                      onClick={() => onToggleAction(step.id)}
                      title={step.isCompleted ? "Click to mark pending" : "Click to mark completed"}
                      className="cursor-pointer transition-transform hover:scale-105"
                    >
                      {step.isCompleted ? (
                        <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">
                          <Check className="w-3 h-3 text-emerald-600" /> Done
                        </span>
                      ) : step.highlight ? (
                        <span className="flex items-center gap-1 text-[10px] font-extrabold text-blue-700 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200">
                          <Flame className="w-3 h-3 text-amber-500 fill-amber-500" /> Current Focus
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50">
                          Pending
                        </span>
                      )}
                    </button>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <button
                  onClick={() => onNavigateToTab(step.targetTab)}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    step.isCompleted
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                      : step.highlight
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                  }`}
                >
                  <span>{step.actionLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
