import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Clock,
  BookOpen,
  Award,
  Sparkles,
  AlertCircle,
  FileText,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Check,
  Code2,
  ListChecks,
  Compass,
  MessageSquare,
  Copy,
  RefreshCw,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Send,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  FileCode,
  Loader2,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";
import { RoadmapStep, LearningRoadmap } from "../types";
import { apiService, DeliverableReviewResult } from "../services/apiService";

interface MilestoneLearningViewProps {
  step: RoadmapStep;
  roadmap: LearningRoadmap | null;
  onBack: () => void;
  onSelectStep: (step: RoadmapStep) => void;
  onToggleComplete: (stepId: string) => void;
  onSaveNotes: (stepId: string, notes: string) => void;
  onQuizSubmit: (stepId: string, score: number, passed: boolean) => void;
  onAskAIAboutStep: (stepTitle: string) => void;
}

export const MilestoneLearningView: React.FC<MilestoneLearningViewProps> = ({
  step,
  roadmap,
  onBack,
  onSelectStep,
  onToggleComplete,
  onSaveNotes,
  onQuizSubmit,
  onAskAIAboutStep,
}) => {
  const [activeSection, setActiveSection] = useState<
    "overview" | "syllabus" | "deliverable" | "resources" | "quiz" | "deepdive" | "notes"
  >("overview");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [notes, setNotes] = useState(step.userNotes || "");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [deliverableChecklist, setDeliverableChecklist] = useState<Record<string, boolean>>({});
  const [deepDiveData, setDeepDiveData] = useState<any>(null);
  const [loadingDeepDive, setLoadingDeepDive] = useState(false);

  // --- AUDIO / VOICE NARRATION STATE ---
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // --- LIVE AI DELIVERABLE & CODE REVIEWER STATE ---
  const [submissionCode, setSubmissionCode] = useState<string>("");
  const [submissionNotes, setSubmissionNotes] = useState<string>("");
  const [programmingLanguage, setProgrammingLanguage] = useState<string>("TypeScript");
  const [reviewData, setReviewData] = useState<DeliverableReviewResult | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [copiedReviewSnippet, setCopiedReviewSnippet] = useState<number | null>(null);

  // Load available speech synthesis voices
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          setAvailableVoices(voices);
          // Prefer English natural voices
          const defaultIdx = voices.findIndex(
            (v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google"))
          );
          if (defaultIdx !== -1) setSelectedVoiceIndex(defaultIdx);
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Helper to generate starter boilerplate code based on selected programming language
  const generateStarterCode = (lang: string, currentStep: RoadmapStep): string => {
    const rawSkill = currentStep.skillsAcquired[0] || "Milestone";
    const cleanSkill = rawSkill.replace(/[^a-zA-Z0-9]/g, "");
    const serviceName = (cleanSkill || "Milestone") + "Service";
    const tableName = "milestone_" + (currentStep.id || "001").replace(/[^a-zA-Z0-9]/g, "_") + "_logs";
    const skillsList = currentStep.skillsAcquired.join(", ");

    switch (lang) {
      case "Python":
        return `# Milestone Implementation: ${currentStep.deliverable}
# Target Skills: ${skillsList}

import time
from typing import Dict, Any, Optional

class ${serviceName}:
    """
    Implementation for: ${currentStep.title}
    Deliverable: ${currentStep.deliverable}
    """
    def __init__(self, milestone_id: str = "${currentStep.id}", enable_telemetry: bool = True):
        self.milestone_id = milestone_id
        self.enable_telemetry = enable_telemetry
        self.is_initialized = False

    def initialize(self) -> None:
        """Setup connections, schemas, or memory buffers."""
        self.is_initialized = True
        print(f"[${serviceName}] Initialized successfully for milestone {self.milestone_id}.")

    def execute_pipeline(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Execute core deliverable pipeline logic."""
        if not self.is_initialized:
            raise RuntimeError("Service not initialized. Call initialize() first.")
        
        # =========================================================
        # WRITE YOUR CODE HERE...
        # Implement your core milestone deliverable logic below:
        # =========================================================
        
        processed_result = {
            "status": "completed",
            "input_received": payload,
            "deliverable_spec": "${currentStep.deliverable.replace(/"/g, '\\"')}"
        }

        return {
            "success": True,
            "milestone_id": self.milestone_id,
            "processed_at": time.time(),
            "result": processed_result
        }

if __name__ == "__main__":
    service = ${serviceName}()
    service.initialize()
    output = service.execute_pipeline({"test_mode": True})
    print("Pipeline Execution Result:", output)
`;

      case "JavaScript":
        return `// Milestone Implementation: ${currentStep.deliverable}
// Target Skills: ${skillsList}

class ${serviceName} {
  constructor(config = {}) {
    this.milestoneId = config.milestoneId || "${currentStep.id}";
    this.enableTelemetry = config.enableTelemetry ?? true;
    this.isInitialized = false;
  }

  async initialize() {
    // Setup connections, schemas, or memory buffers
    this.isInitialized = true;
    console.log(\`[\${this.constructor.name}] Initialized successfully for milestone \${this.milestoneId}.\`);
  }

  async executePipeline(payload = {}) {
    if (!this.isInitialized) {
      throw new Error("Service not initialized. Call initialize() first.");
    }
    
    // =========================================================
    // WRITE YOUR CODE HERE...
    // Implement your core milestone deliverable logic below:
    // =========================================================

    const processedResult = {
      status: "completed",
      inputReceived: payload,
      deliverableSpec: "${currentStep.deliverable.replace(/"/g, '\\"')}"
    };

    return {
      success: true,
      milestoneId: this.milestoneId,
      result: processedResult,
      processedAt: Date.now()
    };
  }
}

module.exports = { ${serviceName} };
`;

      case "SQL":
        return `-- Milestone Implementation: ${currentStep.deliverable}
-- Target Skills: ${skillsList}

-- 1. Schema setup & Table creation
CREATE TABLE IF NOT EXISTS ${tableName} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- WRITE YOUR CODE HERE...
-- Implement your core SQL queries & analytical logic below:
-- =========================================================

WITH aggregated_metrics AS (
  SELECT 
    event_type,
    COUNT(*) AS total_events,
    MAX(created_at) AS last_seen
  FROM ${tableName}
  WHERE created_at >= NOW() - INTERVAL '7 days'
  GROUP BY event_type
)
SELECT 
  event_type,
  total_events,
  last_seen,
  ROUND(total_events * 100.0 / NULLIF(SUM(total_events) OVER (), 0), 2) AS percentage
FROM aggregated_metrics
ORDER BY total_events DESC;
`;

      case "Rust":
        return `// Milestone Implementation: ${currentStep.deliverable}
// Target Skills: ${skillsList}

use std::collections::HashMap;

pub struct ${serviceName}Config {
    pub milestone_id: String,
    pub enable_telemetry: bool,
    pub timeout_ms: u64,
}

pub struct ${serviceName} {
    config: ${serviceName}Config,
    is_initialized: bool,
}

impl ${serviceName} {
    pub fn new(config: ${serviceName}Config) -> Self {
        Self {
            config,
            is_initialized: false,
        }
    }

    pub fn initialize(&mut self) -> Result<(), String> {
        // Setup state & buffers
        self.is_initialized = true;
        println!("[${serviceName}] Initialized successfully for milestone {}", self.config.milestone_id);
        Ok(())
    }

    pub fn execute_pipeline(&self, payload: &HashMap<String, String>) -> Result<String, String> {
        if !self.is_initialized {
            return Err("Service not initialized. Call initialize() first.".to_string());
        }
        
        // =========================================================
        // WRITE YOUR CODE HERE...
        // Implement your core milestone deliverable logic below:
        // =========================================================

        Ok(format!("Execution completed successfully for payload keys: {}", payload.len()))
    }
}

fn main() {
    let config = ${serviceName}Config {
        milestone_id: "${currentStep.id}".to_string(),
        enable_telemetry: true,
        timeout_ms: 5000,
    };
    let mut service = ${serviceName}::new(config);
    let _ = service.initialize();
}
`;

      case "Go":
        return `// Milestone Implementation: ${currentStep.deliverable}
// Target Skills: ${skillsList}

package main

import (
	"fmt"
	"time"
)

type ${serviceName}Config struct {
	MilestoneID     string
	EnableTelemetry bool
	TimeoutMS       int
}

type ${serviceName} struct {
	config        ${serviceName}Config
	isInitialized bool
}

func New${serviceName}(cfg ${serviceName}Config) *${serviceName} {
	return &${serviceName}{
		config:        cfg,
		isInitialized: false,
	}
}

func (s *${serviceName}) Initialize() error {
	s.isInitialized = true
	fmt.Printf("[${serviceName}] Initialized for milestone: %s\\n", s.config.MilestoneID)
	return nil
}

func (s *${serviceName}) ExecutePipeline(payload map[string]interface{}) (map[string]interface{}, error) {
	if !s.isInitialized {
		return nil, fmt.Errorf("service not initialized")
	}
	
	// =========================================================
	// WRITE YOUR CODE HERE...
	// Implement your core milestone deliverable logic below:
	// =========================================================

	return map[string]interface{}{
		"success":     true,
		"milestoneId": s.config.MilestoneID,
		"processedAt": time.Now().Unix(),
		"inputPayload": payload,
	}, nil
}

func main() {
	cfg := ${serviceName}Config{
		MilestoneID:     "${currentStep.id}",
		EnableTelemetry: true,
		TimeoutMS:       5000,
	}
	svc := New${serviceName}(cfg)
	_ = svc.Initialize()
}
`;

      case "Markdown / Architecture RFC":
        return `# Architecture RFC: ${currentStep.title}
**Deliverable Spec**: ${currentStep.deliverable}
**Target Skills**: ${skillsList}

## 1. Executive Summary
Provide a high-level technical summary of the proposed solution and core architectural goals.

## 2. Component Architecture & System Boundaries
\`\`\`
[ Client / API Gateway ]
          │
          ▼
[ ${currentStep.skillsAcquired[0] || "Core"} Service ] ──▶ [ Database / Distributed Cache ]
\`\`\`

<!-- ========================================================= -->
<!-- WRITE YOUR ARCHITECTURE SPECIFICATION & RFC HERE...       -->
<!-- ========================================================= -->

## 3. Key Design Decisions & Technical Trade-offs
- **Throughput & Scalability**: Asynchronous non-blocking architecture.
- **Reliability & Resilience**: Fallback circuit breakers and retry exponential backoff.
- **Security & Compliance**: Zero-trust boundary schema validation.

## 4. Implementation & Validation Plan
1. Define schema & contract interfaces.
2. Implement service business logic.
3. Validate through automated integration testing and benchmark stress tests.
`;

      case "TypeScript":
      default:
        return `// Milestone Implementation: ${currentStep.deliverable}
// Target Skills: ${skillsList}

export interface MilestoneConfig {
  milestoneId: string;
  enableTelemetry: boolean;
  timeoutMs: number;
}

export class ${serviceName} {
  private isInitialized = false;

  constructor(private config: MilestoneConfig) {}

  public async initialize(): Promise<void> {
    // Setup connections, schemas, or memory buffers
    this.isInitialized = true;
  }

  public async executePipeline(payload: Record<string, unknown>): Promise<{ success: boolean; result: unknown }> {
    if (!this.isInitialized) {
      throw new Error("Service not initialized. Call initialize() first.");
    }
    
    // =========================================================
    // WRITE YOUR CODE HERE...
    // Implement your core milestone deliverable logic below:
    // =========================================================

    return {
      success: true,
      result: { status: "ready", processedAt: Date.now(), payload }
    };
  }
}
`;
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setProgrammingLanguage(newLang);
    setSubmissionCode(generateStarterCode(newLang, step));
  };

  const handleResetCodeTemplate = () => {
    setSubmissionCode(generateStarterCode(programmingLanguage, step));
  };

  // Sync state when step changes
  useEffect(() => {
    setNotes(step.userNotes || "");
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setCopiedIndex(null);
    setReviewData(null);
    setSubmissionNotes("");
    
    // Generate default boilerplate code for this step's deliverable based on selected language
    setSubmissionCode(generateStarterCode(programmingLanguage, step));

    // Stop ongoing speech when switching milestones
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsSpeechPaused(false);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step.id]);

  // Keyboard shortcut: Esc to go back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onBack]);

  const allSteps = roadmap?.steps || [];
  const currentIndex = allSteps.findIndex((s) => s.id === step.id);
  const prevStep = currentIndex > 0 ? allSteps[currentIndex - 1] : null;
  const nextStep = currentIndex >= 0 && currentIndex < allSteps.length - 1 ? allSteps[currentIndex + 1] : null;
  const isCompleted = step.status === "completed";

  // --- SPEECH / AUDIO NARRATION HANDLERS ---
  const handleToggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser environment.");
      return;
    }

    if (isSpeaking && !isSpeechPaused) {
      window.speechSynthesis.pause();
      setIsSpeechPaused(true);
      return;
    }

    if (isSpeaking && isSpeechPaused) {
      window.speechSynthesis.resume();
      setIsSpeechPaused(false);
      return;
    }

    // Build comprehensive narration script
    window.speechSynthesis.cancel();
    const narrationScript = [
      `Milestone: ${step.title}.`,
      `Phase: ${step.phaseName}.`,
      `Estimated study commitment is ${step.estimatedHours} hours.`,
      `Summary: ${step.shortSummary}`,
      `Key architectural objectives: ${step.detailedDescription}`,
      `Target portfolio deliverable: ${step.deliverable}.`,
      `Verified skills acquired: ${step.skillsAcquired.join(", ")}.`,
      `Pedagogical recommendation: ${step.aiWhyRecommended || step.reasoning || ""}`,
    ].join(" ");

    const utterance = new SpeechSynthesisUtterance(narrationScript);
    utterance.rate = speechRate;
    if (availableVoices[selectedVoiceIndex]) {
      utterance.voice = availableVoices[selectedVoiceIndex];
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsSpeechPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsSpeechPaused(false);
    };

    utterance.onerror = (e) => {
      console.warn("[SpeechSynthesis] error:", e);
      setIsSpeaking(false);
      setIsSpeechPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeech = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsSpeechPaused(false);
    }
  };

  const handleRateChange = (newRate: number) => {
    setSpeechRate(newRate);
    if (isSpeaking) {
      handleStopSpeech();
      setTimeout(handleToggleSpeech, 100);
    }
  };

  // --- LIVE AI CODE REVIEW HANDLER ---
  const handleReviewDeliverable = async () => {
    if (!submissionCode.trim()) {
      alert("Please paste or write your deliverable code before submitting for review.");
      return;
    }

    setIsReviewing(true);
    try {
      const res = await apiService.reviewDeliverable({
        stepTitle: step.title,
        deliverableSpec: step.deliverable,
        skillsAcquired: step.skillsAcquired,
        submissionCode,
        submissionNotes,
        programmingLanguage,
        userLevel: "Intermediate",
      });

      if (res.success && res.review) {
        setReviewData(res.review);
        if (res.review.status === "passed" || res.review.status === "exceptional") {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }
    } catch (err) {
      console.error("[MilestoneLearningView] Review error:", err);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleAnswerSelect = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleEvaluateQuiz = () => {
    const questions = step.assessment?.questions || [];
    if (questions.length === 0) return;

    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const scorePct = Math.round((correctCount / questions.length) * 100);
    const passed = scorePct >= 66;

    setQuizSubmitted(true);
    onQuizSubmit(step.id, scorePct, passed);

    if (passed) {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const fetchAIDeepDive = async () => {
    if (deepDiveData) return;
    setLoadingDeepDive(true);
    try {
      const data = await apiService.generateStepDeepdive(step.title, step.skillsAcquired);
      if (data.deepdive) {
        setDeepDiveData(data.deepdive);
      }
    } catch (e) {
      console.error("[MilestoneLearningView] Deep dive fetch error:", e);
    } finally {
      setLoadingDeepDive(false);
    }
  };

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleChecklistItem = (key: string) => {
    setDeliverableChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const syllabusTopics = step.skillsAcquired.map((skill, index) => ({
    id: `topic-${index}`,
    title: skill,
    summary: `Foundational and production principles of ${skill} in modern software engineering and AI architectures.`,
    objectives: [
      `Understand key architectural primitives and mental models for ${skill}`,
      `Apply ${skill} within client-server workflows and distributed pipelines`,
      `Avoid common antipatterns and security/latency bottlenecks`,
    ],
    codeSnippet: `// Production Blueprint: ${skill}
import { GoogleGenAI } from "@google/genai";

export async function execute${skill.replace(/[^a-zA-Z0-9]/g, "")}Service(payload: unknown) {
  // Production safe execution with runtime validation
  if (!payload) throw new Error("Payload required");
  return { status: "processed", competency: "${skill}" };
}`,
  }));

  const deliverableItems = [
    { id: "deliv-1", label: `Architect the core data schema and API boundaries for ${step.deliverable.slice(0, 45)}...` },
    { id: "deliv-2", label: `Implement robust error boundaries, retries, and rate limiting.` },
    { id: "deliv-3", label: `Write automated integration assertions verifying core happy & failure paths.` },
    { id: "deliv-4", label: `Document deployment instructions, memory tradeoffs, and latency benchmarks.` },
  ];

  return (
    <div className="w-full bg-slate-50/50 min-h-screen pb-16">
      {/* Top Fixed Breadcrumb & Action Bar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Roadmap</span>
            </button>

            <span className="text-slate-300">/</span>

            <div className="truncate">
              <span className="text-xs text-slate-600 font-semibold uppercase tracking-wider hidden md:inline">
                Phase {step.phaseIndex}: {step.phaseName} •
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                {step.title}
              </h2>
            </div>
          </div>

          {/* Quick Audio & Complete Bar */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Quick Audio Trigger */}
            <button
              onClick={handleToggleSpeech}
              title={isSpeaking ? (isSpeechPaused ? "Resume Audio" : "Pause Audio") : "Listen to Milestone Syllabus"}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                isSpeaking
                  ? "bg-amber-50 text-amber-800 border-amber-300 animate-pulse"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {isSpeaking ? (
                isSpeechPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden sm:inline">Resume</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden sm:inline">Pause</span>
                  </>
                )
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Listen</span>
                </>
              )}
            </button>

            {isSpeaking && (
              <button
                onClick={handleStopSpeech}
                title="Stop Audio"
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs transition-colors cursor-pointer"
              >
                <Square className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => onToggleComplete(step.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                isCompleted
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isCompleted ? "Verified Complete ✓" : "Mark Complete"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Milestone Display Hero */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
                  {step.phaseName}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold bg-slate-100 px-2.5 py-1 rounded-md">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {step.estimatedHours} Hours Required
                </span>
                {isCompleted && (
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Milestone Verified
                  </span>
                )}
                {step.prerequisites && step.prerequisites.length > 0 && (
                  <span className="text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                    Prereqs: {step.prerequisites.join(", ")}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {step.title}
              </h1>

              <p className="text-base text-slate-600 leading-relaxed">
                {step.shortSummary}
              </p>
            </div>

            {/* AI Advisor Jump Box */}
            <div className="bg-blue-50/70 border border-blue-100 p-5 rounded-2xl min-w-[260px] space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-blue-600" />
                AI Explainability Rationale
              </div>
              <p className="text-xs text-blue-950 leading-relaxed font-medium">
                {step.reasoning || step.aiWhyRecommended}
              </p>
              <button
                onClick={() => onAskAIAboutStep(step.title)}
                className="w-full mt-2 py-2 px-3 bg-white hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask AI Tutor About This</span>
              </button>
            </div>
          </div>

          {/* Quick Audio Narration Player Bar & Live Closed Captions */}
          <div className="space-y-2">
            <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg bg-blue-600/30 border border-blue-400/40 text-blue-400 flex items-center justify-center ${isSpeaking && !isSpeechPaused ? "animate-pulse" : ""}`}>
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-2">
                    <span>Audio & Voice Narration Engine</span>
                    {isSpeaking && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {isSpeechPaused ? "PAUSED" : "PLAYING"}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Synthesizes milestone objectives, architecture concepts, and deliverable specs into spoken audio.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Play / Pause */}
                <button
                  onClick={handleToggleSpeech}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {isSpeaking && !isSpeechPaused ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>{isSpeechPaused ? "Resume Narration" : "Play Narration"}</span>
                    </>
                  )}
                </button>

                {isSpeaking && (
                  <button
                    onClick={handleStopSpeech}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Speed controls */}
                <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                  {[0.75, 1, 1.25, 1.5].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleRateChange(rate)}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors cursor-pointer ${
                        speechRate === rate ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Subtitles / Spoken Transcript Display */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                <span className="flex items-center gap-1 text-blue-400">
                  <Volume2 className="w-3 h-3 text-blue-400" />
                  Spoken Narration Transcript (Closed Captions)
                </span>
                <span className="text-slate-500">Live Speech Text</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-850 select-text">
                "Milestone: {step.title}. Phase: {step.phaseName}. Estimated study commitment is {step.estimatedHours} hours. Summary: {step.shortSummary}. Key architectural objectives: {step.detailedDescription}. Target portfolio deliverable: {step.deliverable}. Verified skills acquired: {step.skillsAcquired.join(", ")}. Pedagogical recommendation: {step.aiWhyRecommended || step.reasoning || ""}."
              </p>
            </div>
          </div>

          {/* Quick Stats & Skills Strip */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
                Target Competencies:
              </span>
              {step.skillsAcquired.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-3">
              <span>{step.resources?.length || 0} Curated Resources</span>
              <span>•</span>
              <span>{step.assessment?.questions?.length || 0} Diagnostic Questions</span>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="sticky top-[65px] z-10 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-1.5 shadow-xs overflow-x-auto flex gap-1">
          <button
            onClick={() => setActiveSection("overview")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeSection === "overview"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Overview & Objectives</span>
          </button>

          <button
            onClick={() => setActiveSection("syllabus")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeSection === "syllabus"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Interactive Syllabus ({syllabusTopics.length} Modules)</span>
          </button>

          <button
            onClick={() => setActiveSection("deliverable")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeSection === "deliverable"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>Live AI Code Reviewer</span>
          </button>

          <button
            onClick={() => setActiveSection("resources")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeSection === "resources"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            <span>Curated Resources ({step.resources?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveSection("quiz")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeSection === "quiz"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Milestone Quiz {step.assessment?.passed && "✓"}</span>
          </button>

          <button
            onClick={() => {
              setActiveSection("deepdive");
              fetchAIDeepDive();
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeSection === "deepdive"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI Deep Dive & Pitfalls</span>
          </button>

          <button
            onClick={() => setActiveSection("notes")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeSection === "notes"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Study Notes</span>
          </button>
        </div>

        {/* Dynamic Section Contents */}
        <div className="space-y-8">
          {/* SECTION 1: OVERVIEW & OBJECTIVES */}
          {activeSection === "overview" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-blue-600" />
                  Milestone Objectives & Architecture
                </h3>
                <p className="text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                  {step.detailedDescription}
                </p>
              </div>

              {/* Deliverable Spotlight */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    Target Portfolio Artifact
                  </h3>
                  <button
                    onClick={() => setActiveSection("deliverable")}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Code Reviewer</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
                  <div className="text-sm font-bold text-amber-950">{step.deliverable}</div>
                  <div className="text-xs text-amber-800">
                    Constructing this artifact verifies hands-on mastery of {step.skillsAcquired.join(", ")}.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: INTERACTIVE SYLLABUS */}
          {activeSection === "syllabus" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-2">
                <h2 className="text-xl font-bold text-slate-900">Structured Milestone Syllabus</h2>
                <p className="text-sm text-slate-600">
                  Comprehensive architectural deep-dives, code blueprints, and mental models for this milestone.
                </p>
              </div>

              <div className="space-y-6">
                {syllabusTopics.map((topic, idx) => (
                  <div
                    key={topic.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                          Module {idx + 1}
                        </span>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900">{topic.title}</h3>
                        <p className="text-sm text-slate-600">{topic.summary}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Core Pedagogical Concepts:
                      </h4>
                      <ul className="space-y-2">
                        {topic.objectives.map((obj, oi) => (
                          <li key={oi} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Code2 className="w-4 h-4 text-slate-500" />
                          Production Implementation Template
                        </span>
                        <button
                          onClick={() => handleCopyCode(topic.codeSnippet, idx)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto text-xs font-mono text-slate-100 shadow-inner">
                        <pre>{topic.codeSnippet}</pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: LIVE AI DELIVERABLE & CODE REVIEWER */}
          {activeSection === "deliverable" && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="px-2.5 py-1 rounded text-xs font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                      Live AI Deliverable Reviewer
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
                      {step.deliverable}
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                      Submit your source code or project architecture to receive instant AI evaluation against real-world engineering standards.
                    </p>
                  </div>
                </div>

                {/* Milestone Checklist */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Specification Checklist:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {deliverableItems.map((item) => {
                      const isChecked = Boolean(deliverableChecklist[item.id]);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleChecklistItem(item.id)}
                          className={`p-3 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer select-none ${
                            isChecked
                              ? "bg-emerald-50/60 border-emerald-300 text-emerald-950"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                              isChecked
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "bg-white border-slate-300"
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3" />}
                          </div>
                          <span className={`text-xs font-medium ${isChecked ? "line-through text-slate-500" : ""}`}>
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Code Submission Editor Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-slate-900 text-base">Code Submission Workbench</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Language selector */}
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                      <span>Language:</span>
                      <select
                        value={programmingLanguage}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="TypeScript">TypeScript</option>
                        <option value="Python">Python</option>
                        <option value="JavaScript">JavaScript</option>
                        <option value="SQL">SQL</option>
                        <option value="Rust">Rust</option>
                        <option value="Go">Go</option>
                        <option value="Markdown / Architecture RFC">Architecture RFC</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleResetCodeTemplate}
                        title="Reset code template for selected language"
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Textarea */}
                <div className="space-y-2">
                  <div className="relative">
                    <textarea
                      rows={14}
                      value={submissionCode}
                      onChange={(e) => setSubmissionCode(e.target.value)}
                      placeholder="// Paste your milestone code implementation here..."
                      className="w-full p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed shadow-inner"
                    />
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Learner Design Notes / GitHub Repo Link (Optional):
                  </label>
                  <input
                    type="text"
                    value={submissionNotes}
                    onChange={(e) => setSubmissionNotes(e.target.value)}
                    placeholder="e.g. GitHub repo link, trade-offs made, benchmarks observed..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500">
                    Evaluates functionality, security, design patterns, and edge case resilience.
                  </span>

                  <button
                    onClick={handleReviewDeliverable}
                    disabled={isReviewing}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    {isReviewing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>AI Reviewing Code...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Submit for AI Code Review</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* REVIEW RESULT CARD */}
              {reviewData && (
                <div className="bg-white rounded-2xl border border-blue-200 p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in zoom-in-95 duration-200">
                  {/* Top Score Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                            reviewData.status === "exceptional"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : reviewData.status === "passed"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          }`}
                        >
                          {reviewData.status === "exceptional"
                            ? "⭐ Exceptional Mastery"
                            : reviewData.status === "passed"
                            ? "✓ Verified & Passed"
                            : "⚠️ Revision Recommended"}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1">
                        {reviewData.verdictText}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                        {reviewData.summary}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center bg-slate-800/80 border border-slate-700 px-5 py-3 rounded-xl">
                        <div className="text-3xl font-extrabold text-white">
                          {reviewData.score}
                          <span className="text-xs text-slate-400 font-normal">/100</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          Rubric Score
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4-Pillar Rubric Breakdown */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Evaluation Rubric Breakdown:
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                        <div className="text-xs font-medium text-slate-500">Functionality</div>
                        <div className="text-lg font-bold text-slate-900">
                          {reviewData.rubricScores.functionality}%
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${reviewData.rubricScores.functionality}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                        <div className="text-xs font-medium text-slate-500">Cleanliness</div>
                        <div className="text-lg font-bold text-slate-900">
                          {reviewData.rubricScores.cleanliness}%
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full"
                            style={{ width: `${reviewData.rubricScores.cleanliness}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                        <div className="text-xs font-medium text-slate-500">Architecture</div>
                        <div className="text-lg font-bold text-slate-900">
                          {reviewData.rubricScores.architecture}%
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-purple-600 h-full rounded-full"
                            style={{ width: `${reviewData.rubricScores.architecture}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                        <div className="text-xs font-medium text-slate-500">Security</div>
                        <div className="text-lg font-bold text-slate-900">
                          {reviewData.rubricScores.security}%
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-amber-600 h-full rounded-full"
                            style={{ width: `${reviewData.rubricScores.security}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Strengths & Improvements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="p-5 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Demonstrated Strengths
                      </h4>
                      <ul className="space-y-2">
                        {reviewData.strengths.map((str, i) => (
                          <li key={i} className="text-xs text-emerald-900 flex items-start gap-2">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Security & Edge Cases */}
                    <div className="p-5 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-600" />
                        Security & Edge Cases to Handle
                      </h4>
                      <ul className="space-y-2">
                        {reviewData.securityAndEdgeCases.map((sec, i) => (
                          <li key={i} className="text-xs text-amber-900 flex items-start gap-2">
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{sec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actionable Refactoring Improvements */}
                  {reviewData.improvements.length > 0 && (
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Architectural Recommendations & Suggested Diffs:
                      </h4>
                      <div className="space-y-3">
                        {reviewData.improvements.map((imp, idx) => (
                          <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                            <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                                {idx + 1}
                              </span>
                              <span>{imp.title}</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed pl-7">
                              {imp.description}
                            </p>
                            {imp.suggestedDiffOrSnippet && (
                              <div className="pl-7 pt-1">
                                <div className="bg-slate-900 rounded-lg p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto">
                                  <pre>{imp.suggestedDiffOrSnippet}</pre>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Approve Milestone Button */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                    <div className="text-xs text-slate-700 font-medium">
                      Satisfied with the AI review? Mark this milestone verified to advance your overall completion score and certificate.
                    </div>

                    <button
                      onClick={() => onToggleComplete(step.id)}
                      className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                        isCompleted
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>{isCompleted ? "Verified Complete ✓" : "Mark Milestone Complete"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 4: CURATED RESOURCES */}
          {activeSection === "resources" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Curated Learning Resources</h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Hand-picked tutorials, documentation, interactive labs, and papers tailored to this milestone.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                  {step.resources?.length || 0} Recommended Assets
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {step.resources?.map((res, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-900 text-white">
                          {res.provider}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                            {res.type}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {res.cost}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-snug">{res.title}</h3>

                      <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100 leading-relaxed">
                        <strong className="text-blue-900">Why Selected: </strong>
                        {res.aiRecommendationRationale}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {res.skillsCovered.map((sc, sci) => (
                          <span
                            key={sci}
                            className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-medium"
                          >
                            {sc}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {res.duration}
                      </span>
                      <a
                        href={res.url || "https://google.com"}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
                      >
                        <span>Open Resource</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: MILESTONE QUIZ */}
          {activeSection === "quiz" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{step.assessment?.title || "Milestone Diagnostic Quiz"}</h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Pass this conceptual quiz to verify your retention, close knowledge gaps, and unlock the next milestone.
                  </p>
                </div>
                {step.assessment?.passed && (
                  <div className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Passed with {step.assessment.score}% Score</span>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {step.assessment?.questions?.map((q, qIdx) => {
                  const isAnswered = selectedAnswers[qIdx] !== undefined;
                  const isCorrect = isAnswered && selectedAnswers[qIdx] === q.correctIndex;

                  return (
                    <div
                      key={qIdx}
                      className={`bg-white rounded-2xl p-6 border transition-all shadow-xs ${
                        quizSubmitted
                          ? isCorrect
                            ? "border-emerald-300 bg-emerald-50/30"
                            : "border-rose-300 bg-rose-50/30"
                          : "border-slate-200"
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Question {qIdx + 1}
                          </span>
                          {quizSubmitted && (
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded ${
                                isCorrect
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {isCorrect ? "Correct ✓" : "Incorrect ✗"}
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-slate-900 text-base leading-snug">{q.question}</h3>

                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = selectedAnswers[qIdx] === optIdx;
                            const isTargetCorrect = q.correctIndex === optIdx;

                            let optClasses =
                              "p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center gap-3 cursor-pointer ";
                            if (quizSubmitted) {
                              if (isTargetCorrect) {
                                optClasses += "bg-emerald-100 border-emerald-400 text-emerald-950 font-bold";
                              } else if (isSelected) {
                                optClasses += "bg-rose-100 border-rose-400 text-rose-950 line-through";
                              } else {
                                optClasses += "bg-slate-50 border-slate-200 text-slate-400";
                              }
                            } else {
                              if (isSelected) {
                                optClasses += "bg-blue-50 border-blue-500 text-blue-900 shadow-2xs font-semibold";
                              } else {
                                optClasses += "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100";
                              }
                            }

                            return (
                              <div
                                key={optIdx}
                                onClick={() => handleAnswerSelect(qIdx, optIdx)}
                                className={optClasses}
                              >
                                <div
                                  className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                                    isSelected
                                      ? "bg-blue-600 border-blue-600 text-white"
                                      : "border-slate-300 text-slate-500"
                                  }`}
                                >
                                  {String.fromCharCode(65 + optIdx)}
                                </div>
                                <span>{opt}</span>
                              </div>
                            );
                          })}
                        </div>

                        {quizSubmitted && (
                          <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-950 space-y-1">
                            <strong>Explanation: </strong>
                            <span>{q.explanation}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Submit Quiz Action */}
              <div className="flex justify-end pt-4">
                {!quizSubmitted ? (
                  <button
                    onClick={handleEvaluateQuiz}
                    disabled={Object.keys(selectedAnswers).length === 0}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Submit Quiz Answers
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setQuizSubmitted(false);
                      setSelectedAnswers({});
                    }}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Retake Quiz
                  </button>
                )}
              </div>
            </div>
          )}

          {/* SECTION 6: AI DEEP DIVE & PITFALLS */}
          {activeSection === "deepdive" && (
            <div className="space-y-6">
              {loadingDeepDive ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-bold text-slate-800">Synthesizing Architectural Deep Dive...</p>
                  <p className="text-xs text-slate-500">Extracting failure modes and interview flashcards with Gemini.</p>
                </div>
              ) : deepDiveData ? (
                <div className="space-y-6">
                  {/* Takeaways */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
                    <h3 className="font-bold text-slate-900 text-base uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      Executive Architectural Takeaways
                    </h3>
                    <ul className="space-y-2.5">
                      {deepDiveData.keyTakeaways?.map((kt: string, i: number) => (
                        <li key={i} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{kt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Production Pitfalls */}
                  <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 sm:p-8 space-y-3 shadow-xs">
                    <h3 className="font-bold text-amber-950 text-base uppercase tracking-wider flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      Production Pitfalls & Rookie Mistakes to Avoid
                    </h3>
                    <ul className="list-disc list-inside text-xs sm:text-sm text-amber-950 space-y-1.5 font-medium leading-relaxed">
                      {deepDiveData.productionPitfalls?.map((pf: string, i: number) => (
                        <li key={i}>{pf}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Interview Q&As */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
                    <h3 className="font-bold text-slate-900 text-base uppercase tracking-wider">
                      Technical Interview & Architecture Questions
                    </h3>
                    <div className="space-y-3">
                      {deepDiveData.interviewQuestions?.map((iq: any, i: number) => (
                        <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <div className="font-bold text-slate-900 text-xs sm:text-sm">Q: {iq.question}</div>
                          <div className="text-xs sm:text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                            <strong className="text-blue-600">Model Answer: </strong>
                            {iq.answer}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Generate AI Mental Models & Deep Dive</h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                    Extract advanced architectural pitfalls, interview flashcards, and mental models synthesized for this exact milestone.
                  </p>
                  <button
                    onClick={fetchAIDeepDive}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
                  >
                    Generate Deep Dive Analysis
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SECTION 7: STUDY NOTES */}
          {activeSection === "notes" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Personal Milestone Notes & Scratchpad</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Auto-saved directly to your learning profile.</p>
                </div>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Saved
                </span>
              </div>

              <textarea
                rows={12}
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  onSaveNotes(step.id, e.target.value);
                }}
                placeholder="Document your architecture decisions, code snippets, GitHub PR links, or questions to ask the AI Tutor..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 leading-relaxed"
              />
            </div>
          )}
        </div>

        {/* Bottom Milestone Navigation Bar */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Roadmap</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {prevStep && (
              <button
                onClick={() => onSelectStep(prevStep)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
            )}

            {nextStep && (
              <button
                onClick={() => onSelectStep(nextStep)}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Next Milestone</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
