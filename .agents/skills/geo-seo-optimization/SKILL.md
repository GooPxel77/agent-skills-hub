---
name: geo-seo-optimization
description: Standardized framework and best practices for Generative Engine Optimization (GEO) and Search Engine Optimization (SEO) in web applications and AI Agent hubs.
---

# GEO & SEO Optimization Skill

This skill documents the rules, architecture, structured data schemas, machine-reading standards (`llms.txt`), and E-E-A-T guidelines for optimizing web platforms for both search engines (SEO) and Large Language Models (GEO).

## 1. AI Crawler Access Control (`robots.txt`)

Websites must explicitly grant full access to mainstream AI web crawlers to maximize inclusion in AI synthesis engines (ChatGPT, Perplexity, Claude, Gemini, Apple Intelligence, ByteDance, etc.).

### Standard AI User-Agents to Allow
- `GPTBot` (OpenAI training & indexing)
- `OAI-SearchBot` (OpenAI web search)
- `ClaudeBot` & `anthropic-ai` (Anthropic Claude)
- `PerplexityBot` (Perplexity AI)
- `Google-Extended` (Google AI / Gemini)
- `Applebot-Extended` (Apple Intelligence)
- `Amazonbot` (Amazon AI)
- `Bytespider` (ByteDance AI)
- `CCBot` (Common Crawl)
- `Diffbot` (Diffbot web graph)
- `Meta-ExternalAgent` (Meta AI)

### Rules Specification
```txt
User-agent: *
Allow: /
Disallow: /admin/

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: Bytespider
Allow: /

User-agent: CCBot
Allow: /

User-agent: Diffbot
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

Sitemap: https://www.205055.xyz/sitemap.xml
```

---

## 2. LLM Machine Feed Feeds (`llms.txt` & `llms-full.txt`)

To facilitate zero-latency retrieval by LLMs, provide structured Markdown knowledge feeds under `/public`.

- **`public/llms.txt`**: High-level Markdown index containing metadata, platform topography, core categories, and entry points.
- **`public/llms-full.txt`**: Comprehensive technical manifest with detailed resource attributes, API/RPC usage patterns, dataset statistics, E-E-A-T methodology, and academic citation formats.

---

## 3. Rich JSON-LD Structured Data (Schema.org)

Structured data enables search engines to display rich cards and AI engines to extract semantic facts.

### Primary Schema Types
1. **`WebSite` + `SearchAction`**: Placed on the root layout (`index.html` / `RootLayout`).
   ```json
   {
     "@context": "https://schema.org",
     "@type": "WebSite",
     "name": "Agent Skills Hub",
     "url": "https://www.205055.xyz/",
     "potentialAction": {
       "@type": "SearchAction",
       "target": {
         "@type": "EntryPoint",
         "urlTemplate": "https://www.205055.xyz/?tab=explore&search={search_term_string}"
       },
       "query-input": "required name=search_term_string"
     }
   }
   ```
2. **`Organization`**: Details brand authorship, official repository, and site owner.
3. **`SoftwareApplication` / `SoftwareSourceCode`**: Placed on skill detail pages with fields like `name`, `operatingSystem`, `applicationCategory`, `downloadUrl`, `license`, `aggregateRating` / adoption stars.
4. **`BreadcrumbList`**: Placed on category and item detail pages.
5. **`FAQPage`**: Embeds pre-answered questions regarding licensing, deployment, compatibility, and usage.

---

## 4. E-E-A-T Authority Framework

Google and AI engines evaluate sites based on **Experience, Expertise, Authoritativeness, and Trustworthiness**.

### Requirements
- **`/about` Page**: Must state the platform mission, data collection methodology, quality filtering criteria, privacy commitments, and contact/maintenance information.
- **Academic & Media Citation Guide**: Provide copyable BibTeX, APA, and IEEE citation formats so researchers and LLM benchmark authors can properly cite the site as an authoritative repository.
- **Header & Footer Signals**: Include direct links to `/about`, `llms.txt`, `llms-full.txt`, and `sitemap.xml`.

---

## 5. Technical Verification & Auditing Checklist

- [ ] All `<loc>` tags in `sitemap.xml` match canonical primary domain (`https://www.205055.xyz`).
- [ ] No mixed HTTP/HTTPS or non-www/www canonical mismatches.
- [ ] All JSON-LD scripts validate cleanly via schema validators.
- [ ] `npm run build` completes with zero TypeScript or build errors.
