import { useState } from "react";
import { Megaphone, Send, CheckCircle2 } from "lucide-react";
import SectionCard from "../common/SectionCard";
import { adminActions } from "../../hooks/useAdmin";
import { inputCls } from "./shared";

const AUDIENCES = [
  { id: "all", label: "All users (doctors + patients)" },
  { id: "doctors", label: "Doctors only" },
  { id: "patients", label: "Patients only" },
];

export default function AnnouncementComposer() {
  const [audience, setAudience] = useState("all");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function send() {
    if (!body.trim()) {
      setError("Message body is required.");
      return;
    }
    setError("");
    setSending(true);
    setResult(null);
    try {
      const res = await adminActions.sendAnnouncement({
        audience,
        subject: subject.trim(),
        body: body.trim(),
      });
      setResult(res.sent);
      setSubject("");
      setBody("");
    } catch (e) {
      setError(e?.response?.data?.message || "Could not send announcement.");
    } finally {
      setSending(false);
    }
  }

  return (
    <SectionCard
      icon={Megaphone}
      title="Announcement Composer"
      accent="from-fuchsia-500 to-pink-500"
      iconBg="bg-fuchsia-900/40 text-fuchsia-300"
    >
      <div className="max-w-xl space-y-4">
        <label className="block text-xs text-slate-400">
          Audience
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className={`${inputCls} mt-1`}
          >
            {AUDIENCES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-slate-400">
          Subject <span className="text-slate-600">(optional)</span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Scheduled maintenance"
            className={`${inputCls} mt-1`}
          />
        </label>

        <label className="block text-xs text-slate-400">
          Message
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            placeholder="This message is delivered to each recipient's inbox."
            className={`${inputCls} mt-1 resize-y`}
          />
        </label>

        {error && <p className="text-sm text-rose-400">{error}</p>}
        {result != null && (
          <p className="flex items-center gap-2 text-sm text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            Delivered to {result} inbox{result === 1 ? "" : "es"}.
          </p>
        )}

        <button
          onClick={send}
          disabled={sending}
          className="inline-flex items-center gap-2 rounded-lg bg-fuchsia-600 px-4 py-2 text-sm font-medium text-white hover:bg-fuchsia-700 disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {sending ? "Sending…" : "Send announcement"}
        </button>

        <p className="text-xs text-slate-500">
          Announcements are fanned out as direct messages, so recipients see the
          unread badge and the message in their inbox on next load.
        </p>
      </div>
    </SectionCard>
  );
}
