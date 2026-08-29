import { useState } from "react";
import { VITAL_TYPES } from "../../utils/vitalTypes";

export default function VitalForm({ type, onSubmit }) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const meta = VITAL_TYPES.find((t) => t.value === type) || VITAL_TYPES[0];

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!value.trim()) {
      setError("Please enter a value.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ value: value.trim() });
      setValue("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save reading.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl shadow-sm p-5 space-y-3">
      <h3 className="font-bold text-slate-100">
        Log a reading — <span className="text-violet-300">{meta.label}</span>
      </h3>
      <div className="flex gap-2 min-w-0">
        <input
          className="flex-1 min-w-0 rounded-lg border border-slate-600 bg-slate-900 text-slate-100 placeholder-slate-500 px-3 py-2 text-sm"
          placeholder={meta.placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <span className="self-center text-sm text-slate-400 flex-shrink-0">{meta.unit}</span>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white rounded-lg py-2 text-sm font-medium transition"
      >
        {submitting ? "Saving..." : "Save reading"}
      </button>
    </form>
  );
}
