interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="ps-btn text-sm"
        style={{ padding: '6px 12px', opacity: page <= 1 ? 0.4 : 1 }}
      >
        Prev
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-2" style={{ color: 'var(--ps-text-muted)' }}>...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className="w-9 h-9 text-sm rounded-lg transition-all cursor-pointer"
            style={{
              background: p === page ? 'var(--ps-gradient-neon)' : 'var(--ps-bg-elevated)',
              color: p === page ? '#0a0e1a' : 'var(--ps-text-secondary)',
              border: p === page ? 'none' : '1px solid var(--ps-border)',
              fontWeight: p === page ? 600 : 400,
            }}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="ps-btn text-sm"
        style={{ padding: '6px 12px', opacity: page >= totalPages ? 0.4 : 1 }}
      >
        Next
      </button>
    </div>
  );
}
