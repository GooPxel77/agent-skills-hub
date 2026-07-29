import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { JsonLd } from "../components/JsonLd";
import { useI18n } from "../i18n/I18nContext";
import { 
  ShieldCheck, 
  Cpu, 
  BookOpen, 
  Copy, 
  Check, 
  Bot, 
  ExternalLink,
  Layers,
  Database,
  Award
} from "lucide-react";

export function AboutPage() {
  const { lang } = useI18n();
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const bibtexText = `@misc{agentskillshub2026,
  author = {Agent Skills Hub Contributors},
  title = {Agent Skills Hub: Open Discovery & Indexing Platform for AI Agent Capabilities and MCP Servers},
  year = {2026},
  publisher = {GitHub},
  howpublished = {\\url{https://www.205055.xyz/about}},
  note = {Accessed: 2026-07-29}
}`;

  const apaText = `Agent Skills Hub Contributors. (2026). Agent Skills Hub: Open discovery and indexing platform for AI agent capabilities and MCP servers. Retrieved from https://www.205055.xyz/about`;

  const ieeeText = `Agent Skills Hub Contributors, "Agent Skills Hub: Open Discovery & Indexing Platform for AI Agent Capabilities and MCP Servers," 2026. [Online]. Available: https://www.205055.xyz/about.`;

  const copyToClipboard = (text: string, formatKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(formatKey);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Agent Skills Hub — E-E-A-T & Technical Overview",
    "url": "https://www.205055.xyz/about",
    "description": "Learn about Agent Skills Hub's open indexing platform for AI Agent Skills, Model Context Protocol (MCP) servers, data quality methodology, machine knowledge feeds, and academic citation formats.",
    "publisher": {
      "@type": "Organization",
      "name": "Agent Skills Hub",
      "url": "https://www.205055.xyz/"
    },
    "mainEntity": {
      "@type": "Article",
      "headline": "Agent Skills Hub Architecture & E-E-A-T Standards",
      "author": {
        "@type": "Organization",
        "name": "Agent Skills Hub Team"
      },
      "datePublished": "2026-01-01",
      "dateModified": "2026-07-29"
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--ps-bg-base)", color: "var(--ps-text-primary)" }}>
      <Helmet>
        <title>About & E-E-A-T Authority Center - Agent Skills Hub</title>
        <meta name="description" content="Discover Agent Skills Hub's mission, data quality benchmarks, AI crawler indexing feeds (llms.txt), and academic citation guidelines for AI agent tool research." />
        <link rel="canonical" href="https://www.205055.xyz/about" />
        <meta property="og:title" content="About Agent Skills Hub — E-E-A-T & Technical Overview" />
        <meta property="og:description" content="Discover Agent Skills Hub's mission, data quality benchmarks, AI crawler indexing feeds (llms.txt), and academic citation guidelines." />
        <meta property="og:url" content="https://www.205055.xyz/about" />
        <meta property="og:type" content="article" />
      </Helmet>

      <JsonLd data={aboutSchema} />

      <SiteHeader breadcrumb={[{ label: lang === "zh" ? "关于我们" : "About Us" }]} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 sm:py-14 space-y-12">
        {/* Hero Banner */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
               style={{ background: "rgba(0, 240, 255, 0.1)", color: "var(--ps-neon-cyan)", border: "1px solid rgba(0, 240, 255, 0.2)" }}>
            <ShieldCheck className="w-3.5 h-3.5" />
            {lang === "zh" ? "权威与 E-E-A-T 质量认证" : "E-E-A-T & Authority Center"}
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight ps-neon-text">
            {lang === "zh" ? "关于 Agent Skills Hub" : "About Agent Skills Hub"}
          </h1>
          <p className="text-base sm:text-lg leading-relaxed" style={{ color: "var(--ps-text-secondary)" }}>
            {lang === "zh"
              ? "Agent Skills Hub 是全球领先的开源 AI Agent 技能、Model Context Protocol (MCP) 服务端与开发者工具自动化索引与发现平台。"
              : "Agent Skills Hub is a global open-source discovery platform and automated index for AI Agent Skills, Model Context Protocol (MCP) servers, and agentic developer integrations."}
          </p>
        </section>

        {/* E-E-A-T Pillar Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border space-y-3 transition-all hover:border-[var(--ps-neon-cyan)]"
               style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(79, 70, 229, 0.15)", color: "#818cf8" }}>
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">
              {lang === "zh" ? "91,000+ 仓库索引" : "91,000+ Indexed Repos"}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--ps-text-secondary)" }}>
              {lang === "zh"
                ? "持续扫描 GitHub 全球开源生态，筛选 8,700+ 高质量结构化 Agent 工具，每 8 小时自动增量同步。"
                : "Continuously scans global open-source ecosystems, curating 8,700+ high-quality agent tools auto-synced every 8 hours."}
            </p>
          </div>

          <div className="p-6 rounded-xl border space-y-3 transition-all hover:border-[var(--ps-neon-cyan)]"
               style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">
              {lang === "zh" ? "透明的质量评级算法" : "Transparent Quality Score"}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--ps-text-secondary)" }}>
              {lang === "zh"
                ? "依据 Star 趋势、Fork 活跃度、Commit 频率、文档完整度及 License 许可等多维指标综合计算评分。"
                : "Normalized 0–100 quality scoring derived from community stars, commit velocity, documentation depth, and SPDX licensing."}
            </p>
          </div>

          <div className="p-6 rounded-xl border space-y-3 transition-all hover:border-[var(--ps-neon-cyan)]"
               style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" }}>
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">
              {lang === "zh" ? "零延迟 LLM 机器索引" : "Zero-Latency LLM Feeds"}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--ps-text-secondary)" }}>
              {lang === "zh"
                ? "原生提供 `llms.txt` 与 `llms-full.txt`，支持 ChatGPT, Perplexity, Claude 零编译抓取并直接引用。"
                : "Natively provides `llms.txt` and `llms-full.txt` feeds designed for instant ingestion by ChatGPT, Perplexity, and Claude."}
            </p>
          </div>
        </section>

        {/* Section: Machine Feeds Directory */}
        <section className="p-6 sm:p-8 rounded-2xl border space-y-6" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
          <div className="flex items-center gap-3">
            <Cpu className="w-6 h-6" style={{ color: "var(--ps-neon-cyan)" }} />
            <h2 className="text-xl sm:text-2xl font-bold">
              {lang === "zh" ? "机器知识喂料与 AI 索引入口 (GEO Center)" : "Machine Feeds & AI Index Directory"}
            </h2>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--ps-text-secondary)" }}>
            {lang === "zh"
              ? "我们积极拥抱生成式引擎优化 (GEO)。以下为供大语言模型（LLM）与搜索引擎爬虫直接读取的标准化文本入口："
              : "We fully support Generative Engine Optimization (GEO). Below are structured text entry points designed for direct ingestion by Large Language Models and search crawlers:"}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a href="/llms.txt" target="_blank" rel="noopener noreferrer" 
               className="p-4 rounded-xl border flex flex-col justify-between hover:border-[var(--ps-neon-cyan)] transition-all group"
               style={{ background: "var(--ps-bg-base)", borderColor: "var(--ps-border)" }}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-bold text-[var(--ps-neon-cyan)]">/llms.txt</span>
                  <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs" style={{ color: "var(--ps-text-muted)" }}>
                  {lang === "zh" ? "精简版 Markdown 目录与核心索引 Map" : "Concise Markdown directory and category mapping"}
                </p>
              </div>
              <span className="text-xs font-semibold mt-3 text-[var(--ps-neon-cyan)]">View File &rarr;</span>
            </a>

            <a href="/llms-full.txt" target="_blank" rel="noopener noreferrer" 
               className="p-4 rounded-xl border flex flex-col justify-between hover:border-[var(--ps-neon-cyan)] transition-all group"
               style={{ background: "var(--ps-bg-base)", borderColor: "var(--ps-border)" }}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-bold text-[var(--ps-neon-cyan)]">/llms-full.txt</span>
                  <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs" style={{ color: "var(--ps-text-muted)" }}>
                  {lang === "zh" ? "包含 Schema、API 及 E-E-A-T 的全量 Manifest" : "Complete technical manifest with schemas and quality gates"}
                </p>
              </div>
              <span className="text-xs font-semibold mt-3 text-[var(--ps-neon-cyan)]">View File &rarr;</span>
            </a>

            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" 
               className="p-4 rounded-xl border flex flex-col justify-between hover:border-[var(--ps-neon-cyan)] transition-all group"
               style={{ background: "var(--ps-bg-base)", borderColor: "var(--ps-border)" }}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-bold text-[var(--ps-neon-cyan)]">/sitemap.xml</span>
                  <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs" style={{ color: "var(--ps-text-muted)" }}>
                  {lang === "zh" ? "分层 XML Sitemap 索引与全站 Index" : "Layered XML sitemap index for search crawlers"}
                </p>
              </div>
              <span className="text-xs font-semibold mt-3 text-[var(--ps-neon-cyan)]">View File &rarr;</span>
            </a>
          </div>
        </section>

        {/* Section: Academic & Media Citation Guide */}
        <section className="p-6 sm:p-8 rounded-2xl border space-y-6" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6" style={{ color: "var(--ps-neon-cyan)" }} />
            <h2 className="text-xl sm:text-2xl font-bold">
              {lang === "zh" ? "学术与媒体引用规范 (Citation Guide)" : "Academic & Media Citation Guide"}
            </h2>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--ps-text-secondary)" }}>
            {lang === "zh"
              ? "如果您在学术论文、技术报告、LLM Benchmark 测试或新闻报道中引用 Agent Skills Hub 的数据与工具目录，请使用以下标准引用格式："
              : "If you cite data, metrics, or tool listings from Agent Skills Hub in research papers, technical reports, or AI benchmark evaluations, please use standard citation formats below:"}
          </p>

          <div className="space-y-4">
            {/* BibTeX */}
            <div className="p-4 rounded-xl border space-y-2" style={{ background: "var(--ps-bg-base)", borderColor: "var(--ps-border)" }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--ps-neon-cyan)]">BibTeX</span>
                <button onClick={() => copyToClipboard(bibtexText, "bibtex")} 
                        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-[var(--bg-surface)] border border-[var(--ps-border)] hover:border-[var(--ps-neon-cyan)] transition-colors cursor-pointer">
                  {copiedFormat === "bibtex" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedFormat === "bibtex" ? (lang === "zh" ? "已复制" : "Copied") : (lang === "zh" ? "复制 BibTeX" : "Copy BibTeX")}
                </button>
              </div>
              <pre className="text-xs font-mono overflow-x-auto p-3 rounded bg-black/40 text-slate-300">
                {bibtexText}
              </pre>
            </div>

            {/* APA & IEEE Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border space-y-2" style={{ background: "var(--ps-bg-base)", borderColor: "var(--ps-border)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--ps-neon-cyan)]">APA Format</span>
                  <button onClick={() => copyToClipboard(apaText, "apa")} 
                          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-[var(--bg-surface)] border border-[var(--ps-border)] hover:border-[var(--ps-neon-cyan)] transition-colors cursor-pointer">
                    {copiedFormat === "apa" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedFormat === "apa" ? (lang === "zh" ? "已复制" : "Copied") : (lang === "zh" ? "Copy APA" : "Copy APA")}
                  </button>
                </div>
                <p className="text-xs font-mono p-3 rounded bg-black/40 text-slate-300 leading-relaxed">
                  {apaText}
                </p>
              </div>

              <div className="p-4 rounded-xl border space-y-2" style={{ background: "var(--ps-bg-base)", borderColor: "var(--ps-border)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--ps-neon-cyan)]">IEEE Format</span>
                  <button onClick={() => copyToClipboard(ieeeText, "ieee")} 
                          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-[var(--bg-surface)] border border-[var(--ps-border)] hover:border-[var(--ps-neon-cyan)] transition-colors cursor-pointer">
                    {copiedFormat === "ieee" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedFormat === "ieee" ? (lang === "zh" ? "已复制" : "Copied") : (lang === "zh" ? "Copy IEEE" : "Copy IEEE")}
                  </button>
                </div>
                <p className="text-xs font-mono p-3 rounded bg-black/40 text-slate-300 leading-relaxed">
                  {ieeeText}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Ethical AI & Privacy Statement */}
        <section className="p-6 sm:p-8 rounded-2xl border space-y-4" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
          <div className="flex items-center gap-3">
            <Layers className="w-6 h-6" style={{ color: "var(--ps-neon-cyan)" }} />
            <h2 className="text-xl sm:text-2xl font-bold">
              {lang === "zh" ? "隐私声明与开源伦理 Commitments" : "Privacy & Open-Source Ethics"}
            </h2>
          </div>
          <div className="text-sm leading-relaxed space-y-3" style={{ color: "var(--ps-text-secondary)" }}>
            <p>
              {lang === "zh"
                ? "Agent Skills Hub 严格遵守开源许可（MIT, Apache-2.0, BSD 等），仅采集 GitHub 公开仓库元数据及 Readme 说明文档。我们不存储任何用户私有代码，亦不收集追踪个人身份信息 (PII)。"
                : "Agent Skills Hub strictly respects open-source licensing (MIT, Apache-2.0, BSD, etc.), only aggregating public GitHub metadata and documentation. We do not store private repository code or collect personally identifiable information (PII)."}
            </p>
            <p>
              {lang === "zh"
                ? "如您是开源项目的原作者并希望更新、分类或补充项目信息，欢迎通过 GitHub Issue 提交反馈或直接提交 Pull Request。"
                : "If you are the author of an open-source tool and wish to update, re-classify, or enhance your listing, please submit feedback via GitHub Issues or PRs."}
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
