import React, { useState } from "react";
import { X, Sparkles, SlidersHorizontal, ArrowRight, Zap, Check } from "lucide-react";
import { LearningRoadmap } from "../types";

interface AdaptRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  roadmap: LearningRoadmap | null;
  onAdaptRoadmap: (feedback: string) => Promise<void>;
  isLoading: boolean;
}

export const AdaptRoadmapModal: React.FC<AdaptRoadmapModalProps> = ({
  isOpen,
  onClose,
  roadmap,
  onAdaptRoadmap,
  isLoading,
}) => {
  const [feedback, setFeedback] = useState("");

  if (!isOpen || !roadmap) return null;

  const quickAdaptOptions = [
    "Condense the roadmap to fit 5 hours/week schedule",
    "I already know Python & SQL, skip basic foundations",
    "Add more focus on Multi-Agent architectures and Tool Calling",
    "Include an enterprise-grade portfolio Capstone Project",
    "Shift focus strictly to 100% free & open-source resources",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim() || isLoading) return;
    await onAdaptRoadmap(feedback);
    onClose();
  };

  const handleSelectQuick = (text: string) => {
    setFeedback(text);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-base">Calibrate Learning Path with AI</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1.5">
              How would you like to calibrate your learning path?
            </label>
            <textarea
              rows={4}
              required
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g. I already master Python, please skip step 1 and replace it with advanced LLM prompt evaluation and security guardrails..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Quick Calibration Templates:
            </label>
            <div className="space-y-1.5">
              {quickAdaptOptions.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectQuick(opt)}
                  className="w-full text-left p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-xs text-slate-700 font-medium transition-colors flex items-center justify-between"
                >
                  <span>{opt}</span>
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!feedback.trim() || isLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Re-optimizing Roadmap...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Apply AI Calibration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
