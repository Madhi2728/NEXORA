import { useState } from "react";
import { VITAL_TYPES } from "../../utils/vitalTypes";

export default function VitalForm({ onSubmit }) {
  const [type, setType] = useState(VITAL_TYPES[0].value);
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const meta = VITAL_TYPES.find((t) => t.value === type);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!value.trim()) {
      setError("Please enter a value.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ type, value: value.trim(), unit: meta.unit });
      setValue("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save reading.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-5 space-y-3">
      <h3 className="font-semibold text-slate-800">Log a reading</h3>
      <div className="flex gap-2">
        <select
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {VITAL_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <input
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder={meta.placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <span className="self-center text-sm text-slate-500 w-14">{meta.unit}</span>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

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
