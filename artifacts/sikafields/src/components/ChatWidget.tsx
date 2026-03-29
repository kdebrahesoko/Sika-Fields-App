import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send, RefreshCw, Leaf } from "lucide-react";
import { useLocation } from "wouter";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  timestamp: Date;
}

const STARTER_PROMPTS = [
  "How do I join as a farmer?",
  "How do I buy carbon credits?",
  "How does MRV verification work?",
];

const STORAGE_KEY = "sf-chat-conversation-id";

const API_BASE = "/api/openai";

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

async function apiCreateConversation(): Promise<number> {
  const res = await fetch(`${API_BASE}/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "SikaFields Chat" }),
  });
  const data = await res.json();
  return data.id as number;
}

async function apiLoadHistory(
  id: number,
): Promise<{ id: number; role: string; content: string; createdAt: string }[]> {
  const res = await fetch(`${API_BASE}/conversations/${id}`);
  if (!res.ok) throw new Error("not found");
  const data = await res.json();
  return data.messages;
}

async function apiDeleteConversation(id: number): Promise<void> {
  await fetch(`${API_BASE}/conversations/${id}`, { method: "DELETE" });
}

export default function ChatWidget() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const convIdRef = useRef<number | null>(null);

  const isHidden =
    location.startsWith("/admin") || location.includes("/studio");

  const isArticlePage =
    location.startsWith("/articles/") && !location.includes("/studio");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!open || isHidden || convIdRef.current !== null) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const id = Number(stored);
    convIdRef.current = id;
    setConversationId(id);
    apiLoadHistory(id)
      .then((rawMsgs) => {
        const msgs: Message[] = rawMsgs.map((m) => ({
          id: String(m.id),
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: new Date(m.createdAt),
        }));
        setMessages(msgs);
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        convIdRef.current = null;
        setConversationId(null);
      });
  }, [open, isHidden]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || streaming) return;

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");

      const assistantMsgId = `assistant-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: "assistant",
          content: "",
          streaming: true,
          timestamp: new Date(),
        },
      ]);
      setStreaming(true);

      const markDone = () =>
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, streaming: false } : m,
          ),
        );

      try {
        let convId = convIdRef.current;
        if (convId === null) {
          convId = await apiCreateConversation();
          convIdRef.current = convId;
          setConversationId(convId);
          localStorage.setItem(STORAGE_KEY, String(convId));
        }

        const abort = new AbortController();
        abortRef.current = abort;

        const res = await fetch(`${API_BASE}/conversations/${convId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: content.trim() }),
          signal: abort.signal,
        });

        if (!res.ok || !res.body) throw new Error("Failed to send message");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (!json) continue;
            try {
              const event = JSON.parse(json);
              if (event.content) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, content: m.content + event.content }
                      : m,
                  ),
                );
              }
              if (event.done || event.error) markDone();
            } catch {
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    content:
                      "Sorry, I'm having trouble connecting right now. Please try again or email us at info@sikafield.net.",
                    streaming: false,
                  }
                : m,
            ),
          );
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [streaming],
  );

  const handleNewChat = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const id = convIdRef.current;
    if (id !== null) {
      apiDeleteConversation(id).catch(() => {});
    }
    localStorage.removeItem(STORAGE_KEY);
    convIdRef.current = null;
    setConversationId(null);
    setMessages([]);
    setStreaming(false);
  }, []);

  if (isHidden) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const buttonBottomClass = isArticlePage
    ? "bottom-16 sm:bottom-5"
    : "bottom-5";

  const panelBottomClass = isArticlePage
    ? "sm:bottom-24"
    : "sm:bottom-24";

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className={`fixed z-50 flex flex-col overflow-hidden border border-green-100 bg-white
              inset-x-0 bottom-0 rounded-t-2xl h-[90dvh]
              sm:inset-x-auto sm:right-4 sm:w-[370px] sm:h-[560px] sm:rounded-2xl sm:max-h-[calc(100dvh-7rem)]
              ${panelBottomClass}`}
            style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-[hsl(145,62%,33%)] text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm leading-tight">Ask Sika</p>
                  <p className="text-[11px] text-green-100 leading-tight">
                    AI Assistant · SikaFields
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleNewChat}
                  title="New chat"
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  title="Close"
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
              {messages.length === 0 && (
                <div className="flex flex-col items-center pt-6 pb-2 gap-4">
                  <div className="w-14 h-14 rounded-full bg-[hsl(145,62%,33%)] flex items-center justify-center shadow-lg">
                    <Leaf className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-800 text-sm">
                      Hi, I'm Sika!
                    </p>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed max-w-[240px]">
                      Ask me anything about carbon credits, farmer programs, or
                      buying credits.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 w-full mt-2">
                    {STARTER_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => sendMessage(prompt)}
                        className="text-left text-xs px-3 py-2.5 rounded-xl border border-green-200 bg-white text-green-800 hover:bg-green-50 hover:border-green-400 transition-colors font-medium shadow-sm"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-[hsl(145,62%,33%)] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Leaf className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className="flex flex-col gap-0.5 max-w-[78%]">
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[hsl(145,62%,33%)] text-white rounded-br-sm"
                          : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-sm"
                      }`}
                    >
                      {msg.content || (msg.streaming && <StreamingDots />)}
                      {msg.streaming && msg.content && (
                        <span className="inline-block w-1 h-3.5 ml-0.5 mb-[-2px] bg-current animate-pulse rounded-sm" />
                      )}
                    </div>
                    <p
                      className={`text-[10px] text-gray-400 ${msg.role === "user" ? "text-right" : "text-left pl-1"}`}
                    >
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}

              <div ref={bottomRef} />
            </div>

            <div className="px-3 py-3 bg-white border-t border-gray-100 shrink-0">
              <div className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2 focus-within:border-green-400 focus-within:ring-1 focus-within:ring-green-200 transition-all">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Sika anything…"
                  rows={1}
                  disabled={streaming}
                  className="flex-1 bg-transparent text-sm resize-none outline-none placeholder-gray-400 text-gray-800 max-h-24 leading-relaxed disabled:opacity-60"
                  style={{ minHeight: "24px" }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || streaming}
                  className="w-8 h-8 rounded-lg bg-[hsl(145,62%,33%)] text-white flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-[hsl(145,62%,27%)] transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-1.5">
                Powered by SikaFields AI · Not financial or legal advice
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((v) => !v)}
        className={`fixed right-4 z-50 w-14 h-14 rounded-full bg-[hsl(145,62%,33%)] text-white shadow-xl flex items-center justify-center hover:bg-[hsl(145,62%,27%)] transition-colors ${buttonBottomClass}`}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        style={{ boxShadow: "0 4px 20px rgba(40,120,60,0.40)" }}
        aria-label={open ? "Close chat" : "Open Sika AI chat"}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" />
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}

function StreamingDots() {
  return (
    <span className="flex gap-1 items-center h-4">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
        />
      ))}
    </span>
  );
}
