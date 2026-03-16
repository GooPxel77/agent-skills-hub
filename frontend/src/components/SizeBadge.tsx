import { Box } from "lucide-react";

interface Props {
  sizeCategory: string;
  sizeKb?: number;
}

const SIZE_CONFIG: Record<string, { label: string; borderColor: string; bgColor: string; textColor: string }> = {
  micro: { label: "Micro", borderColor: "rgba(34, 211, 238, 0.3)", bgColor: "rgba(34, 211, 238, 0.08)", textColor: "var(--ps-neon-green)" },
  small: { label: "Small", borderColor: "rgba(0, 240, 255, 0.3)", bgColor: "rgba(0, 240, 255, 0.08)", textColor: "var(--ps-neon-cyan)" },
  medium: { label: "Medium", borderColor: "rgba(245, 158, 11, 0.3)", bgColor: "rgba(245, 158, 11, 0.08)", textColor: "var(--ps-neon-amber)" },
  large: { label: "Large", borderColor: "rgba(236, 72, 153, 0.3)", bgColor: "rgba(236, 72, 153, 0.08)", textColor: "var(--ps-neon-pink)" },
};

function formatSize(kb: number): string {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}

export function SizeBadge({ sizeCategory, sizeKb }: Props) {
  const config = SIZE_CONFIG[sizeCategory];
  if (!config) return null;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full"
      style={{ border: `1px solid ${config.borderColor}`, background: config.bgColor, color: config.textColor }}
      title={sizeKb ? formatSize(sizeKb) : undefined}
    >
      <Box className="w-3 h-3" />
      {config.label}
    </span>
  );
}
