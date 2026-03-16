const TYPE_CONFIG: Record<string, { label: string; borderColor: string; bgColor: string; textColor: string }> = {
  "agent-framework": { label: "Agent框架", borderColor: "rgba(168,85,247,0.3)", bgColor: "rgba(168,85,247,0.1)", textColor: "var(--ps-neon-purple)" },
  "mcp-server": { label: "MCP", borderColor: "rgba(0,240,255,0.3)", bgColor: "rgba(0,240,255,0.08)", textColor: "var(--ps-neon-cyan)" },
  "claude-skill": { label: "Claude", borderColor: "rgba(168,85,247,0.3)", bgColor: "rgba(168,85,247,0.1)", textColor: "var(--ps-neon-purple)" },
  "codex-skill": { label: "Codex", borderColor: "rgba(34,211,238,0.3)", bgColor: "rgba(34,211,238,0.1)", textColor: "var(--ps-neon-green)" },
  "agent-tool": { label: "Agent工具", borderColor: "rgba(0,240,255,0.3)", bgColor: "rgba(0,240,255,0.08)", textColor: "var(--ps-neon-cyan)" },
  "llm-plugin": { label: "LLM插件", borderColor: "rgba(245,158,11,0.3)", bgColor: "rgba(245,158,11,0.1)", textColor: "var(--ps-neon-amber)" },
  "skill": { label: "Skill", borderColor: "rgba(34,211,238,0.3)", bgColor: "rgba(34,211,238,0.1)", textColor: "var(--ps-neon-green)" },
  "tool": { label: "Tool", borderColor: "rgba(148,163,184,0.3)", bgColor: "rgba(148,163,184,0.08)", textColor: "var(--ps-text-secondary)" },
};

interface Props {
  type: string;
}

export function ProjectTypeBadge({ type }: Props) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG["tool"];
  return (
    <span
      className="px-1.5 py-0.5 text-[10px] font-medium rounded whitespace-nowrap shrink-0"
      style={{ border: `1px solid ${cfg.borderColor}`, background: cfg.bgColor, color: cfg.textColor }}
    >
      {cfg.label}
    </span>
  );
}
