"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Bot,
  Upload,
  PieChart,
  TrendingUp,
  AlertTriangle,
  Menu,
  X,
  LogOut,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onOpenReceiptModal?: () => void;
  onOpenChatDrawer?: () => void;
}

export function Sidebar({ isOpen, onToggle, onOpenReceiptModal, onOpenChatDrawer }: SidebarProps) {
  const pathname = usePathname();

  const aiFeatures = [
    {
      name: "Chatbot IA Gemini",
      desc: "Assistente financeiro em tempo real",
      icon: Bot,
      color: "#A855F7",
      action: () => {
        if (onOpenChatDrawer) onOpenChatDrawer();
      }
    },
    {
      name: "Leitor de Notas & PIX (OCR)",
      desc: "Importador de comprovantes por IA",
      icon: Upload,
      color: "#F59E0B",
      action: () => {
        if (onOpenReceiptModal) onOpenReceiptModal();
      }
    },
    {
      name: "Maiores Gastos por Categoria",
      desc: "Análise inteligente de despesas",
      icon: PieChart,
      color: "#3B82F6",
      href: "/transactions"
    },
    {
      name: "Simulador Juros Compostos",
      desc: "Projeção de patrimônio e aportes",
      icon: TrendingUp,
      color: "#10B981",
      href: "/wealth"
    },
    {
      name: "Alertas de Orçamento IA",
      desc: "Monitoramento de teto de gastos",
      icon: AlertTriangle,
      color: "#EF4444",
      href: "/budgets"
    }
  ];

  return (
    <>
      {/* Botão de 3 Barrinhas (Menu Hamburger Retrátil) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className="fixed top-6 left-6 z-50 px-4 py-3 rounded-2xl bg-black/70 hover:bg-black/90 backdrop-blur-2xl border border-white/20 text-white shadow-2xl flex items-center gap-2 font-bold text-xs group"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-amber-400" />
        ) : (
          <Menu className="w-5 h-5 text-purple-400 group-hover:text-amber-400 transition-colors" />
        )}
        <span className="hidden sm:inline font-mono">
          {isOpen ? "Fechar Menu" : "Menu de IA"}
        </span>
      </motion.button>

      {/* Overlay Transparente de Fundo quando aberto */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Retrátil (Gera deslizamento suave da esquerda) */}
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 z-40 w-72 bg-gradient-to-b from-gray-950 via-gray-900 to-black border-r border-white/10 p-6 pt-24 flex flex-col justify-between shadow-2xl transition-transform duration-300 backdrop-blur-2xl text-white",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="space-y-6">
          {/* Logo & Marca */}
          <div className="flex items-center gap-3 px-2 pb-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/40">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white">
                Finanças Gemini
              </h1>
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">
                Ferramentas Especiais
              </p>
            </div>
          </div>

          {/* As 5 Ferramentas de IA */}
          <div className="space-y-2.5">
            <div className="px-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
              Painel de IA
            </div>

            {aiFeatures.map((feat) => {
              const Icon = feat.icon;
              const isActive = feat.href ? pathname === feat.href : false;

              if (feat.href) {
                return (
                  <Link
                    key={feat.name}
                    href={feat.href}
                    onClick={onToggle}
                    className={cn(
                      "group p-3.5 rounded-2xl border transition-all flex items-center justify-between text-left",
                      isActive
                        ? "bg-purple-600/30 border-purple-500/50 shadow-lg text-white"
                        : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 text-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
                        style={{ backgroundColor: `${feat.color}30`, color: feat.color }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                          {feat.name}
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium">
                          {feat.desc}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                  </Link>
                );
              }

              return (
                <button
                  key={feat.name}
                  onClick={() => {
                    if (feat.action) feat.action();
                    onToggle();
                  }}
                  className="w-full group p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/30 hover:border-amber-500/50 hover:bg-white/10 transition-all flex items-center justify-between text-left shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-sm"
                      style={{ backgroundColor: feat.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                        {feat.name}
                      </div>
                      <div className="text-[10px] text-purple-300 font-medium">
                        {feat.desc}
                      </div>
                    </div>
                  </div>
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Rodapé e Sair */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <button
            onClick={() => signOut()}
            className="w-full px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 text-xs font-semibold transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sair da Conta
          </button>
        </div>
      </aside>
    </>
  );
}
