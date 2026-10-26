import { memo } from "react";
import { Link } from "react-router-dom";
import { formatDate, humanize } from "../../common/utils/format";
import type { SignalDto } from "../dto/signal.dto";
import { SeverityBadge, StatusBadge } from "./SignalBadges";

interface SignalCardProps {
  signal: SignalDto;
  search: string;
}

function SignalCardBase({ signal, search }: SignalCardProps) {
  return (
    <li>
      <Link
        to={{ pathname: `/signals/${signal.id}`, search }}
        state={{ fromFeed: true }}
        className="card block p-4 transition-colors hover:border-slate-600 hover:bg-slate-900"
        data-signal-id={signal.id}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-100">{humanize(signal.signalType)}</span>
          <SeverityBadge value={signal.severity} />
          <StatusBadge value={signal.status} />
          <span className="ml-auto text-xs text-slate-500">{formatDate(signal.createdAt)}</span>
        </div>
        <p className="mt-2 text-sm text-slate-300">{signal.rawContent}</p>
        <p className="mt-2 text-xs text-slate-500">
          {signal.tropel.name} · {humanize(signal.tropel.species)} · <span className="font-mono">{signal.id}</span>
        </p>
      </Link>
    </li>
  );
}

export const SignalCard = memo(SignalCardBase);
