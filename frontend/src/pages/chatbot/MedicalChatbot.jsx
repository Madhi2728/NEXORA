import { useEffect, useRef, useState } from "react";
import { sendMessage, getHistory, clearHistory } from "../../services/chatService";
import { Send, Loader2, Trash2, AlertTriangle, Bot, User, HeartPulse } from "lucide-react";

export default function MedicalChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    getHistory()
      .then(setMessages)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setError("");
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text, id: `temp-${Date.now()}` }]);
    setSending(true);

    try {
      const { reply, crisis } = await sendMessage(text);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply, crisis, id: `temp-${Date.now()}-r` },
      ]);
    } catch (err) {
      setError(err.response?.data?.message || "Could not reach the assistant. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function handleClear() {
    await clearHistory();
    setMessages([]);
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {messages.length > 0 && (
        <div className="flex justify-end mb-2">
          <button
            onClick={handleClear}
            className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1"
          >
            <Trash2 size={13} /> Clear chat
          </button>
        </div>
      )}

      <div className="bg-slate-50 rounded-xl border border-slate-100 flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
          {loading ? (
            <p className="text-sm text-slate-400 text-center mt-6">Loading...</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-slate-400 text-center mt-6">
              Ask a general health question, e.g. "What can help with a mild headache?"
            </p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0">
                    <Bot size={14} />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-violet-600 text-white rounded-br-sm"
                      : m.crisis
                      ? "bg-red-50 border border-red-200 text-red-800 rounded-bl-sm"
                      : "bg-slate-100 text-slate-700 rounded-bl-sm"
                  }`}
                >
                  {m.crisis && (
                    <div className="flex items-center gap-1 text-xs font-semibold mb-1">
                      <AlertTriangle size={13} /> Please read this
                    </div>
                  )}
                  {m.content}
                </div>
                {m.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))
          )}
          {sending && (
            <div className="flex gap-2 justify-start">
              <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0">
                <Bot size={14} />
              </div>
              <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-3 py-2">
                <Loader2 size={16} className="animate-spin text-slate-400" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="border-t border-slate-100 p-2.5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center flex-shrink-0 animate-bounce">
            <HeartPulse size={14} />
          </div>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a health question..."
            className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white rounded-lg px-3 py-1.5"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      <p className="text-xs text-slate-400 mt-2">
        General health information only — not a substitute for a doctor. For anything urgent,
        contact emergency services directly.
      </p>
    </div>
  );
}
