import React, { useState } from "react";
import {
  BookOpen,
  Search,
  Filter,
  ExternalLink,
  Clock,
  Sparkles,
  Star,
  Layers,
  Award,
} from "lucide-react";
import { LearningRoadmap, LearningResource } from "../types";

interface ResourceExplorerViewProps {
  roadmap: LearningRoadmap | null;
}

export const ResourceExplorerView: React.FC<ResourceExplorerViewProps> = ({ roadmap }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCost, setSelectedCost] = useState<string>("all");

  if (!roadmap) return null;

  // Aggregate all resources across all roadmap steps with step metadata
  const allResources: (LearningResource & { milestoneTitle: string; phaseName: string })[] = [];
  roadmap.steps.forEach((st) => {
    st.resources?.forEach((res) => {
      allResources.push({
        ...res,
        milestoneTitle: st.title,
        phaseName: st.phaseName,
      });
    });
  });

  const filtered = allResources.filter((res) => {
    const matchesSearch =
      !searchQuery ||
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.skillsCovered.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === "all" || res.type === selectedType;
    const matchesCost =
      selectedCost === "all" ||
      (selectedCost === "free" && res.cost.toLowerCase().includes("free")) ||
      (selectedCost === "paid" && res.cost.toLowerCase().includes("paid"));

    return matchesSearch && matchesType && matchesCost;
  });

  const uniqueTypes = Array.from(new Set(allResources.map((r) => r.type)));

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Curated Resource & Course Library
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              High-yield courses, documentation, and labs mapped to your personalized milestones for{" "}
              <strong className="text-slate-800">{roadmap.targetRole}</strong>.
            </p>
          </div>
          <div className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 self-start">
            {allResources.length} Verified Modules
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by provider, skill, topic..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="all">All Formats (Courses, Projects, Articles)</option>
            {uniqueTypes.map((t) => (
              <option key={t} value={t}>
                Format: {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>

          {/* Cost Filter */}
          <select
            value={selectedCost}
            onChange={(e) => setSelectedCost(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="all">All Cost Types</option>
            <option value="free">Free / Audit Only</option>
            <option value="paid">Paid Platforms</option>
          </select>
        </div>
      </div>

      {/* Grid of Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((res, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-900 text-white">
                    {res.provider}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                    {res.type}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {res.cost}
                  </span>
                  <span className="text-[11px] text-amber-600 font-bold flex items-center gap-0.5">
                    ★ {res.rating}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {res.duration}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                {res.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {res.aiRecommendationRationale}
              </p>

              {/* Tagging to Milestone */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-700">
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  Mapped Milestone: {res.milestoneTitle}
                </div>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {res.skillsCovered.map((sk, ski) => (
                  <span
                    key={ski}
                    className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">{res.phaseName}</span>
              <a
                href={res.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                Access Resource <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
