import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import SectionCard from "../common/SectionCard";
import { useAdminAppointments, useAdminUsers } from "../../hooks/useAdmin";
import {
  StatePanel,
  StatusBadge,
  Pagination,
  formatDate,
  inputCls,
} from "./shared";

const PAGE_SIZE = 15;

export default function AppointmentsOversight() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [from, to, doctorId, status]);

  // Doctor filter options — reuse the users endpoint (role=doctor).
  const { data: doctorData } = useAdminUsers(
    useMemo(() => ({ role: "doctor", pageSize: 100 }), []),
  );
  const doctors = doctorData?.users || [];

  const params = useMemo(
    () => ({ from, to, doctorId, status, page, pageSize: PAGE_SIZE }),
    [from, to, doctorId, status, page],
  );
  const { data, loading, error } = useAdminAppointments(params);
  const rows = data?.appointments || [];

  return (
    <SectionCard
      icon={CalendarDays}
      title="Appointments Oversight"
      accent="from-sky-500 to-blue-500"
      iconBg="bg-sky-900/40 text-sky-300"
      fullHeight
    >
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <label className="text-xs text-slate-400">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={`${inputCls} mt-1`}
          />
        </label>
        <label className="text-xs text-slate-400">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={`${inputCls} mt-1`}
          />
        </label>
        <label className="text-xs text-slate-400">
          Doctor
          <select
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className={`${inputCls} mt-1`}
          >
            <option value="">All doctors</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-400">
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`${inputCls} mt-1`}
          >
            <option value="">Any</option>
            <option value="confirmed">Confirmed</option>
            <option value="waiting">Waiting</option>
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
      </div>

      <StatePanel
        loading={loading}
        error={error}
        isEmpty={rows.length === 0}
        emptyText="No appointments for this filter."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="pb-2 pr-3 font-semibold">When</th>
                <th className="pb-2 pr-3 font-semibold">Patient</th>
                <th className="pb-2 pr-3 font-semibold">Doctor</th>
                <th className="pb-2 pr-3 font-semibold">Hospital</th>
                <th className="pb-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-t border-slate-800">
                  <td className="py-2.5 pr-3 text-slate-300">
                    {formatDate(a.date)} · {a.time}
                  </td>
                  <td className="py-2.5 pr-3 text-slate-100">
                    {a.patientName}
                  </td>
                  <td className="py-2.5 pr-3 text-slate-300">{a.doctorName}</td>
                  <td className="py-2.5 pr-3 text-slate-400">
                    {a.hospitalName}
                  </td>
                  <td className="py-2.5">
                    <StatusBadge value={a.status} />
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
    </SectionCard>
  );
}
