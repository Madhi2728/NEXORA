import { useEffect, useMemo, useState } from "react";
import { ScrollText } from "lucide-react";
import SectionCard from "../common/SectionCard";
import { useAdminAuditLogs } from "../../hooks/useAdmin";
import { StatePanel, Pagination, formatDate, inputCls } from "./shared";

const PAGE_SIZE = 20;

function summarise(meta) {
  if (!meta || typeof meta !== "object") return "";
  const parts = [];
  if (meta.email) parts.push(meta.email);
  if (meta.audience) parts.push(`audience: ${meta.audience}`);
  if (meta.count != null) parts.push(`${meta.count} recipient(s)`);
  if (meta.next != null) parts.push(`→ ${meta.next ? "active" : "suspended"}`);
  if (meta.notes) parts.push(`note: ${meta.notes}`);
  return parts.join(" · ");
}

export default function AuditLogTable() {
  const [action, setAction] = useState("");
  const [rawAction, setRawAction] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setAction(rawAction.trim()), 350);
    return () => clearTimeout(t);
  }, [rawAction]);
  useEffect(() => setPage(1), [action]);

  const params = useMemo(
    () => ({ action, page, pageSize: PAGE_SIZE }),
    [action, page],
  );
  const { data, loading, error } = useAdminAuditLogs(params);
  const logs = data?.logs || [];

  return (
    <SectionCard
      icon={ScrollText}
      title="Audit Log"
      accent="from-slate-500 to-slate-400"
      iconBg="bg-slate-700/60 text-slate-200"
      fullHeight
      headerExtra={
        <input
          value={rawAction}
          onChange={(e) => setRawAction(e.target.value)}
          placeholder="Filter by action…"
          className={`${inputCls} w-44`}
        />
      }
    >
      <StatePanel
        loading={loading}
        error={error}
        isEmpty={logs.length === 0}
        emptyText="No audit entries yet. Admin actions will appear here."
      >
        <ol className="relative space-y-3 border-l border-slate-800 pl-4">
          {logs.map((l) => (
            <li key={l.id} className="relative">
              <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-violet-500" />
              <div className="flex flex-wrap items-baseline gap-x-2">
                <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-violet-200">
                  {l.action}
                </code>
                <span className="text-xs text-slate-500">
                  {formatDate(l.createdAt, true)}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-300">
                <span className="text-slate-100">{l.actorName}</span>
                {l.targetType ? ` · ${l.targetType}` : ""}
                {summarise(l.metadata) ? ` · ${summarise(l.metadata)}` : ""}
              </p>
              {l.ipAddress && (
                <p className="text-[11px] text-slate-600">IP {l.ipAddress}</p>
              )}
            </li>
          ))}
        </ol>
        <Pagination
          page={data?.page || 1}
          pageSize={data?.pageSize || PAGE_SIZE}
          total={data?.total || 0}
          onPage={setPage}
        />
      </StatePanel>
    </SectionCard>
  );
}
