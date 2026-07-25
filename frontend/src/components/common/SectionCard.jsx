export default function SectionCard({ icon: Icon, title, accent = "from-violet-500 to-purple-500", iconBg = "bg-violet-100 text-violet-600", fullHeight = false, headerExtra, children }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-white ${
        fullHeight ? "h-full flex flex-col" : ""
      }`}
    >
      <div className={`h-1.5 bg-gradient-to-r ${accent}`} />
      <div className={`p-5 ${fullHeight ? "flex-1 flex flex-col" : ""}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
              <Icon size={18} />
            </div>
            <h2 className="font-semibold text-slate-800">{title}</h2>
          </div>
          {headerExtra}
        </div>
        <div className={fullHeight ? "flex-1 flex flex-col min-h-0" : ""}>{children}</div>
      </div>
    </div>
  );
}
