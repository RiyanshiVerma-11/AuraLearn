import React from "react";
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Award,
  Zap,
  Flame,
  Calendar,
  Sparkles,
  ArrowRight,
  BookOpen,
  Target,
  ShieldCheck,
  Star,
  Check,
} from "lucide-react";
import { LearningRoadmap, RoadmapStep, UserProfile, AuthUser } from "../types";
import { calculateRoadmapStats, getNextRecommendedSteps } from "../utils/helpers";
import { DEFAULT_INITIAL_ROADMAP } from "../data/presets";
import { SkillGapVisualizer } from "./SkillGapVisualizer";
import { LearningVelocityChart } from "./LearningVelocityChart";
import { CurriculumModalityMatrix } from "./CurriculumModalityMatrix";

interface DashboardViewProps {
  roadmap: LearningRoadmap | null;
  profile: UserProfile;
  authUser?: AuthUser | null;
  onSelectStep: (step: RoadmapStep) => void;
  onToggleComplete: (stepId: string) => void;
  onNavigateToRoadmap: () => void;
  onNavigateToChat: () => void;
  onOpenCertificate?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  roadmap,
  profile,
  authUser,
  onSelectStep,
  onToggleComplete,
  onNavigateToRoadmap,
  onNavigateToChat,
  onOpenCertificate,
}) => {
  const activeRoadmap = roadmap || DEFAULT_INITIAL_ROADMAP;

  const stats = calculateRoadmapStats(activeRoadmap);
  const nextSteps = getNextRecommendedSteps(activeRoadmap, 3);

  // Compute mastery level title
  let masteryLevel = "Novice Explorer";
  let badgeColor = "bg-slate-800 text-blue-400 border border-slate-700";
  if (stats.percentComplete >= 80) {
    masteryLevel = "Principal Architect";
    badgeColor = "bg-blue-900/60 text-blue-300 border border-blue-700";
  } else if (stats.percentComplete >= 50) {
    masteryLevel = "Autonomous Specialist";
    badgeColor = "bg-blue-950 text-blue-300 border border-blue-800";
  } else if (stats.percentComplete >= 20) {
    masteryLevel = "Emerging Practitioner";
    badgeColor = "bg-slate-800 text-emerald-300 border border-slate-700";
  }

  // Days of week schedule — dynamically derived from user's learning style and roadmap domain
  const dailyTargetHours = (profile.weeklyCommitmentHours / 5).toFixed(1);
  const primaryDomain = profile.domainsOfInterests?.[0] || activeRoadmap.targetRole || "Core Skills";
  const secondaryDomain = profile.domainsOfInterests?.[1] || "Applied Engineering";
  const style = profile.learningStyle || "hands-on-projects";
  const isHandsOn = style.includes("hands") || style.includes("project");
  const isTheory = style.includes("academic") || style.includes("theory") || style.includes("RFC");

  const daysOfWeek = [
    { day: "Mon", focus: isTheory ? `${primaryDomain} — Theory & Architecture` : `${primaryDomain} — Core Concepts`, hours: `${dailyTargetHours}h` },
    { day: "Tue", focus: isHandsOn ? "Hands-on Code Lab & Implementation" : `${primaryDomain} — Guided Practice`, hours: `${dailyTargetHours}h` },
    { day: "Wed", focus: `${secondaryDomain} — Deep Dive`, hours: `${dailyTargetHours}h` },
    { day: "Thu", focus: "Milestone Assessment & Code Review", hours: `${dailyTargetHours}h` },
    { day: "Fri", focus: "Portfolio Capstone & Project Work", hours: `${dailyTargetHours}h` },
    { day: "Sat", focus: "Self-Paced Research & Review", hours: "Optional" },
    { day: "Sun", focus: "Roadmap Calibration & Planning", hours: "15m" },
  ];

  const streakDays = authUser?.streakDays ?? 0;

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Top Welcome Card */}
      <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                {masteryLevel}
              </span>
              {streakDays > 0 && (
                <span className="text-xs text-slate-600 flex items-center gap-1 font-semibold">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {streakDays}-Day Active Streak
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {profile.name || "Learner"}&apos;s Executive Radar
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              Tracking your verified milestone journey toward becoming an industry-ready{" "}
              <strong className="text-slate-900 font-semibold">{activeRoadmap.targetRole}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {onOpenCertificate && (
              <button
                onClick={onOpenCertificate}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors whitespace-nowrap cursor-pointer"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>Executive Certificate</span>
              </button>
            )}

            <button
              onClick={onNavigateToChat}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Calibrate Next Steps</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Progress</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {stats.percentComplete}%
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.percentComplete}%` }}
            />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Milestones Mastered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {stats.completedSteps}{" "}
            <span className="text-sm font-normal text-slate-400">/ {stats.totalSteps}</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {stats.totalSteps - stats.completedSteps} remaining
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Hours Invested</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {stats.completedHours}{" "}
            <span className="text-sm font-normal text-slate-400">/ {stats.totalHours}h</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            ~{profile.weeklyCommitmentHours} hrs planned / week
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Quizzes Passed</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {stats.passedQuizzes}{" "}
            <span className="text-sm font-normal text-slate-400">Verified</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Assessments cleared</p>
        </div>
      </div>

      {/* Next Recommended Action Radar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600 fill-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Next Priority Milestones</h2>
          </div>
          <button
            onClick={onNavigateToRoadmap}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            View Full Pathway <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {nextSteps.map((st, i) => (
            <div
              key={st.id}
              className="p-5 bg-white border border-slate-200 hover:border-blue-300 rounded-xl transition-all shadow-xs hover:shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                    Milestone {i + 1}
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-slate-400" /> {st.estimatedHours}h
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{st.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2">{st.shortSummary}</p>

                {/* AI Explainability Callout */}
                <div className="p-2.5 bg-blue-50/80 border border-blue-100/90 rounded-lg space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-900 uppercase tracking-wide">
                    <Sparkles className="w-3 h-3 text-blue-600 flex-shrink-0" />
                    <span>AI Recommendation Reasoning</span>
                  </div>
                  <p className="text-[11px] text-blue-950 leading-relaxed line-clamp-3 font-medium">
                    {st.reasoning || st.aiWhyRecommended}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => onSelectStep(st)}
                  className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Launch Milestone
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Predictive Velocity Burn-up & Role Readiness Chart */}
      <LearningVelocityChart roadmap={activeRoadmap} profile={profile} />

      {/* Two-Column Analytics Grid: Skill Gap Radar & Curriculum Modality Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6">
          <SkillGapVisualizer skillGaps={activeRoadmap.skillGaps} targetRole={activeRoadmap.targetRole} />
        </div>
        <div className="lg:col-span-6">
          <CurriculumModalityMatrix roadmap={activeRoadmap} profile={profile} />
        </div>
      </div>

      {/* Dynamic Weekly Study Schedule Planner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Weekly Allocation Matrix ({profile.weeklyCommitmentHours} hrs/week)
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Tuned for {profile.learningStyle} learning
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {daysOfWeek.map((d, di) => (
            <div
              key={di}
              className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 flex flex-col justify-between shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{d.day}</span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
                    {d.hours}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug font-medium">{d.focus}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Milestone Achievements & Badges */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">Verification & Credentials</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-white border border-blue-200 rounded-xl text-center space-y-1 shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-1">
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-blue-950">Fast Starter</div>
            <div className="text-[10px] text-blue-700">Roadmap Initialized</div>
          </div>

          <div
            className={`p-4 border rounded-xl text-center space-y-1 ${
              stats.completedSteps >= 1
                ? "bg-white border-emerald-300 text-emerald-950 shadow-2xs"
                : "bg-white border-slate-200 opacity-60"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 ${
                stats.completedSteps >= 1 ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400 border border-slate-200"
              }`}
            >
              <Check className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold">First Milestone</div>
            <div className="text-[10px] text-slate-500">Step 1 Verified</div>
          </div>

          <div
            className={`p-4 border rounded-xl text-center space-y-1 ${
              stats.passedQuizzes >= 2
                ? "bg-white border-amber-300 text-amber-950 shadow-2xs"
                : "bg-white border-slate-200 opacity-60"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 ${
                stats.passedQuizzes >= 2 ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-400 border border-slate-200"
              }`}
            >
              <Star className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold">Quiz Master</div>
            <div className="text-[10px] text-slate-500">2+ Quizzes Cleared</div>
          </div>

          <div
            className={`p-4 border rounded-xl text-center space-y-1 ${
              stats.percentComplete >= 100
                ? "bg-white border-purple-300 text-purple-950 shadow-2xs"
                : "bg-white border-slate-200 opacity-60"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 ${
                stats.percentComplete >= 100 ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-400 border border-slate-200"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold">Career Certified</div>
            <div className="text-[10px] text-slate-500">100% Pathway Complete</div>
          </div>
        </div>
      </div>
    </div>
  );
};
