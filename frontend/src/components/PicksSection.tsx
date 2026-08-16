import { useNavigate } from "react-router-dom";
import {
  RiStarFill,
  RiExternalLinkLine,
  RiBookmarkLine,
  RiBookmarkFill,
  RiRobot2Line,
  RiFlashlightLine,
  RiCpuLine,
  RiBrainLine,
  RiSparklingLine,
  RiGitRepositoryLine,
  RiLightbulbLine,
} from "@remixicon/react";
import { useFavorites } from "../hooks/useFavorites";
import { useI18n } from "../i18n/I18nContext";

export type PickStatus =
  | "worth-reusing"
  | "workflow-ready"
  | "deep-research"
  | "needs-testing";

const STATUS_META: Record<
  PickStatus,
  {
    label_zh: string;
    label_en: string;
    tooltip: string;
    dot: string;
  }
> = {
  "workflow-ready": {
    label_zh: "架构成熟 · 推荐落地",
    label_en: "Workflow Ready",
    tooltip: "Production-grade base ready to integrate into real-world autonomous workflows.",
    dot: "var(--accent-green)",
  },
  "deep-research": {
    label_zh: "深度推理 · 学术研究",
    label_en: "Deep Research",
    tooltip: "Pioneering architecture for reasoning, reflection, and self-evolving agent loops.",
    dot: "var(--accent-violet)",
  },
  "worth-reusing": {
    label_zh: "极简轻量 · 高度复用",
    label_en: "Worth Reusing",
    tooltip: "Ultra-fast and lightweight core with minimal footprint for direct reuse.",
    dot: "var(--accent-cyan)",
  },
  "needs-testing": {
    label_zh: "实验探索 · 持续关注",
    label_en: "Needs Testing",
    tooltip: "Promising approach currently undergoing active validation.",
    dot: "var(--accent-amber)",
  },
};

interface AgentPick {
  id: string;
  name: string;
  tagline_zh: string;
  tagline_en: string;
  architecture_zh: string;
  architecture_en: string;
  description_zh: string;
  description_en: string;
  whyThisPick_zh: string;
  whyThisPick_en: string;
  pickStatus: PickStatus;
  reuseScore: number;
  stars: string;
  momentum: string;
  tags: string[];
  sourceUrl: string;
  detailSlug: string;
  envBadge: string;
  skillId?: number;
}

const AGENT_PICKS: AgentPick[] = [
  {
    id: "pick-openclaw",
    name: "openclaw",
    tagline_zh: "全能跨平台个人助理",
    tagline_en: "All-in-One Autonomous Desktop & Cloud Assistant",
    architecture_zh: "全能跨端调度与工具编排核心",
    architecture_en: "Cross-Platform Execution & Tool Orchestrator",
    description_zh:
      "支持 CLI、桌面与移动端无缝跨端运行，原生集成海量工具与 MCP Server，专为复杂多步骤自主工作流打造。",
    description_en:
      "Seamless cross-platform execution (CLI/Desktop/Mobile) with native MCP integration for complex autonomous workflows.",
    whyThisPick_zh:
      "最全面的自主 Agent 落地基座，具备强悍的环境自适应规划与本地文件系统交互能力，是搭建日常全能个人助理的首选。",
    whyThisPick_en:
      "The most versatile autonomous assistant base; natively supports cross-platform execution, local file ops, and adaptive task planning.",
    pickStatus: "workflow-ready",
    reuseScore: 98,
    stars: "18.5k",
    momentum: "Active",
    tags: ["Personal Assistant", "Cross-Platform", "MCP Native", "Task Planning"],
    sourceUrl: "https://github.com/openclaw/openclaw",
    detailSlug: "openclaw/openclaw",
    envBadge: "CLI · Desktop · Cloud",
    skillId: 101,
  },
  {
    id: "pick-hermes-agent",
    name: "hermes-agent",
    tagline_zh: "自进化与深度推理研究型 Agent",
    tagline_en: "Self-Evolving & Deep Reasoning Agent",
    architecture_zh: "长思维链推理与自反思回路引擎",
    architecture_en: "Deep Reasoning & Self-Reflection Engine",
    description_zh:
      "基于 NousResearch 前沿模型架构，结合长思维链深度推理（Deep Reasoning）与自反思回路，专精代码探索与高难规划。",
    description_en:
      "Combines multi-turn deep reasoning and self-reflection loops, specialized in code synthesis and complex research exploration.",
    whyThisPick_zh:
      "开源领域最顶尖的自进化推理架构，能自主诊断执行错误并反思修正，适合高难度算法推导、架构探索与科研分析。",
    whyThisPick_en:
      "State-of-the-art self-reflection architecture in open source; diagnoses execution failures autonomously for complex research & algorithms.",
    pickStatus: "deep-research",
    reuseScore: 95,
    stars: "14.2k",
    momentum: "Research",
    tags: ["Deep Reasoning", "Self-Reflection", "Code Synthesis", "NousResearch"],
    sourceUrl: "https://github.com/NousResearch/Hermes-Agent",
    detailSlug: "NousResearch/Hermes-Agent",
    envBadge: "Research · Python · LLM",
    skillId: 102,
  },
  {
    id: "pick-pi",
    name: "pi",
    tagline_zh: "极简高吞吐轻量流式交互 Agent",
    tagline_en: "Lightweight Streaming Autonomous Agent",
    architecture_zh: "极速低延迟轻量流式调度内核",
    architecture_en: "Ultra-Fast Low-Latency Streaming Core",
    description_zh:
      "极简微内核架构设计，实现毫秒级首字响应与高并发流式工具调度，轻盈高效，适合嵌入移动客户端与边缘设备。",
    description_en:
      "Ultra-minimalist microkernel design achieving millisecond response times and concurrent streaming tool dispatch on edge devices.",
    whyThisPick_zh:
      "极致轻量化与低延迟典范，零臃肿依赖，专为即时响应与高频交互打造，是边缘计算与嵌入式 Agent 的最佳参考标准。",
    whyThisPick_en:
      "The benchmark for lightweight streaming and minimal overhead; built for high-frequency real-time tool calling on edge clients.",
    pickStatus: "worth-reusing",
    reuseScore: 92,
    stars: "9.8k",
    momentum: "Lightweight",
    tags: ["Streaming", "Lightweight", "Edge AI", "Instant Call"],
    sourceUrl: "https://github.com/pi-agent/pi",
    detailSlug: "pi-agent/pi",
    envBadge: "Edge · Native · Stream",
    skillId: 103,
  },
];

function getAgentIcon(id: string) {
  switch (id) {
    case "pick-openclaw":
      return RiRobot2Line;
    case "pick-hermes-agent":
      return RiBrainLine;
    case "pick-pi":
      return RiFlashlightLine;
    default:
      return RiCpuLine;
  }
}

export function PicksSection() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleOpenSource = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="picks" className="mb-10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[var(--ps-neon-amber)]/10 text-[var(--ps-neon-amber)] flex items-center justify-center border border-[var(--ps-neon-amber)]/20">
              <RiStarFill className="w-3.5 h-3.5 fill-current" />
            </div>
            <h2 className="text-lg font-bold text-[var(--ps-text-primary)]">
              {t("picks.title")}
            </h2>
          </div>
          <p className="text-xs text-[var(--ps-text-secondary)] mt-0.5 ml-8">
            {t("picks.subtitle")}
          </p>
        </div>

        <span className="text-xs font-mono text-[var(--ps-neon-cyan)] self-start sm:self-auto flex items-center gap-1.5">
          <RiSparklingLine className="w-3.5 h-3.5" />
          <span>Top 3 Autonomous Agents Focus</span>
        </span>
      </div>

      {/* 3-Column Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
        {AGENT_PICKS.map((pick) => {
          const Icon = getAgentIcon(pick.id);
          const meta = STATUS_META[pick.pickStatus];
          const saved = pick.skillId != null && isFavorite(pick.skillId);

          return (
            <article
              key={pick.id}
              className="p-5 rounded-2xl border border-[var(--ps-border)] bg-[var(--ps-bg-card)] hover:border-[var(--ps-border-strong)] hover:bg-[var(--ps-bg-card-hover)] transition-all duration-300 flex flex-col justify-between shadow-xs group"
            >
              <div>
                {/* Header Row: Status Badge + Reuse Score */}
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <span
                    className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wide select-none"
                    style={{ color: "var(--text-secondary)" }}
                    title={meta.tooltip}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
                      style={{ background: meta.dot }}
                    />
                    {lang === "zh" ? meta.label_zh : meta.label_en}
                  </span>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--ps-neon-green)]/10 text-[var(--ps-neon-green)] border border-[var(--ps-neon-green)]/20 font-mono text-xs font-bold">
                    <span>{pick.reuseScore}</span>
                    <span className="text-[9px] font-sans text-[var(--ps-text-muted)]">
                      {t("picks.reuseScore")}
                    </span>
                  </span>
                </div>

                {/* Title & Tagline */}
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-[var(--ps-neon-cyan)]/10 text-[var(--ps-neon-cyan)] border border-[var(--ps-neon-cyan)]/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-base text-[var(--ps-text-primary)] group-hover:text-[var(--ps-neon-cyan)] transition-colors truncate">
                      {pick.name}
                    </h3>
                    <p className="text-xs text-[var(--ps-text-secondary)] font-medium line-clamp-1">
                      {lang === "zh" ? pick.tagline_zh : pick.tagline_en}
                    </p>
                  </div>
                </div>

                {/* Architecture Role Badge */}
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--ps-bg-elevated)] border border-[var(--ps-border)] text-[10px] font-mono text-[var(--ps-text-muted)] mb-3">
                  <span className="text-[var(--ps-neon-cyan)] font-semibold">
                    {lang === "zh" ? pick.architecture_zh : pick.architecture_en}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-[var(--ps-text-secondary)] leading-relaxed mb-3.5 line-clamp-2">
                  {lang === "zh" ? pick.description_zh : pick.description_en}
                </p>

                {/* Why This Pick (选型理由) */}
                <div className="p-3 rounded-xl bg-[var(--ps-bg-elevated)] border-l-2 border-[var(--ps-neon-amber)] border-t border-r border-b border-[var(--ps-border)]/50 text-xs leading-relaxed mb-4">
                  <span className="font-bold text-[var(--ps-neon-amber)] mr-1 inline-flex items-center gap-1">
                    <RiLightbulbLine className="w-3.5 h-3.5" />
                    <span>{t("picks.whyThisPick")}:</span>
                  </span>
                  <span className="text-[var(--ps-text-primary)] font-medium">
                    {lang === "zh" ? pick.whyThisPick_zh : pick.whyThisPick_en}
                  </span>
                </div>

                {/* Tags & Stars Row */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-[var(--ps-text-muted)] mb-4">
                  {pick.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 rounded bg-[var(--ps-bg-elevated)] border border-[var(--ps-border)] text-[var(--ps-text-secondary)] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="ml-auto flex items-center gap-1 font-mono text-[var(--ps-neon-amber)] font-semibold">
                    <RiStarFill className="w-3 h-3 text-[var(--ps-neon-amber)]" />
                    {pick.stars}
                  </span>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="flex items-center gap-2 pt-3 border-t border-[var(--ps-border)]/50">
                <button
                  onClick={() => handleOpenSource(pick.sourceUrl)}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--ps-bg-elevated)] border border-[var(--ps-border)] hover:border-[var(--ps-neon-cyan)] hover:text-[var(--ps-neon-cyan)] text-[var(--ps-text-primary)] transition-all cursor-pointer flex-1"
                >
                  <RiGitRepositoryLine className="w-3.5 h-3.5" />
                  <span>{lang === "zh" ? "源码仓库" : "GitHub Repo"}</span>
                </button>

                <button
                  onClick={() => navigate(`/skill/${pick.detailSlug}`)}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--ps-neon-cyan)]/10 text-[var(--ps-neon-cyan)] border border-[var(--ps-neon-cyan)]/25 hover:bg-[var(--ps-neon-cyan)] hover:text-black transition-all cursor-pointer flex-1"
                >
                  <span>{lang === "zh" ? "技能详情" : "Skill Detail"}</span>
                  <RiExternalLinkLine className="w-3 h-3 opacity-60" />
                </button>

                {pick.skillId != null && (
                  <button
                    onClick={() => pick.skillId != null && toggleFavorite(pick.skillId)}
                    className="flex items-center justify-center p-2 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 border"
                    style={{
                      background: saved ? "rgba(56,189,248,0.12)" : "var(--ps-bg-elevated)",
                      color: saved ? "var(--ps-neon-cyan)" : "var(--ps-text-muted)",
                      borderColor: saved ? "rgba(56,189,248,0.3)" : "var(--ps-border)",
                    }}
                    title={saved ? "Remove from saved" : "Save to favorites"}
                  >
                    {saved ? (
                      <RiBookmarkFill className="w-3.5 h-3.5" />
                    ) : (
                      <RiBookmarkLine className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
