import { Star, ExternalLink, Bookmark, BookmarkCheck, ChevronRight } from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";

// ─────────────────────────────────────────────────────────────────────────────
// Pick status definitions
// ─────────────────────────────────────────────────────────────────────────────
export type PickStatus = "worth-reusing" | "workflow-ready" | "deep-research" | "needs-testing";

const STATUS_META: Record<PickStatus, {
  label: string;
  tooltip: string;
  dot: string;   // CSS color value for the status dot
}> = {
  "worth-reusing": {
    label: "Worth Reusing",
    tooltip: "Ready to bookmark, reuse, or adapt in real workflows.",
    dot: "var(--accent-cyan)",
  },
  "workflow-ready": {
    label: "Workflow Ready",
    tooltip: "Can be combined with other skills or MCP servers into a reusable workflow.",
    dot: "var(--accent-green)",
  },
  "deep-research": {
    label: "Deep Research",
    tooltip: "Worth studying for architecture, prompt design, agent patterns, or implementation.",
    dot: "var(--accent-violet)",
  },
  "needs-testing": {
    label: "Needs Testing",
    tooltip: "Looks promising but still needs hands-on validation.",
    dot: "var(--accent-amber)",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Curated picks config
// Replace or extend this array to update the picks.
// When real skill IDs are available, add skillId so the Save action works.
// ─────────────────────────────────────────────────────────────────────────────
interface PickEntry {
  id: string;
  title: string;
  description: string;
  whyThisPick: string;
  pickStatus: PickStatus;
  reuseScore: number;
  category: string;
  tags: string[];
  sourceUrl: string;
  stars: string;        // e.g. "48k" — formatted string for display
  updatedAt: string;    // e.g. "3d ago"
  skillId?: number;     // optional: link to real Supabase skill record for Save
}

const CURATED_PICKS: PickEntry[] = [
  {
    id: "pick-cline",
    title: "cline/cline",
    description: "CLI-based AI coding agent for development automation and codebase understanding.",
    whyThisPick: "Useful reference for local coding-agent workflows and tool execution patterns.",
    pickStatus: "worth-reusing",
    reuseScore: 95,
    category: "Claude Skill",
    tags: ["Coding Agent", "Developer Productivity"],
    sourceUrl: "https://github.com/cline/cline",
    stars: "48k",
    updatedAt: "3d ago",
  },
  {
    id: "pick-mcp-servers",
    title: "modelcontextprotocol/servers",
    description: "Official MCP server collection giving AI agents access to files, databases, and APIs.",
    whyThisPick: "The canonical starting point for integrating external tools into any agent workflow.",
    pickStatus: "workflow-ready",
    reuseScore: 92,
    category: "MCP Server",
    tags: ["Protocol", "Integrations"],
    sourceUrl: "https://github.com/modelcontextprotocol/servers",
    stars: "41k",
    updatedAt: "1d ago",
  },
  {
    id: "pick-markitdown",
    title: "microsoft/markitdown",
    description: "Python tool for converting complex documents and files into clean, LLM-ready markdown.",
    whyThisPick: "Elegant pre-processing step for any RAG or document-ingestion pipeline.",
    pickStatus: "deep-research",
    reuseScore: 88,
    category: "AI Skill",
    tags: ["Document Processing", "RAG"],
    sourceUrl: "https://github.com/microsoft/markitdown",
    stars: "39k",
    updatedAt: "5d ago",
  },
  {
    id: "pick-browser-use",
    title: "browser-use/browser-use",
    description: "Make web browsers accessible for AI agents to automate website interactions and data extraction.",
    whyThisPick: "Promising approach to web automation but real-world reliability still needs hands-on testing.",
    pickStatus: "needs-testing",
    reuseScore: 84,
    category: "Agent Tool",
    tags: ["Browser Automation", "Data Extraction"],
    sourceUrl: "https://github.com/browser-use/browser-use",
    stars: "32k",
    updatedAt: "2d ago",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────

function PickStatusBadge({ status }: { status: PickStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest select-none"
      style={{ color: 'var(--text-secondary)' }}
      title={meta.tooltip}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: meta.dot }}
      />
      {meta.label}
    </span>
  );
}

function PickCard({ pick, onNavigate }: { pick: PickEntry; onNavigate: (url: string) => void }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = pick.skillId != null && isFavorite(pick.skillId);

  return (
    <article
      className="flex flex-col p-5 rounded-[var(--ps-radius-card)] border transition-all group"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-subtle)',
        boxShadow: 'var(--shadow-soft)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
    >
      {/* Header: status + score */}
      <div className="flex items-center justify-between mb-3">
        <PickStatusBadge status={pick.pickStatus} />
        <span
          className="text-xs font-medium tabular-nums"
          style={{ color: 'var(--text-muted)' }}
        >
          {pick.reuseScore} Reuse Score
        </span>
      </div>

      {/* Title */}
      <h3
        className="font-semibold text-base mb-1.5 transition-colors"
        style={{ color: 'var(--text-primary)' }}
      >
        {pick.title}
      </h3>

      {/* Description */}
      <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
        {pick.description}
      </p>

      {/* Why this pick */}
      <div
        className="text-xs leading-relaxed mb-4 pl-3 border-l-2"
        style={{ color: 'var(--text-muted)', borderColor: 'var(--border-strong)' }}
      >
        <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Why this pick: </span>
        {pick.whyThisPick}
      </div>

      {/* Metadata: category · tags */}
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] mb-4" style={{ color: 'var(--text-muted)' }}>
        <span>{pick.category}</span>
        {pick.tags.map(t => (
          <span key={t}>· {t}</span>
        ))}
        <span className="ml-auto flex items-center gap-2 shrink-0">
          <Star className="w-3 h-3" style={{ fill: 'var(--accent-amber)', color: 'var(--accent-amber)' }} />
          {pick.stars}
          · {pick.updatedAt}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <button
          onClick={() => onNavigate(pick.sourceUrl)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex-1 justify-center"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-cyan)';
            (e.currentTarget as HTMLElement).style.color = 'var(--accent-cyan)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
          }}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Skill
        </button>

        {pick.skillId != null && (
          <button
            onClick={() => pick.skillId != null && toggleFavorite(pick.skillId)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            style={{
              background: saved ? 'rgba(56,189,248,0.08)' : 'var(--bg-elevated)',
              color: saved ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              border: `1px solid ${saved ? 'rgba(56,189,248,0.2)' : 'var(--border-subtle)'}`,
            }}
            title={saved ? "Remove from saved" : "Save to favorites"}
          >
            {saved
              ? <BookmarkCheck className="w-3.5 h-3.5" />
              : <Bookmark className="w-3.5 h-3.5" />
            }
            {saved ? "Saved" : "Save"}
          </button>
        )}
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main section — shows 3 picks on the homepage
// ─────────────────────────────────────────────────────────────────────────────
const HOMEPAGE_LIMIT = 3;

export function PicksSection() {
  const displayed = CURATED_PICKS.slice(0, HOMEPAGE_LIMIT);
  const hasMore = CURATED_PICKS.length > HOMEPAGE_LIMIT;

  const handleNavigate = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="picks" className="mb-12">
      {/* Section header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-start gap-2">
          <Star
            className="w-5 h-5 mt-0.5 shrink-0"
            style={{ fill: 'var(--accent-amber)', color: 'var(--accent-amber)' }}
          />
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              postsoma-2050's Picks
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Not just ranked by stars — skills worth studying, testing, or reusing in real workflows.
            </p>
          </div>
        </div>

        {hasMore && (
          <button
            onClick={() => scrollToSection("picks")}
            className="hidden sm:flex items-center gap-1 text-xs font-medium transition-colors shrink-0 mt-1 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-cyan)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            View all {CURATED_PICKS.length} picks
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Badge legend — static, not filters */}
      <div className="flex flex-wrap gap-4 mb-5 pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        {(Object.entries(STATUS_META) as [PickStatus, typeof STATUS_META[PickStatus]][]).map(([key, meta]) => (
          <span
            key={key}
            className="inline-flex items-center gap-1.5 text-[10px]"
            style={{ color: 'var(--text-muted)' }}
            title={meta.tooltip}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: meta.dot }} />
            {meta.label}
          </span>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayed.map(pick => (
          <PickCard key={pick.id} pick={pick} onNavigate={handleNavigate} />
        ))}
      </div>
    </section>
  );
}
