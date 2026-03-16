import { ChevronDown, ChevronUp } from "lucide-react";
import { useI18n } from "../i18n/I18nContext";
import type { SkillsQueryParams } from "../types/skill";

interface Props {
  sortBy: string;
  sortOrder: string;
  onSortByChange: (value: SkillsQueryParams["sort_by"]) => void;
  onSortOrderChange: (value: "asc" | "desc") => void;
}

export function SortControls({ sortBy, sortOrder, onSortByChange, onSortOrderChange }: Props) {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-2">
      <select
        value={sortBy}
        onChange={(e) => onSortByChange(e.target.value as SkillsQueryParams["sort_by"])}
        className="ps-input cursor-pointer"
        style={{ padding: '8px 12px', width: 'auto' }}
      >
        <option value="score">Score</option>
        <option value="stars">Stars</option>
        <option value="quality_score">{t("sort.qualityScore")}</option>
        <option value="star_momentum">{t("sort.momentum")}</option>
        <option value="last_commit_at">Last Updated</option>
        <option value="created_at">Created</option>
      </select>
      <button
        onClick={() => onSortOrderChange(sortOrder === "desc" ? "asc" : "desc")}
        className="p-2 rounded-lg transition-all cursor-pointer"
        style={{
          background: 'var(--ps-bg-elevated)',
          border: '1px solid var(--ps-border)',
          color: 'var(--ps-text-secondary)',
        }}
        title={sortOrder === "desc" ? "Descending" : "Ascending"}
      >
        {sortOrder === "desc" ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronUp className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
