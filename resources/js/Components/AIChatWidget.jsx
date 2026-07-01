import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Sparkles, HelpCircle } from "lucide-react";

export const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Halo! Saya Asisten AI Diskominfo Banggai Kepulauan. Ada yang bisa saya bantu hari ini terkait layanan digital, PPID, atau pemetaan BTS?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "Bagaimana cara mengajukan Sertifikat Elektronik TTE?",
    "Bagaimana prosedur memohon informasi publik ke PPID?",
    "Di mana saya bisa mengadukan gangguan jaringan internet?",
    "Di mana lokasi kantor Diskominfo Banggai Kepulauan?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg = { sender: "user", text: textToSend, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
        },
        body: JSON.stringify({ message: textToSend }),
      });
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.reply || "Maaf, terjadi kesalahan koneksi. Silakan coba sesaat lagi.", timestamp: new Date() },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Maaf, sistem sedang sibuk. Anda bisa menghubungi contact center kami di WhatsApp.", timestamp: new Date() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

      {/* Chat Window — slide-up animation via max-h + opacity transition */}
      <div
        className={`w-[360px] max-w-[90vw] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 transition-all duration-300 origin-bottom-right ${
          isOpen
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        }`}
        style={{ height: "500px", display: isOpen ? "flex" : "none" }}
        aria-hidden={!isOpen}
      >
        {/* Header — gradient */}
        <div className="p-4 bg-gradient-to-r from-[#0a549e] to-[#0d6ebf] text-white flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative p-2 bg-white/10 rounded-xl">
              <Sparkles size={15} className="text-amber-300 fill-amber-300" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xs tracking-tight uppercase leading-none">Asisten AI Diskominfo</span>
              <span className="text-[9px] text-sky-300 font-semibold mt-0.5">● Online • Kab. Banggai Kepulauan</span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition"
            aria-label="Tutup Chat"
          >
            <X size={15} />
          </button>
        </div>

        {/* Messages list */}
        <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-3.5 bg-slate-50 dark:bg-slate-950">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 max-w-[85%] ${
                msg.sender === "user" ? "self-end flex-row-reverse" : "self-start"
              }`}
            >
              <div
                className={`p-2 rounded-full flex-shrink-0 ${
                  msg.sender === "user"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-[#0a549e]/10 text-[#0a549e] dark:text-[#499ed7]"
                }`}
              >
                {msg.sender === "user" ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-emerald-600 text-white rounded-tr-none font-semibold"
                    : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-none font-medium"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5 self-start items-center">
              <div className="p-2 rounded-full bg-[#0a549e]/10 text-[#0a549e] dark:text-[#499ed7]">
                <Bot size={14} />
              </div>
              <div className="flex gap-1 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick suggestions */}
        {messages.length === 1 && (
          <div className="p-3 bg-slate-100 dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-1.5 flex-shrink-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <HelpCircle size={10} />
              Pertanyaan Populer:
            </span>
            <div className="flex flex-col gap-1">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="w-full text-left text-[11px] text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/10 transition leading-snug font-semibold"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
          className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2 flex-shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tulis pertanyaan Anda..."
            className="flex-grow bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none dark:text-white"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl disabled:opacity-40 transition"
            aria-label="Kirim"
          >
            <Send size={14} />
          </button>
        </form>
      </div>

      {/* Floating Action Button — glow ping ring */}
      <div className="relative">
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-[#0a549e] animate-ping opacity-25 pointer-events-none" />
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-3.5 bg-gradient-to-br from-[#0a549e] to-[#0d6ebf] hover:from-[#0b5fab] hover:to-[#0e78d3] text-white rounded-full shadow-2xl shadow-blue-900/40 flex items-center justify-center gap-2 group transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          aria-label="Tanya Asisten AI Diskominfo"
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <X size={20} />
          ) : (
            <MessageSquare size={20} className="group-hover:scale-110 transition-transform" />
          )}
          {!isOpen && (
            <span className="text-xs font-bold uppercase tracking-wider hidden md:inline pr-1">Tanya AI</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default AIChatWidget;
