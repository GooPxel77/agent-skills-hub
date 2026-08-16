import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiCodeBoxLine,
  RiSearchEyeLine,
  RiShareForwardBoxLine,
  RiDatabase2Line,
  RiCommandLine,
  RiArrowRightLine,
  RiFileCopyLine,
  RiCheckLine,
  RiSparklingLine,
  RiStackLine,
  RiExternalLinkLine,
  RiLightbulbLine,
} from "@remixicon/react";
import { useI18n } from "../i18n/I18nContext";

interface RecipeTool {
  name: string;
  slug: string;
  role_zh: string;
  role_en: string;
}

interface Recipe {
  id: string;
  iconType: "code" | "search" | "share" | "database";
  title_zh: string;
  title_en: string;
  tag_zh: string;
  tag_en: string;
  environment: string;
  summary_zh: string;
  summary_en: string;
  tools: RecipeTool[];
  guide_zh: string;
  guide_en: string;
  snippet: string;
}

const RECIPES: Recipe[] = [
  {
    id: "recipe-code-refactor",
    iconType: "code",
    title_zh: "全自动代码重构与架构审查套件",
    title_en: "Autonomous Code Refactoring & Architecture Review",
    tag_zh: "工程效率",
    tag_en: "Engineering",
    environment: "Cursor / Windsurf / Claude Code",
    summary_zh: "具备本地上下文感知、自动 Git 差异提取与架构规范审查的自主编程闭环。",
    summary_en: "Context-aware autonomous coding loop with Git diff analysis & rule verification.",
    tools: [
      {
        name: "cline",
        slug: "cline/cline",
        role_zh: "Coding Agent 执行器",
        role_en: "Coding Agent Core",
      },
      {
        name: "mcp-server-git",
        slug: "modelcontextprotocol/servers",
        role_zh: "Git 版本控制 MCP",
        role_en: "Git Version Control MCP",
      },
      {
        name: "qiaomu-advisor",
        slug: "joeseesun/qiaomu-design-advisor",
        role_zh: "架构规则与上下文校验",
        role_en: "Architecture Rules Guard",
      },
    ],
    guide_zh: "在 .cursor/mcp.json 挂载 Git MCP 并注入 .cursorrules，驱动 Agent 自动执行 diff 提取、架构审查、自动重构与单元测试闭环。",
    guide_en: "Mount Git MCP in .cursor/mcp.json and set .cursorrules for autonomous diff -> review -> refactor -> test loops.",
    snippet: `// .cursor/mcp.json
{
  "mcpServers": {
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git"]
    }
  }
}`,
  },
  {
    id: "recipe-deep-research",
    iconType: "search",
    title_zh: "深度研究与知识库自动化管道",
    title_en: "Deep Research & Knowledge Ingestion Pipeline",
    tag_zh: "知识工程",
    tag_en: "Knowledge Base",
    environment: "Claude Desktop / CLI",
    summary_zh: "自动化抓取深层动态网页、清洗杂质文档为纯净 Markdown，批量同步至知识库。",
    summary_en: "Automates deep web scraping, transforms multi-format documents into clean Markdown, and syncs to NotebookLM.",
    tools: [
      {
        name: "browser-use",
        slug: "browser-use/browser-use",
        role_zh: "网页智能交互与深层抓取",
        role_en: "Browser Agent Scraper",
      },
      {
        name: "markitdown",
        slug: "microsoft/markitdown",
        role_zh: "文档转纯净 Markdown",
        role_en: "Doc to Markdown Converter",
      },
      {
        name: "notebooklm-sync",
        slug: "joeseesun/anything-to-notebooklm",
        role_zh: "NotebookLM 批量同步",
        role_en: "NotebookLM Importer",
      },
    ],
    guide_zh: "browser-use 交互抓取深层网页，经 markitdown 提取纯净 Markdown 并批量同步至 NotebookLM 生成结构化研报与播客。",
    guide_en: "Scrape deep web via browser-use, convert to Markdown via markitdown, and sync to NotebookLM for auto-reports.",
    snippet: `# 深度抓取与清洗管道
python -m browser_use.agent --query "AI Agent trend"
markitdown research.pdf > clean_notes.md
python -m anything_to_notebooklm --file clean_notes.md`,
  },
  {
    id: "recipe-social-publisher",
    iconType: "share",
    title_zh: "自动化自媒体与多平台内容分发流",
    title_en: "Autonomous Media Publisher & Syndication Flow",
    tag_zh: "内容出海",
    tag_en: "Content Pipeline",
    environment: "GitHub Actions / Python",
    summary_zh: "从海外前沿热点抓取、多版本文案裂变、高美感封面图渲染到一键自动分发。",
    summary_en: "Trend extraction, multi-platform copy generation, SVG cover rendering, and automated publishing.",
    tools: [
      {
        name: "Agent-Reach",
        slug: "Panniantong/Agent-Reach",
        role_zh: "X 行业热点抓取",
        role_en: "X Trend Extractor",
      },
      {
        name: "baoyu-skills",
        slug: "JimLiu/baoyu-skills",
        role_zh: "SVG 封面与长图排版",
        role_en: "SVG Graphic Generator",
      },
      {
        name: "x-article-publisher",
        slug: "joeseesun/qiaomu-x-article-publisher",
        role_zh: "Markdown 长文自动分发",
        role_en: "Longform Publisher",
      },
    ],
    guide_zh: "定时 Actions 抓取海外热点，驱动 LLM 结合 baoyu 模板生成 SVG 封面与长文，Webhook 自动同步至 X 与微信公众号草稿箱。",
    guide_en: "Scheduled Actions extract trends, generate SVG covers with baoyu prompts, and publish via webhooks to X & WeChat.",
    snippet: `# GitHub Actions 定时发帖工作流
name: Auto Media Pipeline
on:
  schedule:
    - cron: '0 1 * * *' # 每日定时自动执行`,
  },
  {
    id: "recipe-db-ops",
    iconType: "database",
    title_zh: "数据库智能运维与安全查询沙箱",
    title_en: "Database Ops & Safe Query Sandbox",
    tag_zh: "系统运维",
    tag_en: "Database Ops",
    environment: "Claude Desktop / Cursor",
    summary_zh: "为数据库赋予自然语言查询、只读权限前置拦截与慢 SQL 自动优化建议。",
    summary_en: "Natural language database querying with read-only guardrails and slow-query optimization.",
    tools: [
      {
        name: "mcp-postgres",
        slug: "modelcontextprotocol/servers",
        role_zh: "PostgreSQL 直连协议",
        role_en: "Postgres Protocol MCP",
      },
      {
        name: "pydantic-ai-guard",
        slug: "vstorm-co/pydantic-ai-todo",
        role_zh: "结构化数据校验与安全拦截",
        role_en: "Safe Schema Validator",
      },
      {
        name: "defuddle-skill",
        slug: "joeseesun/defuddle-skill",
        role_zh: "复杂 SQL 语义解析",
        role_en: "SQL Query Explainer",
      },
    ],
    guide_zh: "Claude Desktop 挂载 Postgres MCP，结合 Pydantic 只读校验守卫拦截写操作，自然语言智能诊断慢查询与生成索引优化方案。",
    guide_en: "Mount Postgres MCP in Claude Desktop with Pydantic read-only guards for safe natural-language SQL queries and index diagnosis.",
    snippet: `// claude_desktop_config.json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://ro_user:pass@localhost:5432/main"]
    }
  }
}`,
  },
];

function getRecipeIcon(iconType: string) {
  switch (iconType) {
    case "code":
      return RiCodeBoxLine;
    case "search":
      return RiSearchEyeLine;
    case "share":
      return RiShareForwardBoxLine;
    case "database":
      return RiDatabase2Line;
    default:
      return RiSparklingLine;
  }
}

export function ScenarioWorkflows() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section className="mb-10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[var(--ps-neon-purple)]/10 text-[var(--ps-neon-purple)] flex items-center justify-center border border-[var(--ps-neon-purple)]/20">
              <RiStackLine className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-lg font-bold text-[var(--ps-text-primary)]">
              {t("recipes.title")}
            </h2>
          </div>
          <p className="text-xs text-[var(--ps-text-secondary)] mt-0.5 ml-8">
            {t("recipes.subtitle")}
          </p>
        </div>

        <span className="text-xs text-[var(--ps-text-muted)] font-mono self-start sm:self-auto">
          {RECIPES.length} Production Recipes
        </span>
      </div>

      {/* Flattened Recipe Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {RECIPES.map((recipe) => {
          const Icon = getRecipeIcon(recipe.iconType);
          const isCopied = copiedId === recipe.id;

          return (
            <div
              key={recipe.id}
              className="p-4 sm:p-5 rounded-2xl border border-[var(--ps-border)] bg-[var(--ps-bg-card)] hover:border-[var(--ps-neon-cyan)]/40 hover:bg-[var(--ps-bg-card-hover)] transition-all duration-200 flex flex-col justify-between shadow-xs group"
            >
              <div>
                {/* Header Row: Icon + Title + Environment Badge */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[var(--ps-neon-cyan)]/10 text-[var(--ps-neon-cyan)] border border-[var(--ps-neon-cyan)]/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[var(--ps-text-primary)] truncate">
                        {lang === "zh" ? recipe.title_zh : recipe.title_en}
                      </h3>
                      <p className="text-xs text-[var(--ps-text-secondary)] line-clamp-1">
                        {lang === "zh" ? recipe.summary_zh : recipe.summary_en}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--ps-bg-elevated)] border border-[var(--ps-border)] text-[10px] font-mono text-[var(--ps-neon-cyan)] shrink-0">
                    <RiCommandLine className="w-2.5 h-2.5" />
                    {recipe.environment.split("/")[0].trim()}
                  </span>
                </div>

                {/* Compact Single-Line Toolchain Flow */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1.5 my-1">
                  <span className="text-[10px] font-semibold text-[var(--ps-text-muted)] uppercase tracking-wider shrink-0 mr-0.5">
                    Flow:
                  </span>
                  {recipe.tools.map((tool, idx) => (
                    <div key={tool.slug} className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => navigate(`/skill/${tool.slug}`)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--ps-bg-elevated)] border border-[var(--ps-border)] hover:border-[var(--ps-neon-cyan)]/50 hover:text-[var(--ps-neon-cyan)] text-[11px] font-medium text-[var(--ps-text-primary)] transition-colors cursor-pointer"
                        title={`${tool.name} — ${lang === "zh" ? tool.role_zh : tool.role_en}`}
                      >
                        <span>{tool.name}</span>
                        <RiExternalLinkLine className="w-2.5 h-2.5 opacity-40" />
                      </button>
                      {idx < recipe.tools.length - 1 && (
                        <RiArrowRightLine className="w-3 h-3 text-[var(--ps-text-muted)] shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Flattened Action & Integration Line (No Heavy Embedded Dark Card) */}
              <div className="pt-2.5 mt-2.5 border-t border-[var(--ps-border)]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs text-[var(--ps-text-secondary)] leading-relaxed flex-1 min-w-0 pr-2">
                  <span className="text-[var(--ps-neon-amber)] font-medium mr-1 inline-flex items-center gap-1">
                    <RiLightbulbLine className="w-3.5 h-3.5" />
                    <span>{t("recipes.guideLabel")}:</span>
                  </span>
                  <span>{lang === "zh" ? recipe.guide_zh : recipe.guide_en}</span>
                </p>

                <button
                  onClick={() => handleCopy(recipe.id, recipe.snippet)}
                  className="flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--ps-neon-cyan)]/10 text-[var(--ps-neon-cyan)] hover:bg-[var(--ps-neon-cyan)] hover:text-black border border-[var(--ps-neon-cyan)]/25 transition-all cursor-pointer shrink-0 self-end sm:self-auto"
                >
                  {isCopied ? (
                    <>
                      <RiCheckLine className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">{t("recipes.copied")}</span>
                    </>
                  ) : (
                    <>
                      <RiFileCopyLine className="w-3 h-3" />
                      <span>{t("recipes.copyConfig")}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
