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
            className={`absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 rounded-2xl blur-md opacity-40 group-hover:opacity-75 transition-opacity ${
              animated ? "animate-pulse" : ""
            }`}
          />
        )}

        {/* Vector SVG Logo */}
        <svg
          viewBox="0 0 512 512"
          className={`${dim.box} relative z-10 drop-shadow-md`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`bgGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="50%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            <linearGradient id={`facetLeft-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>

            <linearGradient id={`facetRight-${size}`} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#c4b5fd" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#6d28d9" />
            </linearGradient>

            <linearGradient id={`bridgeGrad-${size}`} x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>

            <filter id={`sparkGlow-${size}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Rounded Tile Canvas */}
          <rect width="512" height="512" rx="128" fill={`url(#bgGrad-${size})`} />
          <rect
            width="504"
            height="504"
            x="4"
            y="4"
            rx="124"
            fill="none"
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="8"
          />

          {/* Subtle Neural Orbital Ring */}
          <ellipse
            cx="256"
            cy="260"
            rx="170"
            ry="90"
            fill="none"
            stroke="rgba(56, 189, 248, 0.2)"
            strokeWidth="4"
            strokeDasharray="12 12"
            transform="rotate(-15 256 260)"
          />

          {/* Neural Pathway Constellation Lines */}
          <path
            d="M125 380 L256 100 L387 380"
            fill="none"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="6"
            strokeDasharray="10 10"
          />
          <circle cx="125" cy="380" r="10" fill="#38bdf8" />
          <circle cx="387" cy="380" r="10" fill="#c084fc" />
          <circle cx="256" cy="100" r="12" fill="#ffffff" filter={`url(#sparkGlow-${size})`} />

          {/* Dynamic Geometric 'A' Apex Left Wing */}
          <path
            d="M256 100 L140 370 L215 370 L256 260 Z"
            fill={`url(#facetLeft-${size})`}
          />

          {/* Dynamic Geometric 'A' Apex Right Wing */}
          <path
            d="M256 100 L372 370 L297 370 L256 260 Z"
            fill={`url(#facetRight-${size})`}
          />

          {/* Ascending Bridge / Transverse Arch */}
          <path
            d="M185 300 L327 300 L297 340 L215 340 Z"
            fill={`url(#bridgeGrad-${size})`}
          />

          {/* Central Radiance Core Spark */}
          <polygon
            points="256,165 268,195 300,200 274,222 282,255 256,236 230,255 238,222 212,200 244,195"
            fill="#ffffff"
            filter={`url(#sparkGlow-${size})`}
          />
          <circle cx="256" cy="210" r="7" fill="#67e8f9" />
        </svg>
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
