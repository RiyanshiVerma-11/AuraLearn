import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  Lock,
  PlayCircle,
  ExternalLink,
  BookOpen,
  HelpCircle,
  Sparkles,
  Award,
  ChevronRight,
  AlertCircle,
  FileText,
  Clock,
  Layers,
  ArrowRight,
  Send,
} from "lucide-react";
import confetti from "canvas-confetti";
import { RoadmapStep, LearningResource } from "../types";
import { apiService } from "../services/apiService";

interface StepDetailModalProps {
  step: RoadmapStep | null;
  onClose: () => void;
  onToggleComplete: (stepId: string) => void;
  onSaveNotes: (stepId: string, notes: string) => void;
  onQuizSubmit: (stepId: string, score: number, passed: boolean) => void;
  onAskAIAboutStep: (stepTitle: string) => void;
}

export const StepDetailModal: React.FC<StepDetailModalProps> = ({
  step,
  onClose,
  onToggleComplete,
  onSaveNotes,
  onQuizSubmit,
  onAskAIAboutStep,
}) => {
  if (!step) return null;

  const [activeTab, setActiveTab] = useState<"overview" | "resources" | "quiz" | "deepdive" | "notes">("overview");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [notes, setNotes] = useState(step.userNotes || "");
  const [deepDiveData, setDeepDiveData] = useState<any>(null);
  const [loadingDeepDive, setLoadingDeepDive] = useState(false);

  useEffect(() => {
    setNotes(step.userNotes || "");
    setSelectedAnswers({});
    setQuizSubmitted(false);
  }, [step.id]);

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
    const passed = scorePct >= 66; // 2 out of 3 or higher

    setQuizSubmitted(true);
    onQuizSubmit(step.id, scorePct, passed);

    if (passed) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const fetchAIDeepDive = async () => {
    if (deepDiveData) return;
    setLoadingDeepDive(true);
    try {
      const data = await apiService.generateStepDeepdive(
        step.title,
        step.skillsAcquired
      );
      if (data.deepdive) {
        setDeepDiveData(data.deepdive);
      }
    } catch (e) {
      console.error("[StepDetailModal] Deep dive fetch error:", e);
    } finally {
      setLoadingDeepDive(false);
    }
  };

  const isCompleted = step.status === "completed";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-white text-slate-900 flex items-start justify-between border-b border-slate-200">
          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                {step.phaseName}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {step.estimatedHours} hrs estimated
              </span>
              {isCompleted && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> VERIFIED
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">{step.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "overview"
                ? "border-blue-600 text-blue-700 bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Overview & Syllabus
          </button>
          <button
            onClick={() => setActiveTab("resources")}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "resources"
                ? "border-blue-600 text-blue-700 bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            Curated Resources ({step.resources?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "quiz"
                ? "border-blue-600 text-blue-700 bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            Milestone Quiz {step.assessment?.passed && "✓"}
          </button>
          <button
            onClick={() => {
              setActiveTab("deepdive");
              fetchAIDeepDive();
            }}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "deepdive"
                ? "border-blue-600 text-blue-700 bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            AI Deep Dive & Pitfalls
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "notes"
                ? "border-blue-600 text-blue-700 bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            Study Notes
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm text-slate-700">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* AI Why Recommended Highlight */}
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  AI Explainability & Gap Vector Rationale
                </div>
                <p className="text-xs sm:text-sm text-blue-950 leading-relaxed font-medium">
                  {step.reasoning || step.aiWhyRecommended}
                </p>
              </div>

              {/* Detailed Description */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">Milestone Objectives</h3>
                <p className="text-slate-600 leading-relaxed font-normal">{step.detailedDescription}</p>
              </div>

              {/* Deliverable Card */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <Award className="w-4 h-4 text-blue-600" />
                  Concrete Deliverable / Portfolio Artifact
                </div>
                <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono">
                  {step.deliverable}
                </p>
              </div>

              {/* Skills Acquired */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Skills & Competencies Acquired
                </h3>
                <div className="flex flex-wrap gap-2">
                  {step.skillsAcquired.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Study Tips */}
              {step.aiTips && step.aiTips.length > 0 && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    AI Actionable Study Tips
                  </div>
                  <ul className="list-disc list-inside text-xs text-amber-950 space-y-1 font-medium">
                    {step.aiTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RESOURCES */}
          {activeTab === "resources" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-medium">
                Hand-picked high-yield learning resources tailored to your skill level and budget preference.
              </p>
              <div className="space-y-3">
                {step.resources?.map((res, i) => (
                  <div
                    key={i}
                    className="p-4 bg-white border border-slate-200 hover:border-blue-300 rounded-xl shadow-xs transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-900 text-white">
                            {res.provider}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                            {res.type}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {res.cost}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 text-slate-400" /> {res.duration}
                          </span>
                          <span className="text-[11px] text-amber-600 font-bold">
                            ★ {res.rating}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">{res.title}</h4>
                      </div>
                      <a
                        href={res.url || "https://google.com"}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
                        title="Open Resource"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-100">
                      <span className="font-bold text-blue-900">Why Selected: </span>
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
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: QUIZ & ASSESSMENT */}
          {activeTab === "quiz" && (
            <div className="space-y-6">
              <div className="p-4 bg-white text-slate-900 border border-slate-200 shadow-2xs rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{step.assessment?.title || "Milestone Check"}</h3>
                  <p className="text-xs text-slate-500 font-normal">
                    Pass this 3-question quiz to demonstrate competency and unlock subsequent milestones.
                  </p>
                </div>
                {step.assessment?.passed && (
                  <div className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Passed ({step.assessment.score}%)
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {step.assessment?.questions.map((q, qIdx) => {
                  const isAnswered = selectedAnswers[qIdx] !== undefined;
                  const isCorrect = isAnswered && selectedAnswers[qIdx] === q.correctIndex;

                  return (
                    <div
                      key={qIdx}
                      className={`p-4 rounded-xl border transition-all ${
                        quizSubmitted
                          ? isCorrect
                            ? "bg-emerald-50/50 border-emerald-200"
                            : "bg-rose-50/50 border-rose-200"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="font-bold text-slate-900 text-xs sm:text-sm mb-3 flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs flex-shrink-0 font-bold">
                          {qIdx + 1}
                        </span>
                        <span>{q.question}</span>
                      </div>

                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = selectedAnswers[qIdx] === optIdx;
                          const isTheCorrectOption = q.correctIndex === optIdx;

                          let btnStyle = "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100";
                          if (quizSubmitted) {
                            if (isTheCorrectOption) {
                              btnStyle = "bg-emerald-100 border-emerald-500 text-emerald-900 font-bold";
                            } else if (isSelected && !isTheCorrectOption) {
                              btnStyle = "bg-rose-100 border-rose-500 text-rose-900 font-medium";
                            }
                          } else if (isSelected) {
                            btnStyle = "bg-blue-50 border-blue-600 text-blue-900 font-bold";
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleAnswerSelect(qIdx, optIdx)}
                              className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between gap-2 ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && isTheCorrectOption && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className="mt-3 p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-600">
                          <span className="font-bold text-slate-900">Explanation: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <span className="text-xs text-slate-500 font-medium">
                  Answer all questions and submit for instant diagnostic grading.
                </span>
                <button
                  onClick={handleEvaluateQuiz}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  {quizSubmitted ? "Re-evaluate Answers" : "Submit Quiz"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: AI DEEP DIVE */}
          {activeTab === "deepdive" && (
            <div className="space-y-6">
              {loadingDeepDive ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-semibold">Generating mental models and production pitfalls...</p>
                </div>
              ) : deepDiveData ? (
                <div className="space-y-6">
                  {/* Mental Models */}
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Key Mental Models & Core Principles
                    </h4>
                    <ul className="space-y-2">
                      {deepDiveData.keyTakeaways?.map((kt: string, i: number) => (
                        <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{kt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Challenge Project */}
                  {deepDiveData.challengeProject && (
                    <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3 shadow-2xs">
                      <h4 className="font-bold text-blue-950 text-xs uppercase tracking-wider">
                        Hands-On Challenge: {deepDiveData.challengeProject.name}
                      </h4>
                      <p className="text-xs text-blue-900 leading-relaxed font-normal">
                        {deepDiveData.challengeProject.description}
                      </p>
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-blue-950">Implementation Milestones:</span>
                        <ul className="list-disc list-inside text-xs text-blue-900 space-y-0.5 font-medium">
                          {deepDiveData.challengeProject.milestones?.map((m: string, mi: number) => (
                            <li key={mi}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Production Pitfalls */}
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 shadow-2xs">
                    <h4 className="font-bold text-amber-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      Production Pitfalls to Avoid
                    </h4>
                    <ul className="list-disc list-inside text-xs text-amber-900 space-y-1 font-medium">
                      {deepDiveData.productionPitfalls?.map((pf: string, i: number) => (
                        <li key={i}>{pf}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Interview Q&A */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Target Interview & Architecture Q&As
                    </h4>
                    {deepDiveData.interviewQuestions?.map((iq: any, i: number) => (
                      <div key={i} className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1.5 shadow-2xs">
                        <div className="font-bold text-slate-900">Q: {iq.question}</div>
                        <div className="text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                          <span className="font-bold text-blue-600">Model Answer: </span>
                          {iq.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <button
                    onClick={fetchAIDeepDive}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
                  >
                    Generate AI Deep Dive
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: STUDY NOTES */}
          {activeTab === "notes" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">
                  Your Personal Study Notes & Code Snippets
                </label>
                <span className="text-[11px] text-slate-400 font-medium">Auto-saved to your profile</span>
              </div>
              <textarea
                rows={8}
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  onSaveNotes(step.id, e.target.value);
                }}
                placeholder="Write notes, key takeaways, links to your GitHub repos, or questions here..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onAskAIAboutStep(step.title);
            }}
            className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ask AI Advisor about this topic
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg border border-slate-200"
            >
              Close
            </button>
            <button
              id={`btn-modal-complete-${step.id}`}
              onClick={() => {
                onToggleComplete(step.id);
                if (!isCompleted) {
                  confetti({ particleCount: 50, spread: 60 });
                }
              }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-bold rounded-lg transition-colors shadow-xs ${
                isCompleted
                  ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isCompleted ? "Mark as Incomplete" : "Verify Milestone Complete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
