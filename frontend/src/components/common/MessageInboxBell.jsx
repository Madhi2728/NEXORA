import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Mail, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getInbox,
  getUnreadCount,
  markRead,
} from "../../services/messageService";

const POLL_MS = 30_000;

function timeAgo(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const secs = Math.floor((Date.now() - d.getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

// Navbar bell for async direct messages. Polls the unread count every 30s and,
// when opened, loads the inbox; clicking a message marks it read.
//
// Exposes an imperative `open()` (via ref) so a sibling — e.g. the dashboard's
// "Unread Messages" stat card — can pop the dropdown. `onCountChange` reports
// the live unread count up so that same card can show it without polling twice.
function MessageInboxBell({ onCountChange }, ref) {
  const { user } = useAuth();
  const userId = user?.id;

  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({ open: () => setOpen(true) }), []);

  useEffect(() => {
    onCountChange?.(count);
  }, [count, onCountChange]);

  const refreshCount = useCallback(() => {
    if (!userId) return;
    getUnreadCount(userId)
      .then(setCount)
      .catch(() => {});
  }, [userId]);

  // Poll the unread count.
  useEffect(() => {
    if (!userId) return;
    refreshCount();
    const id = setInterval(refreshCount, POLL_MS);
    return () => clearInterval(id);
  }, [userId, refreshCount]);

  // Load the inbox when the dropdown opens.
  const panelRef = useRef(null);
  useEffect(() => {
    if (!open || !userId) return;
    setLoading(true);
    getInbox(userId)
      .then(setMessages)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, userId]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    function onClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target))
        setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  async function openMessage(msg) {
    if (msg.read_at) return;
    try {
      await markRead(msg.id);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id ? { ...m, read_at: new Date().toISOString() } : m,
        ),
      );
      setCount((c) => Math.max(0, c - 1));
    } catch {
      /* ignore — will reconcile on next poll */
    }
  }

  if (!userId) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative text-slate-300 hover:text-white"
        aria-label="Messages"
      >
        <Mail size={20} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-fuchsia-600 text-[10px] text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-700 bg-slate-800 p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-300">Messages</p>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-500 hover:text-slate-300"
              aria-label="Close"
            >
              <X size={13} />
            </button>
          </div>

          {loading ? (
            <p className="py-4 text-center text-xs text-slate-500">Loading…</p>
          ) : messages.length === 0 ? (
            <p className="text-xs text-slate-500">No messages yet.</p>
          ) : (
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {messages.map((m) => (
                <button
                  key={m.id}
                  onClick={() => openMessage(m)}
                  className={`block w-full rounded-lg p-2 text-left text-xs transition-colors ${
                    m.read_at
                      ? "bg-slate-900/40 hover:bg-slate-900/70"
                      : "bg-violet-950/30 hover:bg-violet-950/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-100">
                      {m.sender?.name || "Unknown"}
                    </span>
                    <span className="flex-shrink-0 text-slate-500">
                      {timeAgo(m.created_at)}
                    </span>
                  </div>
                  {m.subject && (
                    <p className="mt-0.5 text-slate-300">{m.subject}</p>
                  )}
                  <p className="mt-0.5 line-clamp-2 text-slate-400">{m.body}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default forwardRef(MessageInboxBell);
