import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Lightbulb,
  ArrowUp,
  Compass,
  Zap,
  RotateCcw,
  BookOpen,
  Target,
  CheckCircle2,
} from "lucide-react";
import { ChatMessage, UserProfile, LearningRoadmap } from "../types";

interface ConversationalAdvisorProps {
  chatHistory: ChatMessage[];
  onSendMessage: (msg: string) => Promise<void>;
  isLoading: boolean;
  profile: UserProfile;
  roadmap: LearningRoadmap | null;
  onExecuteAction: (action: string, payload?: any) => void;
}

export const ConversationalAdvisor: React.FC<ConversationalAdvisorProps> = ({
  chatHistory,
  onSendMessage,
  isLoading,
  profile,
  roadmap,
  onExecuteAction,
}) => {
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;
    const msg = inputMessage.trim();
    setInputMessage("");
    await onSendMessage(msg);
  };

  const handleQuickPrompt = async (prompt: string) => {
    if (isLoading) return;
    await onSendMessage(prompt);
  };

  return (
    <div className="flex-1 flex flex-col w-full h-[calc(100dvh-3.5rem)] min-h-0 bg-slate-50/50 relative overflow-hidden">
      {/* Top Advisor Header Bar */}
      <header className="flex-shrink-0 bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3 shadow-2xs z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-sm">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
                  Aura AI Advisor
                </h1>
                <span className="hidden xs:inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                <Target className="w-3 h-3 text-blue-600 flex-shrink-0" />
                <span className="truncate">
                  Path: <strong className="text-slate-800 font-semibold">{roadmap?.targetRole || "Career Accelerator"}</strong>
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/60">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span>Real-time calibration & advice</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Messages Scroll Area - Takes full available space */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6 space-y-5">
        <div className="max-w-4xl mx-auto w-full space-y-5">
          {chatHistory.length === 0 && (
            <div className="py-8 sm:py-16 text-center space-y-6 max-w-xl mx-auto animate-in fade-in duration-300">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  How can I help you master your goals today?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                  Ask questions about specific skills, calibrate your milestone pace, request capstone project ideas, or discuss interview prep.
                </p>
              </div>

              {/* Starter Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
                <button
                  type="button"
                  onClick={() => handleQuickPrompt("Why did you recommend this specific sequence of milestones in my roadmap?")}
                  className="p-3.5 bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all shadow-2xs group cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 group-hover:text-blue-600">
                    <Compass className="w-4 h-4 text-blue-600" />
                    <span>Explain Roadmap Strategy</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    Understand why concepts are sequenced this way.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPrompt("I only have 5 hours a week to study right now. How should I adjust my roadmap pace?")}
                  className="p-3.5 bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all shadow-2xs group cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 group-hover:text-blue-600">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Adapt to 5 hrs/week</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    Recalibrate timeline for tighter schedules.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPrompt("What portfolio capstone project will impress hiring managers most for this role?")}
                  className="p-3.5 bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all shadow-2xs group cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 group-hover:text-blue-600">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>Recommend Portfolio Projects</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    Stand out with real-world production-ready builds.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPrompt("I already have intermediate foundations in this subject. Can we skip the basics?")}
                  className="p-3.5 bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all shadow-2xs group cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 group-hover:text-blue-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Fast-track Past Basics</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    Jump straight to intermediate & advanced modules.
                  </p>
                </button>
              </div>
            </div>
          )}

          {chatHistory.map((msg) => {
            const isUser = msg.sender === "user";

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} animate-in fade-in duration-200`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-2xs ${
                    isUser
                      ? "bg-slate-800 text-white"
                      : "bg-gradient-to-br from-blue-600 to-indigo-700 text-white"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[88%] sm:max-w-[80%] text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? "bg-blue-600 text-white p-3.5 sm:p-4 rounded-2xl rounded-tr-xs ml-4 sm:ml-8 font-normal"
                      : "bg-white border border-slate-200/90 text-slate-800 p-4 sm:p-5 rounded-2xl rounded-tl-xs mr-4 sm:mr-8 space-y-3"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Suggested Actions if returned by AI */}
                  {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                      {msg.suggestedActions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => onExecuteAction(act.action, act.payload)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs border border-blue-200 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* AI Thinking Animation */}
          {isLoading && (
            <div className="flex items-start gap-3 animate-in fade-in duration-200">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs p-4 shadow-xs flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Aura is formulating personalized advice...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Chat Input Area at the Very Bottom */}
      <div className="flex-shrink-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-3 sm:px-6 py-3 sm:py-4 shadow-lg z-20">
        <div className="max-w-4xl mx-auto w-full space-y-2.5">
          {/* Quick Prompts Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 whitespace-nowrap flex-shrink-0">
              <Sparkles className="w-3 h-3 text-blue-600" /> Suggested:
            </span>
            <button
              type="button"
              onClick={() => handleQuickPrompt("Why this milestone order?")}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium rounded-full text-xs whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer"
            >
              Why this order?
            </button>
            <button
              type="button"
              onClick={() => handleQuickPrompt("I have 5 hrs/week. Adapt my plan.")}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium rounded-full text-xs whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer"
            >
              Adapt for 5 hrs/wk
            </button>
            <button
              type="button"
              onClick={() => handleQuickPrompt("What are the best free resources for this?")}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium rounded-full text-xs whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer"
            >
              Best Free Resources
            </button>
            <button
              type="button"
              onClick={() => handleQuickPrompt("Give me a practice coding challenge for my current step.")}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium rounded-full text-xs whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer"
            >
              Practice Challenge
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              id="chat-advisor-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Aura anything about your career path, skills, or projects..."
              className="w-full pl-4 sm:pl-5 pr-12 sm:pr-14 py-3 sm:py-3.5 bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-slate-300/80 focus:border-blue-500 rounded-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-inner text-slate-900 transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="absolute right-1.5 sm:right-2 top-1.5 sm:top-2 w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-full transition-all flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
              aria-label="Send message"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Footer note */}
          <p className="text-[10px] text-center text-slate-400">
            Aura AI dynamically personalizes advice using your roadmap and learning profile.
          </p>
        </div>
      </div>
    </div>
  );
};
