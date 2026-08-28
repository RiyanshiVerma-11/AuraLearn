import React from "react";
import { AlertCircle, CheckCircle2, TrendingUp, Sparkles, Target, Zap } from "lucide-react";
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
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Skill Gap Matrix & Growth Trajectory</h2>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
              AI Diagnostic
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Targeting baseline competency standards for <span className="font-bold text-slate-800">{targetRole}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
              {criticalCount} Critical Gaps
            </span>
          )}
          {moderateCount > 0 && (
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wider">
              {moderateCount} Moderate
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {skillGaps.map((gap, index) => {
          const delta = Math.max(0, gap.targetProficiency - gap.currentProficiency);
          let severityBadge = (
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600">
              {gap.gapSeverity}
            </span>
          );

          if (gap.gapSeverity === "critical") {
            severityBadge = (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase">
                Critical Gap
              </span>
            );
          } else if (gap.gapSeverity === "moderate") {
            severityBadge = (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                Moderate
              </span>
            );
          } else if (gap.gapSeverity === "mastered" || gap.gapSeverity === "minor") {
            severityBadge = (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                On Track
              </span>
            );
          }

          return (
            <div
              key={index}
              className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs hover:border-blue-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{gap.skill}</span>
                  <span className="text-xs text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                    {gap.category}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {severityBadge}
                  <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> +{delta}% Delta
                  </span>
                </div>
              </div>

              {/* Progress Comparison Dual Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                  <span>Current Baseline: <strong className="text-slate-900 font-bold">{gap.currentProficiency}%</strong></span>
                  <span>Target Benchmark: <strong className="text-blue-700 font-bold">{gap.targetProficiency}%</strong></span>
                </div>
                <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                <div className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="font-bold text-slate-900">Industry Relevance: </span>
                  {gap.importance}
                </div>
                <div className="text-blue-950 bg-blue-50/70 p-2.5 rounded-lg border border-blue-100 shadow-2xs">
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
