import React, { useState } from "react";
import {
  X,
  Copy,
  Download,
  FileText,
  Share2,
  Code,
  Calendar,
  Clock,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { LearningRoadmap } from "../types";
import {
  calculateStepDates,
  downloadICSFile,
  generateGoogleCalendarUrl,
} from "../utils/calendarExport";

interface ExportRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  roadmap: LearningRoadmap | null;
  weeklyCommitmentHours?: number;
}

export const ExportRoadmapModal: React.FC<ExportRoadmapModalProps> = ({
  isOpen,
  onClose,
  roadmap,
  weeklyCommitmentHours = 15,
}) => {
  const [activeTab, setActiveTab] = useState<"calendar" | "markdown" | "json">("calendar");
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [startDateStr, setStartDateStr] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [customWeeklyHours, setCustomWeeklyHours] = useState(weeklyCommitmentHours);

  if (!isOpen || !roadmap) return null;

  const parsedStartDate = new Date(startDateStr || new Date().toISOString().split("T")[0]);
  const scheduleEvents = calculateStepDates(roadmap, parsedStartDate, customWeeklyHours);

  const generateMarkdown = () => {
    let md = `# 🧭 ${roadmap.title}\n`;
    md += `**Target Role:** ${roadmap.targetRole} | **Difficulty:** ${roadmap.difficulty}\n`;
    md += `**Estimated Duration:** ${roadmap.totalEstimatedWeeks} Weeks (~${roadmap.totalEstimatedHours} Hours)\n\n`;
    md += `## Summary\n${roadmap.summary}\n\n`;
    md += `## 🎯 Identified Skill Gaps\n`;
    roadmap.skillGaps.forEach((g) => {
      md += `- **${g.skill}** (${g.currentProficiency}% → ${g.targetProficiency}%) - ${g.gapSeverity.toUpperCase()}: ${g.recommendedFocus}\n`;
    });
    md += `\n## 🗺️ Phases & Milestones\n\n`;

    roadmap.phases.forEach((p) => {
      md += `### Phase ${p.phaseIndex}: ${p.title} (${p.estimatedHours}h)\n`;
      md += `${p.description}\n\n`;

      const steps = roadmap.steps.filter((s) => s.phaseIndex === p.phaseIndex);
      steps.forEach((s) => {
        const statusCheck = s.status === "completed" ? "[x]" : "[ ]";
        md += `- ${statusCheck} **${s.title}** (${s.estimatedHours}h)\n`;
        md += `  - *Summary:* ${s.shortSummary}\n`;
        md += `  - *Deliverable:* \`${s.deliverable}\`\n`;
        md += `  - *Skills:* ${s.skillsAcquired.join(", ")}\n`;
        if (s.resources && s.resources.length > 0) {
          md += `  - *Key Resources:*\n`;
          s.resources.forEach((r) => {
            md += `    - [${r.title}](${r.url}) (${r.provider} - ${r.cost})\n`;
          });
        }
        md += `\n`;
      });
    });

    return md;
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdown();
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleCopyJson = () => {
    const jsonStr = JSON.stringify(roadmap, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(roadmap, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${roadmap.targetRole.toLowerCase().replace(/\s+/g, "-")}-roadmap.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCalendar = () => {
    downloadICSFile(roadmap, parsedStartDate, customWeeklyHours);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="font-bold text-base">Export & Sync Roadmap</h2>
              <p className="text-[11px] text-slate-400">
                Sync milestone deadlines with your calendar or export raw curricula.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2 flex-shrink-0">
          <button
            onClick={() => setActiveTab("calendar")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === "calendar"
                ? "bg-white text-blue-600 border-slate-200 border-b-white -mb-px shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Calendar .ics Deadlines</span>
          </button>

          <button
            onClick={() => setActiveTab("markdown")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === "markdown"
                ? "bg-white text-blue-600 border-slate-200 border-b-white -mb-px shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Markdown (Notes & Docs)</span>
          </button>

          <button
            onClick={() => setActiveTab("json")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === "json"
                ? "bg-white text-blue-600 border-slate-200 border-b-white -mb-px shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Structured JSON</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: CALENDAR EXPORT */}
          {activeTab === "calendar" && (
            <div className="space-y-6">
              {/* Pace & Date Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Roadmap Start Date
                  </label>
                  <input
                    type="date"
                    value={startDateStr}
                    onChange={(e) => setStartDateStr(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Weekly Commitment Pacing ({customWeeklyHours}h/week)
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="5"
                    value={customWeeklyHours}
                    onChange={(e) => setCustomWeeklyHours(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Banner */}
              <div className="p-5 bg-blue-50/80 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-blue-950 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Download Standard iCalendar (.ics)
                  </div>
                  <p className="text-xs text-blue-800/90 leading-relaxed">
                    Auto-schedules {roadmap.steps.length} sequential milestone deadlines into Apple Calendar, Google Calendar, Outlook, and Notion Calendar.
                  </p>
                </div>
                <button
                  onClick={handleDownloadCalendar}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .ics Schedule</span>
                </button>
              </div>

              {/* Schedule Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Calculated Milestone Timeline ({scheduleEvents.length} Events)</span>
                  <span className="text-slate-500 font-normal text-[11px]">
                    ~{Math.ceil(roadmap.totalEstimatedHours / customWeeklyHours)} Weeks Total
                  </span>
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {scheduleEvents.map(({ step, startDate, dueDate }, idx) => (
                    <div
                      key={step.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <div className="font-bold text-slate-900 truncate">{step.title}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span>{startDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – {dueDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                            <span>•</span>
                            <span>{step.estimatedHours}h effort</span>
                          </div>
                        </div>
                      </div>

                      <a
                        href={generateGoogleCalendarUrl(step, roadmap, startDate, dueDate)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 flex-shrink-0"
                        title="Add this single event to Google Calendar"
                      >
                        <span>Google Cal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MARKDOWN */}
          {activeTab === "markdown" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Ready to paste into GitHub README, Obsidian knowledge base, or Notion syllabus.
                </p>
                <button
                  onClick={handleCopyMarkdown}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  {copiedMd ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                readOnly
                rows={12}
                value={generateMarkdown()}
                className="w-full p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none"
              />
            </div>
          )}

          {/* TAB 3: JSON */}
          {activeTab === "json" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Full programmatic schema payload with phases, diagnostic quizzes, and deliverables.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyJson}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedJson ? "Copied!" : "Copy JSON"}</span>
                  </button>
                  <button
                    onClick={handleDownloadJson}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </button>
                </div>
              </div>

              <textarea
                readOnly
                rows={12}
                value={JSON.stringify(roadmap, null, 2)}
                className="w-full p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
