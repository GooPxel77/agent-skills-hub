export interface Platform {
  name: string;
  url: string;
  tag_zh: string;
  tag_en: string;
  description_zh: string;
  description_en: string;
  icon: "globe" | "github" | "store";
}

export const platforms: Platform[] = [
  {
    name: "Skills.sh",
    url: "https://skills.sh/",
    tag_zh: "生态索引",
    tag_en: "Registry",
    description_zh: "全网 Agent 技能索引与生态发现平台，实时追踪发布动态与流行趋势。",
    description_en: "Agent skill directory and ecosystem index tracking the latest releases and trends.",
    icon: "globe",
  },
  {
    name: "Everything Claude Code (ECC)",
    url: "https://github.com/affaan-m/ECC",
    tag_zh: "Harness 调优体系",
    tag_en: "Harness Framework",
    description_zh: "Claude Code / Cursor 性能调优与 Agent Harness 体系，涵盖技能、直觉与安全规范。",
    description_en: "The agent harness performance optimization system · Skills, instincts & memory for Claude Code, Cursor & beyond.",
    icon: "github",
  },
  {
    name: "SkillsMP",
    url: "https://skillsmp.com/zh",
    tag_zh: "多语言市场",
    tag_en: "Marketplace",
    description_zh: "全球多语言 Agent 技能交易与精选市场，汇集丰富的开箱即用扩展套件。",
    description_en: "Global multi-language Agent skill marketplace with curated ready-to-use packages.",
    icon: "store",
  },
];
