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
} from "lucide-react";
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
                Your Current Skills & Self-Assessed Proficiency (1 to 5)
              </label>
              <span className="text-[11px] text-slate-500 font-medium">Used for Gap Analysis</span>
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
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleSkillLevelChange(idx, star)}
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-colors cursor-pointer ${
                          star <= sk.level
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200 border border-slate-200"
                        }`}
                      >
                        {star}
                      </button>
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

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="New skill (e.g. SQL, PyTorch, Docker)"
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 shadow-2xs"
              />
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-xs text-slate-500 font-medium mr-1">Level:</span>
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setNewSkillLevel(lvl)}
                    className={`w-6 h-6 rounded text-xs font-bold cursor-pointer ${
                      newSkillLevel === lvl
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-600 border border-slate-200"
                    }`}
                  >
                    {lvl}
                  </button>
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
