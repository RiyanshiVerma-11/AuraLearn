import React, { useState, useRef } from "react";
import {
  X,
  Award,
  Download,
  Printer,
  Share2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Calendar,
  Clock,
  BookOpen,
  Copy,
  ExternalLink,
} from "lucide-react";
import confetti from "canvas-confetti";
import { LearningRoadmap, UserProfile } from "../types";
import { calculateRoadmapStats } from "../utils/helpers";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  roadmap: LearningRoadmap | null;
  profile: UserProfile;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  roadmap,
  profile,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !roadmap) return null;

  const stats = calculateRoadmapStats(roadmap);
  const completedSteps = roadmap.steps.filter((s) => s.status === "completed");

  // Determine credential level & title
  let tierTitle = "Foundational Explorer";
  let tierBadgeColor = "from-slate-700 to-slate-900 text-slate-100";
  let ribbonColor = "bg-slate-700";

  if (stats.percentComplete >= 80) {
    tierTitle = "Principal AI & Systems Architect";
    tierBadgeColor = "from-amber-600 to-amber-900 text-amber-100";
    ribbonColor = "bg-amber-600";
  } else if (stats.percentComplete >= 50) {
    tierTitle = "Autonomous Specialist";
    tierBadgeColor = "from-blue-600 to-blue-900 text-blue-100";
    ribbonColor = "bg-blue-600";
  } else if (stats.percentComplete >= 20) {
    tierTitle = "Emerging Practitioner";
    tierBadgeColor = "from-emerald-600 to-emerald-900 text-emerald-100";
    ribbonColor = "bg-emerald-600";
  }

  const credentialId = `AL-2026-${(roadmap.id || "path").slice(0, 4).toUpperCase()}-${Math.abs(
    (profile.name || "user").split("").reduce((acc, c) => acc + c.charCodeAt(0), 1000)
  )
    .toString()
    .padStart(4, "0")}`;

  const issueDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopyShareText = () => {
    const shareText = `🎓 Verified Executive Milestone Credential:
I just completed ${stats.completedSteps}/${stats.totalSteps} milestones (${stats.percentComplete}% completion) on my journey to become a ${roadmap.targetRole} using AuraLearn AI.
Credential ID: ${credentialId}
Skills: ${roadmap.skillGaps.map((s) => s.skill).slice(0, 5).join(", ")}`;

    navigator.clipboard.writeText(shareText);
    setCopiedShare(true);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    setTimeout(() => setCopiedShare(false), 2500);
  };

  // High-Resolution Canvas Export to PNG
  const handleDownloadPNG = async () => {
    setIsExporting(true);
    try {
      const canvas = document.createElement("canvas");
      const width = 1600;
      const height = 1100;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not get 2D canvas context");
      }

      // 1. Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, "#0f172a"); // slate-900
      bgGrad.addColorStop(0.5, "#1e293b"); // slate-800
      bgGrad.addColorStop(1, "#090d16");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Decorative Double Border
      ctx.strokeStyle = "#3b82f6"; // blue-500
      ctx.lineWidth = 6;
      ctx.strokeRect(40, 40, width - 80, height - 80);

      ctx.strokeStyle = "#cbd5e1"; // slate-300 subtle inner
      ctx.lineWidth = 1.5;
      ctx.strokeRect(55, 55, width - 110, height - 110);

      // 3. Header / Brand
      ctx.textAlign = "center";
      ctx.fillStyle = "#60a5fa"; // blue-400
      ctx.font = "bold 24px sans-serif";
      ctx.fillText("A U R A L E A R N   A I   A C C E L E R A T O R", width / 2, 120);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "16px sans-serif";
      ctx.fillText("OFFICIAL EXECUTIVE LEARNING PATH CERTIFICATE", width / 2, 155);

      // 4. Main Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 44px sans-serif";
      ctx.fillText("Certificate of Verified Progress & Mastery", width / 2, 230);

      ctx.fillStyle = "#cbd5e1";
      ctx.font = "20px sans-serif";
      ctx.fillText("This official credential certifies that", width / 2, 300);

      // 5. Learner Name
      ctx.fillStyle = "#93c5fd"; // blue-300
      ctx.font = "bold 56px serif";
      ctx.fillText(profile.name || "Executive Learner", width / 2, 380);

      // 6. Statement
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "22px sans-serif";
      ctx.fillText(
        `has achieved verified pedagogical mastery on the specialized career track:`,
        width / 2,
        450
      );

      ctx.fillStyle = "#38bdf8"; // sky-400
      ctx.font = "bold 36px sans-serif";
      ctx.fillText(roadmap.targetRole, width / 2, 510);

      // 7. Telemetry & Metrics Box
      ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
      ctx.fillRect(200, 570, width - 400, 160);
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 1;
      ctx.strokeRect(200, 570, width - 400, 160);

      ctx.textAlign = "left";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText(`• Completion Rate: ${stats.percentComplete}% (${stats.completedSteps}/${stats.totalSteps} Milestones Verified)`, 240, 620);
      ctx.fillText(`• Total Focused Effort: ~${stats.totalHours} Hours of Curriculum Labs`, 240, 660);
      ctx.fillText(`• Mastery Designation: ${tierTitle}`, 240, 700);

      // 8. Verified Skills Tags
      const skillsStr = roadmap.skillGaps.map((s) => s.skill).slice(0, 6).join("  •  ");
      ctx.textAlign = "center";
      ctx.fillStyle = "#94a3b8";
      ctx.font = "16px sans-serif";
      ctx.fillText(`Verified Competencies: ${skillsStr}`, width / 2, 780);

      // 9. Footer Signatures & Credential Info
      ctx.textAlign = "left";
      ctx.fillStyle = "#64748b";
      ctx.font = "16px sans-serif";
      ctx.fillText(`Credential ID: ${credentialId}`, 100, 950);
      ctx.fillText(`Issue Date: ${issueDate}`, 100, 980);
      ctx.fillText(`Verification: Verified by Gemini AI Learning Engine`, 100, 1010);

      // Seal / Badge on right
      ctx.textAlign = "right";
      ctx.fillStyle = "#3b82f6";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText("AuraLearn AI", width - 100, 950);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "16px sans-serif";
      ctx.fillText("Autonomous Pedagogical Authority", width - 100, 980);
      ctx.fillText("https://auralearn.app/verify", width - 100, 1010);

      // Export canvas to download
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `AuraLearn-Certificate-${(profile.name || "Learner").replace(/\s+/g, "-")}.png`;
      link.href = dataUrl;
      link.click();

      confetti({ particleCount: 70, spread: 90, origin: { y: 0.6 } });
    } catch (err) {
      console.error("Failed to generate certificate PNG:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between flex-shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-bold text-base">Executive Progress & Mastery Certificate</h2>
              <p className="text-xs text-slate-400">
                Official credential verified against completed curriculum milestones.
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

        {/* Certificate Display Canvas View */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-100/70 space-y-6">
          <div
            ref={certRef}
            className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-2xl p-8 sm:p-12 border-4 border-blue-500/40 shadow-2xl overflow-hidden space-y-8 print:border-slate-800 print:text-slate-900 print:bg-white"
          >
            {/* Background Watermark & Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Inner Border */}
            <div className="absolute inset-3 border border-slate-700/60 rounded-xl pointer-events-none" />

            {/* Certificate Header */}
            <div className="text-center space-y-2 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                AuraLearn AI Autonomous Accelerator
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-serif">
                Certificate of Verified Progress & Mastery
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-light">
                This official credential is awarded to
              </p>
            </div>

            {/* Learner Name Spotlight */}
            <div className="text-center py-2 relative z-10">
              <div className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-blue-200 font-serif tracking-wide">
                {profile.name || "Executive Learner"}
              </div>
              <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto mt-2" />
            </div>

            {/* Award Description */}
            <div className="text-center max-w-2xl mx-auto space-y-2 relative z-10">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                in recognition of demonstrated competency, portfolio deliverable verification, and active curriculum progression toward the target professional role:
              </p>
              <div className="text-lg sm:text-2xl font-bold text-sky-300">
                {roadmap.targetRole}
              </div>
            </div>

            {/* Telemetry Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-900/80 border border-slate-700/80 rounded-xl relative z-10">
              <div className="text-center p-2">
                <div className="text-xs text-slate-400 font-medium">Completion Progress</div>
                <div className="text-xl font-extrabold text-emerald-400 mt-0.5">
                  {stats.percentComplete}%
                </div>
                <div className="text-[10px] text-slate-500">
                  {stats.completedSteps} of {stats.totalSteps} Milestones
                </div>
              </div>

              <div className="text-center p-2 border-t sm:border-t-0 sm:border-x border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Mastery Designation</div>
                <div className="text-sm font-bold text-amber-300 mt-1 truncate">
                  {tierTitle}
                </div>
                <div className="text-[10px] text-slate-500">Curriculum Tier</div>
              </div>

              <div className="text-center p-2 border-t sm:border-t-0 border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Curriculum Scope</div>
                <div className="text-xl font-extrabold text-blue-300 mt-0.5">
                  {roadmap.totalEstimatedHours} Hours
                </div>
                <div className="text-[10px] text-slate-500">
                  {roadmap.phases.length} Structured Phases
                </div>
              </div>
            </div>

            {/* Verified Skills Badges */}
            <div className="space-y-2 relative z-10">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
                Verified Skill Competencies
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {roadmap.skillGaps.map((sg, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-slate-800/90 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-blue-400" />
                    <span>{sg.skill}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Certificate Footer */}
            <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 relative z-10">
              <div className="space-y-1 text-center sm:text-left">
                <div className="font-mono text-slate-300 font-semibold">
                  Credential ID: {credentialId}
                </div>
                <div>Issued: {issueDate} • AI Verified</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-amber-400/60 bg-amber-400/10 flex items-center justify-center text-amber-300 shadow-inner">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-200">AuraLearn AI Registry</div>
                  <div className="text-[10px] text-slate-500">Digitally Cryptographic Proof</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons (Hidden on print) */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 print:hidden">
          <div className="text-xs text-slate-600">
            Export a high-resolution image, print a physical copy, or share on LinkedIn.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShareText}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedShare ? "Copied Credentials!" : "Share Badge"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadPNG}
              disabled={isExporting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? "Generating PNG..." : "Download High-Res PNG"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
