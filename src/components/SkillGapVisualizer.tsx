import React from "react";
import { TrendingUp } from "lucide-react";
import { SkillGapAnalysis } from "../types";

interface SkillGapVisualizerProps {
  skillGaps: SkillGapAnalysis[];
  targetRole: string;
}

export const SkillGapVisualizer: React.FC<SkillGapVisualizerProps> = ({
  skillGaps,
  targetRole,
}) => {
  if (!skillGaps || skillGaps.length === 0) {
    return null;
  }

  // Count by severity
  const criticalCount = skillGaps.filter((g) => g.gapSeverity === "critical").length;
  const moderateCount = skillGaps.filter((g) => g.gapSeverity === "moderate").length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900">Skill Gap Matrix & Growth Trajectory</h2>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
              AI Diagnostic
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 font-medium">
            Targeting baseline competency standards for <span className="font-bold text-slate-800">{targetRole}</span>
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {criticalCount > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
              {criticalCount} Critical Gaps
            </span>
          )}
          {moderateCount > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wider">
              {moderateCount} Moderate
            </span>
          )}
        </div>
      </div>

      {/* Skill Cards List */}
      <div className="space-y-2">
        {skillGaps.map((gap, index) => {
          const delta = Math.max(0, gap.targetProficiency - gap.currentProficiency);
          let severityBadge = (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wider">
              {gap.gapSeverity}
            </span>
          );

          if (gap.gapSeverity === "critical") {
            severityBadge = (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase tracking-wider">
                Critical Gap
              </span>
            );
          } else if (gap.gapSeverity === "moderate") {
            severityBadge = (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
                Moderate
              </span>
            );
          } else if (gap.gapSeverity === "mastered" || gap.gapSeverity === "minor") {
            severityBadge = (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                On Track
              </span>
            );
          }

          return (
            <div
              key={index}
              className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs hover:border-blue-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs text-slate-900">{gap.skill}</span>
                  <span className="text-[9px] text-slate-500 bg-slate-100/80 px-1.5 py-0.5 rounded border border-slate-200/70 font-medium tracking-tight">
                    {gap.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {severityBadge}
                  <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +{delta}% Delta
                  </span>
                </div>
              </div>

              {/* Progress Comparison Dual Bar */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-[10px] text-slate-600 font-medium">
                  <span>Current Baseline: <strong className="text-slate-900 font-bold">{gap.currentProficiency}%</strong></span>
                  <span>Target Benchmark: <strong className="text-blue-700 font-bold">{gap.targetProficiency}%</strong></span>
                </div>
                <div className="relative w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  {/* Target Goal Shadow */}
                  <div
                    className="absolute top-0 left-0 h-full bg-blue-200 rounded-full"
                    style={{ width: `${gap.targetProficiency}%` }}
                  />
                  {/* Current Realized */}
                  <div
                    className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-700"
                    style={{ width: `${gap.currentProficiency}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-[10px] pt-0.5">
                <div className="text-slate-600 bg-slate-50/70 p-1.5 sm:p-2 rounded-lg border border-slate-200/70 leading-snug">
                  <span className="font-bold text-slate-900">Industry Relevance: </span>
                  {gap.importance}
                </div>
                <div className="text-blue-950 bg-blue-50/60 p-1.5 sm:p-2 rounded-lg border border-blue-100 leading-snug">
                  <span className="font-bold text-blue-800">Target Focus: </span>
                  {gap.recommendedFocus}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
