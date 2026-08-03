"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MessageSquare, Send, X, Bot, User, RefreshCw } from "lucide-react";
import { askAIChatAction } from "@/server/actions/chat";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

interface AIChatDrawerProps {
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
}

export function AIChatDrawer({ isOpenExternal, onCloseExternal }: AIChatDrawerProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = isOpenExternal !== undefined ? isOpenExternal : internalIsOpen;
  
  const handleClose = () => {
    if (onCloseExternal) onCloseExternal();
    else setInternalIsOpen(false);
  };
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "Olá! Sou seu assistente financeiro Gemini IA. Como posso ajudar com suas despesas ou investimentos hoje?",
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput("");
    setLoading(true);

    const res = await askAIChatAction(textToSend);
    setLoading(false);

    if (res.reply) {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: res.reply,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, aiMsg]);
    }
  };

  const quickPrompts = [
    "Quanto gastei este mês?",
    "Analisar meu patrimônio",
    "Posso comprar um item de R$ 1.500?"
  ];

  return (
    <>
      {/* Botão Flutuante de IA */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setInternalIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 text-white shadow-2xl shadow-purple-900/50 flex items-center gap-2 border border-white/20 font-bold text-sm"
      >
        <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
        <span className="hidden md:inline">Assistente Gemini IA</span>
      </motion.button>

      {/* Drawer do Chat */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-md h-full bg-gradient-to-b from-gray-900 via-gray-900 to-black border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl text-white relative"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                      Gemini Financial Advisor <Sparkles className="w-4 h-4 text-amber-400" />
                    </h3>
                    <p className="text-xs text-purple-300">Inteligência Financeira em Tempo Real</p>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sugestões de Perguntas Rápidas */}
              <div className="py-3 flex gap-2 overflow-x-auto scrollbar-hide border-b border-white/5">
                {quickPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleSend(p)}
                    className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[11px] text-purple-200 border border-purple-500/20 whitespace-nowrap transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Thread de Mensagens */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 scrollbar-hide">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3 ${
                      m.sender === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                        m.sender === "user"
                          ? "bg-purple-600 text-white"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div
                      className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed ${
                        m.sender === "user"
                          ? "bg-purple-600 text-white rounded-tr-none"
                          : "bg-white/5 border border-white/10 text-gray-200 rounded-tl-none"
                      }`}
                    >
                      <p>{m.text}</p>
                      <span className="block text-[9px] text-gray-400 text-right mt-1 font-mono">
                        {m.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-2 text-xs text-purple-300 bg-white/5 p-3 rounded-2xl border border-white/5 w-fit">
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Gemini IA está analisando seus dados...</span>
                  </div>
                )}
              </div>

              {/* Input Footer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="pt-4 border-t border-white/10 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pergunte ao Gemini sobre suas finanças..."
                  className="flex-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all font-medium"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="p-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
