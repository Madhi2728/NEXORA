import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Users, Search, Ban, CheckCircle2, X } from "lucide-react";
import SectionCard from "../common/SectionCard";
import { useAdminUsers, adminActions } from "../../hooks/useAdmin";
import {
  StatePanel,
  StatusBadge,
  Pagination,
  relativeDay,
  inputCls,
} from "./shared";

const ROLE_TABS = [
  { id: "", label: "All" },
  { id: "patient", label: "Patients" },
  { id: "doctor", label: "Doctors" },
  { id: "admin", label: "Admins" },
];
const PAGE_SIZE = 12;

function ConfirmDialog({
  title,
  body,
  confirmLabel,
  tone = "rose",
  busy,
  onConfirm,
  onClose,
}) {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 shadow-xl"
      >
        <div
          className={`h-1.5 w-full bg-gradient-to-r ${tone === "rose" ? "from-rose-500 to-red-500" : "from-emerald-500 to-teal-500"}`}
        />
        <div className="p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="font-bold text-slate-100">{title}</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
          <p className="text-sm text-slate-400">{body}</p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-slate-500"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={busy}
              className={`rounded-lg px-3 py-2 text-sm font-medium text-white disabled:opacity-60 ${
                tone === "rose"
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {busy ? "Working…" : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function UserManagementTable() {
  const [role, setRole] = useState("");
  const [rawSearch, setRawSearch] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState(null); // { user, action }
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSearch(rawSearch.trim()), 350);
    return () => clearTimeout(t);
  }, [rawSearch]);

  useEffect(() => setPage(1), [role, search, status]);

  const params = useMemo(
    () => ({ role, search, status, page, pageSize: PAGE_SIZE }),
    [role, search, status, page],
  );
  const { data, loading, error, refetch } = useAdminUsers(params);

  const users = data?.users || [];

  async function runAction() {
    if (!confirm) return;
    setBusy(true);
    try {
      if (confirm.action === "suspend")
        await adminActions.setUserStatus(confirm.user.id, false);
      else if (confirm.action === "activate")
        await adminActions.setUserStatus(confirm.user.id, true);
      else if (confirm.action === "delete")
        await adminActions.deleteUser(confirm.user.id);
      setConfirm(null);
      refetch();
    } catch (err) {
      alert(err?.response?.data?.message || "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SectionCard
      icon={Users}
      title="User Management"
      accent="from-sky-500 to-blue-500"
      iconBg="bg-sky-900/40 text-sky-300"
      fullHeight
      headerExtra={
        <div className="relative w-44">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input
            value={rawSearch}
            onChange={(e) => setRawSearch(e.target.value)}
            placeholder="Name or email"
            className={`${inputCls} pl-8`}
          />
        </div>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {ROLE_TABS.map((t) => (
          <button
            key={t.id || "all"}
            onClick={() => setRole(t.id)}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              role === t.id
                ? "bg-violet-900/40 text-violet-200"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={`${inputCls} ml-auto w-auto py-1`}
        >
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <StatePanel
        loading={loading}
        error={error}
        isEmpty={users.length === 0}
        emptyText="No users match these filters."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="pb-2 pr-3 font-semibold">User</th>
                <th className="pb-2 pr-3 font-semibold">Role</th>
                <th className="pb-2 pr-3 font-semibold">Status</th>
                <th className="pb-2 pr-3 font-semibold">Last login</th>
                <th className="pb-2 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-800">
                  <td className="py-2.5 pr-3">
                    <p className="text-slate-100">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </td>
                  <td className="py-2.5 pr-3 capitalize text-slate-300">
                    {u.role}
                  </td>
                  <td className="py-2.5 pr-3">
                    <StatusBadge value={u.is_active ? "active" : "suspended"} />
                  </td>
                  <td className="py-2.5 pr-3 text-xs text-slate-400">
                    {relativeDay(u.last_login_at)}
                  </td>
                  <td className="py-2.5 text-right">
                    {u.is_active ? (
                      <button
                        onClick={() =>
                          setConfirm({ user: u, action: "suspend" })
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-2 py-1 text-xs text-rose-300 hover:border-rose-500/50"
                      >
                        <Ban className="h-3.5 w-3.5" /> Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          setConfirm({ user: u, action: "activate" })
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-2 py-1 text-xs text-emerald-300 hover:border-emerald-500/50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={data?.page || 1}
          pageSize={data?.pageSize || PAGE_SIZE}
          total={data?.total || 0}
          onPage={setPage}
        />
      </StatePanel>

      {confirm && (
        <ConfirmDialog
          title={
            confirm.action === "suspend"
              ? "Suspend this account?"
              : "Reactivate this account?"
          }
          body={
            confirm.action === "suspend"
              ? `${confirm.user.name} will be signed out and blocked from logging in. Their records are kept.`
              : `${confirm.user.name} will be able to log in again.`
          }
          confirmLabel={confirm.action === "suspend" ? "Suspend" : "Activate"}
          tone={confirm.action === "suspend" ? "rose" : "emerald"}
          busy={busy}
          onConfirm={runAction}
          onClose={() => setConfirm(null)}
        />
      )}
    </SectionCard>
  );
}
