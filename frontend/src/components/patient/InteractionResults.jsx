import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

const SEVERITY_STYLE = {
  severe: { cls: "bg-red-900/30 border-red-800 text-red-300", badge: "bg-red-600 text-white" },
  moderate: { cls: "bg-amber-900/30 border-amber-800 text-amber-300", badge: "bg-amber-500 text-white" },
  mild: { cls: "bg-sky-900/30 border-sky-800 text-sky-300", badge: "bg-sky-500 text-white" },
};

export default function InteractionResults({ result }) {
  if (!result) return null;

  const { interactions, unrecognized } = result;

  return (
    <div className="space-y-4">
      {unrecognized.length > 0 && (
        <div className="flex items-start gap-2 bg-slate-900/40 border border-slate-700 rounded-lg p-3 text-sm text-slate-300">
          <Info size={16} className="mt-0.5 flex-shrink-0" />
          <span>
            No interaction data available for: <strong>{unrecognized.join(", ")}</strong> (these
            may still be real medicines — we just don't have interaction pairs for them yet).
          </span>
        </div>
      )}

      {interactions.length === 0 ? (
        <div className="flex items-center gap-2 bg-emerald-900/30 border border-emerald-800 rounded-lg p-4 text-emerald-300">
          <CheckCircle2 size={20} />
          <span className="text-sm font-medium">
            No known interactions found among the recognized drugs.
          </span>
        </div>
      ) : (
        interactions.map((it, i) => {
          const style = SEVERITY_STYLE[it.severity] || SEVERITY_STYLE.mild;
          return (
            <div key={i} className={`border rounded-lg p-4 ${style.cls}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-sm">
                  {it.drugs[0]} + {it.drugs[1]}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase ${style.badge}`}>
                  {it.severity}
                </span>
              </div>
              <p className="text-sm flex items-start gap-1.5">
                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                {it.description}
              </p>
            </div>
          );
        })
      )}
    </div>
  );
}
