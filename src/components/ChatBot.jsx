import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Xin chào! 👋 Tôi là trợ lý tư vấn thời trang của MAISON. Tôi có thể giúp bạn chọn đồ, tư vấn size, hoặc trả lời thắc mắc. Bạn cần hỗ trợ gì?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
  const text = input.trim();
  if (!text || isLoading) return;

  const userMsg = { role: "user", content: text };
  const allMessages = [...messages, userMsg];

  setMessages(allMessages);
  setInput("");
  setIsLoading(true);

  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: allMessages }),
    });

    const raw = await resp.text();
    console.log("HTTP status:", resp.status);
    console.log("Raw response:", raw);

    let data = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      throw new Error(`Response không phải JSON: ${raw}`);
    }

    if (!resp.ok) {
      const errorMessage =
        typeof data.error === "string"
          ? data.error
          : data.error?.message ||
            data.message ||
            JSON.stringify(data.error) ||
            `Error ${resp.status}`;

      throw new Error(errorMessage);
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Xin lỗi, tôi chưa có phản hồi.";

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: reply },
    ]);
  } catch (error) {
    console.error("Chat error:", error);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Lỗi: ${error.message || JSON.stringify(error)}`,
      },
    ]);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
            aria-label="Mở chatbot"
          >
            <MessageCircle size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 flex h-[520px] max-h-[calc(100vh-3rem)] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border border-border bg-background shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
              <div className="flex items-center gap-2">
                <Bot size={18} />
                <div>
                  <p className="font-body text-sm font-semibold">Tư vấn MAISON</p>
                  <p className="font-body text-[10px] opacity-70">
                    Online • Trả lời ngay
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:opacity-70"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Bot size={14} />
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-2 font-body text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none [&>ol]:m-0 [&>p]:m-0 [&>ul]:m-0">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      <User size={14} />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Bot size={14} />
                  </div>
                  <div className="rounded-lg bg-secondary px-3 py-2 text-secondary-foreground">
                    <div className="flex gap-1">
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="flex shrink-0 gap-2 border-t border-border p-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Nhập tin nhắn..."
                className="flex-1 rounded border border-border bg-background px-3 py-2 font-body text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="rounded bg-primary p-2 text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
