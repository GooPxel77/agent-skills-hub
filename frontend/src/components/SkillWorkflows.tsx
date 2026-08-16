import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiServerLine,
  RiSparklingLine,
  RiToolsLine,
  RiCpuLine,
  RiTerminalBoxLine,
  RiPlugLine,
  RiStackLine,
  RiArrowRightLine,
  RiStarFill,
  RiExternalLinkLine,
  RiLightbulbLine,
  RiFocus2Line,
} from "@remixicon/react";
import { useI18n } from "../i18n/I18nContext";
import { supabase } from "../lib/supabase";
import { CATEGORY_GUIDE_MAP, type CategoryMeta } from "../data/categories";

interface WorkflowSkill {
  repo_name: string;
  repo_full_name: string;
  description: string;
  stars: number;
  score: number;
  author_name: string;
}

interface CategoryData {
  id: string;
  meta: CategoryMeta;
  skill_count: number;
  skills: WorkflowSkill[];
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const USE_SUPABASE = !!supabase && !API_BASE;

function getCategoryIcon(iconName: string) {
  switch (iconName) {
    case "server":
      return RiServerLine;
    case "sparkles":
      return RiSparklingLine;
    case "wrench":
      return RiToolsLine;
    case "cpu":
      return RiCpuLine;
    case "code":
      return RiTerminalBoxLine;
    case "puzzle":
      return RiPlugLine;
    default:
      return RiStackLine;
  }
}

async function fetchCategoriesFromSupabase(): Promise<CategoryData[]> {
  if (!supabase) return [];
  const sb = supabase;
  const categories = Object.keys(CATEGORY_GUIDE_MAP);

  // Parallel requests for all categories
  const results = await Promise.all(
    categories.map(async (cat) => {
      const { data: skills, count } = await sb
        .from("skills")
        .select("repo_name,repo_full_name,description,stars,score,quality_score,author_name", {
          count: "exact",
        })
        .eq("category", cat)
        .order("stars", { ascending: false })
        .limit(3);
      return { cat, skills, count };
    })
  );

  const list: CategoryData[] = [];
  for (const { cat, skills, count } of results) {
    const meta = CATEGORY_GUIDE_MAP[cat];
    if (!meta) continue;

    list.push({
      id: cat,
      meta,
      skill_count: count ?? (skills?.length || 0),
      skills: (skills || []).map((s) => ({
        repo_name: s.repo_name,
        repo_full_name: s.repo_full_name,
        description: s.description || "",
        stars: s.stars,
        score: s.score || s.quality_score || 0,
        author_name: s.author_name,
      })),
    });
  }

  list.sort((a, b) => a.meta.sort_order - b.meta.sort_order);
  return list;
}

export function SkillWorkflows() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [activeCatId, setActiveCatId] = useState<string>("mcp-server");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_SUPABASE) {
      fetchCategoriesFromSupabase()
        .then((data) => {
          setCategories(data);
          if (data.length > 0) setActiveCatId(data[0].id);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      fetch(`${API_BASE}/api/workflows`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const mapped = data.map((d: any) => ({
              id: d.id,
              meta: CATEGORY_GUIDE_MAP[d.id] || {
                id: d.id,
                icon: "layers",
                title_zh: d.title_zh || d.id,
                title_en: d.title_en || d.id,
                badge_zh: "生态分类",
                badge_en: "Category",
                scene_zh: d.description_zh || "",
                scene_en: d.description_en || "",
                target_zh: "开发者",
                target_en: "Developers",
                sort_order: 99,
              },
              skill_count: d.skill_count || 0,
              skills: d.skills || [],
            }));
            setCategories(mapped);
            if (mapped.length > 0) setActiveCatId(mapped[0].id);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, []);

  if (loading || categories.length === 0) return null;

  const activeCategory =
    categories.find((c) => c.id === activeCatId) || categories[0];
  const ActiveIcon = getCategoryIcon(activeCategory?.meta.icon || "layers");

  return (
    <section className="mb-10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[var(--ps-neon-cyan)]/10 text-[var(--ps-neon-cyan)] flex items-center justify-center border border-[var(--ps-neon-cyan)]/20">
              <RiStackLine className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-lg font-bold text-[var(--ps-text-primary)]">
              {t("categoryGuide.title")}
            </h2>
          </div>
          <p className="text-xs text-[var(--ps-text-secondary)] mt-0.5 ml-8">
            {t("categoryGuide.subtitle")}
          </p>
        </div>

        <button
          onClick={() => navigate("/?tab=explore")}
          className="text-xs font-medium text-[var(--ps-neon-cyan)] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          <span>{lang === "zh" ? "进入全部筛选检索" : "Open Full Explorer"}</span>
          <RiArrowRightLine className="w-3 h-3" />
        </button>
      </div>

      {/* Compact Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4">
        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.meta.icon);
          const isActive = cat.id === activeCatId;
          const title = lang === "zh" ? cat.meta.title_zh : cat.meta.title_en;
          const tooltip = lang === "zh" ? cat.meta.scene_zh : cat.meta.scene_en;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCatId(cat.id)}
              title={tooltip}
              className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 shrink-0 cursor-pointer border ${
                isActive
                  ? "bg-[var(--ps-bg-elevated)] border-[var(--ps-neon-cyan)] text-[var(--ps-text-primary)] shadow-[0_0_15px_rgba(56,189,248,0.1)]"
                  : "bg-[var(--ps-bg-card)] border-[var(--ps-border)] text-[var(--ps-text-secondary)] hover:border-[var(--ps-border-strong)] hover:text-[var(--ps-text-primary)]"
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive
                    ? "text-[var(--ps-neon-cyan)]"
                    : "text-[var(--ps-text-muted)] group-hover:text-[var(--ps-text-secondary)]"
                }`}
              />
              <span className="font-semibold">{title}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  isActive
                    ? "bg-[var(--ps-neon-cyan)]/20 text-[var(--ps-neon-cyan)]"
                    : "bg-[rgba(255,255,255,0.05)] text-[var(--ps-text-muted)]"
                }`}
              >
                {cat.skill_count >= 1000
                  ? `${(cat.skill_count / 1000).toFixed(1)}k`
                  : cat.skill_count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Category Selection Guide & Plain Language Context Card */}
      {activeCategory && (
        <div className="p-4 sm:p-5 rounded-2xl border border-[var(--ps-border)] bg-[var(--ps-bg-card)] hover:border-[var(--ps-border-strong)] transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--ps-border)]/60 mb-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[var(--ps-neon-cyan)]/10 text-[var(--ps-neon-cyan)] border border-[var(--ps-neon-cyan)]/20 flex items-center justify-center shrink-0 mt-0.5">
                <ActiveIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-[var(--ps-text-primary)]">
                    {lang === "zh"
                      ? activeCategory.meta.title_zh
                      : activeCategory.meta.title_en}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-md border border-[var(--ps-neon-cyan)]/30 bg-[var(--ps-neon-cyan)]/10 text-[var(--ps-neon-cyan)] font-medium">
                    {lang === "zh"
                      ? activeCategory.meta.badge_zh
                      : activeCategory.meta.badge_en}
                  </span>
                  <span className="text-xs text-[var(--ps-text-muted)] font-mono">
                    {activeCategory.skill_count.toLocaleString()}{" "}
                    {lang === "zh" ? "个已收录技能" : "skills indexed"}
                  </span>
                </div>

                {/* 1-Sentence Plain Language Scenario Guide */}
                <p className="text-xs sm:text-sm text-[var(--ps-text-primary)] font-medium mt-1.5 leading-relaxed flex items-center gap-1.5">
                  <span className="text-[var(--ps-neon-amber)] font-bold shrink-0 flex items-center gap-1">
                    <RiLightbulbLine className="w-3.5 h-3.5" />
                    <span>{t("categoryGuide.bestFor")}:</span>
                  </span>
                  <span>
                    {lang === "zh"
                      ? activeCategory.meta.scene_zh
                      : activeCategory.meta.scene_en}
                  </span>
                </p>

                {/* Target Audience */}
                <p className="text-xs text-[var(--ps-text-muted)] mt-1 flex items-center gap-1.5">
                  <span className="font-medium text-[var(--ps-text-secondary)] flex items-center gap-1">
                    <RiFocus2Line className="w-3.5 h-3.5 text-[var(--ps-neon-cyan)]" />
                    <span>{t("categoryGuide.targetAudience")}:</span>
                  </span>
                  <span>
                    {lang === "zh"
                      ? activeCategory.meta.target_zh
                      : activeCategory.meta.target_en}
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Filter Action Button */}
            <button
              onClick={() =>
                navigate(`/?tab=explore&category=${activeCategory.id}`)
              }
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--ps-neon-cyan)]/10 text-[var(--ps-neon-cyan)] border border-[var(--ps-neon-cyan)]/25 hover:bg-[var(--ps-neon-cyan)] hover:text-black transition-all cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
            >
              <span>
                {t("categoryGuide.browseAll").replace(
                  "{count}",
                  activeCategory.skill_count.toLocaleString()
                )}
              </span>
              <RiExternalLinkLine className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Top Ranked Representative Skills Grid (Compact 3-item) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-[var(--ps-text-muted)] uppercase tracking-wide">
                {t("categoryGuide.topSamples")}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {activeCategory.skills.map((skill) => (
                <div
                  key={skill.repo_full_name}
                  onClick={() => navigate(`/skill/${skill.repo_full_name}`)}
                  className="group p-3 rounded-xl border border-[var(--ps-border)]/70 bg-[var(--ps-bg-elevated)] hover:border-[var(--ps-neon-cyan)]/40 hover:bg-[var(--ps-bg-card-hover)] transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-[var(--ps-text-primary)] group-hover:text-[var(--ps-neon-cyan)] transition-colors truncate">
                        {skill.repo_name}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--ps-neon-amber)] flex items-center gap-0.5 shrink-0">
                        <RiStarFill className="w-3 h-3 text-[var(--ps-neon-amber)]" />
                        {skill.stars >= 1000
                          ? `${(skill.stars / 1000).toFixed(1)}k`
                          : skill.stars}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--ps-text-secondary)] line-clamp-2 leading-tight">
                      {skill.description || "No description provided."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--ps-border)]/40 text-[10px] text-[var(--ps-text-muted)]">
                    <span className="truncate">@{skill.author_name}</span>
                    <span className="text-[var(--ps-neon-green)] font-mono font-semibold">
                      Score {Math.round(skill.score)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
