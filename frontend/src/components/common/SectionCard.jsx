// frontend/src/components/common/SectionCard.jsx
//
// Reusable card wrapper used by every dashboard section (Health Dashboard,
// AI Health Intelligence, Prescription OCR, Medicine Info Lookup, Medical
// Report Analysis). When `fullHeight` is set, the card gets a fixed height
// (not just h-full — the grid row it sits in has no definite height of its
// own, so h-full alone has nothing to fill, and the row would otherwise
// silently size itself to whichever sibling's content happens to be
// tallest) and its content area scrolls independently — the header (icon +
// title) stays fixed, only the body below it scrolls.

const FULL_HEIGHT = "h-[34rem]"; // 544px — shared by every fullHeight section, so paired cards match

export default function SectionCard({
  icon: Icon,
  title,
  accent = "from-violet-500 to-purple-500",
  iconBg = "bg-violet-900/40 text-violet-300",
  fullHeight = false,
  headerExtra,
  className = "",
  children,
}) {
  return (
    <div
      className={`rounded-2xl shadow-sm border border-slate-700 bg-slate-800 overflow-hidden ${
        fullHeight ? `${FULL_HEIGHT} flex flex-col` : ""
      } ${className}`}
    >
      {/* Top accent bar */}
      <div className={`h-1.5 rounded-t-2xl bg-gradient-to-r ${accent}`} />

      <div className={`p-5 ${fullHeight ? "flex-1 flex flex-col min-h-0" : ""}`}>
        {/* Header — stays fixed, never scrolls */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}
            >
              <Icon size={18} />
            </div>
            <h2 className="font-semibold text-slate-100">{title}</h2>
          </div>
          {headerExtra}
        </div>

        {/* Content — this is the ONLY part that scrolls */}
        <div
          className={
            fullHeight
              ? "flex-1 flex flex-col min-h-0 overflow-y-auto pr-1"
              : ""
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}
