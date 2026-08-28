import React from "react";

interface BrandLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero" | "splash";
  showWordmark?: boolean;
  badgeText?: string;
  className?: string;
  glow?: boolean;
  animated?: boolean;
  theme?: "dark" | "light";
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = "md",
  showWordmark = true,
  badgeText,
  className = "",
  glow = true,
  animated = false,
  theme = "dark",
}) => {
  const getDimension = () => {
    switch (size) {
      case "xs":
        return { box: "w-5 h-5", px: 20 };
      case "sm":
        return { box: "w-7 h-7", px: 28 };
      case "md":
        return { box: "w-9 h-9", px: 36 };
      case "lg":
        return { box: "w-12 h-12", px: 48 };
      case "xl":
        return { box: "w-16 h-16", px: 64 };
      case "hero":
        return { box: "w-20 h-20", px: 80 };
      case "splash":
        return { box: "w-28 h-28 sm:w-32 sm:h-32", px: 128 };
      default:
        return { box: "w-9 h-9", px: 36 };
    }
  };

  const dim = getDimension();

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Dynamic Emblem Graphic */}
      <div className="relative flex-shrink-0 flex items-center justify-center">
        {/* Ambient Glow Aura */}
        {glow && (
          <div
            className={`absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-500 rounded-2xl blur-md opacity-40 group-hover:opacity-75 transition-opacity ${
              animated ? "animate-pulse" : ""
            }`}
          />
        )}

        {/* Real Brand Logo Image */}
        <img
          src="/logo.png"
          alt="AuraLearn Logo"
          className={`${dim.box} relative z-10 rounded-xl object-contain drop-shadow-md border border-cyan-500/20 bg-slate-950`}
        />
      </div>

      {/* Companion Wordmark */}
      {showWordmark && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`font-black tracking-tight ${
                theme === "light" ? "text-slate-900" : "text-white"
              } ${
                size === "xs" || size === "sm"
                  ? "text-sm"
                  : size === "md"
                  ? "text-base"
                  : size === "lg"
                  ? "text-lg"
                  : size === "xl"
                  ? "text-2xl"
                  : size === "hero"
                  ? "text-3xl"
                  : "text-4xl"
              }`}
            >
              Aura<span className={theme === "light" ? "text-blue-600" : "text-blue-400"}>Learn</span>
            </span>
            {badgeText && (
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                  theme === "light"
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-blue-950 text-blue-400 border border-blue-800"
                }`}
              >
                {badgeText}
              </span>
            )}
          </div>
          {(size === "md" || size === "lg" || size === "xl" || size === "hero" || size === "splash") && (
            <span
              className={`text-[11px] font-medium tracking-normal truncate ${
                theme === "light" ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Autonomous Learning Architect
            </span>
          )}
        </div>
      )}
    </div>
  );
};
