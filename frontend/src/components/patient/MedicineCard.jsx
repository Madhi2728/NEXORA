import { Pill, Syringe, Wind, Droplet } from "lucide-react";

const CATEGORY_STYLE = {
  tablet: { icon: Pill, cls: "bg-violet-100 text-violet-600" },
  capsule: { icon: Pill, cls: "bg-indigo-100 text-indigo-600" },
  injection: { icon: Syringe, cls: "bg-rose-100 text-rose-600" },
  inhaler: { icon: Wind, cls: "bg-sky-100 text-sky-600" },
  liquid: { icon: Droplet, cls: "bg-amber-100 text-amber-600" },
};

export default function MedicineCard({ medicine }) {
  const style = CATEGORY_STYLE[medicine.category] || CATEGORY_STYLE.tablet;
  const Icon = style.icon;

  return (
    <div className="flex gap-3 bg-white rounded-xl shadow-sm p-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${style.cls}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800">{medicine.name}</p>
        <p className="text-xs text-slate-500">{medicine.commonUse}</p>
      </div>
    </div>
  );
}
