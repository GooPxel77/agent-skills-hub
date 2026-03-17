import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { fetchSkills, fetchSkillsByIds } from "../api/client";
import { CategoryFilter } from "../components/CategoryFilter";
import { HeroSection } from "../components/HeroSection";
import { LazySection } from "../components/LazySection";
import { Pagination } from "../components/Pagination";
import { SearchBar } from "../components/SearchBar";
import { SkeletonCards } from "../components/SkeletonCards";
import { SkillCard } from "../components/SkillCard";
import { SkillDetailPanel } from "../components/SkillDetailPanel";
import { SkillTable } from "../components/SkillTable";
import { ScenarioWorkflows } from "../components/ScenarioWorkflows";
import { SkillWorkflows } from "../components/SkillWorkflows";
import { PlatformRecommendations } from "../components/PlatformRecommendations";
import { SortControls } from "../components/SortControls";
import { ViewToggle } from "../components/ViewToggle";
import { SubmitSkill } from "../components/SubmitSkill";
import { NewThisWeek } from "../components/NewThisWeek";
import { FilterSidebar } from "../components/FilterSidebar";
import { SiteHeader } from "../components/SiteHeader";
import { ScrollToTop } from "../components/ScrollToTop";
import { SiteFooter } from "../components/SiteFooter";
import { useI18n } from "../i18n/I18nContext";
import { useUrlParams } from "../hooks/useUrlParams";
import { useStats } from "../hooks/useStats";
import { useLandingData } from "../hooks/useLandingData";
import { useFavorites } from "../hooks/useFavorites";
import type { PaginatedSkills, Skill } from "../types/skill";

export function Home() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { params, tab, setTab, updateParams, setPage } = useUrlParams();
  const { stats, categories } = useStats();
  const { data: landingData } = useLandingData();
  const [view, setView] = useState<"card" | "table">("card");

  // Explore tab data
  const [data, setData] = useState<PaginatedSkills | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch explore data when params change & tab is explore
  useEffect(() => {
    if (tab !== "explore") return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchSkills(params)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [params, tab]);

  // Favorites tab data
  const { favorites } = useFavorites();
  const [favData, setFavData] = useState<Skill[]>([]);
  const [favLoading, setFavLoading] = useState(false);

  // Fetch favorites data when tab is favorites
  useEffect(() => {
    if (tab !== "favorites") return;
    if (favorites.length === 0) {
      setFavData([]);
      return;
    }
    let cancelled = false;
    setFavLoading(true);
    fetchSkillsByIds(favorites)
      .then((result) => {
        if (!cancelled) {
          // Client-side sorting and search
          let sorted = [...result];
          if (params.search) {
            const q = params.search.toLowerCase();
            sorted = sorted.filter(s =>
              s.repo_name.toLowerCase().includes(q) ||
              (s.description || "").toLowerCase().includes(q) ||
              s.author_name.toLowerCase().includes(q)
            );
          }
          if (params.sort_by === "stars") {
            sorted.sort((a, b) => params.sort_order === "asc" ? a.stars - b.stars : b.stars - a.stars);
          } else if (params.sort_by === "score") {
            sorted.sort((a, b) => params.sort_order === "asc" ? a.score - b.score : b.score - a.score);
          } else if (params.sort_by === "last_commit_at") {
            sorted.sort((a, b) => {
              const timeA = a.last_commit_at ? new Date(a.last_commit_at).getTime() : 0;
              const timeB = b.last_commit_at ? new Date(b.last_commit_at).getTime() : 0;
              return params.sort_order === "asc" ? timeA - timeB : timeB - timeA;
            });
          }
          setFavData(sorted);
        }
      })
      .finally(() => {
        if (!cancelled) setFavLoading(false);
      });
    return () => { cancelled = true; };
  }, [favorites, tab, params.search, params.sort_by, params.sort_order]);

  // Skill detail panel (for overview sections)
  const [detailSkill, setDetailSkill] = useState<Skill | null>(null);

  const handleOpenRepo = useCallback((skill: Skill) => {
    window.open(skill.repo_url, "_blank", "noopener");
  }, []);

  const handleShowDetail = useCallback((skill: Skill) => {
    // Navigate using slug (owner/repo) for SEO-friendly URLs
    navigate(`/skill/${skill.repo_full_name}`);
  }, [navigate]);

  const handleNavigateSkill = useCallback(async (skillId: number) => {
    navigate(`/skill/${skillId}`);
  }, [navigate]);

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>My Skills Hub - Personal Agent Skills Collection</title>
        <meta name="description" content="My personal collection of Agent Skills, MCP servers, and AI tools." />
        <meta property="og:title" content="My Skills Hub - Personal Agent Skills Collection" />
        <meta property="og:description" content="My personal collection of Agent Skills, MCP servers, and AI tools." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <SiteHeader showTabs tab={tab} onTabChange={setTab} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Overview Tab */}
        {tab === "overview" && (
          <div className="animate-fade-in-up">
            {/* Hero: headline + search + trending tags + key stats */}
            <HeroSection
              stats={landingData?.stats ?? stats}
              onSearch={(query) => {
                updateParams({ search: query });
                setTab("explore");
              }}
            />
            <div id="new-this-week" className="scroll-mt-44">
              <LazySection>
                <NewThisWeek onShowDetail={handleShowDetail} />
              </LazySection>
            </div>
            <div id="categories" className="scroll-mt-44">
              <LazySection>
                <SkillWorkflows />
              </LazySection>
            </div>
            <div id="scenarios" className="scroll-mt-44">
              <LazySection>
                <ScenarioWorkflows />
              </LazySection>
            </div>
            <div id="discover" className="scroll-mt-44">
              <LazySection>
                <PlatformRecommendations />
              </LazySection>
            </div>
            <div id="add-skill" className="scroll-mt-44">
              <LazySection minHeight="100px">
                <SubmitSkill />
              </LazySection>
            </div>
          </div>
        )}

        {/* Explore Tab */}
        {tab === "explore" && (
          <>
            {/* Top Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
              <div className="w-full sm:w-64">
                <SearchBar
                  value={params.search || ""}
                  onChange={(search) => updateParams({ search })}
                />
              </div>
              <div className="flex items-center gap-3 flex-1">
                <SortControls
                  sortBy={params.sort_by}
                  sortOrder={params.sort_order}
                  onSortByChange={(sort_by) => updateParams({ sort_by })}
                  onSortOrderChange={(sort_order) => updateParams({ sort_order })}
                />
                <ViewToggle view={view} onChange={setView} />
              </div>
            </div>

            {/* Mobile-only inline filters (hidden on lg+) */}
            <div className="lg:hidden">
              <div className="mb-4">
                <CategoryFilter
                  categories={categories}
                  selected={params.category || ""}
                  onSelect={(category) => updateParams({ category })}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-xs text-[var(--ps-text-muted)]">{t("explore.size")}</span>
                {["micro", "small", "medium", "large"].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateParams({ size_category: params.size_category === s ? undefined : s })}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-colors cursor-pointer ${params.size_category === s
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-[var(--ps-bg-card)] text-[var(--ps-text-secondary)] border-[var(--ps-border)] hover:border-blue-300"
                      }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
                <span className="text-xs text-[var(--ps-text-muted)] mx-1">|</span>
                <span className="text-xs text-[var(--ps-text-muted)]">{t("explore.platform")}</span>
                {["python", "node", "go", "docker", "claude", "mcp"].map((p) => (
                  <button
                    key={p}
                    onClick={() => updateParams({ platform: params.platform === p ? undefined : p })}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-colors cursor-pointer ${params.platform === p
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-[var(--ps-bg-card)] text-[var(--ps-text-secondary)] border-[var(--ps-border)] hover:border-blue-300"
                      }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop: Sidebar + Content */}
            <div className="flex gap-6">
              {/* Sidebar — desktop only */}
              <div className="hidden lg:block">
                <FilterSidebar
                  params={params}
                  onUpdate={updateParams}
                  categories={categories}
                />
              </div>

              {/* Main content */}
              <div className="flex-1 min-w-0">
                {/* Error */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Loading Skeleton */}
                {loading && <SkeletonCards count={6} />}

                {/* Results */}
                {!loading && data && data.items.length > 0 && (
                  <>
                    <div className="text-sm text-[var(--ps-text-muted)] mb-3">
                      {t("explore.showing")} {(data.page - 1) * data.page_size + 1}-
                      {Math.min(data.page * data.page_size, data.total)} {t("explore.of")}{" "}
                      {data.total.toLocaleString()} {t("explore.skills")}
                    </div>
                    {view === "card" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
                        {data.items.map((skill) => (
                          <SkillCard key={skill.id} skill={skill} onSelect={handleOpenRepo} onShowDetail={handleShowDetail} />
                        ))}
                      </div>
                    ) : (
                      <SkillTable skills={data.items} onSelect={handleOpenRepo} onShowDetail={handleShowDetail} />
                    )}
                    <Pagination
                      page={data.page}
                      totalPages={data.total_pages}
                      onPageChange={setPage}
                    />
                  </>
                )}

                {/* Empty State */}
                {!loading && data && data.items.length === 0 && (
                  <div className="text-center py-16">
                    <svg className="w-10 h-10 text-[var(--ps-text-muted)] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                    <h3 className="text-lg font-medium text-[var(--ps-text-primary)]">{t("explore.noResults")}</h3>
                    <p className="text-sm text-[var(--ps-text-secondary)] mt-1">
                      {t("explore.noResultsHint")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Favorites Tab */}
        {tab === "favorites" && (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
              <div className="w-full sm:w-64">
                <SearchBar
                  value={params.search || ""}
                  onChange={(search) => updateParams({ search })}
                />
              </div>
              <div className="w-full sm:w-auto overflow-x-auto scrollbar-hide pb-1 -mb-1">
                <SortControls
                  sortBy={params.sort_by}
                  sortOrder={params.sort_order}
                  onSortByChange={(sort_by) => updateParams({ sort_by })}
                  onSortOrderChange={(sort_order) => updateParams({ sort_order })}
                />
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-3 ml-auto">
                <ViewToggle view={view} onChange={setView} />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              {favLoading && <SkeletonCards count={3} />}

              {!favLoading && favData.length > 0 && (
                <>
                  <div className="text-sm text-[var(--ps-text-muted)] mb-3 flex items-center gap-2">
                    <span>{favData.length} {t("explore.skills")} in Favorites</span>
                  </div>
                  {view === "card" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
                      {favData.map((skill) => (
                        <SkillCard key={skill.id} skill={skill} onSelect={handleOpenRepo} onShowDetail={handleShowDetail} />
                      ))}
                    </div>
                  ) : (
                    <SkillTable skills={favData} onSelect={handleOpenRepo} onShowDetail={handleShowDetail} />
                  )}
                </>
              )}

              {!favLoading && favorites.length === 0 && (
                <div className="text-center py-20 px-4 bg-[var(--ps-bg-card)] rounded-xl border border-[var(--ps-border)] shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                  </div>
                  <h3 className="text-xl font-medium text-[var(--ps-text-primary)] mb-2">No favorites yet</h3>
                  <p className="text-[var(--ps-text-secondary)] mb-6 max-w-sm mx-auto">
                    You haven't added any skills to your favorites. Explore the collection and save the ones you like.
                  </p>
                  <button
                    onClick={() => setTab("explore")}
                    className="px-6 py-2.5 rounded-full bg-[var(--ps-neon-cyan)] text-white font-medium hover:bg-opacity-90 shadow-[var(--ps-shadow-glow)] transition-all cursor-pointer"
                  >
                    Explore Skills
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Skill Detail Panel (for panel-based viewing, kept for backward compat) */}
      {detailSkill && (
        <SkillDetailPanel
          skill={detailSkill}
          onClose={() => setDetailSkill(null)}
          onNavigateSkill={handleNavigateSkill}
        />
      )}

      <ScrollToTop />
      <SiteFooter />
    </div>
  );
}
