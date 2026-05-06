interface Props {
  score: number;
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-[var(--ps-neon-green)]"; // Muted green
  if (score >= 70) return "text-[var(--ps-neon-purple)]"; // Muted violet
  return "text-[var(--ps-text-muted)]"; // Muted gray
}

export function ScoreBadge({ score, className = "" }: Props) {
  if (!score || score <= 0) return null;
  
  const colorClass = getScoreColor(score);

  return (
    <span className={`inline-flex items-center gap-1 font-medium ${colorClass} ${className}`}>
      {score.toFixed(0)} Reuse Score
    </span>
  );
}

function getTier(score: number): string {
  if (score >= 80) return "S";
  if (score >= 65) return "A";
  if (score >= 50) return "B";
  if (score >= 35) return "C";
  return "D";
}

export function QualityBadge({ score }: { score: number }) {
  if (!score || score <= 0) return null;
  const tier = getTier(score);
  return (
    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded text-[var(--ps-text-muted)] border border-[var(--ps-border)]">
      Q:{tier}
    </span>
  );
}

export { getScoreColor, getTier };
