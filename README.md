# Agent Skills Hub

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Sync Status](https://img.shields.io/badge/Sync-Auto--Every--8h-00f0ff?style=flat-square&logo=github-actions)](https://github.com/postsoma-2050/skills-hub/actions)
[![Indexed Skills](https://img.shields.io/badge/Indexed%20Skills-11.7k%2B-emerald?style=flat-square)](https://github.com/postsoma-2050/skills-hub)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TypeScript%20%7C%20Tailwind%20v4-61dafb?style=flat-square&logo=react)](frontend/)
[![Backend](https://img.shields.io/badge/Backend-Python%203.12%20%7C%20FastAPI-3776ab?style=flat-square&logo=fastapi)](backend/)
[![Icons](https://img.shields.io/badge/Icons-Remix%20Icon-5f43b2?style=flat-square)](https://remixicon.com)
[![GEO Feed](https://img.shields.io/badge/GEO%20Feed-llms.txt-orange?style=flat-square)](frontend/public/llms.txt)

**Autonomous AI Agent Skills, MCP Servers & Production Toolchains Registry**

*An automated discovery, multi-dimensional quality scoring, and compatibility platform for the open-source AI agent ecosystem.*

[English](README.md) · [简体中文](#-简体中文介绍) · [Live Demo](https://postsoma-2050.github.io/skills-hub/) · [GEO Feed (llms.txt)](https://postsoma-2050.github.io/skills-hub/llms.txt)

</div>

---

## 🌟 Key Highlights & Advantages

- 🔄 **8-Hour Automated Global Crawling & Sync**: Continuously indexes **11,700+ GitHub repositories** across the global AI ecosystem. Automated 6-phase pipeline cleanses, deduplicates, and snapshots trends every 8 hours.
- 🛡️ **8-Dimensional Quality & Reuse Scoring (0–100)**: Eliminates raw star bias by evaluating repository completeness, README structure, prompt clarity, example quality, execution safety, and agent readiness.
- 💡 **Plain-Language Scenario Guidance**: Translates complex technical architectures into 1-sentence plain-language selection rationales tailored for developers, researchers, and prompt engineers.
- 🧩 **Production Stacks & Recipes**: Ready-to-use toolchain pipelines with one-click configuration snippets for Cursor, Claude Code, Windsurf, OpenClaw, and Cline.
- 🤖 **Top 3 Autonomous Agents Focus**: Dedicated architectural picks and selection criteria for industry-leading autonomous engines (`openclaw`, `hermes-agent`, `pi`).
- 🌐 **GEO & AI Machine-Readable Feeds**: Native support for Generative Engine Optimization (`/llms.txt`, `/llms-full.txt`, and Schema.org JSON-LD) enabling direct indexing by LLMs and search engines.
- 🎨 **Modern Tech UI/UX**: Built with React 19, Tailwind CSS v4, Remix Icon system, full internationalization (EN/ZH), and smooth responsive dark mode.

---

## 🏗️ System Architecture & Workflow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Data Pipeline (Every 8h)                        │
└────────────────────────────────────────────────────────────────────────┘
  1. Discovery     ──▸ Search GitHub API (mcp-server, claude-skill, tools)
  2. Curated Lists ──▸ Ingest data/curated/*.txt (verified repositories)
  3. Enrichment    ──▸ Fetch README, commit velocity, release tags & stats
  4. Scoring       ──▸ Compute 8-dimension quality score & Reuse Score (0-100)
  5. Taxonomy      ──▸ Classify into MCP, Claude, Codex, Agent Tool, Plugin
  6. Storage       ──▸ Upsert into Supabase (PostgreSQL) / SQLite

┌────────────────────────────────────────────────────────────────────────┐
│                        Presentation & Feeds                            │
└────────────────────────────────────────────────────────────────────────┘
  • Web Interface  ──▸ Flow Stream (New / Trending / Most Stars)
  • Scenario Guide ──▸ Plain-Language Protocol Decision Guide
  • Recipes        ──▸ Production Toolchain Stacks (Cursor / Claude Code)
  • Machine Feeds  ──▸ /llms.txt · /llms-full.txt · /sitemap.xml · RSS 2.0
```

---

## 📂 Protocol & Category Taxonomy

| Category | Icon | Protocol / Type | Best For | Target Audience |
| :--- | :---: | :--- | :--- | :--- |
| **MCP Servers** | `RiServerLine` | Model Context Protocol | Direct tool & data integration with Claude Desktop, Cursor & Windsurf | Claude / Cursor users, tool integrators |
| **Claude & Codex Skills** | `RiSparklingLine` | Prompts & Engineering Rules | Injecting expert instructions, refactoring rules, and engineering specs | Full-stack devs, Prompt engineers |
| **Agent Tools & Frameworks** | `RiToolsLine` | Autonomous Core & Harness | Multi-agent orchestration, execution sandboxes, CLIs & observability | Agent devs, AI system architects |
| **Automation Scripts** | `RiCpuLine` | Scheduled Pipelines | Lightweight background cron jobs, social media publishing & scrapers | Indie hackers, automation geeks |
| **Codex Skills** | `RiTerminalBoxLine` | Code Synthesis Context | Language-specific test generation and legacy migration templates | Refactoring & migration devs |
| **LLM Plugins** | `RiPlugLine` | Client Addons | Standard chat client add-ons (web browsing, PDF/DOCX parsers) | Chat client users, knowledge managers |

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **Python**: v3.12+
- **Git**: Installed and configured

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Configure GITHUB_TOKEN and ADMIN_TOKEN in .env
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Default runs against local backend at http://localhost:8000
npm run dev
```

### 4. Run Sync Locally
```bash
cd backend
python sync_runner.py
```

---

## ⚡ Production Deployment (CI/CD)

### GitHub Secrets Configuration
Under your repository **Settings → Secrets and variables → Actions**, configure:

| Secret | Description |
| :--- | :--- |
| `GH_TOKEN` | GitHub Personal Access Token with `public_repo` scope |
| `SUPABASE_DB_URL` | PostgreSQL transaction pooler URI from Supabase |
| `VITE_SUPABASE_URL` | Supabase Project API URL (`https://xxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anon Public API Key |

### Workflows
- **`sync.yml`**: Triggers every 8 hours or upon pushes to `data/curated/*.txt` to pull, cleanse, and score repositories.
- **`deploy.yml`**: Compiles frontend assets and automatically deploys to GitHub Pages.

---

## 📡 REST API & GEO Endpoints

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/skills` | `GET` | Paginated search, category filtering, and sorting |
| `/api/skills/{id}` | `GET` | Skill detail, quality breakdown & compatible toolchains |
| `/api/trending` | `GET` | Star velocity & rising momentum leaders (7-day window) |
| `/api/top-rated` | `GET` | Highest quality scored skills |
| `/api/submit-skill` | `POST` | Community repository submission |
| `/llms.txt` | `GET` | GEO index feed formatted for LLM consumption |
| `/llms-full.txt` | `GET` | Full manifest schema for AI Agents & Search Engines |

---

## 🇨🇳 简体中文介绍

### 关于 Agent Skills Hub
**Agent Skills Hub** 是一个针对开源 AI Agent 技能、MCP 服务器、Prompt 规则与自主 Agent 框架的自动化索引、多维工程评分与实战落地平台。

### 核心价值与特色
1. **8 小时全自动全网抓取与增量同步**：收录 11,700+ GitHub 开源项目，定时清洗入库。
2. **8 维质量工程评分体系（0–100）**：杜绝盲信 Stars 数量，从代码完整度、README 规范度、适配性等维度综合打分。
3. **选型白话指引**：将晦涩技术名词提炼为一句话使用场景与适用对象，降低选型门槛。
4. **实战落地配方（Recipes）**：提供面向 Cursor / Claude Code / OpenClaw 的一键复制流水线搭配方案。
5. **三大自主 Agent 聚焦**：针对全能个人助理（`openclaw`）、深度推理研究（`hermes-agent`）、极简流式交互（`pi`）提供选型解析。
6. **GEO 机器友好标准**：支持 `/llms.txt`、`/llms-full.txt` 与 Schema.org 元数据，便于大模型和搜索引擎直接索引。
7. **现代化交互与视觉设计**：采用 Remix Icon 图标规范、Tailwind CSS v4 与中英双语国际化（i18n）。

---

## 📄 License

Distributed under the [MIT License](LICENSE). Built and maintained by [postsoma-2050](https://github.com/postsoma-2050).
