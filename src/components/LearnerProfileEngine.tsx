import React, { useState } from "react";
import {
  Sparkles,
  User,
  Target,
  Briefcase,
  Clock,
  BookOpen,
  DollarSign,
  GraduationCap,
  Plus,
  Trash2,
  Check,
  Flame,
  Lightbulb,
  Compass,
  Github,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";

// ─── Skill Level Rubrics ────────────────────────────────────────────────────
const SKILL_LEVEL_RUBRICS: Record<number, { label: string; descriptor: string; color: string }> = {
  1: { label: "Novice",       descriptor: "Heard of it / watched intro videos",                    color: "bg-slate-100 text-slate-600 border-slate-300" },
  2: { label: "Beginner",    descriptor: "Completed tutorials, built toy examples",               color: "bg-sky-50 text-sky-700 border-sky-200" },
  3: { label: "Intermediate",descriptor: "Built & shipped personal or hobby projects",            color: "bg-blue-50 text-blue-700 border-blue-200" },
  4: { label: "Proficient",  descriptor: "Used in production at work or client projects",         color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  5: { label: "Expert",      descriptor: "Deep expertise — can architect, mentor, or teach others", color: "bg-violet-50 text-violet-700 border-violet-200" },
};

// ─── Level Button with Rubric Tooltip ───────────────────────────────────────
const LevelButton: React.FC<{
  level: number;
  selected: boolean;
  onClick: () => void;
}> = ({ level, selected, onClick }) => {
  const [showTip, setShowTip] = useState(false);
  const rubric = SKILL_LEVEL_RUBRICS[level];
  return (
    <div className="relative" onMouseEnter={() => setShowTip(true)} onMouseLeave={() => setShowTip(false)}>
      <button
        type="button"
        onClick={onClick}
        className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
          selected ? "bg-blue-600 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:border-blue-400"
        }`}
      >
        {level}
      </button>
      {showTip && (
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-52 rounded-lg border p-2.5 shadow-lg text-[11px] leading-snug pointer-events-none ${rubric.color}`}>
          <div className="font-bold text-[12px] mb-0.5">{level} — {rubric.label}</div>
          <div>{rubric.descriptor}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-current" style={{ borderTopColor: 'inherit' }} />
        </div>
      )}
    </div>
  );
};

// ─── Extracted Skill Preview Row ─────────────────────────────────────────────
interface PreviewSkill { skill: string; level: number; reasoning?: string; selected: boolean; }

const PreviewSkillRow: React.FC<{
  item: PreviewSkill;
  onChange: (updated: PreviewSkill) => void;
}> = ({ item, onChange }) => (
  <div className={`flex items-center gap-2 p-2 rounded-lg border text-xs transition-all ${
    item.selected ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200 opacity-60"
  }`}>
    <input
      type="checkbox"
      checked={item.selected}
      onChange={(e) => onChange({ ...item, selected: e.target.checked })}
      className="w-3.5 h-3.5 accent-blue-600 cursor-pointer flex-shrink-0"
    />
    <span className="flex-1 font-semibold text-slate-800 truncate">{item.skill}</span>
    {item.reasoning && (
      <span className="text-slate-500 hidden sm:block truncate max-w-[180px]">{item.reasoning}</span>
    )}
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((l) => (
        <LevelButton
          key={l}
          level={l}
          selected={item.level === l}
          onClick={() => onChange({ ...item, level: l, selected: true })}
        />
      ))}
    </div>
  </div>
);
import {
  UserProfile,
  ExperienceLevel,
  LearningStyle,
  LearningPace,
  BudgetPreference,
} from "../types";
import { POPULAR_DOMAINS } from "../data/presets";

interface LearnerProfileEngineProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onGenerateRoadmap: (profile: UserProfile) => Promise<void>;
  isLoading: boolean;
  onOpenPresetsModal: () => void;
}

export const LearnerProfileEngine: React.FC<LearnerProfileEngineProps> = ({
  profile,
  onUpdateProfile,
  onGenerateRoadmap,
  isLoading,
  onOpenPresetsModal,
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState<number>(3);
  const [newCourseName, setNewCourseName] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // ── GitHub Import State ──
  const [showGithubPanel, setShowGithubPanel] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [githubPreview, setGithubPreview] = useState<PreviewSkill[]>([]);

  // ── Resume / AI Extract State ──
  const [showResumePanel, setShowResumePanel] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [resumePreview, setResumePreview] = useState<PreviewSkill[]>([]);

  React.useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleFieldChange = <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onUpdateProfile(updated);
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const updatedSkills = [
      ...formData.knownSkills,
      { skill: newSkillName.trim(), level: newSkillLevel },
    ];
    handleFieldChange("knownSkills", updatedSkills);
    setNewSkillName("");
    setNewSkillLevel(3);
  };

  // ── Merge preview skills into profile (no duplicates) ──
  const mergePreviewSkills = (preview: PreviewSkill[]) => {
    const toAdd = preview.filter((p) => p.selected);
    if (toAdd.length === 0) return;
    const existing = new Set(formData.knownSkills.map((s) => s.skill.toLowerCase()));
    const merged = [
      ...formData.knownSkills,
      ...toAdd
        .filter((p) => !existing.has(p.skill.toLowerCase()))
        .map((p) => ({ skill: p.skill, level: p.level })),
    ];
    handleFieldChange("knownSkills", merged);
  };

  // ── GitHub Import Handler ──
  const handleGithubImport = async () => {
    if (!githubUsername.trim()) return;
    setGithubLoading(true);
    setGithubError(null);
    setGithubPreview([]);

    try {
      // Fetch up to 100 public repos, sorted by most recently pushed
      const reposRes = await fetch(
        `https://api.github.com/users/${encodeURIComponent(githubUsername.trim())}/repos?per_page=100&sort=pushed`,
        { headers: { Accept: "application/vnd.github+json" } }
      );

      if (reposRes.status === 404) {
        setGithubError(`GitHub user "${githubUsername.trim()}" not found. Please check the username and try again.`);
        return;
      }
      if (reposRes.status === 403 || reposRes.status === 429) {
        setGithubError("GitHub API rate limit reached. Please try again in ~1 hour.");
        return;
      }
      if (!reposRes.ok) {
        setGithubError(`GitHub API error (${reposRes.status}). Please try again later.`);
        return;
      }

      const repos: any[] = await reposRes.json();
      const top20 = repos.slice(0, 20); // cap to avoid rate limits

      // Fetch language bytes for each repo in parallel
      const languageMaps = await Promise.all(
        top20.map(async (repo) => {
          try {
            const langRes = await fetch(repo.languages_url, {
              headers: { Accept: "application/vnd.github+json" },
            });
            if (!langRes.ok) return {};
            return await langRes.json() as Record<string, number>;
          } catch {
            return {};
          }
        })
      );

      // Aggregate: count repos each language appears in
      const repoCounts: Record<string, number> = {};
      for (const langMap of languageMaps) {
        for (const lang of Object.keys(langMap)) {
          repoCounts[lang] = (repoCounts[lang] || 0) + 1;
        }
      }

      if (Object.keys(repoCounts).length === 0) {
        setGithubError("No public repositories with detectable languages found for this user.");
        return;
      }

      // Map repo count → skill level
      const toPreview: PreviewSkill[] = Object.entries(repoCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([lang, count]) => ({
          skill: lang,
          level: count >= 7 ? 5 : count >= 4 ? 4 : count >= 2 ? 3 : 2,
          reasoning: `Found in ${count} public repo${count !== 1 ? "s" : ""}`,
          selected: true,
        }));

      setGithubPreview(toPreview);
    } catch {
      setGithubError("Could not reach GitHub. Check your internet connection and try again.");
    } finally {
      setGithubLoading(false);
    }
  };

  // ── Resume / AI Extraction Handler ──
  const handleResumeExtract = async () => {
    if (resumeText.trim().length < 20) return;
    setResumeLoading(true);
    setResumeError(null);
    setResumePreview([]);

    try {
      const res = await fetch("/api/extract-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: resumeText }),
      });

      const data = await res.json();
      if (!res.ok) {
        setResumeError(data.error || "AI extraction failed. Please try again.");
        return;
      }

      const preview: PreviewSkill[] = (data.skills || []).map((s: any) => ({
        skill: s.skill,
        level: s.level,
        reasoning: s.reasoning,
        selected: true,
      }));

      if (preview.length === 0) {
        setResumeError("No technical skills detected. Try adding more detail about your tech stack.");
        return;
      }

      setResumePreview(preview);
    } catch {
      setResumeError("Connection error. Please check your internet and try again.");
    } finally {
      setResumeLoading(false);
    }
  };


  const handleRemoveSkill = (index: number) => {
    const updated = formData.knownSkills.filter((_, i) => i !== index);
    handleFieldChange("knownSkills", updated);
  };

  const handleSkillLevelChange = (index: number, level: number) => {
    const updated = [...formData.knownSkills];
    updated[index].level = level;
    handleFieldChange("knownSkills", updated);
  };

  const handleToggleDomain = (domain: string) => {
    const current = formData.domainsOfInterests || [];
    const exists = current.includes(domain);
    const updated = exists ? current.filter((d) => d !== domain) : [...current, domain];
    handleFieldChange("domainsOfInterests", updated);
  };

  const handleAddCustomDomain = () => {
    if (!customDomain.trim()) return;
    if (!formData.domainsOfInterests.includes(customDomain.trim())) {
      handleFieldChange("domainsOfInterests", [
        ...formData.domainsOfInterests,
        customDomain.trim(),
      ]);
    }
    setCustomDomain("");
  };

  const handleAddCourse = () => {
    if (!newCourseName.trim()) return;
    handleFieldChange("completedCourses", [
      ...formData.completedCourses,
      newCourseName.trim(),
    ]);
    setNewCourseName("");
  };

  const handleRemoveCourse = (index: number) => {
    const updated = formData.completedCourses.filter((_, i) => i !== index);
    handleFieldChange("completedCourses", updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("auralearn_has_customized_profile", "true");
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
    await onGenerateRoadmap(formData);
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Top Banner Card */}
      <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              AI Profiling Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Personalized Learner Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-normal">
              Our AI analyzes your exact background, skill gaps, schedule, and learning modality to
              build a tailored roadmap with verified prerequisites.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenPresetsModal}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Compass className="w-4 h-4 text-blue-600" />
            Preset Archetypes
          </button>
        </div>
      </div>

      {/* Guide Banner for New Users / Learners */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0 mt-0.5 shadow-xs">
          <Target className="w-4 h-4" />
        </div>
        <div className="text-xs text-slate-700 space-y-1">
          <div className="font-bold text-slate-900 text-sm">
            💡 How to calibrate your custom curriculum:
          </div>
          <p className="leading-relaxed">
            1. Set your <strong>Target Dream Role</strong> and <strong>Current Experience Level</strong> below.<br />
            2. Rate your known competencies from <strong>1 (Novice)</strong> to <strong>5 (Expert)</strong> in Section 2 so AI skips what you already know.<br />
            3. Choose your <strong>Weekly Study Capacity</strong> (e.g. 10 hrs/week) to calculate realistic timeline milestones.<br />
            4. Click <strong>Generate AI Roadmap</strong> at the bottom to synthesize your custom learning path.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Core Goals & Identity */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">1. Target Career & Background</h2>
              <p className="text-xs text-slate-500">Define your current experience baseline and target aspiration.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 transition-all font-medium shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Current Background / Role
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.currentRole}
                  onChange={(e) => handleFieldChange("currentRole", e.target.value)}
                  placeholder="e.g. Junior Web Dev, Student, QA Engineer"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 transition-all font-medium shadow-2xs"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-900 mb-1 flex items-center justify-between">
                <span>Target Dream Role / Objective</span>
                <span className="text-[11px] text-blue-600 font-semibold">Career Aspiration</span>
              </label>
              <div className="relative">
                <Target className="w-4 h-4 text-blue-600 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={formData.targetRole}
                  onChange={(e) => handleFieldChange("targetRole", e.target.value)}
                  placeholder="e.g. Full-Stack Generative AI Engineer, Cloud Architect, MLOps Lead"
                  className="w-full pl-9 pr-3 py-2 text-sm font-semibold bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 transition-all shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Overall Technical Experience Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(["Beginner", "Intermediate", "Advanced", "Expert"] as ExperienceLevel[]).map(
                (lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleFieldChange("experienceLevel", lvl)}
                    className={`py-2.5 px-3 rounded-lg text-xs font-bold border text-center transition-all cursor-pointer ${
                      formData.experienceLevel === lvl
                        ? "bg-blue-50 border-blue-600 text-blue-700 shadow-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs"
                    }`}
                  >
                    {lvl}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Goal description in natural language */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detailed Learning Goal & Context (Natural Language)
            </label>
            <textarea
              rows={3}
              value={formData.learningGoalsText}
              onChange={(e) => handleFieldChange("learningGoalsText", e.target.value)}
              placeholder="e.g., I want to build production apps using Gemini and vector DBs. I already know JavaScript, but need deep help with AI evaluation, RAG patterns, and deploying microservices."
              className="w-full p-3 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Section 2: Domains & Known Skills */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">2. Domains of Interest & Skill Inventory</h2>
              <p className="text-xs text-slate-500">Select topics you care about and rate your existing competencies.</p>
            </div>
          </div>

          {/* Domains */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Focus Domains & Technologies
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {POPULAR_DOMAINS.map((domain) => {
                const selected = formData.domainsOfInterests.includes(domain);
                return (
                  <button
                    key={domain}
                    type="button"
                    onClick={() => handleToggleDomain(domain)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      selected
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs"
                    }`}
                  >
                    {selected ? "✓ " : "+ "}
                    {domain}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomDomain();
                  }
                }}
                placeholder="Add custom domain or tech..."
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 shadow-2xs"
              />
              <button
                type="button"
                onClick={handleAddCustomDomain}
                className="px-3 py-1.5 text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 shadow-2xs cursor-pointer"
              >
                Add Topic
              </button>
            </div>
          </div>

          {/* Known Skills Inventory */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">
                Your Current Skills & Self-Assessed Proficiency
              </label>
              <span className="text-[11px] text-slate-500 font-medium">Used for Gap Analysis</span>
            </div>

            {/* Rubric Legend */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[1,2,3,4,5].map((l) => (
                <div key={l} className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${SKILL_LEVEL_RUBRICS[l].color}`}>
                  <span className="font-black">{l}</span>
                  <span>{SKILL_LEVEL_RUBRICS[l].label}</span>
                </div>
              ))}
              <div className="flex items-center gap-1 text-[10px] text-slate-400 ml-1">
                <Info className="w-3 h-3" />
                <span>Hover a level button for full description</span>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              {formData.knownSkills.map((sk, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg gap-3 shadow-2xs"
                >
                  <span className="text-xs font-bold text-slate-900 flex-1 truncate">
                    {sk.skill}
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <LevelButton
                        key={star}
                        level={star}
                        selected={star <= sk.level}
                        onClick={() => handleSkillLevelChange(idx, star)}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(idx)}
                    className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Manual Add Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSkill(); } }}
                placeholder="New skill (e.g. SQL, PyTorch, Docker)"
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 shadow-2xs"
              />
              <div className="flex items-center gap-1 justify-end">
                <span className="text-xs text-slate-500 font-medium mr-1">Level:</span>
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <LevelButton
                    key={lvl}
                    level={lvl}
                    selected={newSkillLevel === lvl}
                    onClick={() => setNewSkillLevel(lvl)}
                  />
                ))}
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="ml-2 flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </div>

            {/* ── Quick Import Buttons ─────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <button
                type="button"
                onClick={() => { setShowGithubPanel(!showGithubPanel); setShowResumePanel(false); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs"
              >
                <Github className="w-3.5 h-3.5" />
                Import from GitHub
                {showGithubPanel ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
              </button>
              <button
                type="button"
                onClick={() => { setShowResumePanel(!showResumePanel); setShowGithubPanel(false); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5" />
                Extract from Resume / Bio
                {showResumePanel ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
              </button>
            </div>

            {/* ── GitHub Import Panel ──────────────────────────────────── */}
            {showGithubPanel && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Github className="w-4 h-4" />
                  Import Public GitHub Languages
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Enter your GitHub username. We'll fetch your top 20 public repos and map
                  languages to skill levels — <strong>no login or token required</strong>.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={githubUsername}
                    onChange={(e) => { setGithubUsername(e.target.value); setGithubError(null); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleGithubImport(); } }}
                    placeholder="e.g. torvalds"
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                  <button
                    type="button"
                    disabled={githubLoading || !githubUsername.trim()}
                    onClick={handleGithubImport}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    {githubLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Github className="w-3.5 h-3.5" />}
                    {githubLoading ? "Fetching..." : "Fetch Skills"}
                  </button>
                </div>

                {githubError && (
                  <div className="flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-[11px] text-rose-700">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    {githubError}
                  </div>
                )}

                {githubPreview.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Review & select skills to import — adjust levels before adding:</div>
                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                      {githubPreview.map((item, i) => (
                        <PreviewSkillRow
                          key={i}
                          item={item}
                          onChange={(updated) => {
                            const copy = [...githubPreview];
                            copy[i] = updated;
                            setGithubPreview(copy);
                          }}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        mergePreviewSkills(githubPreview);
                        setGithubPreview([]);
                        setShowGithubPanel(false);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Add {githubPreview.filter(p => p.selected).length} Selected Skills
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Resume / AI Extraction Panel ─────────────────────────── */}
            {showResumePanel && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <FileText className="w-4 h-4" />
                  Extract Skills from Resume or Bio
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Paste a snippet from your resume, LinkedIn "About" section, or any professional bio.
                  Our AI will extract your technical skills and estimate proficiency levels.
                  <strong> You can review and edit everything before adding.</strong>
                </p>
                <textarea
                  rows={5}
                  value={resumeText}
                  onChange={(e) => { setResumeText(e.target.value); setResumeError(null); }}
                  placeholder="e.g. 'I'm a full-stack engineer with 4 years of experience building React and Node.js applications. I've deployed microservices on AWS (ECS, Lambda) and have strong skills in PostgreSQL and Redis...' "
                  className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 resize-none"
                  maxLength={5000}
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">{resumeText.length}/5000 characters</span>
                  <button
                    type="button"
                    disabled={resumeLoading || resumeText.trim().length < 20}
                    onClick={handleResumeExtract}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    {resumeLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {resumeLoading ? "Analyzing..." : "Extract Skills with AI"}
                  </button>
                </div>

                {resumeError && (
                  <div className="flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-[11px] text-rose-700">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    {resumeError}
                  </div>
                )}

                {resumePreview.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Review & edit — AI-extracted skills:</div>
                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                      {resumePreview.map((item, i) => (
                        <PreviewSkillRow
                          key={i}
                          item={item}
                          onChange={(updated) => {
                            const copy = [...resumePreview];
                            copy[i] = updated;
                            setResumePreview(copy);
                          }}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        mergePreviewSkills(resumePreview);
                        setResumePreview([]);
                        setShowResumePanel(false);
                        setResumeText("");
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Add {resumePreview.filter(p => p.selected).length} Selected Skills
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Learning Habits & Pace */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">3. Time Commitment, Style & Budget</h2>
              <p className="text-xs text-slate-500">Customize study pacing and preferred resource formats.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Weekly Hours */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700">
                  Weekly Commitment: <span className="text-blue-600">{formData.weeklyCommitmentHours} hrs/week</span>
                </label>
                <span className="text-[11px] text-slate-500 font-medium">
                  ~{(formData.weeklyCommitmentHours / 7).toFixed(1)} hrs/day
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="40"
                step="1"
                value={formData.weeklyCommitmentHours}
                onChange={(e) =>
                  handleFieldChange("weeklyCommitmentHours", parseInt(e.target.value, 10))
                }
                className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-medium mt-1">
                <span>3h (Casual)</span>
                <span>10h (Balanced)</span>
                <span>20h (Accelerated)</span>
                <span>40h (Full-time)</span>
              </div>
            </div>

            {/* Learning Style */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Preferred Learning Modality
              </label>
              <select
                value={formData.learningStyle}
                onChange={(e) => handleFieldChange("learningStyle", e.target.value as LearningStyle)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium shadow-2xs"
              >
                <option value="hands-on-projects">Hands-on Projects & Practical Builds</option>
                <option value="case-studies">Real-World Case Studies & Applied Analysis</option>
                <option value="video-first">Video Courses & Visual Lectures</option>
                <option value="interactive-code">Interactive Coding Sandboxes</option>
                <option value="academic-papers">Academic Papers & Institutional Docs</option>
                <option value="balanced">Balanced Multi-Modal Mix</option>
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Resource Cost Preference
              </label>
              <select
                value={formData.preferredBudget}
                onChange={(e) =>
                  handleFieldChange("preferredBudget", e.target.value as BudgetPreference)
                }
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium shadow-2xs"
              >
                <option value="free-only">100% Free / Open Source Only</option>
                <option value="open-and-paid">Open-source + Paid Top Platforms</option>
                <option value="cert-focused">Accredited Certifications Focused</option>
              </select>
            </div>

            {/* Completed Courses */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Prior Completed Courses & Certifications
              </label>
              <div className="space-y-1.5 mb-2 max-h-24 overflow-y-auto">
                {formData.completedCourses.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs bg-white px-2.5 py-1 rounded border border-slate-200 text-slate-700 font-medium shadow-2xs"
                  >
                    <span className="truncate">{c}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCourse(i)}
                      className="text-slate-400 hover:text-rose-500 ml-2 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="e.g. CS50x, Fast.ai Part 1"
                  className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={handleAddCourse}
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 shadow-2xs cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>AI calculates sequence, prerequisites, and high-yield resources.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {savedSuccess && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold">
                <Check className="w-4 h-4" /> Profile Updated!
              </span>
            )}
            <button
              id="btn-generate-ai-roadmap"
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm rounded-xl transition-all shadow-xs"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Personalized Roadmap...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Roadmap</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
