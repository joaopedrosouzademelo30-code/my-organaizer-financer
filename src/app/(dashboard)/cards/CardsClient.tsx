"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Calendar, ShieldCheck, Plus, Clock, AlertCircle } from "lucide-react";

interface CardsClientProps {
  initialCards: Array<{
    id: string;
    name: string;
    limit: number;
    closingDay: number;
    dueDay: number;
    usedLimit: number;
    availableLimit: number;
    installments: Array<{ description: string; current: number; total: number; amount: number }>;
  }>;
}

export function CardsClient({ initialCards }: CardsClientProps) {
  const [cards] = useState(initialCards);

  const formatMoney = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-8 pb-24 text-white">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-purple-400" /> Cartões de Crédito & Faturas
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Gerenciamento de limites, datas de fechamento, vencimentos e compras parceladas.
          </p>
        </div>
      </div>

      {/* Grid de Cartões */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => {
          const usedPercentage = Math.min(100, Math.round((card.usedLimit / card.limit) * 100));

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 rounded-3xl bg-gradient-to-br from-purple-950/40 via-gray-900 to-black border border-purple-500/30 backdrop-blur-2xl shadow-2xl space-y-6 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 to-purple-500 flex items-center justify-center font-black text-white text-lg shadow-lg">
                    {card.name.includes("Nubank") ? "nu" : "💳"}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xl">{card.name}</h3>
                    <p className="text-xs text-gray-400">Cartão de Crédito Físico & Virtual</p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                  ● Fatura Aberta
                </span>
              </div>

              {/* Datas de Fechamento e Vencimento */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-white/5 p-4 rounded-2xl border border-white/5">
                <div>
                  <span className="text-gray-400 block font-medium">Fechamento da Fatura</span>
                  <span className="text-white font-bold font-mono">Dia {card.closingDay} do mês</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Vencimento do Boleto</span>
                  <span className="text-amber-400 font-bold font-mono">Dia {card.dueDay} do mês</span>
                </div>
              </div>

              {/* Progresso do Limite Consumido */}
              <div className="space-y-2">
                <div className="flex justify-between items-end text-xs">
                  <span className="text-gray-400">Fatura Atual: <strong className="text-white">{formatMoney(card.usedLimit)}</strong></span>
                  <span className="text-gray-400">Limite Disponível: <strong className="text-emerald-400">{formatMoney(card.availableLimit)}</strong></span>
                </div>

                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${usedPercentage}%` }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500"
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-gray-400 font-mono">
                  <span>Limite Total: {formatMoney(card.limit)}</span>
                  <span className="text-purple-300 font-bold">{usedPercentage}% utilizado</span>
                </div>
              </div>

              {/* Compras Parceladas */}
              {card.installments.length > 0 && (
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Compras Parceladas na Fatura
                  </h4>
                  {card.installments.map((inst, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-white">{inst.description}</div>
                        <div className="text-[10px] text-purple-300 font-mono">Parcela {inst.current} de {inst.total}</div>
                      </div>
                      <div className="font-mono font-bold text-white">{formatMoney(inst.amount)}/mês</div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
