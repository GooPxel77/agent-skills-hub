import { Star, Shield, Zap, Search } from "lucide-react";

const PICKS = [
  {
    id: "pick-1",
    name: "cline/cline",
    description: "An AI agent that can run in your CLI to automate standard development tasks and codebase understanding.",
    badge: "Worth Reusing",
    badgeIcon: Star,
    badgeColor: "text-[var(--ps-neon-cyan)] bg-[rgba(56,189,248,0.1)] border-[rgba(56,189,248,0.2)]",
    score: 95
  },
  {
    id: "pick-2",
    name: "modelcontextprotocol/servers",
    description: "The official collection of MCP servers to give your AI assistants access to files, databases, and APIs.",
    badge: "Workflow Ready",
    badgeIcon: Zap,
    badgeColor: "text-[var(--ps-neon-green)] bg-[rgba(52,211,153,0.1)] border-[rgba(52,211,153,0.2)]",
    score: 92
  },
  {
    id: "pick-3",
    name: "microsoft/markitdown",
    description: "Python tool for converting complex documents and files into clean, llm-ready markdown.",
    badge: "Deep Research",
    badgeIcon: Search,
    badgeColor: "text-[var(--ps-neon-purple)] bg-[rgba(129,140,248,0.1)] border-[rgba(129,140,248,0.2)]",
    score: 88
  },
  {
    id: "pick-4",
    name: "browser-use/browser-use",
    description: "Make web browsers accessible for AI agents to automate website interactions and data extraction.",
    badge: "Needs Testing",
    badgeIcon: Shield,
    badgeColor: "text-[var(--ps-neon-amber)] bg-[rgba(251,191,36,0.1)] border-[rgba(251,191,36,0.2)]",
    score: 84
  }
];

export function PicksSection() {
  return (
    <section className="mb-12">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Star className="w-5 h-5 text-[var(--ps-neon-amber)] fill-[var(--ps-neon-amber)]" />
          <h2 className="text-xl font-bold text-[var(--ps-text-primary)]">postsoma-2050's Picks</h2>
        </div>
        <p className="text-sm text-[var(--ps-text-secondary)]">
          Not just ranked by stars — these are skills worth studying, testing, or reusing in real AI agent workflows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {PICKS.map((pick) => {
          const Icon = pick.badgeIcon;
          return (
            <div 
              key={pick.id}
              className="group p-5 rounded-[var(--ps-radius-card)] border border-[var(--ps-border)] bg-[var(--ps-bg-card)] hover:border-[var(--ps-border-glow)] transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold uppercase tracking-wide ${pick.badgeColor}`}>
                  <Icon className="w-3 h-3" />
                  {pick.badge}
                </div>
                <div className="text-xs font-semibold px-2 py-1 rounded border border-[var(--ps-border)] text-[var(--ps-text-secondary)]">
                  {pick.score} Reuse
                </div>
              </div>
              
              <h3 className="font-semibold text-base text-[var(--ps-text-primary)] group-hover:text-[var(--ps-neon-cyan)] transition-colors mb-2">
                {pick.name}
              </h3>
              
              <p className="text-xs text-[var(--ps-text-secondary)] line-clamp-3">
                {pick.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
