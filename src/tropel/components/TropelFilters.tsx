import { SearchInput } from "../../common/components/SearchInput";
import { SelectField, enumOptions } from "../../common/components/SelectField";
import { humanize } from "../../common/utils/format";
import type { SectorSummaryDto } from "../../sector/dto/sector.dto";
import { PAGE_SIZES, SORT_LABELS, SPECIES, TROPEL_SORTS, VITAL_STATES, type PageSize, type TropelListQuery } from "../dto/tropel.dto";

interface TropelFiltersProps {
  query: TropelListQuery;
  sectors: SectorSummaryDto[];
  onChange: (patch: Partial<TropelListQuery>, options?: { replace?: boolean }) => void;
  onReset: () => void;
}

const speciesOptions = enumOptions(SPECIES, humanize);
const vitalOptions = enumOptions(VITAL_STATES, humanize);
const sortOptions = TROPEL_SORTS.map((value) => ({ value, label: SORT_LABELS[value] }));
const sizeOptions = PAGE_SIZES.map((size) => ({ value: String(size), label: `${size} por página` }));

export function TropelFilters({ query, sectors, onChange, onReset }: TropelFiltersProps) {
  const sectorOptions = sectors.map((sector) => ({ value: sector.id, label: `${sector.sectorCode} · ${sector.name}` }));
  // Si la URL trae un sector que aun no cargo, se muestra igual para no perder el valor.
  if (query.sectorId && !sectorOptions.some((option) => option.value === query.sectorId)) {
    sectorOptions.unshift({ value: query.sectorId, label: query.sectorId });
  }
  const hasFilters = query.species || query.vitalState || query.sectorId || query.q;

  return (
    <div className="card mb-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] lg:items-end">
      <SearchInput id="tropel-q" label="Buscar por nombre" value={query.q} onCommit={(q) => onChange({ q }, { replace: true })} placeholder="Ej: Pixel" />
      <SelectField id="tropel-species" label="Especie" value={query.species} options={speciesOptions} emptyLabel="Todas" onChange={(species) => onChange({ species })} />
      <SelectField id="tropel-vital" label="Estado vital" value={query.vitalState} options={vitalOptions} emptyLabel="Todos" onChange={(vitalState) => onChange({ vitalState })} />
      <SelectField id="tropel-sector" label="Sector" value={query.sectorId} options={sectorOptions} emptyLabel="Todos" onChange={(sectorId) => onChange({ sectorId })} />
      <SelectField
        id="tropel-sort"
        label="Ordenar"
        value={query.sort}
        options={sortOptions}
        onChange={(sort) => {
          if (sort) onChange({ sort });
        }}
      />
      <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
        <SelectField
          id="tropel-size"
          label="Tamaño"
          value={String(query.size)}
          options={sizeOptions}
          onChange={(raw) => {
            const size = PAGE_SIZES.find((s) => String(s) === raw);
            if (size) onChange({ size: size as PageSize });
          }}
        />
        <button type="button" className="btn-secondary self-end" onClick={onReset} disabled={!hasFilters}>
          Limpiar
        </button>
      </div>
    </div>
  );
}
