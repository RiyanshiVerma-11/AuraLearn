import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Clock,
  Calendar,
  Sparkles,
  Zap,
  Sliders,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { LearningRoadmap, UserProfile } from "../types";
import { calculateRoadmapStats } from "../utils/helpers";

interface LearningVelocityChartProps {
  roadmap: LearningRoadmap;
  profile: UserProfile;
}

export const LearningVelocityChart: React.FC<LearningVelocityChartProps> = ({
  roadmap,
  profile,
}) => {
  const stats = calculateRoadmapStats(roadmap);
  const [simulatedWeeklyHours, setSimulatedWeeklyHours] = useState<number>(
    profile.weeklyCommitmentHours || 10
  );

  // Compute velocity projection timeline
  const { chartData, projectedWeeks, actualWeeksSoFar, targetCompletionDate, velocityStatus } =
    useMemo(() => {
      const totalHours = Math.max(stats.totalHours, 1);
      const completedHours = stats.completedHours;
      const weeklyHours = Math.max(simulatedWeeklyHours, 1);

      const totalWeeksNeeded = Math.ceil(totalHours / weeklyHours);
      const projectedWeeks = Math.max(totalWeeksNeeded, 4);

      // Estimate current week in progress
      const actualWeeksSoFar = Math.min(
        Math.ceil(completedHours / weeklyHours) || 1,
        projectedWeeks
      );

      // Target Completion Date
      const today = new Date();
      const weeksRemaining = Math.max(
        Math.ceil((totalHours - completedHours) / weeklyHours),
        0
      );
      const completionDate = new Date(today);
      completionDate.setDate(today.getDate() + weeksRemaining * 7);
      const targetCompletionDate = completionDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      // Generate points for each week
      const data = [];
      let cumulativePlanned = 0;
      let cumulativeActual = 0;

      // Rate of planned hours per week
      const plannedRate = totalHours / projectedWeeks;

      for (let w = 0; w <= projectedWeeks; w++) {
        cumulativePlanned = Math.min(Math.round(w * plannedRate), totalHours);

        // Actual progress line only extends up to current progress week
        let actualVal: number | null = null;
        if (w <= actualWeeksSoFar) {
          if (w === 0) {
            actualVal = 0;
          } else if (w === actualWeeksSoFar) {
            actualVal = completedHours;
          } else {
            // interpolated actual
            actualVal = Math.round((completedHours / actualWeeksSoFar) * w);
          }
        }

        // Projected forecast curve from current week to completion
        let projectedVal: number | null = null;
        if (w >= actualWeeksSoFar) {
          const hoursLeft = totalHours - completedHours;
          const weeksLeft = Math.max(projectedWeeks - actualWeeksSoFar, 1);
          const progressInProjectedPhase = (w - actualWeeksSoFar) / weeksLeft;
          projectedVal = Math.min(
            Math.round(completedHours + hoursLeft * progressInProjectedPhase),
            totalHours
          );
        }

        data.push({
          week: w === 0 ? "Start" : `Wk ${w}`,
          weekNumber: w,
          "Planned Target (hrs)": cumulativePlanned,
          "Actual Completed (hrs)": actualVal,
          "AI Projected Path (hrs)": projectedVal,
          milestoneBenchmark: Math.round((w / projectedWeeks) * 100),
        });
      }

      let velocityStatus = "On Track";
      if (completedHours >= (actualWeeksSoFar * plannedRate)) {
        velocityStatus = "Accelerated Pace";
      } else if (completedHours < (actualWeeksSoFar * plannedRate * 0.75) && actualWeeksSoFar > 1) {
        velocityStatus = "Needs Catch-up";
      }

      return {
        chartData: data,
        projectedWeeks,
        actualWeeksSoFar,
        targetCompletionDate,
        velocityStatus,
      };
    }, [stats.totalHours, stats.completedHours, simulatedWeeklyHours]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header with Title & Live Telemetry */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900">
              Learning Velocity & Role-Readiness Projection
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              {velocityStatus}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Predictive burn-up model forecasting milestone completion and industry readiness for{" "}
            <strong className="text-slate-800 font-semibold">{roadmap.targetRole}</strong>.
          </p>
        </div>

        {/* Forecast Badges */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Est. Readiness Date</div>
            <div className="text-xs font-extrabold text-blue-600">{targetCompletionDate}</div>
          </div>
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Duration</div>
            <div className="text-xs font-extrabold text-slate-800">
              ~{projectedWeeks} Weeks ({stats.totalHours}h)
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Hours Simulator Control */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600 shadow-2xs">
            <Sliders className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Weekly Commitment Simulator</span>
              <span className="text-[10px] font-normal text-slate-500">
                (Profile baseline: {profile.weeklyCommitmentHours}h/wk)
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Adjust hours to visualize how pacing changes your projected completion date.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="range"
            min="3"
            max="30"
            step="1"
            value={simulatedWeeklyHours}
            onChange={(e) => setSimulatedWeeklyHours(Number(e.target.value))}
            className="w-full sm:w-36 accent-blue-600 cursor-pointer"
          />
          <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-black text-blue-700 min-w-[58px] text-center shadow-2xs">
            {simulatedWeeklyHours}h/wk
          </span>
          {simulatedWeeklyHours !== profile.weeklyCommitmentHours && (
            <button
              onClick={() => setSimulatedWeeklyHours(profile.weeklyCommitmentHours || 10)}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
              title="Reset to baseline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Recharts Area Burn-up Forecast Chart */}
      <div className="w-full h-72 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={{ stroke: "#cbd5e1" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={{ stroke: "#cbd5e1" }}
              tickLine={false}
              unit="h"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#1e293b",
                borderRadius: "0.75rem",
                color: "#f8fafc",
                fontSize: "12px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
              }}
              itemStyle={{ padding: "2px 0" }}
              formatter={(value: any, name: string) => [
                `${value} hrs`,
                name,
              ]}
              labelFormatter={(label) => `Timeline Pacing: ${label}`}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: "11px", paddingTop: "0px" }}
            />
            <Area
              type="monotone"
              dataKey="Planned Target (hrs)"
              stroke="#94a3b8"
              strokeDasharray="4 4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPlanned)"
            />
            <Area
              type="monotone"
              dataKey="AI Projected Path (hrs)"
              stroke="#06b6d4"
              strokeDasharray="3 3"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorProjected)"
            />
            <Area
              type="monotone"
              dataKey="Actual Completed (hrs)"
              stroke="#2563eb"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorActual)"
              activeDot={{ r: 6, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Analytical Footnotes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>
            <strong>{stats.completedHours}h logged</strong> out of {stats.totalHours}h target
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            <strong>{Math.max(stats.totalHours - stats.completedHours, 0)}h remaining</strong> to
            capstone
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Sparkles className="w-4 h-4 text-cyan-600 flex-shrink-0" />
          <span>
            Burn-up rate calculated on <strong>{simulatedWeeklyHours} hrs/week</strong> pacing
          </span>
        </div>
      </div>
    </div>
  );
};
