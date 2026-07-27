import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const TRUNCATE_AT = 260;

export default function ExpandableText({ label, text }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;

  const isLong = text.length > TRUNCATE_AT;
  const shown = expanded || !isLong ? text : text.slice(0, TRUNCATE_AT) + "...";

  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-slate-300 whitespace-pre-wrap">{shown}</p>
      {isLong && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 mt-1"
        >
          {expanded ? (
            <>
              Show less <ChevronUp size={12} />
            </>
          ) : (
            <>
              Read more <ChevronDown size={12} />
            </>
          )}
        </button>
      )}
    </div>
  );
}
