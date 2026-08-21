import { useEffect, useRef, useState } from "react";
import { sendMessage, getHistory, clearHistory } from "../../services/chatService";
import {
  Send,
  Loader2,
  Trash2,
  AlertTriangle,
  Bot,
  User,
  HeartPulse,
  History,
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";

export default function MedicalChatbot() {
  const [messages, setMessages] = useState([]); // current live session only
  const [history, setHistory] = useState([]); // full saved history, shown in side panel
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // --- Voice assistant state ---
  const [isListening, setIsListening] = useState(false);
  const [supportsVoice, setSupportsVoice] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false); // auto-read assistant replies aloud

  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);
  const handleSendRef = useRef(); // always points at the latest handleSend closure

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function loadHistory() {
    setHistoryLoading(true);
    getHistory()
      .then(setHistory)
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }

  function toggleHistory() {
    const next = !showHistory;
    setShowHistory(next);
    if (next) loadHistory();
  }

  async function handleSend(e, voiceText) {
    if (e) e.preventDefault();
    const text = (voiceText ?? input).trim();
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
      if (showHistory) loadHistory(); // keep the side panel in sync if it's open
      if (voiceEnabled) speak(reply);
    } catch (err) {
      setError(err.response?.data?.message || "Could not reach the assistant. Please try again.");
    } finally {
      setSending(false);
    }
  }

  // keep the ref fresh so speech recognition always calls the latest handleSend
  useEffect(() => {
    handleSendRef.current = handleSend;
  });

  async function handleClear() {
    stopSpeaking();
    await clearHistory();
    setMessages([]);
    setHistory([]);
  }

  // --- Voice: speech-to-text setup (runs once) ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupportsVoice(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      if (final.trim()) {
        setInput("");
        setIsListening(false);
        handleSendRef.current?.(null, final);
      } else {
        setInput(interim);
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    setSupportsVoice(true);

    return () => {
      recognition.stop();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  function toggleListening() {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    stopSpeaking();
    setError("");
    setInput("");
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      // ignore "already started" errors from rapid double-clicks
    }
  }

  // --- Voice: text-to-speech ---
  function speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  function toggleVoiceEnabled() {
    setVoiceEnabled((prev) => {
      if (prev) stopSpeaking();
      return !prev;
    });
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex justify-end items-center gap-3 mb-2">
        <button
          onClick={toggleVoiceEnabled}
          title={voiceEnabled ? "Voice replies: On" : "Voice replies: Off"}
          className={`text-xs flex items-center gap-1 ${
            voiceEnabled ? "text-violet-300" : "text-slate-500 hover:text-violet-300"
          }`}
        >
          {voiceEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />} Voice
        </button>
        <button
          onClick={toggleHistory}
          className={`text-xs flex items-center gap-1 ${
            showHistory ? "text-violet-300" : "text-slate-500 hover:text-violet-300"
          }`}
        >
          <History size={13} /> History
        </button>
        {(messages.length > 0 || history.length > 0) && (
          <button
            onClick={handleClear}
            className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1"
          >
            <Trash2 size={13} /> Clear chat
          </button>
        )}
      </div>

      <div className="relative bg-slate-900/40 rounded-xl border border-slate-700 flex flex-1 min-h-0">
        {/* Main live conversation */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
            {messages.length === 0 ? (
              <p className="text-sm text-slate-500 text-center mt-6">
                Ask a general health question, e.g. "What can help with a mild headache?"
              </p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-violet-900/40 text-violet-300 flex items-center justify-center flex-shrink-0">
                      <Bot size={14} />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-violet-600 text-white rounded-br-sm"
                        : m.crisis
                        ? "bg-red-900/40 border border-red-700 text-red-300 rounded-bl-sm"
                        : "bg-slate-700 text-slate-200 rounded-bl-sm"
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
                    <div className="w-7 h-7 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center flex-shrink-0">
                      <User size={14} />
                    </div>
                  )}
                </div>
              ))
            )}
            {sending && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-violet-900/40 text-violet-300 flex items-center justify-center flex-shrink-0">
                  <Bot size={14} />
                </div>
                <div className="bg-slate-700 rounded-2xl rounded-bl-sm px-3 py-2">
                  <Loader2 size={16} className="animate-spin text-slate-500" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="border-t border-slate-700 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center flex-shrink-0">
              <HeartPulse size={14} />
            </div>

            <button
              type="button"
              onClick={toggleListening}
              disabled={!supportsVoice}
              title={
                !supportsVoice
                  ? "Voice input not supported in this browser"
                  : isListening
                  ? "Stop listening"
                  : "Speak your question"
              }
              className={`w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center transition-colors ${
                isListening
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {isListening ? <MicOff size={15} /> : <Mic size={15} />}
            </button>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Type a health question..."}
              className="flex-1 rounded-lg border border-slate-600 bg-slate-900 text-slate-100 placeholder-slate-500 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white rounded-lg w-9 h-9 flex-shrink-0 flex items-center justify-center"
            >
              <Send size={15} />
            </button>
          </form>
        </div>

        {/* Right-side toggleable history panel */}
        {showHistory && (
          <div className="w-56 flex-shrink-0 border-l border-slate-700 bg-slate-800 flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700">
              <p className="text-xs font-semibold text-slate-300">Saved History</p>
              <button onClick={() => setShowHistory(false)} className="text-slate-500 hover:text-slate-300">
                <X size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {historyLoading ? (
                <p className="text-xs text-slate-500 text-center mt-4">Loading...</p>
              ) : history.length === 0 ? (
                <p className="text-xs text-slate-500 text-center mt-4">No saved messages yet.</p>
              ) : (
                history.map((m) => (
                  <div key={m.id} className="text-xs">
                    <p className={`font-medium ${m.role === "user" ? "text-violet-300" : "text-slate-400"}`}>
                      {m.role === "user" ? "You" : "Assistant"}
                    </p>
                    <p className="text-slate-300 whitespace-pre-wrap line-clamp-4">{m.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-400 mt-2">{error}</p>}

      <p className="text-xs text-slate-500 mt-2">
        General health information only — not a substitute for a doctor. For anything urgent,
        contact emergency services directly.
      </p>
    </div>
  );
}
