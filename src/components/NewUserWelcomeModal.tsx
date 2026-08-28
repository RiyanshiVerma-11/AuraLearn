import React, { useState } from "react";
import {
  Sparkles,
  User,
  Target,
  Clock,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  SlidersHorizontal,
  X,
  Zap,
  Briefcase,
  Layers,
  ChevronRight,
} from "lucide-react";
import { UserProfile, ExperienceLevel, LearningStyle } from "../types";

interface NewUserWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onGenerateRoadmap: (profile: UserProfile) => Promise<void>;
  onNavigateToFullProfile: () => void;
}

export const NewUserWelcomeModal: React.FC<NewUserWelcomeModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onGenerateRoadmap,
  onNavigateToFullProfile,
}) => {
  const [name, setName] = useState(profile.name || "");
  const [targetRole, setTargetRole] = useState(profile.targetRole || "Generative AI & Systems Engineer");
  const [currentRole, setCurrentRole] = useState(profile.currentRole || "Junior Full-Stack Developer");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(
    profile.experienceLevel || "Intermediate"
  );
  const [weeklyHours, setWeeklyHours] = useState<number>(profile.weeklyCommitmentHours || 10);
  const [learningStyle, setLearningStyle] = useState<LearningStyle>(
    profile.learningStyle || "hands-on-projects"
  );
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const quickRoles = [
    "Generative AI & Systems Engineer",
    "Full-Stack AI Developer",
    "Cloud Solutions & DevOps Architect",
    "Autonomous AI Agent Engineer",
    "Data Scientist & ML Engineer",
    "Senior Distributed Systems Engineer",
  ];

  const handleApplyQuickUpdates = (): UserProfile => {
    const updated: UserProfile = {
      ...profile,
      name: name.trim() || profile.name || "Learner",
      targetRole: targetRole.trim() || profile.targetRole,
      currentRole: currentRole.trim() || profile.currentRole,
      experienceLevel,
      weeklyCommitmentHours: weeklyHours,
      learningStyle,
    };
    onUpdateProfile(updated);
    localStorage.setItem("auralearn_has_customized_profile", "true");
    return updated;
  };

  const handleGoToFullProfile = () => {
    handleApplyQuickUpdates();
    onClose();
    onNavigateToFullProfile();
  };

  const handleQuickGenerate = async () => {
    const updated = handleApplyQuickUpdates();
    setIsGenerating(true);
    try {
      await onGenerateRoadmap(updated);
      onClose();
    } catch (err) {
      console.error("[NewUserWelcomeModal] Quick generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExploreDefault = () => {
    handleApplyQuickUpdates();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/75 backdrop-blur-sm">
      <div
        className="relative w-full max-w-4xl max-h-[85vh] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Gradient Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 flex-shrink-0" />

        {/* Modal Sticky Header */}
        <div className="flex-shrink-0 p-5 sm:p-6 pb-4 bg-gradient-to-b from-blue-50/60 to-white border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="space-y-1 pr-6">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-blue-600 text-white shadow-2xs">
                Welcome to AuraLearn 🎉
              </span>
              <span className="text-xs text-slate-500 font-semibold">• Profile Personalization</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Personalize your learning trajectory, {name || "Learner"}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed max-w-2xl">
              We&apos;ve pre-loaded an initial curriculum. Review or customize your background, dream role, and weekly schedule below:
            </p>
          </div>

          {/* Prominent High-Visibility Close (X) Button */}
          <button
            onClick={handleExploreDefault}
            className="flex-shrink-0 p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-full transition-all shadow-xs cursor-pointer focus:outline-hidden"
            title="Close & explore default path"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body (Wide 2-Column Layout) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Default vs Custom Banner */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 leading-relaxed">
              <span className="font-bold">Default Settings Loaded:</span> Currently configured for{" "}
              <strong>{profile.targetRole}</strong> at <strong>{profile.weeklyCommitmentHours}h/week</strong>. You can adjust them now or jump into the comprehensive profile engine.
            </div>
          </div>

          {/* Wide 2-Column Form Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Personal Identity & Target Role */}
            <div className="space-y-4">
              {/* Name & Current Background */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Chen"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Current Role / Background
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={currentRole}
                      onChange={(e) => setCurrentRole(e.target.value)}
                      placeholder="e.g. Junior Developer"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Target Role & Quick Suggestions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Dream Role / Objective
                </label>
                <div className="relative mb-2">
                  <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Generative AI & Systems Engineer"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-bold focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>

                {/* Quick Role Suggestions */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[11px] text-slate-500 font-semibold self-center mr-1">
                    Quick Select:
                  </span>
                  {quickRoles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setTargetRole(role)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        targetRole === role
                          ? "bg-blue-600 text-white font-bold shadow-2xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Experience Level, Study Hours & Modality */}
            <div className="space-y-4">
              {/* Experience Level & Study Capacity Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Experience Level
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["Beginner", "Intermediate", "Advanced", "Expert"] as ExperienceLevel[]).map(
                      (lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setExperienceLevel(lvl)}
                          className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                            experienceLevel === lvl
                              ? "bg-blue-50 border-blue-500 text-blue-700 font-bold"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {lvl}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Weekly Capacity</span>
                    <span className="text-blue-600 font-bold">{weeklyHours} hrs/wk</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { hrs: 5, label: "5h" },
                      { hrs: 10, label: "10h" },
                      { hrs: 20, label: "20h" },
                      { hrs: 40, label: "40h" },
                    ].map((item) => (
                      <button
                        key={item.hrs}
                        type="button"
                        onClick={() => setWeeklyHours(item.hrs)}
                        className={`p-1.5 rounded-xl text-[11px] font-semibold border transition-all text-center cursor-pointer ${
                          weeklyHours === item.hrs
                            ? "bg-blue-50 border-blue-500 text-blue-700 font-bold"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div className="font-bold">{item.hrs}h</div>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    ~{(weeklyHours / 7).toFixed(1)} hrs/day pacing
                  </p>
                </div>
              </div>

              {/* Preferred Learning Modality */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Preferred Learning Modality
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "hands-on-projects", label: "Hands-on Code" },
                    { id: "interactive-code", label: "Visual & Labs" },
                    { id: "academic-papers", label: "Theory / RFCs" },
                    { id: "case-studies", label: "Diagnostics" },
                  ].map((mod) => (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => setLearningStyle(mod.id as LearningStyle)}
                      className={`p-2 rounded-xl text-[11px] font-semibold border transition-all text-center cursor-pointer ${
                        learningStyle === mod.id
                          ? "bg-blue-50 border-blue-500 text-blue-700 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {mod.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Sticky Action Footer */}
        <div className="flex-shrink-0 p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleExploreDefault}
            className="w-full sm:w-auto text-xs text-slate-600 hover:text-slate-900 font-semibold py-2 px-3 transition-colors cursor-pointer text-center"
          >
            Explore Default Path First
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleGoToFullProfile}
              className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
              <span>Customize Full Skills</span>
            </button>

            <button
              type="button"
              onClick={handleQuickGenerate}
              disabled={isGenerating}
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs shadow-blue-500/20 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Path...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Path with AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
