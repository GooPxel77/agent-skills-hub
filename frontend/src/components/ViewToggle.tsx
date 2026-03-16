import { LayoutGrid, List } from "lucide-react";

interface Props {
  view: "card" | "table";
  onChange: (view: "card" | "table") => void;
}

export function ViewToggle({ view, onChange }: Props) {
  return (
    <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--ps-border)' }}>
      <button
        onClick={() => onChange("card")}
        className="p-2 transition-all cursor-pointer"
        style={{
          background: view === "card" ? 'var(--ps-gradient-neon)' : 'var(--ps-bg-elevated)',
          color: view === "card" ? '#0a0e1a' : 'var(--ps-text-secondary)',
        }}
        title="Card view"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        onClick={() => onChange("table")}
        className="p-2 transition-all cursor-pointer"
        style={{
          background: view === "table" ? 'var(--ps-gradient-neon)' : 'var(--ps-bg-elevated)',
          color: view === "table" ? '#0a0e1a' : 'var(--ps-text-secondary)',
        }}
        title="Table view"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}
