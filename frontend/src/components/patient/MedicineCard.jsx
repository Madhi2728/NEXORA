import { Pill, Syringe, Wind, Droplet } from "lucide-react";

const CATEGORY_STYLE = {
  tablet: { icon: Pill, cls: "bg-violet-900/40 text-violet-300" },
  capsule: { icon: Pill, cls: "bg-indigo-900/40 text-indigo-300" },
  injection: { icon: Syringe, cls: "bg-rose-900/40 text-rose-300" },
  inhaler: { icon: Wind, cls: "bg-sky-900/40 text-sky-300" },
  liquid: { icon: Droplet, cls: "bg-amber-900/40 text-amber-300" },
};

export default function MedicineCard({ medicine }) {
  const style = CATEGORY_STYLE[medicine.category] || CATEGORY_STYLE.tablet;
  const Icon = style.icon;

  return (
    <div className="flex gap-3 bg-slate-800 rounded-xl shadow-sm p-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${style.cls}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-100">{medicine.name}</p>
        <p className="text-xs text-slate-400">{medicine.commonUse}</p>
      </div>
    </div>
  );
}
