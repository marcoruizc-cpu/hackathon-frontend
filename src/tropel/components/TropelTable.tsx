import { Link, useLocation } from "react-router-dom";
import { formatDate, humanize } from "../../common/utils/format";
import type { TropelDto } from "../dto/tropel.dto";
import { Meter, VitalStateBadge } from "./Badges";

export function TropelTable({ rows }: { rows: TropelDto[] }) {
  const location = useLocation();
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-slate-400">
          <tr className="border-b border-slate-800">
            <th scope="col" className="px-4 py-3">Nombre</th>
            <th scope="col" className="px-4 py-3">Especie</th>
            <th scope="col" className="px-4 py-3">Estado</th>
            <th scope="col" className="px-4 py-3">Energía</th>
            <th scope="col" className="px-4 py-3">Caos</th>
            <th scope="col" className="px-4 py-3">Mutación</th>
            <th scope="col" className="px-4 py-3">Sector</th>
            <th scope="col" className="px-4 py-3">Actualizado</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((tropel) => (
            <tr key={tropel.id} className="border-b border-slate-800/60 hover:bg-slate-800/40">
              <td className="px-4 py-3 font-medium">
                <Link to={`/tropels/${tropel.id}`} state={{ backTo: `${location.pathname}${location.search}` }} className="text-cyan-300 hover:underline">
                  {tropel.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-300">{humanize(tropel.species)}</td>
              <td className="px-4 py-3"><VitalStateBadge value={tropel.vitalState} /></td>
              <td className="px-4 py-3"><Meter value={tropel.energyLevel} label="Energía" /></td>
              <td className="px-4 py-3"><Meter value={tropel.chaosIndex} label="Caos" color="bg-violet-400" /></td>
              <td className="px-4 py-3 tabular-nums text-slate-300">{tropel.mutationStage}</td>
              <td className="px-4 py-3 text-slate-300">{tropel.sector.sectorCode}</td>
              <td className="px-4 py-3 text-slate-400">{formatDate(tropel.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
