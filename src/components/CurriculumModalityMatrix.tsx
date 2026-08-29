import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import {
  Layers,
  Code2,
  BookOpen,
  Award,
  Sparkles,
} from "lucide-react";
import { LearningRoadmap, UserProfile } from "../types";

interface CurriculumModalityMatrixProps {
  roadmap: LearningRoadmap;
  profile: UserProfile;
}

const MODALITY_COLORS: Record<string, string> = {
  "Hands-on Projects & Specs": "#2563eb", // blue-600
  "Interactive Labs & Blueprints": "#06b6d4", // cyan-500
  "Official Documentation & RFCs": "#6366f1", // indigo-500
  "Diagnostic Assessments": "#f59e0b", // amber-500
  "Self-Paced Research & Review": "#10b981", // emerald-500
};

export const CurriculumModalityMatrix: React.FC<CurriculumModalityMatrixProps> = ({
  roadmap,
  profile,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"donut" | "bars">("donut");

  // Calculate live breakdown from active roadmap steps
  const { modalityData, totalActivities, learningStyleFit } = useMemo(() => {
    let deliverablesCount = 0;
    let codeBlueprintsCount = 0;
    let officialDocsCount = 0;
    let quizCount = 0;

    roadmap.steps.forEach((step) => {
      deliverablesCount += step.deliverable ? 1 : 1;
      codeBlueprintsCount += 2;
      if (step.resources?.length) {
        officialDocsCount += step.resources.filter(
          (r) => r.type === "article" || r.type === "book" || r.type === "interactive"
        ).length;
      }
      quizCount += step.assessment?.questions?.length || 3;
    });

    const totalActivities =
      deliverablesCount + codeBlueprintsCount + Math.max(officialDocsCount, 2) + quizCount;

    const data = [
      {
        name: "Hands-on Projects & Specs",
        value: deliverablesCount,
        percentage: Math.round((deliverablesCount / totalActivities) * 100),
        color: MODALITY_COLORS["Hands-on Projects & Specs"],
        icon: Code2,
        description: "Milestone-verified deliverables, repos, and architectural artifacts.",
      },
      {
        name: "Interactive Labs & Blueprints",
        value: codeBlueprintsCount,
        percentage: Math.round((codeBlueprintsCount / totalActivities) * 100),
        color: MODALITY_COLORS["Interactive Labs & Blueprints"],
        icon: Layers,
        description: "Copyable starter code, pattern scaffolds, and unit-tested implementations.",
      },
      {
        name: "Official Documentation & RFCs",
        value: Math.max(officialDocsCount, 2),
        percentage: Math.round((Math.max(officialDocsCount, 2) / totalActivities) * 100),
        color: MODALITY_COLORS["Official Documentation & RFCs"],
        icon: BookOpen,
        description: "Standard specifications, RFCs, MIT/Stanford academic sources, and whitepapers.",
      },
      {
        name: "Diagnostic Assessments",
        value: quizCount,
        percentage: Math.round((quizCount / totalActivities) * 100),
        color: MODALITY_COLORS["Diagnostic Assessments"],
        icon: Award,
        description: "Instant-evaluation technical checks, conceptual probes, and flashcards.",
      },
    ];

    // Explain how this matches the profile's learning style
    let learningStyleFit = "Balanced Multi-Modal Structure";
    if (profile.learningStyle === "hands-on-projects") {
      learningStyleFit = "Heavy Hands-on Bias (>40% Deliverables & Code Blueprints)";
    } else if (profile.learningStyle === "academic-papers") {
      learningStyleFit = "Academic & Specification Heavy (Deep RFC & Theory Focus)";
    } else if (profile.learningStyle === "interactive-code") {
      learningStyleFit = "Rapid Iteration & Diagnostic Feedback Loop";
    }

    return {
      modalityData: data,
      totalActivities,
      learningStyleFit,
    };
  }, [roadmap.steps, profile.learningStyle]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="p-1 bg-blue-50 text-blue-600 rounded-md border border-blue-100">
              <Layers className="w-3.5 h-3.5" />
            </span>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900">
              Curriculum Modality & Pedagogical Allocation
            </h2>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
            AI-balanced breakdown of practical building vs. theoretical grounding for{" "}
            <span className="font-semibold text-slate-800 capitalize">
              {profile.learningStyle.replace("-", " ")}
            </span>{" "}
            learning preference.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode("donut")}
              className={`px-2.5 py-0.5 text-[10px] font-bold rounded transition-colors cursor-pointer ${
                viewMode === "donut"
                  ? "bg-white text-blue-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Donut View
            </button>
            <button
              onClick={() => setViewMode("bars")}
              className={`px-2.5 py-0.5 text-[10px] font-bold rounded transition-colors cursor-pointer ${
                viewMode === "bars"
                  ? "bg-white text-blue-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Bar View
            </button>
          </div>
        </div>
      </div>

      {/* Main Visualizer Content (Chart centered on top, items below) */}
      <div className="space-y-3.5">
        {/* Top Chart Area */}
        <div className="flex flex-col items-center justify-center min-h-[190px] py-1">
          {viewMode === "donut" ? (
            <div className="w-full max-w-xs h-48 sm:h-52 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modalityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {modalityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={activeIndex === index ? "#0f172a" : "#ffffff"}
                        strokeWidth={activeIndex === index ? 2 : 1.5}
                        className="cursor-pointer transition-all"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      borderRadius: "0.5rem",
                      color: "#f8fafc",
                      fontSize: "11px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
                    }}
                    formatter={(value: any, name: string) => [
                      `${value} items (${Math.round(
                        (Number(value) / totalActivities) * 100
                      )}%)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-xl font-extrabold text-slate-900">{totalActivities}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  Total Items
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-lg h-48 sm:h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={modalityData}
                  layout="vertical"
                  margin={{ top: 5, right: 15, left: 5, bottom: 5 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 9, fill: "#475569" }}
                    width={150}
                    tickFormatter={(val) => val}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      borderRadius: "0.5rem",
                      color: "#f8fafc",
                      fontSize: "11px",
                    }}
                    formatter={(value: any) => [`${value} items`, "Count"]}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {modalityData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Modality Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2.5 border-t border-slate-100">
          {modalityData.map((item, idx) => {
            const Icon = item.icon;
            const isHovered = activeIndex === idx;

            return (
              <div
                key={item.name}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`p-2.5 sm:p-3 rounded-lg border transition-all cursor-pointer ${
                  isHovered
                    ? "bg-slate-50 border-slate-400 shadow-2xs"
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <Icon className="w-3.5 h-3.5 text-slate-700 flex-shrink-0" />
                    <span className="text-[11px] font-bold text-slate-900 leading-snug">{item.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[10px] font-bold text-slate-800">
                      {item.value} <span className="text-[9px] font-normal text-slate-500">items</span>
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                      style={{
                        backgroundColor: `${item.color}15`,
                        color: item.color,
                      }}
                    >
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 mt-1 pl-4.5 leading-tight">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Alignment Callout Banner */}
      <div className="p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-lg flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-[10px] text-blue-950 space-y-0.5">
          <div className="font-bold flex items-center gap-1.5 flex-wrap">
            <span>Adaptive Pedagogical Alignment:</span>
            <span className="font-semibold text-blue-700">{learningStyleFit}</span>
          </div>
          <p className="text-[10px] text-blue-900/80 font-normal leading-tight">
            Aura dynamically allocates milestone deliverables, RFC specifications, and interactive
            sandboxes based on your selected learning pace.
          </p>
        </div>
      </div>
    </div>
  );
};
