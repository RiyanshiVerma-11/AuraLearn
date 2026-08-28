import React from "react";
import { X, Sparkles, BrainCircuit, Server, Layers, ShieldCheck, ArrowRight } from "lucide-react";
import { CAREER_PATH_PRESETS } from "../data/presets";
import { CareerPathPreset, UserProfile } from "../types";

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: CareerPathPreset) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "BrainCircuit":
        return <BrainCircuit className="w-5 h-5" />;
      case "Server":
        return <Server className="w-5 h-5" />;
      case "Layers":
        return <Layers className="w-5 h-5" />;
      case "ShieldCheck":
        return <ShieldCheck className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-base">Select Career Archetype Preset</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <p className="text-xs text-slate-500 font-medium">
            Choose a curated career archetype to instantly initialize your personalized learning path
            and skill gap diagnostic.
          </p>

          <div className="space-y-3">
            {CAREER_PATH_PRESETS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset);
                  onClose();
                }}
                className="p-4 bg-white hover:bg-blue-50/40 border border-slate-200 hover:border-blue-400 rounded-xl shadow-xs transition-all cursor-pointer group flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0">
                    {getIcon(preset.icon)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        {preset.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">~{preset.estimatedWeeks} Weeks</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors">
                      {preset.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-normal">{preset.tagline}</p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {preset.skillsHighlighted.map((sk, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-2 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0 self-center">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
