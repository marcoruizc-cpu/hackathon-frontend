import { SearchInput } from "../../common/components/SearchInput";
import { SelectField, enumOptions } from "../../common/components/SelectField";
import { humanize } from "../../common/utils/format";
import { SEVERITIES, SIGNAL_STATUSES, SIGNAL_TYPES, type SignalFeedFilters } from "../dto/signal.dto";

const typeOptions = enumOptions(SIGNAL_TYPES, humanize);
const severityOptions = enumOptions(SEVERITIES, humanize);
const statusOptions = enumOptions(SIGNAL_STATUSES, humanize);

interface SignalFiltersProps {
  filters: SignalFeedFilters;
  onChange: (patch: Partial<SignalFeedFilters>, options?: { replace?: boolean }) => void;
  onReset: () => void;
}

export function SignalFilters({ filters, onChange, onReset }: SignalFiltersProps) {
  const hasFilters = Boolean(filters.signalType || filters.severity || filters.status || filters.q);
  return (
    <div className="card mb-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end">
      <SearchInput id="signal-q" label="Buscar" value={filters.q} onCommit={(q) => onChange({ q }, { replace: true })} placeholder="Contenido o Tropel" />
      <SelectField id="signal-type" label="Tipo" value={filters.signalType} options={typeOptions} emptyLabel="Todos" onChange={(signalType) => onChange({ signalType })} />
      <SelectField id="signal-severity" label="Severidad" value={filters.severity} options={severityOptions} emptyLabel="Todas" onChange={(severity) => onChange({ severity })} />
      <SelectField id="signal-status" label="Estado" value={filters.status} options={statusOptions} emptyLabel="Todos" onChange={(status) => onChange({ status })} />
      <button type="button" className="btn-secondary" onClick={onReset} disabled={!hasFilters}>Limpiar</button>
    </div>
  );
}
