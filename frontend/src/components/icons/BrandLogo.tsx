import React from "react";

export function BrandLogo({ className = "w-6 h-6", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
      fill="none"
      aria-label="Agent Skills Hub"
      role="img"
      className={className}
      {...props}
    >
      <defs>
        {/* Background Subtle Tech Base */}
        <radialGradient id="headerLogoBg" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stop-color="#140f2d" />
          <stop offset="100%" stop-color="#05040a" />
        </radialGradient>

        {/* Purple Neon Circuit Gradient */}
        <linearGradient id="headerLogoSGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="35%" stopColor="#a855f7" />
          <stop offset="70%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>

        {/* Center Connector Warm Gradient */}
        <linearGradient id="headerLogoWarmGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="35%" stopColor="#f43f5e" />
          <stop offset="80%" stopColor="#fbbf24" />
        </linearGradient>

        {/* Glowing Amber Concentric Core */}
        <radialGradient id="headerLogoAmberCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#fef08a" />
          <stop offset="70%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ea580c" />
        </radialGradient>

        {/* Soft Glow */}
        <filter id="headerLogoGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="headerLogoAmberGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Dark Base Plate */}
      <rect width="128" height="128" rx="26" fill="url(#headerLogoBg)" />

      {/* Outer Ambient Glow Trace */}
      <g opacity="0.6" filter="url(#headerLogoGlow)">
        <path
          d="M 42 26 L 68 26 L 82 46 L 70 58 L 44 58 L 32 70 L 44 88 L 70 88 L 82 72"
          stroke="url(#headerLogoSGrad)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Main S Circuit */}
      <g filter="url(#headerLogoGlow)">
        <path
          d="M 42 26 L 68 26 L 82 46 L 70 58 L 44 58 L 32 70 L 44 88 L 70 88 L 82 72"
          stroke="url(#headerLogoSGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Top Branch to Purple Rounded Node */}
        <path
          d="M 80 43 Q 88 43 93 38 Q 98 34 104 34"
          stroke="#a855f7"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <rect
          x="98"
          y="28"
          width="13"
          height="13"
          rx="3.5"
          fill="#2e1065"
          stroke="#c084fc"
          strokeWidth="2.5"
        />

        {/* Bottom Branch to Purple Rounded Node */}
        <path
          d="M 80 74 Q 88 74 93 79 Q 98 84 104 84"
          stroke="#a855f7"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <rect
          x="98"
          y="78"
          width="13"
          height="13"
          rx="3.5"
          fill="#2e1065"
          stroke="#c084fc"
          strokeWidth="2.5"
        />

        {/* Center Connector */}
        <line
          x1="64"
          y1="58"
          x2="92"
          y2="58"
          stroke="url(#headerLogoWarmGrad)"
          strokeWidth="6.5"
          strokeLinecap="round"
        />
      </g>

      {/* Concentric Amber Node with Radiant Bloom */}
      <g filter="url(#headerLogoAmberGlow)">
        <circle cx="100" cy="58" r="11" stroke="#fbbf24" strokeWidth="3.5" fill="none" />
        <circle cx="100" cy="58" r="5.5" fill="url(#headerLogoAmberCore)" />
      </g>
    </svg>
  );
}
