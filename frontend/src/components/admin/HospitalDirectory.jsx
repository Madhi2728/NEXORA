import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Building2,
  Search,
  Plus,
  Pencil,
  ChevronDown,
  ChevronRight,
  X,
  Trash2,
  UserPlus,
} from "lucide-react";
import SectionCard from "../common/SectionCard";
import {
  useHospitals,
  useAdminUsers,
  adminActions,
} from "../../hooks/useAdmin";
import { StatePanel, StatusBadge, Pagination, inputCls } from "./shared";

const PAGE_SIZE = 12;
const EMPTY = {
  name: "",
  type: "hospital",
  address: "",
  city: "",
  state: "",
  pincode: "",
  latitude: "",
  longitude: "",
  phone: "",
  departments: [],
};

function TagInput({ value, onChange }) {
  const [draft, setDraft] = useState("");
  function add() {
    const v = draft.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setDraft("");
  }
  return (
    <div className="mt-1 rounded-lg border border-slate-600 bg-slate-900 p-2">
      <div className="flex flex-wrap gap-1.5">
        {value.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-full bg-violet-900/40 px-2 py-0.5 text-xs text-violet-200"
          >
            {t}
            <button onClick={() => onChange(value.filter((x) => x !== t))}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
          }}
          onBlur={add}
          placeholder="Add department + Enter"
          className="min-w-[10rem] flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder-slate-500"
        />
      </div>
    </div>
  );
}

function HospitalFormModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(() => ({ ...EMPTY, ...(initial || {}) }));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const editing = Boolean(initial?.id);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save() {
    if (!form.name.trim()) return setErr("Name is required.");
    setBusy(true);
    setErr("");
    try {
      const payload = {
        name: form.name,
        type: form.type,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        phone: form.phone,
        departments: form.departments,
        latitude: form.latitude === "" ? null : Number(form.latitude),
        longitude: form.longitude === "" ? null : Number(form.longitude),
      };
      if (editing) await adminActions.updateHospital(initial.id, payload);
      else await adminActions.createHospital(payload);
      onSaved();
      onClose();
    } catch (e) {
      setErr(e?.response?.data?.message || "Could not save hospital.");
    } finally {
      setBusy(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 shadow-xl"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 to-teal-500" />
        <div className="flex items-center justify-between px-5 py-4">
          <h3 className="font-bold text-slate-100">
            {editing ? "Edit hospital" : "Add hospital"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 pb-5">
          <label className="block text-xs text-slate-400">
            Name
            <input
              value={form.name}
              onChange={set("name")}
              className={`${inputCls} mt-1`}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs text-slate-400">
              Type
              <select
                value={form.type}
                onChange={set("type")}
                className={`${inputCls} mt-1`}
              >
                <option value="hospital">Hospital</option>
                <option value="clinic">Clinic</option>
              </select>
            </label>
            <label className="block text-xs text-slate-400">
              Phone
              <input
                value={form.phone}
                onChange={set("phone")}
                className={`${inputCls} mt-1`}
              />
            </label>
          </div>
          <label className="block text-xs text-slate-400">
            Address
            <input
              value={form.address}
              onChange={set("address")}
              className={`${inputCls} mt-1`}
            />
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="block text-xs text-slate-400">
              City
              <input
                value={form.city}
                onChange={set("city")}
                className={`${inputCls} mt-1`}
              />
            </label>
            <label className="block text-xs text-slate-400">
              State
              <input
                value={form.state}
                onChange={set("state")}
                className={`${inputCls} mt-1`}
              />
            </label>
            <label className="block text-xs text-slate-400">
              Pincode
              <input
                value={form.pincode}
                onChange={set("pincode")}
                className={`${inputCls} mt-1`}
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs text-slate-400">
              Latitude
              <input
                value={form.latitude}
                onChange={set("latitude")}
                placeholder="optional"
                className={`${inputCls} mt-1`}
              />
            </label>
            <label className="block text-xs text-slate-400">
              Longitude
              <input
                value={form.longitude}
                onChange={set("longitude")}
                placeholder="optional"
                className={`${inputCls} mt-1`}
              />
            </label>
          </div>
          <div className="text-xs text-slate-400">
            Departments
            <TagInput
              value={form.departments}
              onChange={(d) => setForm((f) => ({ ...f, departments: d }))}
            />
          </div>
          {err && <p className="text-sm text-rose-400">{err}</p>}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-700 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-slate-500"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={busy}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
          >
            {busy ? "Saving…" : editing ? "Save changes" : "Create hospital"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function DoctorsSubPanel({ hospital, allDoctors, onChanged }) {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pick, setPick] = useState("");
  const [dept, setDept] = useState("");
  const [fee, setFee] = useState("");
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    try {
      const { doctors } = await adminActions.getHospitalDoctors(hospital.id);
      setRows(doctors);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hospital.id]);

  const assignedIds = new Set((rows || []).map((r) => r.userId));
  const available = allDoctors.filter((d) => !assignedIds.has(d.id));

  async function attach() {
    if (!pick) return;
    setErr("");
    try {
      await adminActions.addHospitalDoctor(hospital.id, {
        user_id: pick,
        department: dept || null,
        fee: fee === "" ? null : Number(fee),
      });
      setPick("");
      setDept("");
      setFee("");
      await load();
      onChanged?.();
    } catch (e) {
      setErr(e?.response?.data?.message || "Could not attach doctor.");
    }
  }

  async function detach(userId) {
    try {
      await adminActions.removeHospitalDoctor(hospital.id, userId);
      await load();
      onChanged?.();
    } catch (e) {
      setErr(e?.response?.data?.message || "Could not remove doctor.");
    }
  }

  return (
    <div className="border-t border-slate-800 bg-slate-900/40 p-3">
      {loading ? (
        <p className="py-3 text-center text-xs text-slate-500">
          Loading doctors…
        </p>
      ) : rows.length === 0 ? (
        <p className="py-2 text-xs text-slate-500">No doctors assigned yet.</p>
      ) : (
        <div className="space-y-1.5">
          {rows.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-sm"
            >
              <span className="text-slate-100">
                {d.name}
                <span className="text-slate-500">
                  {" "}
                  · {d.department || "—"}
                  {d.fee != null ? ` · ₹${d.fee}` : ""}
                </span>
              </span>
              <button
                onClick={() => detach(d.userId)}
                className="text-slate-500 hover:text-rose-300"
                aria-label="Remove doctor"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <select
          value={pick}
          onChange={(e) => setPick(e.target.value)}
          className={`${inputCls} w-auto py-1`}
        >
          <option value="">Attach a doctor…</option>
          {available.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <input
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          placeholder="Department"
          className={`${inputCls} w-32 py-1`}
        />
        <input
          value={fee}
          onChange={(e) => setFee(e.target.value)}
          placeholder="Fee"
          className={`${inputCls} w-20 py-1`}
        />
        <button
          onClick={attach}
          disabled={!pick}
          className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-violet-700 disabled:opacity-50"
        >
          <UserPlus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
      {err && <p className="mt-1 text-xs text-rose-400">{err}</p>}
    </div>
  );
}

export default function HospitalDirectory() {
  const [rawSearch, setRawSearch] = useState("");
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal] = useState(null); // null | {} | hospital

  useEffect(() => {
    const t = setTimeout(() => setSearch(rawSearch.trim()), 350);
    return () => clearTimeout(t);
  }, [rawSearch]);
  useEffect(() => setPage(1), [search, city, status]);

  const params = useMemo(
    () => ({ search, city, status, page, pageSize: PAGE_SIZE }),
    [search, city, status, page],
  );
  const { data, loading, error, refetch } = useHospitals(params);
  const { data: doctorData } = useAdminUsers(
    useMemo(() => ({ role: "doctor", pageSize: 200 }), []),
  );
  const allDoctors = doctorData?.users || [];
  const hospitals = data?.hospitals || [];

  async function toggleStatus(h) {
    try {
      await adminActions.setHospitalStatus(h.id, !h.is_active);
      refetch();
    } catch (e) {
      alert(e?.response?.data?.message || "Could not change status.");
    }
  }

  return (
    <SectionCard
      icon={Building2}
      title="Hospitals & Departments"
      accent="from-violet-500 to-purple-500"
      iconBg="bg-violet-900/40 text-violet-300"
      fullHeight
      headerExtra={
        <button
          onClick={() => setModal({})}
          className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700"
        >
          <Plus className="h-3.5 w-3.5" /> Add hospital
        </button>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative w-48">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input
            value={rawSearch}
            onChange={(e) => setRawSearch(e.target.value)}
            placeholder="Search name"
            className={`${inputCls} pl-8`}
          />
        </div>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          className={`${inputCls} w-32`}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={`${inputCls} w-auto`}
        >
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <StatePanel
        loading={loading}
        error={error}
        isEmpty={hospitals.length === 0}
        emptyText="No hospitals match these filters."
      >
        <div className="space-y-2">
          {hospitals.map((h) => {
            const open = expanded === h.id;
            return (
              <div
                key={h.id}
                className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60"
              >
                <div className="flex items-center gap-3 p-3">
                  <button
                    onClick={() => setExpanded(open ? null : h.id)}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    {open ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-100">
                      {h.name}
                      <span className="ml-2 text-xs font-normal text-slate-500">
                        {h.doctorCount} doctor{h.doctorCount === 1 ? "" : "s"}
                      </span>
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {[h.city, h.state].filter(Boolean).join(", ") ||
                        "No location"}
                      {h.departments?.length
                        ? ` · ${h.departments.join(", ")}`
                        : ""}
                    </p>
                  </div>
                  <button onClick={() => toggleStatus(h)} title="Toggle active">
                    <StatusBadge value={h.is_active ? "active" : "suspended"} />
                  </button>
                  <button
                    onClick={() => setModal(h)}
                    className="rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:border-violet-500/50 hover:text-violet-300"
                    aria-label="Edit hospital"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
                {open && (
                  <DoctorsSubPanel
                    hospital={h}
                    allDoctors={allDoctors}
                    onChanged={refetch}
                  />
                )}
              </div>
            );
          })}
        </div>
        <Pagination
          page={data?.page || 1}
          pageSize={data?.pageSize || PAGE_SIZE}
          total={data?.total || 0}
          onPage={setPage}
        />
      </StatePanel>

      {modal && (
        <HospitalFormModal
          initial={modal.id ? modal : null}
          onClose={() => setModal(null)}
          onSaved={refetch}
        />
      )}
    </SectionCard>
  );
}
