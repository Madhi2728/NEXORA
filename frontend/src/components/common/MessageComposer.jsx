// frontend/src/components/common/MessageComposer.jsx
//
// Simple async-messaging compose modal. Role-agnostic: pass any recipient
// { id, name, role } and it sends a message via POST /api/messages. Reused by
// the doctor dashboard now; usable from patient/admin views later.
//
//   <MessageComposer
//     recipient={{ id, name, role }}   // required, auto-fills the "To" field
//     onClose={() => ...}
//     onSent={(message) => ...}        // optional
//   />

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Send, X, Check, MessageSquare } from "lucide-react";
import { sendMessage } from "../../services/messageService";

export default function MessageComposer({ recipient, onClose, onSent }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSend() {
    if (!recipient?.id) {
      setError("No recipient selected.");
      return;
    }
    if (!body.trim()) {
      setError("Write a message before sending.");
      return;
    }
    setError("");
    setSending(true);
    try {
      const message = await sendMessage({
        receiver_id: recipient.id,
        receiver_role: recipient.role,
        subject: subject.trim(),
        body: body.trim(),
      });
      setSent(true);
      onSent?.(message);
      setTimeout(() => onClose?.(), 1000);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not send message.");
    } finally {
      setSending(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-slate-600 bg-slate-900 text-slate-100 placeholder-slate-500 px-3 py-2 text-sm focus:outline-none focus:border-violet-500";
  const labelCls = "text-xs text-slate-400 mb-1 block";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 shadow-xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 to-teal-500" />

        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-900/40 text-teal-300">
              <MessageSquare size={18} />
            </div>
            <div>
              <h2 className="font-bold text-slate-100">New Message</h2>
              <p className="text-xs text-slate-400">
                To {recipient?.name || "—"}
                {recipient?.role ? ` · ${recipient.role}` : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 transition-colors hover:text-slate-200"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-5 pb-5">
          <div>
            <label className={labelCls}>To</label>
            <input
              value={recipient?.name || ""}
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-400"
            />
          </div>
          <div>
            <label className={labelCls}>Subject (optional)</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Your recent lab results"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              placeholder="Write your message…"
              className={`${inputCls} resize-y`}
            />
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 justify-end gap-2 border-t border-slate-700 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-900"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || sent}
            className="flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
          >
            {sent ? (
              <>
                <Check size={15} /> Sent
              </>
            ) : (
              <>
                <Send size={15} /> {sending ? "Sending…" : "Send"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
