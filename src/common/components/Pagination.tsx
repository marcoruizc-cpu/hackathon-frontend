interface PaginationProps {
  page: number; // 0-based
  totalPages: number;
  disabled?: boolean;
  onChange: (page: number) => void;
}

function pageWindow(page: number, total: number): number[] {
  const start = Math.max(0, Math.min(page - 2, total - 5));
  const end = Math.min(total, start + 5);
  return Array.from({ length: Math.max(0, end - start) }, (_, i) => start + i);
}

export function Pagination({ page, totalPages, disabled = false, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Paginación" className="flex flex-wrap items-center justify-center gap-1">
      <button type="button" className="btn-secondary" disabled={disabled || page === 0} onClick={() => onChange(0)} aria-label="Primera página">«</button>
      <button type="button" className="btn-secondary" disabled={disabled || page === 0} onClick={() => onChange(page - 1)}>Anterior</button>
      {pageWindow(page, totalPages).map((p) => (
        <button
          key={p}
          type="button"
          className={`btn-secondary min-w-10 ${p === page ? "border-cyan-400 text-cyan-300" : ""}`}
          aria-current={p === page ? "page" : undefined}
          disabled={disabled}
          onClick={() => onChange(p)}
        >
          {p + 1}
        </button>
      ))}
      <button type="button" className="btn-secondary" disabled={disabled || page >= totalPages - 1} onClick={() => onChange(page + 1)}>Siguiente</button>
      <button type="button" className="btn-secondary" disabled={disabled || page >= totalPages - 1} onClick={() => onChange(totalPages - 1)} aria-label="Última página">»</button>
    </nav>
  );
}
