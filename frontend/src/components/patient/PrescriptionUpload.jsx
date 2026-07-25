import { useRef, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";

export default function PrescriptionUpload({
  onUploaded,
  title = "Upload a prescription",
  promptText = "Click to choose a photo of your prescription",
}) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  }

  async function handleSubmit() {
    if (!file) {
      setError("Please choose an image first.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      await onUploaded(file);
      setFile(null);
      setPreview(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-slate-800 rounded-xl shadow-sm p-5 space-y-4">
      <h3 className="font-semibold text-slate-100">{title}</h3>

      <label
        htmlFor="prescription-file"
        className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-violet-800 rounded-xl py-8 cursor-pointer hover:bg-violet-900/20 transition text-center"
      >
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-40 rounded-lg object-contain" />
        ) : (
          <>
            <UploadCloud className="text-violet-400" size={32} />
            <span className="text-sm text-slate-400">{promptText}</span>
            <span className="text-xs text-slate-500">JPG, PNG, or WEBP — up to 10MB</span>
          </>
        )}
        <input
          id="prescription-file"
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!file || uploading}
        className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white rounded-lg py-2 text-sm font-medium transition"
      >
        {uploading && <Loader2 size={16} className="animate-spin" />}
        {uploading ? "Uploading..." : "Upload & extract text"}
      </button>
    </div>
  );
}
