export interface CategoryMeta {
  id: string;
  icon: string;
  title_zh: string;
  title_en: string;
  badge_zh: string;
  badge_en: string;
  scene_zh: string;
  scene_en: string;
  target_zh: string;
  target_en: string;
  sort_order: number;
}

export const CATEGORY_GUIDE_MAP: Record<string, CategoryMeta> = {
  "mcp-server": {
    id: "mcp-server",
    icon: "server",
    title_zh: "MCP 服务器",
    title_en: "MCP Servers",
    badge_zh: "客户端直连协议",
    badge_en: "Direct Client Protocol",
    scene_zh: "适合 Claude Desktop、Cursor、Windsurf 直连，标准化扩展 AI 读写本地文件、数据库、GitHub 与外部 API 的能力。",
    scene_en: "Ideal for direct integration with Claude Desktop, Cursor & Windsurf; standardizes AI access to local files, databases & external APIs.",
    target_zh: "Claude / Cursor 用户、桌面 AI 助手使用者",
    target_en: "Claude Desktop & Cursor users, AI tool integrators",
    sort_order: 1,
  },
  "claude-skill": {
    id: "claude-skill",
    icon: "sparkles",
    title_zh: "Claude / Codex 技能",
    title_en: "Claude & Codex Skills",
    badge_zh: "编程指令与规则",
    badge_en: "Coding Prompts & Rules",
    scene_zh: "适合注入 AI Coding Agent / Prompt 体系，为代码重构、架构审查与特定框架规范提供专家级指令流。",
    scene_en: "Tailored for AI Coding Agents & prompt systems; provides specialized instruction flows for refactoring, review, and engineering specs.",
    target_zh: "全栈工程师、Prompt 工程师、Claude Code 用户",
    target_en: "Full-stack devs, prompt engineers, Claude Code users",
    sort_order: 2,
  },
  "agent-tool": {
    id: "agent-tool",
    icon: "wrench",
    title_zh: "Agent 框架与工具",
    title_en: "Agent Tools & Frameworks",
    badge_zh: "自主 Agent 构建",
    badge_en: "Autonomous Agent Core",
    scene_zh: "适合开发者搭建自主 Agent 系统，涵盖 Multi-Agent 编排、执行沙箱、CLI 运行器与可观测性套件。",
    scene_en: "Built for developing autonomous agent systems; includes multi-agent orchestration, sandboxes, CLIs & observability suites.",
    target_zh: "Agent 应用开发者、大模型系统架构师",
    target_en: "Agent developers, AI system architects",
    sort_order: 3,
  },
  "ai-skill": {
    id: "ai-skill",
    icon: "cpu",
    title_zh: "自动化脚本",
    title_en: "Automation Scripts",
    badge_zh: "定时管道与发帖",
    badge_en: "Scheduled Pipelines",
    scene_zh: "适合轻量级任务与定时管道，复用于自媒体发帖、舆情研报抓取、每日汇总与跨平台数据同步。",
    scene_en: "Reusable scripts for lightweight tasks & scheduled pipelines, including social media posting, data scraping & daily reports.",
    target_zh: "独立开发者、自媒体运营、日常自动化极客",
    target_en: "Indie hackers, content creators, automation geeks",
    sort_order: 4,
  },
  "codex-skill": {
    id: "codex-skill",
    icon: "code",
    title_zh: "Codex 编程技能",
    title_en: "Codex Skills",
    badge_zh: "代码生成模板",
    badge_en: "Code Synthesis",
    scene_zh: "专为代码生成与单元测试补齐设计，包含细分语言的最佳工程上下文模板与上下文片段。",
    scene_en: "Specialized for code synthesis and test generation, providing refined contextual templates across languages.",
    target_zh: "自动化测试、代码重构与迁移开发者",
    target_en: "Refactoring, testing & code migration devs",
    sort_order: 5,
  },
  "llm-plugin": {
    id: "llm-plugin",
    icon: "puzzle",
    title_zh: "LLM 插件与扩展",
    title_en: "LLM Plugins & Extensions",
    badge_zh: "模型能力外挂",
    badge_en: "Model Addons",
    scene_zh: "适合扩展通用 LLM 客户端功能，快速为大模型接入联网检索、PDF 解析与特定格式转换能力。",
    scene_en: "Extends standard LLM clients with web browsing, document parsing, and file format conversion utilities.",
    target_zh: "Chat 客户端用户、知识库管理者",
    target_en: "Chat client users, knowledge managers",
    sort_order: 6,
  },
};
