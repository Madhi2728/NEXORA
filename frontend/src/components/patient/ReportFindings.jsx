const STATUS_STYLE = {
  low: "bg-amber-900/40 text-amber-300",
  high: "bg-red-900/40 text-red-300",
  normal: "bg-emerald-900/40 text-emerald-300",
};

export default function ReportFindings({ findings }) {
  if (!findings || !findings.length) {
    return (
      <p className="text-sm text-slate-400">
        No recognizable lab values found in this report.
      </p>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-900/40 text-slate-400">
          <tr>
            <th className="text-left px-4 py-2 font-medium">Test</th>
            <th className="text-left px-4 py-2 font-medium">Value</th>
            <th className="text-left px-4 py-2 font-medium">Normal Range</th>
            <th className="text-left px-4 py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {findings.map((f, i) => (
            <tr key={i} className="border-t border-slate-700">
              <td className="px-4 py-2 text-slate-200">{f.test}</td>
              <td className="px-4 py-2 font-medium text-slate-100">
                {f.value} {f.unit}
              </td>
              <td className="px-4 py-2 text-slate-400">{f.normalRange}</td>
              <td className="px-4 py-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLE[f.status]}`}>
                  {f.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
