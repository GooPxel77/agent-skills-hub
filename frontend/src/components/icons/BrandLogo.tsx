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
        {/* Light Theme Gradients */}
        <linearGradient id="brandLogoGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="40%" stopColor="#7c3aed" />
          <stop offset="75%" stopColor="#6d28d9" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>

        <linearGradient id="brandLogoWarmLight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="35%" stopColor="#e11d48" />
          <stop offset="75%" stopColor="#f59e0b" />
        </linearGradient>

        <radialGradient id="brandLogoAmberCoreLight" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#fef08a" />
          <stop offset="70%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>

        {/* Dark Theme Gradients */}
        <linearGradient id="brandLogoGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="40%" stopColor="#a855f7" />
          <stop offset="75%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>

        <linearGradient id="brandLogoWarmDark" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="35%" stopColor="#fb7185" />
          <stop offset="75%" stopColor="#fbbf24" />
        </linearGradient>

        <radialGradient id="brandLogoAmberCoreDark" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#fef08a" />
          <stop offset="70%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ea580c" />
        </radialGradient>
      </defs>

      <style>{`
        .ash-s-path {
          stroke: url(#brandLogoGradLight);
          stroke-width: 8;
          stroke-linecap: round;
          stroke-linejoin: round;
          transition: stroke 0.2s ease;
        }
        .ash-branch-path {
          stroke: #7c3aed;
          stroke-width: 6;
          stroke-linecap: round;
          fill: none;
        }
        .ash-connector-line {
          stroke: url(#brandLogoWarmLight);
          stroke-width: 6.5;
          stroke-linecap: round;
        }
        .ash-node-box {
          fill: #ede9fe;
          stroke: #7c3aed;
          stroke-width: 2.2;
        }
        .ash-amber-ring {
          stroke: #d97706;
          stroke-width: 3.5;
          fill: #fffbeb;
        }
        .ash-amber-core {
          fill: url(#brandLogoAmberCoreLight);
        }

        :root.dark .ash-s-path, html.dark .ash-s-path, .dark .ash-s-path {
          stroke: url(#brandLogoGradDark);
          filter: drop-shadow(0 0 3px rgba(192, 132, 252, 0.65));
        }
        :root.dark .ash-branch-path, html.dark .ash-branch-path, .dark .ash-branch-path {
          stroke: #c084fc;
        }
        :root.dark .ash-connector-line, html.dark .ash-connector-line, .dark .ash-connector-line {
          stroke: url(#brandLogoWarmDark);
        }
        :root.dark .ash-node-box, html.dark .ash-node-box, .dark .ash-node-box {
          fill: #2e1065;
          stroke: #c084fc;
          stroke-width: 2;
        }
        :root.dark .ash-amber-ring, html.dark .ash-amber-ring, .dark .ash-amber-ring {
          stroke: #fbbf24;
          fill: #1c1917;
          filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.85));
        }
        :root.dark .ash-amber-core, html.dark .ash-amber-core, .dark .ash-amber-core {
          fill: url(#brandLogoAmberCoreDark);
        }
      `}</style>

      {/* Main S Circuit Tube (100% Transparent background) */}
      <path
        className="ash-s-path"
        d="M 24 82 L 38 102 L 61 102 L 74 82 L 61 64 L 38 64 L 24 46 L 38 26 L 61 26"
      />

      {/* Top Branch to Node */}
      <path
        className="ash-branch-path"
        d="M 61 26 L 74 46 C 79 51, 84 42, 93 42"
      />
      <rect className="ash-node-box" x="93" y="35" width="14" height="14" rx="3.5" />

      {/* Bottom Branch to Node */}
      <path
        className="ash-branch-path"
        d="M 74 82 C 79 82, 84 88, 93 88"
      />
      <rect className="ash-node-box" x="93" y="81" width="14" height="14" rx="3.5" />

      {/* Center Warm Connector */}
      <line className="ash-connector-line" x1="61" y1="64" x2="89" y2="64" />

      {/* Amber Concentric Node */}
      <circle className="ash-amber-ring" cx="100" cy="64" r="10" />
      <circle className="ash-amber-core" cx="100" cy="64" r="5" />
    </svg>
  );
}
