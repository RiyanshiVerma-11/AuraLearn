import React, { useState, useEffect } from "react";
import {
  Compass,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BrainCircuit,
  Target,
  Zap,
  BookOpen,
  Award,
  Layers,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Star,
  Users,
  Clock,
  TrendingUp,
  Cpu,
  BarChart3,
  SlidersHorizontal,
  Check,
  HelpCircle,
  Play,
  Terminal,
  ExternalLink,
  XCircle,
  AlertTriangle,
  FileCode2,
  GitBranch,
  Share2,
  Flame,
  ArrowUpRight,
  Workflow,
  GraduationCap,
  CheckSquare,
  Code2,
  Lock,
  Unlock,
  MessageSquare,
  RefreshCw,
  Download,
  Smartphone,
  Laptop,
  Monitor,
  X,
  Info,
  Search,
  Database,
  Server,
  Binary,
  GitCommit,
  FileText,
} from "lucide-react";
import { CAREER_PATH_PRESETS } from "../data/presets";
import { CareerPathPreset, LearningRoadmap, AuthUser } from "../types";
import { pwaService } from "../services/pwaService";
import { BrandLogo } from "./BrandLogo";

interface LandingPageViewProps {
  onGetStarted: () => void;
  onSelectPreset: (preset: CareerPathPreset) => void;
  onNavigateToTab: (tab: "landing" | "roadmap" | "dashboard" | "profile" | "chat" | "resources") => void;
  roadmap: LearningRoadmap | null;
  onOpenAuth?: (mode?: "signin" | "signup") => void;
  authUser?: AuthUser | null;
}

interface FAQItem {
  question: string;
  answer: string;
  category: "General" | "Compiler Engine" | "Curriculum & Labs" | "Enterprise & Access";
}

const FAQS_DATA: FAQItem[] = [
  {
    category: "General",
    question: "Is AuraLearn only for software engineers or for all domains?",
    answer:
      "AuraLearn is an intelligent personalized learning recommender for ANY field or goal! Whether you are exploring Artificial Intelligence, Product Management, UI/UX Design, Data Analytics, Healthcare Informatics, Digital Marketing, Financial Modeling, Cloud Systems, or Academic Research, Aura analyzes your background and builds a tailored roadmap with curated courses, projects, and diagnostics across your chosen discipline.",
  },
  {
    category: "General",
    question: "How does AuraLearn differ from static course catalogs and roadmaps?",
    answer:
      "Static platforms show the same generic course playlists to everyone, ignoring what you already know. AuraLearn is an AI-powered personalized learning architect: it evaluates your current experience baseline, calculates mathematical skill deltas against real role competencies, prunes redundant material, and sequences courses, projects, and assessments into an adaptive roadmap matched to your exact weekly hours.",
  },
  {
    category: "Compiler Engine",
    question: "How does the skill gap and recommendation engine calculate timelines?",
    answer:
      "The engine uses structured AI models cross-referenced against real industry standards and academic rubrics. It assigns cognitive complexity ratings to each milestone, factors in prerequisite dependencies, and computes calibrated completion timelines based on your actual weekly availability.",
  },
  {
    category: "Compiler Engine",
    question: "What happens when my schedule changes or I want to adapt my roadmap?",
    answer:
      "You can recalibrate your roadmap at any time via the one-click 'Calibrate Path' engine or through conversation with Aura, our AI advisor. Simply tell Aura: 'I only have 5 hours this week—prioritize core deliverables and defer secondary topics,' and your entire downstream roadmap recalculates dynamically.",
  },
  {
    category: "Curriculum & Labs",
    question: "Where do the recommended courses and learning resources come from?",
    answer:
      "All milestones link to high-yield verified resources from authoritative institutions and platforms: Coursera, edX, MIT OpenCourseWare, Stanford Online, Harvard Online, Google Career Certificates, DeepLearning.AI, official documentation, and curated open-source repositories. You can filter for 100% Free resources vs. Paid Certifications with a single click.",
  },
  {
    category: "Curriculum & Labs",
    question: "How do diagnostic mastery gates and quizzes verify real competence?",
    answer:
      "Every milestone is paired with an authentic hands-on deliverable/case-study and a 3-question conceptual diagnostic assessment. These questions test practical problem-solving, trade-offs, and critical decision-making. Passing updates your Skill Radar in real time and unlocks downstream milestones.",
  },
  {
    category: "Enterprise & Access",
    question: "Can I export my learning roadmap to Notion, Obsidian, or Markdown?",
    answer:
      "Yes. The built-in Export tool lets you copy cleanly structured Markdown checklists with resource hyperlinks and time budgets, or download the full JSON schema to integrate directly into your personal notes, LMS, or team knowledge base.",
  },
  {
    category: "Enterprise & Access",
    question: "Is AuraLearn free to use for individual learners?",
    answer:
      "Yes. The Starter plan is 100% free forever for individual learners to create profiles, diagnose skill gaps, generate custom roadmaps, take milestone assessments, and export paths.",
  },
];

// Interactive Hero Simulator Data across diverse disciplines
const HERO_SIMULATOR_PRESETS = [
  {
    id: "genai",
    title: "AI & Machine Learning",
    role: "Generative AI & Systems Specialist",
    weeks: 8,
    hours: 80,
    skills: [
      { name: "Transformer Math & Attention", current: 30, target: 85, color: "bg-blue-600" },
      { name: "Vector Search & Hybrid RAG", current: 40, target: 90, color: "bg-indigo-600" },
      { name: "Multi-Agent Tool Orchestration", current: 15, target: 80, color: "bg-sky-600" },
      { name: "Production LLMOps & Latency Evals", current: 20, target: 85, color: "bg-emerald-600" },
    ],
    milestones: [
      {
        id: "m1",
        num: "01",
        title: "Prompt Engineering & Structured Schemas",
        time: "14 hrs",
        status: "verified",
        deliverable: "Built validated JSON extraction pipeline with strict typing and schema safety",
        source: "DeepLearning.AI / Google Cloud",
      },
      {
        id: "m2",
        num: "02",
        title: "High-Throughput Hybrid RAG with Vector Search",
        time: "18 hrs",
        status: "active",
        deliverable: "Constructed hybrid vector retrieval pipeline with reciprocal rank fusion",
        source: "Stanford Online / Qdrant",
      },
      {
        id: "m3",
        num: "03",
        title: "Autonomous Tool-Calling Agent Protocol",
        time: "22 hrs",
        status: "locked",
        deliverable: "Constructed multi-turn agent with sandboxed tool execution and retry loops",
        source: "Anthropic / Gemini Docs",
      },
    ],
  },
  {
    id: "pm",
    title: "Product Management",
    role: "Senior Product Manager & AI Lead",
    weeks: 8,
    hours: 64,
    skills: [
      { name: "User Research & Problem Discovery", current: 45, target: 90, color: "bg-amber-600" },
      { name: "Product Specs (PRD) & Scoping", current: 40, target: 85, color: "bg-blue-600" },
      { name: "A/B Testing & Quantitative Metrics", current: 25, target: 80, color: "bg-indigo-600" },
      { name: "AI Product Strategy & Economics", current: 20, target: 85, color: "bg-emerald-600" },
    ],
    milestones: [
      {
        id: "pm1",
        num: "01",
        title: "Opportunity Solution Tree & User Discovery",
        time: "12 hrs",
        status: "verified",
        deliverable: "Conducted 8 user interviews and synthesized findings into prioritized opportunity maps",
        source: "Reforge / Teresa Torres",
      },
      {
        id: "pm2",
        num: "02",
        title: "Comprehensive PRD & Release Scoping",
        time: "16 hrs",
        status: "active",
        deliverable: "Authored end-to-end PRD with acceptance criteria, telemetry specs, and risk matrices",
        source: "Harvard Business School Online",
      },
      {
        id: "pm3",
        num: "03",
        title: "A/B Experimentation & Funnel Optimization",
        time: "18 hrs",
        status: "locked",
        deliverable: "Designed multi-variant experiment with statistical sample size and power calculation",
        source: "Coursera / Wharton",
      },
    ],
  },
  {
    id: "data",
    title: "Data & Analytics",
    role: "Senior Business Data Analyst",
    weeks: 10,
    hours: 80,
    skills: [
      { name: "Advanced SQL, Window Functions & CTEs", current: 40, target: 90, color: "bg-blue-600" },
      { name: "Tableau & Executive BI Dashboards", current: 35, target: 85, color: "bg-indigo-600" },
      { name: "Python Exploratory Data Analysis", current: 20, target: 80, color: "bg-emerald-600" },
      { name: "Statistical Hypothesis Testing", current: 15, target: 75, color: "bg-purple-600" },
    ],
    milestones: [
      {
        id: "d1",
        num: "01",
        title: "Advanced SQL & Dimensional Data Modeling",
        time: "18 hrs",
        status: "verified",
        deliverable: "Constructed star-schema analytical warehouse with complex cohort retention queries",
        source: "Mode Analytics / Stanford",
      },
      {
        id: "d2",
        num: "02",
        title: "Interactive Executive KPI Dashboard",
        time: "20 hrs",
        status: "active",
        deliverable: "Built interactive Tableau dashboard tracking customer LTV, CAC, and churn",
        source: "Google Data Analytics / Coursera",
      },
      {
        id: "d3",
        num: "03",
        title: "Predictive Customer Churn Modeling",
        time: "22 hrs",
        status: "locked",
        deliverable: "Trained logistic regression model in Python with ROC-AUC evaluation curves",
        source: "MIT OpenCourseWare",
      },
    ],
  },
  {
    id: "design",
    title: "UI/UX & Design",
    role: "Lead UI/UX Product Designer",
    weeks: 8,
    hours: 64,
    skills: [
      { name: "Figma Component & Token Systems", current: 50, target: 95, color: "bg-sky-600" },
      { name: "User Journey & Usability Audits", current: 30, target: 85, color: "bg-blue-600" },
      { name: "Micro-Interactions & Prototyping", current: 25, target: 80, color: "bg-indigo-600" },
      { name: "WCAG Accessibility Compliance", current: 35, target: 90, color: "bg-emerald-600" },
    ],
    milestones: [
      {
        id: "ux1",
        num: "01",
        title: "Design System Tokens & Component Library",
        time: "14 hrs",
        status: "verified",
        deliverable: "Engineered responsive multi-theme Figma design system with auto-layout and variants",
        source: "Nielsen Norman Group",
      },
      {
        id: "ux2",
        num: "02",
        title: "End-to-End Mobile App High-Fidelity Prototype",
        time: "18 hrs",
        status: "active",
        deliverable: "Designed interactive checkout flow and conducted moderated user testing sessions",
        source: "Interaction Design Foundation",
      },
      {
        id: "ux3",
        num: "03",
        title: "Accessibility Audit & Micro-Interaction Engine",
        time: "16 hrs",
        status: "locked",
        deliverable: "Completed WCAG 2.1 AA audit with interactive animated feedback micro-states",
        source: "W3C WAI Guidelines",
      },
    ],
  },
  {
    id: "health",
    title: "Healthcare Informatics",
    role: "Healthcare Informatics Specialist",
    weeks: 10,
    hours: 80,
    skills: [
      { name: "EHR & HL7/FHIR Standards", current: 20, target: 85, color: "bg-emerald-600" },
      { name: "Clinical Data Privacy (HIPAA)", current: 40, target: 95, color: "bg-blue-600" },
      { name: "Healthcare Workflow Optimization", current: 30, target: 80, color: "bg-indigo-600" },
      { name: "Epidemiological Data Modeling", current: 15, target: 75, color: "bg-amber-600" },
    ],
    milestones: [
      {
        id: "h1",
        num: "01",
        title: "FHIR API Data Ingestion & EHR Interoperability",
        time: "20 hrs",
        status: "verified",
        deliverable: "Built secure patient record sync using HL7 FHIR RESTful resources",
        source: "Johns Hopkins / Coursera",
      },
      {
        id: "h2",
        num: "02",
        title: "HIPAA Security Architecture & Compliance Audit",
        time: "18 hrs",
        status: "active",
        deliverable: "Authored technical risk assessment and data de-identification pipeline",
        source: "Harvard Medical School Online",
      },
      {
        id: "h3",
        num: "03",
        title: "Clinical Decision Support KPI Dashboard",
        time: "22 hrs",
        status: "locked",
        deliverable: "Constructed analytics portal monitoring readmission rates and alert fatigue",
        source: "NIH / HealthIT.gov",
      },
    ],
  },
  {
    id: "marketing",
    title: "Growth & Marketing",
    role: "Growth & Digital Marketing Lead",
    weeks: 6,
    hours: 48,
    skills: [
      { name: "Search Engine Optimization (SEO)", current: 35, target: 85, color: "bg-emerald-600" },
      { name: "Paid Acquisition (PPC & Meta)", current: 30, target: 80, color: "bg-blue-600" },
      { name: "Conversion Rate Optimization (CRO)", current: 25, target: 85, color: "bg-indigo-600" },
      { name: "Multi-Touch Attribution Analytics", current: 20, target: 80, color: "bg-purple-600" },
    ],
    milestones: [
      {
        id: "mkt1",
        num: "01",
        title: "Technical SEO Audit & Keyword Strategy",
        time: "12 hrs",
        status: "verified",
        deliverable: "Conducted site-wide technical crawl and built high-intent content cluster map",
        source: "HubSpot Academy / Moz",
      },
      {
        id: "mkt2",
        num: "02",
        title: "Paid Campaign Architecture & Ad Creative Testing",
        time: "16 hrs",
        status: "active",
        deliverable: "Launched multi-funnel Google Search & Meta campaign with automated budget rules",
        source: "Google Digital Garage",
      },
      {
        id: "mkt3",
        num: "03",
        title: "Lifecycle Email Nurture & CRO Funnel",
        time: "14 hrs",
        status: "locked",
        deliverable: "Engineered dynamic onboarding email workflow with A/B subject line tests",
        source: "CXL Institute",
      },
    ],
  },
];

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onGetStarted,
  onSelectPreset,
  onNavigateToTab,
  roadmap,
  onOpenAuth,
  authUser,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>("All");
  const [activeFeatureTab, setActiveFeatureTab] = useState<
    "compiler" | "radar" | "dag" | "deliverables" | "quizzes" | "advisor" | "export"
  >("compiler");
  const [activeSimulatorId, setActiveSimulatorId] = useState<string>("genai");
  const [selectedSimulatorMilestone, setSelectedSimulatorMilestone] = useState<number>(1);
  const [pricingCycle, setPricingCycle] = useState<"annual" | "monthly">("annual");
  const [canInstall, setCanInstall] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [activeInstallTab, setActiveInstallTab] = useState<"desktop" | "ios" | "android">("desktop");
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const unsub = pwaService.subscribeInstallState((installable) => {
      setCanInstall(installable);
    });
    return unsub;
  }, []);

  const handleInstallClick = async () => {
    if (canInstall) {
      const accepted = await pwaService.promptInstall();
      if (!accepted) {
        setShowInstallModal(true);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const [feedbackReviews, setFeedbackReviews] = useState<any[]>([
    {
      id: "fb-1",
      name: "Riyanshi Verma",
      roleTitle: "AI & Full-Stack Engineer • Verified Learner",
      rating: 4.8,
      comment:
        "AuraLearn completely changed how I organize my technical learning. Instead of getting stuck in tutorial hell, the prerequisite graph pinpointed my exact skill gaps and generated a structured, hands-on roadmap that actually matched my weekly schedule. Truly exceptional!",
      createdAt: new Date().toISOString(),
      status: "approved",
      isFeatured: true,
    },
    {
      id: "fb-2",
      name: "David Kim",
      roleTitle: "Staff Cloud Architect • Verified Learner",
      rating: 5.0,
      comment:
        "The explainability feature is what sets AuraLearn apart. Knowing WHY each course was selected based on my diagnostics made me trust the path 100%. Transitioned to Staff Platform role in 4 months.",
      createdAt: new Date().toISOString(),
      status: "approved",
    },
    {
      id: "fb-3",
      name: "Elena Martinez",
      roleTitle: "MLOps Specialist • Verified Learner",
      rating: 5.0,
      comment:
        "The AI code reviewer on milestone submissions feels like having a senior staff engineer reviewing your pull requests in real time. Absolute game changer for portfolio building.",
      createdAt: new Date().toISOString(),
      status: "approved",
    },
  ]);
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(4.8);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    // Fetch live approved feedback from backend
    fetch("/api/feedback")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setFeedbackReviews(data.reviews);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);
    if (!feedbackName.trim() || !feedbackComment.trim()) return;

    setIsSubmittingFeedback(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: feedbackName,
          rating: feedbackRating,
          comment: feedbackComment,
          roleTitle: authUser ? "Verified Learner" : "Community Learner",
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to submit feedback.");
      }

      setFeedbackMsg({ type: "success", text: data.message });
      if (data.item && data.status === "approved") {
        setFeedbackReviews((prev) => [data.item, ...prev.filter((r) => r.id !== data.item.id)]);
      }
      setFeedbackComment("");
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Feedback submission failed." });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const handleLaunchAuthOrApp = (mode: "signin" | "signup" = "signup") => {
    if (authUser) {
      onNavigateToTab("roadmap");
    } else if (onOpenAuth) {
      onOpenAuth(mode);
    } else {
      onGetStarted();
    }
  };

  const activePreset =
    HERO_SIMULATOR_PRESETS.find((p) => p.id === activeSimulatorId) || HERO_SIMULATOR_PRESETS[0];

  const filteredFaqs =
    selectedFaqCategory === "All"
      ? FAQS_DATA
      : FAQS_DATA.filter((f) => f.category === selectedFaqCategory);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* 1. HERO SECTION: CRISP, AUTHORITATIVE & PRODUCT-CENTRIC TWO-COLUMN HERO */}
      <section id="hero" className="relative pt-4 pb-12 sm:pt-6 sm:pb-20 border-b border-slate-200 bg-white scroll-mt-14 overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Authoritative Copy & Call-to-Actions (7 cols) */}
            <div className="lg:col-span-7 text-left space-y-6">
              {/* Version & Institutional Benchmark Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-slate-100 text-xs font-mono font-medium shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>AuraLearn v2.4</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-300">AI-Powered Personalized Learning Path Recommender</span>
              </div>

              {/* Clear, High-Conviction Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950 leading-[1.15]">
                AI-Powered Personalized Learning Paths for Any Goal & Career.
              </h1>

              {/* Precision Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
                Stop struggling through disconnected course catalogs. Aura understands your profile, diagnoses your exact skill gaps, and compiles an adaptive, milestone-driven curriculum tailored to your learning style, schedule, and career aspirations across tech, business, design, and beyond.
              </p>

              {/* Primary Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  id="btn-hero-launch-workspace"
                  onClick={onGetStarted}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Build Your Personalized Path</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="btn-hero-view-demo-roadmap"
                  onClick={() => onNavigateToTab("roadmap")}
                  className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-900 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>Explore Live Workspace</span>
                </button>

                <button
                  id="btn-hero-install-pwa"
                  onClick={handleInstallClick}
                  className="px-4 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl border border-slate-200 shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  title="Install Desktop or Mobile Application"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  <span>Install App (PWA)</span>
                </button>
              </div>

              {/* Institutional Syllabus Alignment Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 font-medium border-t border-slate-100">
                <span className="text-slate-400 font-semibold">Courses & Labs from:</span>
                <span className="hover:text-slate-900 transition-colors">Coursera</span>
                <span className="text-slate-300">•</span>
                <span className="hover:text-slate-900 transition-colors">edX</span>
                <span className="text-slate-300">•</span>
                <span className="hover:text-slate-900 transition-colors">MIT OpenCourseWare</span>
                <span className="text-slate-300">•</span>
                <span className="hover:text-slate-900 transition-colors">Stanford Online</span>
                <span className="text-slate-300">•</span>
                <span className="hover:text-slate-900 transition-colors">Harvard Online</span>
                <span className="text-slate-300">•</span>
                <span className="hover:text-slate-900 transition-colors">Google & DeepLearning.AI</span>
              </div>
            </div>

            {/* Right Column: Aesthetic Brand Logo & Product Badge Showcase (5 cols) */}
            <div className="lg:col-span-5 flex items-center justify-center lg:justify-end">
              <div className="relative group p-8 sm:p-10 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center text-center space-y-5 max-w-sm sm:max-w-md w-full">
                {/* Ambient Soft Glow Background */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-cyan-400/30 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {/* Main Vector Brand Emblem Graphic */}
                <div className="relative z-10 p-2">
                  <BrandLogo size="splash" showWordmark={false} glow={true} animated={true} />
                </div>

                {/* Product Wordmark & Identity Tag */}
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                      Aura<span className="text-blue-400">Learn</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-blue-950 text-blue-400 border border-blue-800">
                      v2.4 Core
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-xs font-normal">
                    Autonomous Skill Delta & Milestone DAG Compilation Engine
                  </p>
                </div>

                {/* Micro Live Telemetry Pills */}
                <div className="relative z-10 grid grid-cols-2 gap-2.5 w-full pt-3 border-t border-slate-800/80 text-left">
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Engine Status</div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Gemini 2.5 Active
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Resolution</div>
                    <div className="text-xs font-semibold text-blue-300 mt-0.5">
                      Prerequisite DAG
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FEATURE SHOWCASE GRID: 100% ACCURATE PRODUCT CAPABILITIES */}
          <div className="mt-12 pt-10 border-t border-slate-200">
            <div className="text-center space-y-2 mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold uppercase tracking-wider border border-blue-200">
                <BrainCircuit className="w-3.5 h-3.5 text-blue-600" />
                <span>Verified Core Architecture</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                Enterprise AI Engines Inside AuraLearn
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
                Explore the actual autonomous capabilities running live inside the AuraLearn workspace.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Feature 1: AI Code & Deliverable Reviewer */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <FileCode2 className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                      Live Engine
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    AI Code & Rubric Reviewer
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Submit code deliverables for automated evaluation against Functionality, Cleanliness, Architecture, and Security rubrics with actionable code diffs.
                  </p>
                </div>

                {/* Real UI Mock Card */}
                <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 space-y-2 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                    <span>Rubric Verdict:</span>
                    <span className="text-emerald-400 font-bold">Passed (92/100)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
                    <div className="flex items-center justify-between bg-slate-900/80 p-1.5 rounded">
                      <span>Functionality</span>
                      <span className="text-blue-400 font-bold">95%</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-900/80 p-1.5 rounded">
                      <span>Security</span>
                      <span className="text-blue-400 font-bold">90%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 2: Conversational AI Advisor (Aura) */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400 bg-indigo-950/60 border border-indigo-800 px-2 py-0.5 rounded">
                      Aura AI Advisor
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Context-Aware Career Architect
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Ask Aura why milestones were recommended, recalibrate hours on demand, and execute 1-click adaptive roadmap updates.
                  </p>
                </div>

                {/* Real UI Mock Card */}
                <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-md bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      A
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      "I've rebalanced your roadmap for 5 hours/week while preserving core vector DB milestones."
                    </p>
                  </div>
                  <div className="pt-1 flex flex-wrap gap-1">
                    <span className="text-[9px] bg-blue-900/60 text-blue-300 border border-blue-700/60 px-2 py-0.5 rounded">
                      Adapt for 5h/week
                    </span>
                    <span className="text-[9px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
                      Explain Step 1
                    </span>
                  </div>
                </div>
              </div>

              {/* Feature 3: Verified Certificate & Skill Diagnostic */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Award className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded">
                      Verifiable
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Certificate & Diagnostic Radar
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Track skill gap delta from baseline to target proficiency and generate exportable Certificates of Mastery upon milestone sign-off.
                  </p>
                </div>

                {/* Real UI Mock Card */}
                <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Certificate Hash</div>
                    <div className="text-xs font-mono text-cyan-300 font-semibold">0x7F9A...B4E2</div>
                  </div>
                  <div className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-bold uppercase tracking-wider">
                    Verified
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* INTERACTIVE PRODUCT SIMULATOR CONSOLE */}
          <div className="mt-12 max-w-5xl mx-auto rounded-2xl border border-slate-200/90 bg-white shadow-lg overflow-hidden">
            {/* Top Window Navigation & Tab Bar */}
            <div className="px-4 sm:px-6 py-3 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800">
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                </div>
                <span className="text-xs font-mono text-slate-400">
                  aura://compiler/{activePreset.id}
                </span>
              </div>

              {/* Role Archetype Selectors */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
                {HERO_SIMULATOR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setActiveSimulatorId(preset.id);
                      setSelectedSimulatorMilestone(1);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      activeSimulatorId === preset.id
                        ? "bg-blue-600 text-white shadow-2xs font-bold"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Inner Dashboard Simulator Preview */}
            <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/60">
              {/* Left Column: Mathematical Skill Gap Matrix (5 cols) */}
              <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Calculated Skill Gap Delta
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {activePreset.weeks} wks @ {Math.round(activePreset.hours / activePreset.weeks)} hrs/wk
                  </span>
                </div>

                <div className="space-y-3.5">
                  {activePreset.skills.map((skill, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-800 font-semibold">{skill.name}</span>
                        <span className="font-mono text-slate-600 font-bold">
                          {skill.current}% → <strong className="text-blue-600">{skill.target}%</strong>
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-slate-300 rounded-l-full"
                          style={{ width: `${skill.current}%` }}
                          title={`Current Verified: ${skill.current}%`}
                        />
                        <div
                          className={`h-full ${skill.color} rounded-r-full`}
                          style={{ width: `${skill.target - skill.current}%` }}
                          title={`Target Delta: +${skill.target - skill.current}%`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200/80 text-xs text-blue-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Compiler Optimization</span>
                  </div>
                  <p className="text-[11px] text-blue-900 leading-relaxed">
                    Pruned 32 redundant beginner modules. Sequenced {activePreset.milestones.length} core milestone gates to close the delta in {activePreset.hours} total study hours.
                  </p>
                </div>
              </div>

              {/* Right Column: Interactive Sequenced Milestone DAG (7 cols) */}
              <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Sequenced Milestone DAG
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Target: <strong className="text-slate-800">{activePreset.role}</strong>
                  </span>
                </div>

                <div className="space-y-3">
                  {activePreset.milestones.map((m, idx) => {
                    const isSelected = selectedSimulatorMilestone === idx;
                    const isVerified = m.status === "verified";
                    const isActive = m.status === "active";

                    return (
                      <div
                        key={m.id}
                        onClick={() => setSelectedSimulatorMilestone(idx)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-50/40 border-blue-400 shadow-xs ring-1 ring-blue-400/30"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span
                              className={`w-7 h-7 rounded-lg text-xs font-bold font-mono flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                isVerified
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  : isActive
                                  ? "bg-blue-600 text-white shadow-2xs"
                                  : "bg-slate-100 text-slate-500 border border-slate-200"
                              }`}
                            >
                              {isVerified ? "✓" : m.num}
                            </span>

                            <div className="space-y-1">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                                {m.title}
                              </h4>
                              <p className="text-[11px] text-slate-600 leading-normal">
                                <strong className="text-slate-800 font-medium">Deliverable:</strong> {m.deliverable}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-0.5">
                                <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-medium">
                                  {m.source}
                                </span>
                                <span>•</span>
                                <span>{m.time}</span>
                              </div>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex-shrink-0 ${
                              isVerified
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : isActive
                                ? "bg-blue-600 text-white shadow-2xs"
                                : "bg-slate-100 text-slate-500 border border-slate-200"
                            }`}
                          >
                            {m.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Click any milestone to inspect syllabus requirements</span>
                  <button
                    onClick={onGetStarted}
                    className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Customize This Path</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW THE CURRICULUM COMPILER WORKS (SYSTEM ARCHITECTURE) */}
      <section id="how-it-works" className="py-20 bg-white border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase border border-slate-200">
              <Workflow className="w-3.5 h-3.5 text-blue-600" />
              Recommendation Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              How the Personalized Path Engine Works
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Traditional platforms treat learning like a flat playlist. AuraLearn analyzes your background and targets, executing four adaptive stages:
            </p>
          </div>

          {/* 4-Stage Compiler Pipeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-4 shadow-2xs relative">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-mono font-bold text-sm flex items-center justify-center shadow-xs">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900">Baseline & Gap Assessment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inputs your existing background, past projects, and interests. Computes exact skill deltas against benchmark job competencies.
              </p>
              <div className="text-[11px] font-mono text-blue-700 bg-blue-50 p-2.5 rounded border border-blue-100">
                input: Vector&lt;Skill, Level&gt;
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-4 shadow-2xs relative">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-mono font-bold text-sm flex items-center justify-center shadow-xs">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900">Prerequisite Graph Sequencing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prunes redundant basics and sequences foundational concepts into an intelligent dependency graph with zero missing prerequisites.
              </p>
              <div className="text-[11px] font-mono text-blue-700 bg-blue-50 p-2.5 rounded border border-blue-100">
                graph: DAG&lt;Milestone, Prereqs&gt;
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-4 shadow-2xs relative">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-mono font-bold text-sm flex items-center justify-center shadow-xs">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900">Adaptive Pace & Style Alignment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Allocates resources across your preferred learning style (Hands-on, Video, RFCs/Theory) and distributes study sprints to fit your weekly schedule.
              </p>
              <div className="text-[11px] font-mono text-blue-700 bg-blue-50 p-2.5 rounded border border-blue-100">
                schedule: Sprint(weeks, hours)
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-4 shadow-2xs relative">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-mono font-bold text-sm flex items-center justify-center shadow-xs">
                04
              </div>
              <h3 className="text-base font-bold text-slate-900">Dynamic Live Recalibration</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pass an assessment early or need to change your weekly hours? The engine recalibrates downstream timelines in real time.
              </p>
              <div className="text-[11px] font-mono text-emerald-700 bg-emerald-50 p-2.5 rounded border border-emerald-100">
                recalibrate: LiveDAG.rebalance()
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PLATFORM CAPABILITIES EXPLORER */}
      <section id="features" className="py-20 bg-slate-50/60 border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase border border-blue-200">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              Comprehensive Platform Capabilities
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Designed for Accelerated Mastery in Any Field
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Every component in AuraLearn is built to eliminate tutorial overload and replace it with verifiable, career-ready competence.
            </p>
          </div>

          {/* Interactive Feature Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
            {[
              { id: "compiler", label: "Skill Radar Engine", icon: Target },
              { id: "dag", label: "Interactive DAG Graph", icon: Compass },
              { id: "deliverables", label: "Production Deliverables", icon: Code2 },
              { id: "quizzes", label: "Diagnostic Mastery Gates", icon: CheckSquare },
              { id: "advisor", label: "24/7 AI Advisor (Aura)", icon: MessageSquare },
              { id: "export", label: "Notion & Obsidian Sync", icon: Share2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFeatureTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`feature-tab-${tab.id}`}
                  onClick={() => setActiveFeatureTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-200/90 shadow-2xs"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-blue-400" : "text-slate-500"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Showcase Card */}
          <div className="max-w-5xl mx-auto rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xs">
            {activeFeatureTab === "compiler" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-mono font-bold uppercase border border-blue-200">
                    DIAGNOSTIC RADAR
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-950">
                    Mathematical Skill Gap Calculations
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Instead of generic multiple-choice quizzes, Aura evaluates your past stack experience and calculates exact percentage deltas across Foundations, Frameworks, Systems Architecture, and Production Tooling.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Pinpoints high-risk blind spots before technical screens</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Calculates precise delta vectors (e.g. 25% → 85%)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Continuously updates your visual Radar as milestones are verified</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => onNavigateToTab("dashboard")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>Inspect Skill Radar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="lg:col-span-6 bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3 font-mono text-xs shadow-2xs">
                  <div className="flex justify-between text-slate-500 pb-2 border-b border-slate-200">
                    <span>COMPETENCY VECTOR</span>
                    <span>DELTA STATUS</span>
                  </div>
                  <div className="space-y-2.5">
                    <div>
                      <div className="flex justify-between text-slate-800 mb-1 font-sans font-medium">
                        <span>Transformer Math & Attention</span>
                        <span className="text-blue-700 font-bold">25% → 85% (+60%)</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: "60%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-slate-800 mb-1 font-sans font-medium">
                        <span>Vector Indexing & Hybrid RAG</span>
                        <span className="text-indigo-700 font-bold">40% → 90% (+50%)</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: "50%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-slate-800 mb-1 font-sans font-medium">
                        <span>Production LLMOps & Latency Evals</span>
                        <span className="text-emerald-700 font-bold">15% → 80% (+65%)</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: "65%" }} />
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded border border-slate-200 text-[11px] text-slate-700 font-sans">
                    <strong>Compiler Output:</strong> 3 priority skill gaps mapped to 60 cognitive study hours.
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === "dag" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-mono font-bold uppercase border border-indigo-200">
                    TOPOLOGICAL DAG
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-950">
                    Non-Linear Prerequisite Progression
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Real software systems are not linear checklists. AuraLearn organizes your progression as a strict DAG, preventing you from tackling complex Raft consensus or custom CUDA kernels before mastering asynchronous memory locks.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span>Visual locked, active, and verified milestone state machines</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span>Difficulty tiers: Tier 1 (Core) through Tier 4 (Principal Architect)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span>One-click path adaptation to skip known nodes or insert new frameworks</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => onNavigateToTab("roadmap")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>View Interactive DAG</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="lg:col-span-6 bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2.5 text-xs shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 pb-2 border-b border-slate-200 font-mono">
                    <span>GRAPH NODES</span>
                    <span className="text-emerald-700 font-bold">STAGE 1 VERIFIED</span>
                  </div>
                  <div className="p-3 bg-white border border-emerald-300 rounded-lg flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-slate-900">01. Async Concurrency & Memory Layout</span>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold font-mono">VERIFIED</span>
                  </div>
                  <div className="p-3 bg-blue-50/70 border border-blue-300 rounded-lg flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <Play className="w-4 h-4 text-blue-600 fill-blue-600" />
                      <span className="font-bold text-blue-950">02. Raft Protocol Consensus Engine</span>
                    </div>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold font-mono">ACTIVE</span>
                  </div>
                  <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-between opacity-60">
                    <div className="flex items-center gap-2.5">
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-600">03. Distributed WAL & Snapshot Replication</span>
                    </div>
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold font-mono">LOCKED</span>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === "deliverables" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-mono font-bold uppercase border border-emerald-200">
                    PROOF OF COMPETENCY
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-950">
                    Production-Grade Project Deliverables
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    No clone tutorials or trivial todo apps. Every milestone concludes with an authentic engineering deliverable that you can commit to GitHub, showcase to hiring teams, and defend during senior technical interviews.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Explicit SLA & latency requirements (e.g. sub-50ms p99 retrieval)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Direct alignment with Staff/Principal interview design questions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Build real artifacts: Custom allocators, Raft clusters, Agent harnesses</span>
                    </li>
                  </ul>
                  <button
                    onClick={onGetStarted}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>Generate Your First Deliverable</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="lg:col-span-6 bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3 font-mono text-xs shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 pb-2 border-b border-slate-200">
                    <span>DELIVERABLE SPECIFICATION</span>
                    <span className="text-emerald-700 font-bold font-mono">PORTFOLIO ARTIFACT</span>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2.5 shadow-2xs font-sans">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-950 font-bold text-sm">Project: In-Memory Key-Value Store with Raft</span>
                      <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded font-bold font-mono">Tier 3</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Implement leader election, log replication, and periodic snapshotting in Go or Rust. Must pass simulated network partition tests with zero data corruption.
                    </p>
                    <div className="flex gap-2 text-[10px] text-slate-700 pt-1 font-mono">
                      <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">Raft Consensus</span>
                      <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">Jepsen Tests</span>
                      <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">WAL Storage</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === "quizzes" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-50 text-amber-700 text-xs font-mono font-bold uppercase border border-amber-200">
                    MASTERY GATES
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-950">
                    Architectural Diagnostic Assessments
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Verify conceptual mastery with instant 3-question diagnostic assessments. Each test challenges trade-offs, edge cases, and failure recovery to ensure you retain deep intuition before unlocking dependent levels.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>Deep architectural rationales for both correct and incorrect options</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>Passing the quiz automatically verifies competency on your Skill Radar</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>Instant retakes with fresh randomized questions to solidify weak points</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => onNavigateToTab("roadmap")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>Try Diagnostic Assessment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="lg:col-span-6 bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3 text-xs shadow-2xs">
                  <div className="flex justify-between text-slate-500 pb-2 border-b border-slate-200 font-mono">
                    <span>DIAGNOSTIC QUESTION 2 OF 3</span>
                    <span className="text-amber-700 font-bold">SYSTEM TRADE-OFF</span>
                  </div>
                  <p className="text-slate-900 font-medium leading-relaxed">
                    When scaling vector search across 100M+ documents, why choose HNSW over Flat Inverted File (IVF) index?
                  </p>
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center justify-between shadow-2xs">
                      <span>✓ HNSW maintains logarithmic search latency at high recall (95%+) via hierarchical graph traversal</span>
                      <span className="text-[10px] font-bold bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-800 font-mono">CORRECT</span>
                    </div>
                    <div className="p-3 rounded-lg bg-white border border-slate-200 text-slate-600">
                      <span>✕ HNSW requires zero RAM overhead compared to inverted file indexes</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === "advisor" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-sky-50 text-sky-700 text-xs font-mono font-bold uppercase border border-sky-200">
                    CONVERSATIONAL ADVISOR
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-950">
                    24/7 Context-Aware AI Copilot (Aura)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Aura is your personalized career architect with full awareness of your roadmap progress, target role, and past diagnostic scores. Unblock tricky bugs, conduct mock technical interviews, or rebalance your study pacing with natural language.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-sky-600 flex-shrink-0" />
                      <span>Instant code debugging and architecture trade-off reviews</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-sky-600 flex-shrink-0" />
                      <span>Can recalibrate your roadmap live on conversational command</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-sky-600 flex-shrink-0" />
                      <span>Simulates senior technical and system design whiteboard screens</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => onNavigateToTab("chat")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>Launch AI Advisor Chat</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="lg:col-span-6 bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3 text-xs shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 pb-2 border-b border-slate-200 font-mono">
                    <span>LIVE CONTEXT SESSION</span>
                    <span className="text-emerald-700 flex items-center gap-1 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ONLINE
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-lg text-slate-800 text-right ml-6 border border-slate-200 shadow-2xs">
                    "I only have 6 hours this week instead of 15. Can you prioritize the most essential RAG deliverables?"
                  </div>
                  <div className="p-3 bg-blue-50/90 rounded-lg text-blue-950 mr-6 border border-blue-200 space-y-1.5 shadow-2xs">
                    <div className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Aura (AI Advisor)</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-blue-900">
                      "I've recalibrated your roadmap: deferring multi-modal chunking to next week and prioritizing hybrid BM25 + dense embedding vector search for this week (6 hrs). Pacing updated!"
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === "export" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-mono font-bold uppercase border border-slate-200">
                    INTEROPERABILITY
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-950">
                    Export to Notion, Obsidian & GitHub
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    You own your roadmap. Export your structured learning path as clean Markdown checklists (with task checkboxes, resource links, and study hour estimates) or download the complete structured JSON payload.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-slate-900 flex-shrink-0" />
                      <span>One-click copy formatted Markdown with task checklists</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-slate-900 flex-shrink-0" />
                      <span>Download JSON payload for custom automated workflows</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-slate-900 flex-shrink-0" />
                      <span>Seamless import into Obsidian, Notion, Logseq, and GitHub Readmes</span>
                    </li>
                  </ul>
                  <button
                    onClick={onGetStarted}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>Generate & Export Path</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="lg:col-span-6 bg-slate-900 text-slate-200 p-5 rounded-xl border border-slate-800 font-mono text-[11px] space-y-2 shadow-2xs">
                  <div className="text-slate-500 pb-1 border-b border-slate-800 flex justify-between">
                    <span># roadmap-export.md</span>
                    <span className="text-emerald-400">READY</span>
                  </div>
                  <div className="text-blue-400 font-bold"># Learning Roadmap: Senior AI Engineer</div>
                  <div className="text-slate-400">**Total Hours:** 120 hrs • **Weekly Target:** 12 hrs/wk</div>
                  <div className="pt-1 text-slate-100 font-semibold">## Phase 1: Attention & Transformers</div>
                  <div className="text-emerald-400">- [x] 01: Scaled Dot-Product Attention (Verified)</div>
                  <div className="text-slate-300">- [ ] 02: Hybrid Vector Search & RAG</div>
                  <div className="text-slate-500 pl-4">  * [Stanford CS224N Lab](https://stanford.edu) (Free)</div>
                  <div className="text-slate-400">- [ ] 03: Multi-Agent Orchestration (Locked)</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. TRANSFORMATION MATRIX (BEFORE VS. AFTER) */}
      <section id="before-vs-after" className="py-20 bg-white border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase border border-slate-200">
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              Velocity Comparison
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Static Course Catalogs vs. AI Personalized Path Recommender
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Why generic playlists cause burnout and dropouts, and how a personalized adaptive path drives consistent goal achievement.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 bg-slate-900 text-white text-xs font-bold font-mono p-4 sm:px-6 divide-y md:divide-y-0 md:divide-x divide-slate-800">
              <div className="md:col-span-3">DIMENSION</div>
              <div className="md:col-span-4 md:pl-4 text-rose-300">TRADITIONAL WAY (GENERIC CATALOG)</div>
              <div className="md:col-span-5 md:pl-4 text-emerald-300">AURALEARN (PERSONALIZED RECOMMENDER)</div>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {[
                {
                  dim: "Curriculum Strategy",
                  old: "Jumping randomly between disjointed 40-hour courses and generic, one-size-fits-all playlists.",
                  aura: "Sequenced milestone roadmap matching your verified background, career aspirations, and preferred style.",
                },
                {
                  dim: "Skill Gap Visibility",
                  old: "Studying topics you already know while blind spots and prerequisite gaps go completely unnoticed.",
                  aura: "Exact skill gap calculations (e.g. 25% → 85%) mapped directly against target job role competencies.",
                },
                {
                  dim: "Proof of Competency",
                  old: "Passively watching videos at 2x speed without producing authentic case studies or projects.",
                  aura: "Practical milestone deliverables, case studies, and conceptual 3-question diagnostic assessments.",
                },
                {
                  dim: "Pacing & Adaptability",
                  old: "Miss one busy week at work, fall behind a rigid syllabus, and abandon the entire learning endeavor.",
                  aura: "One-click recalibration dynamically adjusts all downstream milestone deadlines to fit your schedule.",
                },
                {
                  dim: "Domain Flexibility",
                  old: "Locked to rigid single-topic courses with no cross-disciplinary skill bridging.",
                  aura: "Customizes paths across Tech, Product, AI, Design, Healthcare, Business, and Finance.",
                },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-12 p-4 sm:px-6 gap-2 md:gap-4 items-center">
                  <div className="md:col-span-3 font-bold text-slate-900">{row.dim}</div>
                  <div className="md:col-span-4 text-slate-600 flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                    <span>{row.old}</span>
                  </div>
                  <div className="md:col-span-5 text-slate-900 font-medium flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{row.aura}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. CAREER ARCHETYPES PRESET CATALOG */}
      <section id="archetypes" className="py-20 bg-slate-50/60 border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase border border-blue-200">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Curated Presets
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                High-Demand Career & Skill Paths
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Click any career preset across engineering, product, design, healthcare, data, or marketing to initialize a calibrated learning path.
              </p>
            </div>
            <button
              onClick={onGetStarted}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>Build Custom Role Path</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CAREER_PATH_PRESETS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset);
                  onNavigateToTab("roadmap");
                }}
                className="p-5 rounded-xl bg-white border border-slate-200/90 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4 shadow-2xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-mono">
                      {preset.category}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono font-medium">~{preset.estimatedWeeks} wks</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors leading-snug">
                    {preset.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{preset.tagline}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-600 group-hover:text-slate-900">
                    Initialize Path
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TRANSPARENT PRICING & TIERS */}
      <section id="pricing" className="py-20 bg-white border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase border border-slate-200">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              Transparent Pricing
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Invest in Accelerated Career Velocity
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Start free forever, or upgrade for unlimited AI recalibrations and 24/7 copilot assistance.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="pt-3 flex items-center justify-center gap-3">
              <span className={`text-xs font-semibold ${pricingCycle === "monthly" ? "text-slate-900" : "text-slate-500"}`}>
                Monthly
              </span>
              <button
                type="button"
                onClick={() => setPricingCycle(pricingCycle === "annual" ? "monthly" : "annual")}
                className="w-12 h-6 bg-slate-900 rounded-full p-1 transition-colors relative cursor-pointer"
                aria-label="Toggle annual pricing"
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    pricingCycle === "annual" ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
              <span className={`text-xs font-semibold flex items-center gap-1.5 ${pricingCycle === "annual" ? "text-slate-900" : "text-slate-500"}`}>
                <span>Annual</span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">
                  Save 20%
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Starter Free Tier */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-6 flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-950">Starter</h3>
                  <p className="text-xs text-slate-500 mt-1">For self-directed learners.</p>
                </div>
                <div className="text-3xl font-extrabold text-slate-950">
                  $0 <span className="text-xs text-slate-500 font-normal">/ forever</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Personalized Career Roadmap</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Baseline Skill Gap Diagnostics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Milestone Quizzes & Deliverables</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Markdown & JSON Roadmap Export</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onGetStarted}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-slate-200"
              >
                Start Free
              </button>
            </div>

            {/* Pro Architect Tier */}
            <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-6 flex flex-col justify-between relative shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-white">Pro Learner</h3>
                    <p className="text-xs text-slate-400 mt-1">For career pivots & skill acceleration.</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider font-mono">
                    Popular
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-white">
                  {pricingCycle === "annual" ? "$15" : "$19"}{" "}
                  <span className="text-xs text-slate-400 font-normal">/ month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span><strong>Everything in Starter</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span>Unlimited AI Path Recalibrations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span>24/7 Contextual AI Advisor (Aura)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span>AI Deep Dive & Failure Mode Generator</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span>Curated Free vs. Paid Resource Filtering</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onGetStarted}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Start 14-Day Free Pro Trial
              </button>
            </div>

            {/* Enterprise / Team Tier */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-6 flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-950">Team & Org</h3>
                  <p className="text-xs text-slate-500 mt-1">For managers, leads, and organizations.</p>
                </div>
                <div className="text-3xl font-extrabold text-slate-950">
                  $49 <span className="text-xs text-slate-500 font-normal">/ seat / mo</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Company-wide Skill Gap Matrix</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Custom Internal Competency Paths</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>LMS & Team Export Sync</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Dedicated Learning Success Manager</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onGetStarted}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-slate-200"
              >
                Contact Enterprise Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. COMPREHENSIVE FAQS */}
      <section id="faq" className="py-20 bg-slate-50/60 border-b border-slate-200 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase border border-blue-200">
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              Frequently Asked Questions
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Clear answers on our methodology, AI model engine, curriculum quality, and data security.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {["All", "General", "Compiler Engine", "Curriculum & Labs", "Enterprise & Access"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedFaqCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedFaqCategory === cat
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-200 shadow-2xs"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-3 pt-2">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isOpen
                      ? "bg-white border-blue-400 shadow-xs"
                      : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                      {faq.question}
                    </span>
                    <span
                      className={`p-1.5 rounded-lg text-slate-500 flex-shrink-0 transition-transform ${
                        isOpen ? "bg-blue-50 text-blue-700 rotate-180" : "bg-slate-100"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7.5 LEARNER FEEDBACK & TESTIMONIALS SECTION */}
      <section id="feedback" className="py-20 bg-white border-b border-slate-200 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase border border-amber-200">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              Community Ratings & Feedback
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Loved by Engineers, Architects & Learners
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
              Real feedback from learners using AuraLearn's AI curriculum compiler to accelerate their career transitions.
            </p>
          </div>

          {/* Featured Feedback Card Grid — Dynamically Rendered & Moderated */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {feedbackReviews.map((rev) => {
              const isRv = rev.name.toLowerCase().includes("riyanshi");
              const fullStars = Math.floor(rev.rating);
              const hasHalf = rev.rating % 1 !== 0;

              return (
                <div
                  key={rev.id}
                  className={`p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden transition-all ${
                    isRv
                      ? "bg-linear-to-b from-amber-50/50 via-white to-slate-50/50 border-2 border-amber-200/90 shadow-sm"
                      : "bg-white border border-slate-200 shadow-2xs hover:border-slate-300"
                  }`}
                >
                  {rev.isFeatured && (
                    <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                      Featured Review
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Rating Badge */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: fullStars }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                        {hasHalf && (
                          <div className="relative w-4 h-4">
                            <Star className="w-4 h-4 text-slate-200" />
                            <div className="absolute top-0 left-0 overflow-hidden w-[80%]">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="font-extrabold text-slate-900 text-sm font-mono">{rev.rating.toFixed(1)} / 5.0</span>
                    </div>

                    {/* Review Text */}
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>

                  {/* Author Profile */}
                  <div className={`pt-5 mt-4 border-t flex items-center gap-3 ${isRv ? "border-amber-100" : "border-slate-100"}`}>
                    <div
                      className={`w-10 h-10 rounded-full text-white font-bold text-sm flex items-center justify-center shadow-xs ${
                        isRv
                          ? "bg-linear-to-tr from-amber-500 to-indigo-600"
                          : "bg-slate-800"
                      }`}
                    >
                      {rev.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
                        {rev.name}
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </h4>
                      <p className="text-[11px] text-slate-500">{rev.roleTitle || "Verified Learner"}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Feedback Submission Form */}
          <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200">
            <form onSubmit={handleSubmitFeedback} className="max-w-2xl mx-auto space-y-5">
              <div className="text-center space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  Share Your Experience or Feedback
                </h3>
                <p className="text-xs text-slate-500">
                  Reviews are automatically quality-checked by our moderation engine before publishing.
                </p>
              </div>

              {feedbackMsg && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    feedbackMsg.type === "success"
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border border-rose-200 text-rose-800"
                  }`}
                >
                  {feedbackMsg.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  )}
                  <span>{feedbackMsg.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={feedbackName}
                    onChange={(e) => setFeedbackName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Score Rating</label>
                  <div className="relative">
                    <select
                      value={feedbackRating}
                      onChange={(e) => setFeedbackRating(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-48 overflow-y-auto cursor-pointer"
                    >
                      <optgroup label="🌟 Exceptional Tier (4.8 - 5.0)">
                        <option value="5.0">⭐⭐⭐⭐⭐ 5.0 / 5.0 — Exceptional Mastery</option>
                        <option value="4.9">⭐⭐⭐⭐⭐ 4.9 / 5.0 — Outstanding Accuracy</option>
                        <option value="4.8">⭐⭐⭐⭐⭐ 4.8 / 5.0 — Highly Recommended (Top Pick)</option>
                        <option value="4.7">⭐⭐⭐⭐⭐ 4.7 / 5.0 — Excellent Structure</option>
                      </optgroup>
                      <optgroup label="✨ Great Tier (4.0 - 4.6)">
                        <option value="4.6">⭐⭐⭐⭐ 4.6 / 5.0 — Very Strong Curriculum</option>
                        <option value="4.5">⭐⭐⭐⭐ 4.5 / 5.0 — Great Pacing & Projects</option>
                        <option value="4.4">⭐⭐⭐⭐ 4.4 / 5.0 — Solid Skill Diagnostic</option>
                        <option value="4.3">⭐⭐⭐⭐ 4.3 / 5.0 — Very Good Resources</option>
                        <option value="4.2">⭐⭐⭐⭐ 4.2 / 5.0 — Helpful AI Explanations</option>
                        <option value="4.0">⭐⭐⭐⭐ 4.0 / 5.0 — Good Learning Roadmap</option>
                      </optgroup>
                      <optgroup label="👍 Good Tier (3.0 - 3.9)">
                        <option value="3.8">⭐⭐⭐ 3.8 / 5.0 — Positive Experience</option>
                        <option value="3.5">⭐⭐⭐ 3.5 / 5.0 — Decent Recommendations</option>
                        <option value="3.0">⭐⭐⭐ 3.0 / 5.0 — Average Baseline</option>
                      </optgroup>
                      <optgroup label="💡 Improvement Tier (1.0 - 2.9)">
                        <option value="2.5">⭐⭐ 2.5 / 5.0 — Needs Additional Domains</option>
                        <option value="2.0">⭐⭐ 2.0 / 5.0 — Needs More Free Options</option>
                        <option value="1.0">⭐ 1.0 / 5.0 — Needs Revision</option>
                      </optgroup>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Feedback & Experience</label>
                <textarea
                  rows={3}
                  required
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="What goals are you pursuing? How has AuraLearn helped your learning journey?"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Protected by automated content moderation
                </span>
                <button
                  type="submit"
                  disabled={isSubmittingFeedback}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 8. FINAL CONVERSION BANNER */}
      <section id="final-cta" className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Ready to compile your personalized learning path?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-normal">
            Join thousands of software engineers, cloud architects, and data scientists accelerating their technical depth with AuraLearn.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Compile Your Roadmap — It's Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateToTab("chat")}
              className="w-full sm:w-auto px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Chat With AI Advisor
            </button>
            <button
              onClick={handleInstallClick}
              className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Install Web App</span>
            </button>
          </div>
        </div>
      </section>

      {/* 9. PRODUCT FOOTER */}
      <footer className="py-12 bg-white border-t border-slate-200 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="AuraLearn Logo"
              className="w-7 h-7 rounded-lg object-contain border border-slate-200 shadow-xs"
            />
            <span className="font-bold text-slate-900 tracking-tight">AuraLearn</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">AI-Powered Personalized Learning Path Recommender</span>
          </div>

          <div className="flex items-center gap-6 text-slate-600 font-medium">
            <button
              onClick={() => onNavigateToTab("roadmap")}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Roadmap
            </button>
            <button
              onClick={() => onNavigateToTab("dashboard")}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Skill Radar
            </button>
            <button
              onClick={() => onNavigateToTab("resources")}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Resources
            </button>
            <button
              onClick={() => onNavigateToTab("profile")}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Profile
            </button>
            <button
              onClick={handleInstallClick}
              className="text-blue-600 hover:text-blue-800 font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          </div>

          <div className="text-slate-400">
            © {new Date().getFullYear()} AuraLearn. All rights reserved.
          </div>
        </div>
      </footer>

      {/* PWA / Native App Installation Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl space-y-0">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-white">Install AuraLearn App</h3>
                  <p className="text-xs text-slate-400">Fast, offline-ready & instant desktop/mobile access</p>
                </div>
              </div>
              <button
                onClick={() => setShowInstallModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Platform Selection Tabs */}
            <div className="px-6 pt-5 pb-2 bg-slate-50 border-b border-slate-200 flex gap-2">
              <button
                onClick={() => setActiveInstallTab("desktop")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeInstallTab === "desktop"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Desktop (Chrome/Edge)</span>
              </button>

              <button
                onClick={() => setActiveInstallTab("ios")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeInstallTab === "ios"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>iOS (Safari)</span>
              </button>

              <button
                onClick={() => setActiveInstallTab("android")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeInstallTab === "android"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android</span>
              </button>
            </div>

            {/* Tab Instructions Content */}
            <div className="p-6 space-y-4">
              {activeInstallTab === "desktop" && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3.5 bg-blue-50/60 rounded-xl border border-blue-100">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="text-xs text-slate-700">
                      Look at your browser's address bar (top right) for the <strong>Install App icon (⊕ or 💻)</strong> or click browser settings.
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="text-xs text-slate-700">
                      Click <strong>"Install AuraLearn"</strong> to pin the full standalone window to your Dock or Taskbar.
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="text-xs text-slate-700">
                      Enjoy instant zero-latency launches with offline caching of your saved roadmaps and study notes.
                    </div>
                  </div>
                </div>
              )}

              {activeInstallTab === "ios" && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3.5 bg-blue-50/60 rounded-xl border border-blue-100">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="text-xs text-slate-700">
                      Open AuraLearn in <strong>Apple Safari</strong> on your iPhone or iPad.
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="text-xs text-slate-700">
                      Tap the <strong>Share button</strong> (the square with an upward arrow) in the Safari toolbar.
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="text-xs text-slate-700">
                      Scroll down and tap <strong>"Add to Home Screen"</strong>, then confirm by tapping <strong>Add</strong>.
                    </div>
                  </div>
                </div>
              )}

              {activeInstallTab === "android" && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3.5 bg-blue-50/60 rounded-xl border border-blue-100">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="text-xs text-slate-700">
                      Open AuraLearn in <strong>Chrome</strong> on your Android phone or tablet.
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="text-xs text-slate-700">
                      Tap the <strong>three dots menu (⋮)</strong> in the top right corner.
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="text-xs text-slate-700">
                      Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                    </div>
                  </div>
                </div>
              )}

              {/* Direct Prompt or Share URL bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                {canInstall && (
                  <button
                    onClick={() => {
                      pwaService.promptInstall();
                      setShowInstallModal(false);
                    }}
                    className="w-full sm:flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Trigger Direct Install Prompt</span>
                  </button>
                )}

                <button
                  onClick={handleCopyLink}
                  className="w-full sm:w-auto py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Copy App Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
