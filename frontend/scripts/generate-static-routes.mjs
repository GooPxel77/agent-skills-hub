import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, '../dist');
const indexPath = join(distDir, 'index.html');
const SITE = 'https://www.205055.xyz';

function esc(s) {
  if (!s) return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildRouteHtml(baseHtml, { title, description, canonicalUrl, ogType = 'website' }) {
  let html = baseHtml;
  if (title) {
    html = html.replace(/<title>.*?<\/title>/i, `<title>${esc(title)}</title>`);
    html = html.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${esc(title)}" />`);
    html = html.replace(/<meta name="twitter:title" content=".*?" \/>/i, `<meta name="twitter:title" content="${esc(title)}" />`);
  }
  if (description) {
    html = html.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${esc(description)}" />`);
    html = html.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${esc(description)}" />`);
    html = html.replace(/<meta name="twitter:description" content=".*?" \/>/i, `<meta name="twitter:description" content="${esc(description)}" />`);
  }
  if (canonicalUrl) {
    html = html.replace(/<link rel="canonical" href=".*?" \/>/i, `<link rel="canonical" href="${esc(canonicalUrl)}" />`);
    html = html.replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${esc(canonicalUrl)}" />`);
  }
  if (ogType) {
    html = html.replace(/<meta property="og:type" content=".*?" \/>/i, `<meta property="og:type" content="${ogType}" />`);
  }
  return html;
}

function run() {
  if (!existsSync(indexPath)) {
    console.error('dist/index.html not found! Run vite build first.');
    process.exit(1);
  }

  const baseHtml = readFileSync(indexPath, 'utf-8');

  // 1. /about
  const aboutDir = join(distDir, 'about');
  mkdirSync(aboutDir, { recursive: true });
  writeFileSync(
    join(aboutDir, 'index.html'),
    buildRouteHtml(baseHtml, {
      title: 'About & E-E-A-T Authority Center - Agent Skills Hub',
      description: 'Discover Agent Skills Hub\'s mission, data quality benchmarks, AI crawler indexing feeds (llms.txt), and academic citation guidelines for AI agent tool research.',
      canonicalUrl: `${SITE}/about`,
      ogType: 'article'
    })
  );
  console.log('✅ Generated static /about/index.html');

  // 2. /compare
  const compareDir = join(distDir, 'compare');
  mkdirSync(compareDir, { recursive: true });
  writeFileSync(
    join(compareDir, 'index.html'),
    buildRouteHtml(baseHtml, {
      title: 'Compare AI Agent Skills & MCP Servers - Agent Skills Hub',
      description: 'Side-by-side comparison of AI Agent skills, tools, and MCP servers on Agent Skills Hub.',
      canonicalUrl: `${SITE}/compare`,
      ogType: 'website'
    })
  );
  console.log('✅ Generated static /compare/index.html');
}

run();
