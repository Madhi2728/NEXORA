const STATUS_STYLE = {
  low: "bg-amber-50 text-amber-700",
  high: "bg-red-50 text-red-700",
  normal: "bg-emerald-50 text-emerald-700",
};

export default function ReportFindings({ findings }) {
  if (!findings || !findings.length) {
    return (
      <p className="text-sm text-slate-500">
        No recognizable lab values found in this report.
      </p>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="text-left px-4 py-2 font-medium">Test</th>
            <th className="text-left px-4 py-2 font-medium">Value</th>
            <th className="text-left px-4 py-2 font-medium">Normal Range</th>
            <th className="text-left px-4 py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {findings.map((f, i) => (
            <tr key={i} className="border-t border-slate-100">
              <td className="px-4 py-2 text-slate-700">{f.test}</td>
              <td className="px-4 py-2 font-medium text-slate-800">
                {f.value} {f.unit}
              </td>
              <td className="px-4 py-2 text-slate-500">{f.normalRange}</td>
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
