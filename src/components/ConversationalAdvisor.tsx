import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Lightbulb,
  Compass,
  Zap,
  RotateCcw,
  BookOpen,
  Target,
  CheckCircle2,
  ExternalLink,
  ArrowUp,
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

// ─── Markdown renderer ────────────────────────────────────────────────────────
// Custom component map so every markdown element looks polished inside the
// chat bubble instead of rendering raw browser defaults.
const MarkdownComponents: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  // Headings
  h1: ({ children }) => (
    <h1 className="text-base font-bold text-slate-900 mb-2 mt-1 flex items-center gap-2 leading-snug">
      <span className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 flex-shrink-0" />
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-sm font-bold text-slate-800 mb-1.5 mt-3 flex items-center gap-2 leading-snug">
      <span className="w-1 h-4 rounded-full bg-blue-400 flex-shrink-0" />
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold text-slate-700 mb-1 mt-2.5 leading-snug">{children}</h3>
  ),

  // Paragraphs
  p: ({ children }) => (
    <p className="text-sm text-slate-700 leading-relaxed mb-2 last:mb-0">{children}</p>
  ),

  // Bold & italic
  strong: ({ children }) => (
    <strong className="font-semibold text-slate-900">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-slate-600">{children}</em>
  ),

  // Unordered list
  ul: ({ children }) => (
    <ul className="space-y-1.5 my-2 pl-0">{children}</ul>
  ),
  // Ordered list
  ol: ({ children }) => (
    <ol className="space-y-1.5 my-2 pl-0 list-none counter-reset-[list-counter]">{children}</ol>
  ),
  // List item — handles both ul and ol nicely
  li: ({ children, ...props }) => (
    <li className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
      <span className="flex-1">{children}</span>
    </li>
  ),

  // Inline code
  code: ({ inline, children, ...props }: any) =>
    inline ? (
      <code className="px-1.5 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-blue-700 font-mono text-xs">
        {children}
      </code>
    ) : (
      <code className="block w-full text-xs font-mono text-slate-700 leading-relaxed">
        {children}
      </code>
    ),

  // Code block
  pre: ({ children }) => (
    <pre className="my-3 p-3 rounded-xl bg-slate-900 text-slate-100 overflow-x-auto text-xs font-mono leading-relaxed border border-slate-700">
      {children}
    </pre>
  ),

  // Blockquote
  blockquote: ({ children }) => (
    <blockquote className="my-2 pl-3 border-l-2 border-blue-300 text-slate-600 italic text-sm">
      {children}
    </blockquote>
  ),

  // Horizontal rule
  hr: () => <hr className="my-3 border-slate-200" />,

  // Links — open in new tab, with icon
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2 decoration-blue-300 hover:decoration-blue-500 transition-colors"
    >
      {children}
      <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-70" />
    </a>
  ),

  // Tables
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
      <table className="w-full text-xs text-left">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-slate-50 border-b border-slate-200">{children}</thead>
  ),
  tbody: ({ children }) => <tbody className="divide-y divide-slate-100">{children}</tbody>,
  tr: ({ children }) => <tr className="hover:bg-blue-50/30 transition-colors">{children}</tr>,
  th: ({ children }) => (
    <th className="px-3 py-2 font-semibold text-slate-700 whitespace-nowrap">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 text-slate-600 leading-relaxed">{children}</td>
  ),
};

// ─── AuraMessage component ────────────────────────────────────────────────────
interface AuraMessageProps {
  msg: ChatMessage;
  onExecuteAction: (action: string, payload?: any) => void;
}

const AuraMessage: React.FC<AuraMessageProps> = ({ msg, onExecuteAction }) => {
  const isUser = msg.sender === "user";

  if (isUser) {
    return (
      <div className="flex items-end gap-2.5 flex-row-reverse animate-in fade-in slide-in-from-right-2 duration-200">
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 text-white flex-shrink-0 shadow-sm ring-2 ring-white">
          <User className="w-4 h-4" />
        </div>
        <div className="max-w-[80%] sm:max-w-[72%] bg-gradient-to-br from-blue-600 to-indigo-700 text-white px-4 py-3 rounded-2xl rounded-br-md shadow-md shadow-blue-500/20 text-sm leading-relaxed font-normal">
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 animate-in fade-in slide-in-from-left-2 duration-200">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-700 text-white flex-shrink-0 shadow-sm ring-2 ring-white mt-0.5">
        <Bot className="w-4 h-4" />
      </div>

      {/* Bubble */}
      <div className="max-w-[88%] sm:max-w-[80%] flex flex-col gap-3">
        <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-md shadow-sm px-5 py-4 text-slate-800 space-y-1">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={MarkdownComponents}
          >
            {msg.text}
          </ReactMarkdown>
        </div>

        {/* Suggested action chips */}
        {msg.suggestedActions && msg.suggestedActions.length > 0 && (
          <div className="flex flex-wrap gap-2 pl-1">
            {msg.suggestedActions.map((act, i) => (
              <button
                key={i}
                onClick={() => onExecuteAction(act.action, act.payload)}
                className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-blue-50 text-blue-700 font-semibold rounded-full text-xs border border-blue-200 hover:border-blue-400 transition-all shadow-xs hover:shadow-blue-100 hover:shadow-sm cursor-pointer active:scale-95"
              >
                <Sparkles className="w-3 h-3 text-blue-500 group-hover:text-blue-600 transition-colors" />
                {act.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
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
    <div className="flex-1 flex flex-col w-full h-[calc(100dvh-3.5rem)] min-h-0 bg-slate-50/60 relative overflow-hidden">

      {/* ── Header ── */}
      <header className="flex-shrink-0 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 px-4 sm:px-6 py-3 shadow-xs z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-sm shadow-blue-500/20">
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
                  Path:{" "}
                  <strong className="text-slate-800 font-semibold">
                    {roadmap?.targetRole || "Career Accelerator"}
                  </strong>
                </span>
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/60 flex-shrink-0">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span>Real-time calibration & advice</span>
          </div>
        </div>
      </header>

      {/* ── Messages ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-4xl mx-auto w-full space-y-5">

          {/* Empty state */}
          {chatHistory.length === 0 && (
            <div className="py-10 sm:py-16 text-center space-y-6 max-w-xl mx-auto animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900">
                  How can I help you master your goals today?
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                  Ask about specific skills, calibrate your pace, get project ideas, or discuss interview prep.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
                {[
                  {
                    icon: <Compass className="w-4 h-4 text-blue-600" />,
                    label: "Explain Roadmap Strategy",
                    desc: "Understand why concepts are sequenced this way.",
                    prompt: "Why did you recommend this specific sequence of milestones in my roadmap?",
                  },
                  {
                    icon: <Zap className="w-4 h-4 text-amber-500" />,
                    label: "Adapt to 5 hrs/week",
                    desc: "Recalibrate timeline for tighter schedules.",
                    prompt: "I only have 5 hours a week to study right now. How should I adjust my roadmap pace?",
                  },
                  {
                    icon: <BookOpen className="w-4 h-4 text-indigo-600" />,
                    label: "Recommend Portfolio Projects",
                    desc: "Stand out with real-world production-ready builds.",
                    prompt: "What portfolio capstone project will impress hiring managers most for this role?",
                  },
                  {
                    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
                    label: "Fast-track Past Basics",
                    desc: "Jump straight to intermediate & advanced modules.",
                    prompt: "I already have intermediate foundations in this subject. Can we skip the basics?",
                  },
                ].map((card) => (
                  <button
                    key={card.label}
                    type="button"
                    onClick={() => handleQuickPrompt(card.prompt)}
                    className="p-4 bg-white hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-xl transition-all shadow-xs group cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 group-hover:text-blue-700">
                      {card.icon}
                      <span>{card.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-normal">{card.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {chatHistory.map((msg) => (
            <AuraMessage key={msg.id} msg={msg} onExecuteAction={onExecuteAction} />
          ))}

          {/* Thinking animation */}
          {isLoading && (
            <div className="flex items-start gap-2.5 animate-in fade-in duration-200">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 text-white flex items-center justify-center flex-shrink-0 shadow-sm ring-2 ring-white">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-md px-5 py-4 shadow-xs flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  {[0, 0.15, 0.3].map((delay, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                      style={{ animationDelay: `${delay}s` }}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Aura is formulating personalised advice…
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Input bar ── */}
      <div className="flex-shrink-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-3 sm:px-6 py-3 sm:py-4 shadow-lg z-20">
        <div className="max-w-4xl mx-auto w-full space-y-2.5">

          {/* Quick chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 whitespace-nowrap flex-shrink-0">
              <Sparkles className="w-3 h-3 text-blue-500" /> Suggested:
            </span>
            {[
              { label: "Why this order?",        prompt: "Why this milestone order?" },
              { label: "Adapt for 5 hrs/wk",    prompt: "I have 5 hrs/week. Adapt my plan." },
              { label: "Best Free Resources",   prompt: "What are the best free resources for this?" },
              { label: "Practice Challenge",    prompt: "Give me a practice coding challenge for my current step." },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => handleQuickPrompt(chip.prompt)}
                className="px-3 py-1 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 font-medium rounded-full text-xs whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer border border-transparent hover:border-blue-200"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Text input */}
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              id="chat-advisor-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Aura anything about your career path, skills, or projects…"
              className="w-full pl-5 pr-14 py-3.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-300/70 focus:border-blue-500 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-inner text-slate-900 transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="absolute right-1.5 top-1.5 w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white rounded-full transition-all flex items-center justify-center shadow-sm cursor-pointer active:scale-95"
              aria-label="Send message"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          <p className="text-[10px] text-center text-slate-400">
            Aura dynamically personalises advice using your roadmap and learning profile.
          </p>
        </div>
      </div>
    </div>
  );
};
