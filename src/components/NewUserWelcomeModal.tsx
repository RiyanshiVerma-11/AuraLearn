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
    profile.learningStyle || "Hands-on Projects"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Gradient Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />

        {/* Close Button */}
        <button
          onClick={handleExploreDefault}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          title="Explore default roadmap first"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 sm:p-7 pb-4 bg-gradient-to-b from-blue-50/50 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-blue-600 text-white shadow-2xs">
              Welcome to AuraLearn 🎉
            </span>
            <span className="text-xs text-slate-500 font-semibold">• Profile Setup</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Let's personalize your learning trajectory, {name || "there"}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
            We've pre-loaded an initial curriculum for you. To ensure your AI-synthesized roadmap
            accurately reflects your <strong>real background, skill gaps, and schedule</strong>, review or customize your details below:
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 pt-2 space-y-5">
          {/* Default vs Custom Banner */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 leading-relaxed">
              <span className="font-bold">Default Settings Loaded:</span> Currently configured for{" "}
              <strong>{profile.targetRole}</strong> at <strong>{profile.weeklyCommitmentHours}h/week</strong>. You can adjust them now or jump into the comprehensive profile engine.
            </div>
          </div>

          {/* Quick Edit Grid */}
          <div className="space-y-4">
            {/* 1. Name & Current Background */}
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
                    placeholder="e.g. Riyanshi Verma"
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
                    placeholder="e.g. Junior Full-Stack Developer"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 2. Target Dream Role / Objective */}
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

            {/* 3. Experience Level & Weekly Study Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Technical Experience Level
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
                  <span>Weekly Study Capacity</span>
                  <span className="text-blue-600 font-bold">{weeklyHours} hrs/week</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { hrs: 5, label: "5h (Casual)" },
                    { hrs: 10, label: "10h (Balanced)" },
                    { hrs: 20, label: "20h (Active)" },
                    { hrs: 40, label: "40h (Intense)" },
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

            {/* 4. Preferred Learning Modality */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Preferred Learning Modality
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "Hands-on Projects", label: "Hands-on Code" },
                  { id: "Interactive & Visual", label: "Visual & Labs" },
                  { id: "Theory & RFC Deep-Dives", label: "Theory / RFCs" },
                  { id: "Diagnostic & Assessment-Driven", label: "Diagnostics" },
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

        {/* Modal Action Footer */}
        <div className="p-6 sm:p-7 pt-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleExploreDefault}
            className="w-full sm:w-auto text-xs text-slate-500 hover:text-slate-800 font-semibold py-2 px-3 transition-colors cursor-pointer text-center"
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
              <span>Customize Full Skills (1-5)</span>
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
