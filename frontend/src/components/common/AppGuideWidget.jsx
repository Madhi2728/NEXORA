import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { APP_GUIDE_ITEMS } from "../../data/appGuideItems";

export default function AppGuideWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-fade-in">
          <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-4 py-3 flex items-center justify-between">
            <p className="font-semibold text-sm">About Nexora Health</p>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto p-4 space-y-4">
            {APP_GUIDE_ITEMS.map(({ icon: Icon, title, description }, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{title}</p>
                  <p className="text-xs text-slate-500">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative group">
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-600/30 flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="App guide"
        >
          <Sparkles size={22} />
        </button>
        {!open && (
          <span className="absolute bottom-full right-0 mb-2 whitespace-nowrap bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Know everything about Nexora
          </span>
        )}
      </div>
    </div>
  );
}
