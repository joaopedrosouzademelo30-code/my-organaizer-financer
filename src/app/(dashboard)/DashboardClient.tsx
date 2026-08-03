"use client";

import Spline from '@splinetool/react-spline';
import { motion } from 'framer-motion';
import { Suspense } from 'react';
import { signOut } from "next-auth/react";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { Sparkles, Landmark, CreditCard, ArrowDownLeft, ArrowUpRight } from "lucide-react";

export function DashboardClient({ balance, income, expense }: { balance: number, income: number, expense: number }) {
  const formatMoney = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Camada 3D */}
      <div className="absolute inset-0 w-full h-full">
        <Suspense fallback={<div className="flex items-center justify-center w-full h-full text-white/50">Carregando Cenas 3D...</div>}>
          <Spline scene="https://prod.spline.design/Iors8FvXPPXXt3wJ/scene.splinecode" />
        </Suspense>
      </div>

      {/* Seletor de Temas no Canto Superior Direito */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeSwitcher />
      </div>

      {/* Painel Glassmorphism com Dados Reais */}
      <div className="absolute inset-0 pointer-events-none p-6 md:p-12 flex flex-col items-start justify-start z-10 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, x: -30, filter: "blur(10px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: "circOut" }}
          className="pointer-events-auto p-8 rounded-[2rem] bg-black/40 backdrop-blur-2xl border border-white/20 shadow-2xl max-w-md w-full space-y-6"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" /> Balanço Consolidado
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white/90 drop-shadow-md">
              Patrimônio Líquido
            </h1>
            <p className="text-4xl font-black text-white mt-2 drop-shadow-lg truncate">
              {formatMoney(balance)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-300 rounded-full text-xs font-bold shadow-inner">
              ● NuConta Débito Conectada
            </div>
            <button 
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 backdrop-blur-md border border-red-500/30 text-red-200 rounded-full text-xs font-semibold shadow-inner transition-colors"
            >
              Sair
            </button>
          </div>
          
          <div className="pt-6 border-t border-white/10 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 flex items-center gap-1.5">
                <ArrowDownLeft className="w-4 h-4 text-emerald-400" /> Entradas Totais (Mês)
              </span>
              <span className="text-emerald-400 font-bold text-sm">+{formatMoney(income)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4 text-purple-400" /> Saídas Totais (Mês)
              </span>
              <span className="text-white font-bold text-sm">-{formatMoney(expense)}</span>
            </div>
          </div>

          {/* Widget Dica Financeira IA */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-800/30 text-xs text-purple-200 space-y-1">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Dica de Inteligência Financeira
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              Sua margem retida deste mês é de {formatMoney(income - expense)}. Que tal guardar 30% desse valor na sua meta de Reserva em Metas?
            </p>
          </div>
        </motion.div>
      </div>
      
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/60 z-0 mix-blend-overlay"></div>
    </div>
  );
}
