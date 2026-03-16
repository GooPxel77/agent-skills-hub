interface Props {
  platforms: string; // JSON string
  max?: number;
}

const PLATFORM_CONFIG: Record<string, { label: string; borderColor: string; bgColor: string; textColor: string }> = {
  python: { label: "Python", borderColor: "rgba(245,158,11,0.3)", bgColor: "rgba(245,158,11,0.08)", textColor: "var(--ps-neon-amber)" },
  node: { label: "Node.js", borderColor: "rgba(34,211,238,0.3)", bgColor: "rgba(34,211,238,0.08)", textColor: "var(--ps-neon-green)" },
  go: { label: "Go", borderColor: "rgba(0,240,255,0.3)", bgColor: "rgba(0,240,255,0.08)", textColor: "var(--ps-neon-cyan)" },
  rust: { label: "Rust", borderColor: "rgba(236,72,153,0.3)", bgColor: "rgba(236,72,153,0.08)", textColor: "var(--ps-neon-pink)" },
  docker: { label: "Docker", borderColor: "rgba(0,240,255,0.3)", bgColor: "rgba(0,240,255,0.08)", textColor: "var(--ps-neon-cyan)" },
  cli: { label: "CLI", borderColor: "rgba(148,163,184,0.3)", bgColor: "rgba(148,163,184,0.08)", textColor: "var(--ps-text-secondary)" },
  claude: { label: "Claude", borderColor: "rgba(168,85,247,0.3)", bgColor: "rgba(168,85,247,0.08)", textColor: "var(--ps-neon-purple)" },
  codex: { label: "Codex", borderColor: "rgba(34,211,238,0.3)", bgColor: "rgba(34,211,238,0.08)", textColor: "var(--ps-neon-green)" },
  gemini: { label: "Gemini", borderColor: "rgba(0,240,255,0.3)", bgColor: "rgba(0,240,255,0.08)", textColor: "var(--ps-neon-cyan)" },
  mcp: { label: "MCP", borderColor: "rgba(168,85,247,0.3)", bgColor: "rgba(168,85,247,0.08)", textColor: "var(--ps-neon-purple)" },
  vscode: { label: "VS Code", borderColor: "rgba(0,240,255,0.3)", bgColor: "rgba(0,240,255,0.08)", textColor: "var(--ps-neon-cyan)" },
  browser: { label: "Browser", borderColor: "rgba(236,72,153,0.3)", bgColor: "rgba(236,72,153,0.08)", textColor: "var(--ps-neon-pink)" },
  java: { label: "Java", borderColor: "rgba(236,72,153,0.3)", bgColor: "rgba(236,72,153,0.08)", textColor: "var(--ps-neon-pink)" },
  ruby: { label: "Ruby", borderColor: "rgba(236,72,153,0.3)", bgColor: "rgba(236,72,153,0.08)", textColor: "var(--ps-neon-pink)" },
  shell: { label: "Shell", borderColor: "rgba(148,163,184,0.3)", bgColor: "rgba(148,163,184,0.08)", textColor: "var(--ps-text-secondary)" },
};

export function PlatformBadges({ platforms, max = 4 }: Props) {
  let parsed: string[] = [];
  try {
    parsed = JSON.parse(platforms);
  } catch {
    return null;
  }

  if (parsed.length === 0) return null;

  const shown = parsed.slice(0, max);
  const remaining = parsed.length - max;

  return (
    <div className="flex flex-wrap gap-1">
      {shown.map((p) => {
        const config = PLATFORM_CONFIG[p] || { label: p, borderColor: "rgba(148,163,184,0.3)", bgColor: "rgba(148,163,184,0.08)", textColor: "var(--ps-text-secondary)" };
        return (
          <span
            key={p}
            className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded"
            style={{ border: `1px solid ${config.borderColor}`, background: config.bgColor, color: config.textColor }}
          >
            {config.label}
          </span>
        );
      })}
      {remaining > 0 && (
        <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] rounded"
          style={{ color: 'var(--ps-text-muted)', background: 'var(--ps-bg-elevated)' }}>
          +{remaining}
        </span>
      )}
    </div>
  );
}
