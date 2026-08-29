import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  Lock,
  PlayCircle,
  Clock,
  Award,
  ChevronRight,
  BookOpen,
  Check,
  Search,
  Zap,
  Layers,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { LearningRoadmap, RoadmapStep } from "../types";
import { calculateRoadmapStats } from "../utils/helpers";

interface RoadmapGraphViewProps {
  roadmap: LearningRoadmap | null;
  profile?: any;
  onSelectStep: (step: RoadmapStep) => void;
  onToggleComplete: (stepId: string) => void;
  onOpenAdaptModal: () => void;
}

export const RoadmapGraphView: React.FC<RoadmapGraphViewProps> = ({
  roadmap,
  profile,
  onSelectStep,
  onToggleComplete,
  onOpenAdaptModal,
}) => {
  const [filterPhase, setFilterPhase] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  if (!roadmap) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Learning Path Initialized</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
          Configure your learner profile or select a career archetype to synthesize your personalized roadmap.
        </p>
      </div>
    );
  }

  const stats = calculateRoadmapStats(roadmap);

  const filteredSteps = roadmap.steps.filter((step) => {
    const matchesPhase = filterPhase === "all" || step.phaseIndex === filterPhase;
    const matchesSearch =
      !searchQuery ||
      step.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      step.skillsAcquired.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      step.shortSummary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPhase && matchesSearch;
  });

  // Identify next uncompleted step for daily recommendation
  const currentActiveStep = roadmap.steps.find((s) => s.status === "in_progress") ||
    roadmap.steps.find((s) => s.status === "up_next") ||
    roadmap.steps[0];

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Offline Dynamic Fallback Notice Banner */}
      {roadmap.isFallback && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 shadow-xs flex items-start gap-3.5 text-amber-900">
          <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs sm:text-sm">
            <div className="flex items-center gap-2 font-bold text-amber-900 flex-wrap">
              <span>Offline / API Fallback Mode Active</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-200 text-amber-900 font-bold border border-amber-300">
                Live AI Engine Unreachable
              </span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              The live AI generation service is currently disconnected or model limits were exceeded. A standard starter preview roadmap is displayed below. To generate a 100% custom AI roadmap tailored to <strong>"{roadmap.targetRole}"</strong>, please ensure Gemini / Groq API keys are active or try again when reconnected.
            </p>
          </div>
        </div>
      )}

      {/* Personalized AI Roadmap Status Banner */}
      <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-blue-800/60 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-mono font-bold uppercase tracking-wider border border-blue-400/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Personalized AI Curriculum Generated</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
            Welcome back, <span className="text-blue-300 font-black">{profile?.name || "Learner"}</span>! Your personalized roadmap is ready.
          </h2>
          <p className="text-xs text-slate-300 font-normal">
            Calibrated specifically for your <strong className="text-white">{profile?.experienceLevel || roadmap.difficulty}</strong> baseline toward <strong className="text-blue-200">{roadmap.targetRole}</strong>.
          </p>
        </div>
        <button
          onClick={() => onSelectStep(currentActiveStep)}
          className="relative z-10 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer flex-shrink-0"
        >
          <span>Continue Active Milestone</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Roadmap Overview Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
                {roadmap.targetRole}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                Difficulty: {roadmap.difficulty}
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                ~{roadmap.totalEstimatedWeeks} Weeks ({stats.totalHours} hrs total)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {roadmap.title}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">{roadmap.summary}</p>
          </div>

          {/* Progress Box */}
          <div className="flex sm:flex-col items-end justify-between sm:justify-center p-4 bg-white border border-slate-200 rounded-xl min-w-[220px] shadow-2xs">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Overall Progress
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stats.percentComplete}%` }}
                  />
                </div>
                <span className="text-base font-extrabold text-blue-600">{stats.percentComplete}%</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-2 font-medium">
              {stats.completedSteps} of {stats.totalSteps} Milestones Verified
            </div>
          </div>
        </div>

        {/* AI Calibration Note */}
        {roadmap.aiPersonalizationNotes && (
          <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-950 leading-relaxed">
              <strong className="font-bold text-blue-900">AI Pedagogical Alignment: </strong>
              {roadmap.aiPersonalizationNotes}
            </div>
          </div>
        )}

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          {/* Phase Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterPhase("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                filterPhase === "all"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              All Phases ({roadmap.steps.length})
            </button>
            {roadmap.phases.map((ph) => (
              <button
                key={ph.phaseIndex}
                onClick={() => setFilterPhase(ph.phaseIndex)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  filterPhase === ph.phaseIndex
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                P{ph.phaseIndex}: {ph.title.split(" ")[0]}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skill, milestone, deliverable..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 transition-all shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Structured Roadmap Timeline / Phases */}
      <div className="space-y-12">
        {roadmap.phases
          .filter((ph) => filterPhase === "all" || filterPhase === ph.phaseIndex)
          .map((phase) => {
            const phaseSteps = filteredSteps.filter((s) => s.phaseIndex === phase.phaseIndex);
            if (phaseSteps.length === 0) return null;

            const completedPhaseCount = phaseSteps.filter((s) => s.status === "completed").length;
            const phasePercent = Math.round((completedPhaseCount / phaseSteps.length) * 100);

            return (
              <div key={phase.phaseIndex} className="space-y-4">
                {/* Phase Header */}
                <div className="flex items-center justify-between bg-white text-slate-900 px-5 py-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      P{phase.phaseIndex}
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 tracking-tight">{phase.title}</h2>
                      <p className="text-xs text-slate-500">{phase.description}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-600">
                      {completedPhaseCount}/{phaseSteps.length} Verified
                    </span>
                    <div className="hidden sm:block w-24 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${phasePercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Steps List with Elegant Vertical Timeline Spine */}
                <div className="relative pl-9 sm:pl-10 space-y-6 before:content-[''] before:absolute before:left-3.5 sm:before:left-4 before:top-4 before:bottom-4 before:w-[2px] before:bg-blue-100">
                  {phaseSteps.map((step) => {
                    const isCompleted = step.status === "completed";
                    const isInProgress = step.status === "in_progress";
                    const isUpNext = step.status === "up_next";
                    const isLocked = step.status === "locked";

                    // Node marker dot
                    let nodeMarker = (
                      <div className="absolute -left-[28px] sm:-left-[30px] top-4 w-6 h-6 bg-slate-100 border-4 border-white rounded-full shadow-xs flex items-center justify-center text-[10px] text-slate-400 z-10">
                        <Lock className="w-2.5 h-2.5" />
                      </div>
                    );

                    if (isCompleted) {
                      nodeMarker = (
                        <div className="absolute -left-[28px] sm:-left-[30px] top-4 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full shadow-xs flex items-center justify-center text-[10px] font-bold text-white z-10">
                          ✓
                        </div>
                      );
                    } else if (isInProgress) {
                      nodeMarker = (
                        <div className="absolute -left-[28px] sm:-left-[30px] top-4 w-6 h-6 bg-blue-600 border-4 border-white rounded-full shadow-xs animate-pulse z-10" />
                      );
                    } else if (isUpNext) {
                      nodeMarker = (
                        <div className="absolute -left-[28px] sm:-left-[30px] top-4 w-6 h-6 bg-amber-400 border-4 border-white rounded-full shadow-xs z-10" />
                      );
                    }

                    return (
                      <div key={step.id} className="relative">
                        {nodeMarker}

                        <div
                          id={`roadmap-step-card-${step.id}`}
                          className={`bg-white rounded-xl transition-all ${
                            isInProgress
                              ? "p-5 sm:p-6 border-2 border-blue-500 shadow-md"
                              : isCompleted
                              ? "p-4 sm:p-5 border border-blue-100 shadow-xs hover:border-blue-300"
                              : isUpNext
                              ? "p-4 sm:p-5 border border-amber-200/90 shadow-xs hover:border-amber-300"
                              : "p-4 sm:p-5 border border-slate-200 shadow-2xs opacity-75 hover:opacity-100"
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="space-y-2 flex-1">
                              {/* Tag row */}
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {isInProgress && (
                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                                      Current Focus
                                    </span>
                                  )}
                                  {isCompleted && (
                                    <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-bold border border-emerald-200">
                                      VERIFIED
                                    </span>
                                  )}
                                  {isUpNext && (
                                    <span className="bg-amber-50 text-amber-800 text-[10px] px-2 py-0.5 rounded font-bold border border-amber-200">
                                      UP NEXT
                                    </span>
                                  )}
                                  {isLocked && (
                                    <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded font-bold">
                                      LOCKED
                                    </span>
                                  )}

                                  <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    {step.estimatedHours} hrs
                                  </span>

                                  {step.prerequisites && step.prerequisites.length > 0 && (
                                    <span className="text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                                      Prereq: {step.prerequisites.join(", ")}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <h3
                                onClick={() => onSelectStep(step)}
                                className="text-base sm:text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
                              >
                                {step.title}
                              </h3>

                              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                {step.shortSummary}
                              </p>

                              {/* AI Explainability & Rationale Box */}
                              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg space-y-1">
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-900 uppercase tracking-wide">
                                  <Sparkles className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                  <span>AI Explainability Rationale</span>
                                </div>
                                <p className="text-xs text-blue-950 leading-relaxed font-medium">
                                  {step.reasoning || step.aiWhyRecommended}
                                </p>
                              </div>

                              {/* Hands-on Deliverable & Resource previews (grid layout matching design mockup) */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                                  <p className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                                    <Award className="w-3.5 h-3.5 text-blue-600" />
                                    Hands-on Deliverable
                                  </p>
                                  <p className="text-xs font-medium text-slate-800">{step.deliverable}</p>
                                </div>

                                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                                  <p className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                                    Recommended Resource
                                  </p>
                                  <p className="text-xs font-medium text-slate-800 truncate">
                                    {step.resources?.[0]?.title || "Core Architecture Modules"}
                                  </p>
                                </div>
                              </div>

                              {/* Skills Badges */}
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {step.skillsAcquired.map((sk, ski) => (
                                  <span
                                    key={ski}
                                    className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100"
                                  >
                                    {sk}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                              <button
                                id={`btn-open-step-${step.id}`}
                                onClick={() => onSelectStep(step)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                Syllabus & Quiz
                              </button>

                              <button
                                id={`btn-toggle-complete-${step.id}`}
                                onClick={() => onToggleComplete(step.id)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                                  isCompleted
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                }`}
                              >
                                <Check className="w-3.5 h-3.5" />
                                {isCompleted ? "Verified ✓" : "Mark Done"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>

      {/* Daily Recommendation Banner (from Design Mockup) */}
      {currentActiveStep && (
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xs text-blue-600 flex-shrink-0 font-bold">
              ⚡
            </div>
            <div>
              <p className="text-sm font-bold text-blue-900">Daily Milestone Recommendation</p>
              <p className="text-xs text-blue-700">
                Focus on &apos;<strong className="font-semibold">{currentActiveStep.title}</strong>&apos; to solidify your next core competencies.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectStep(currentActiveStep)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors flex-shrink-0 shadow-xs flex items-center gap-1.5"
          >
            Launch Milestone <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
