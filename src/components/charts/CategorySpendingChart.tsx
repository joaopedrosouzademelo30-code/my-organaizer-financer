"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, PieChart as PieIcon, RefreshCw, Car, Utensils, ShoppingCart, Fuel, HeartPulse, Tv, Home, ShoppingBag, Tag, CheckCircle2 } from "lucide-react";
import { reclassifyAllTransactionsWithAI } from "@/server/actions/transactions";

interface CategorySpendingChartProps {
  initialData: {
    categories: Array<{
      name: string;
      amount: number;
      color: string;
      icon: string;
      percentage: string;
    }>;
    totalSpent: number;
  };
}

const ICON_MAP: Record<string, any> = {
  Wrench: Car,
  Car: Car,
  Utensils: Utensils,
  ShoppingCart: ShoppingCart,
  Fuel: Fuel,
  HeartPulse: HeartPulse,
  Tv: Tv,
  Home: Home,
  ShoppingBag: ShoppingBag,
  TrendingUp: TrendingUp,
  Tag: Tag
};

export function CategorySpendingChart({ initialData }: CategorySpendingChartProps) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [reclassifiedNotice, setReclassifiedNotice] = useState<string | null>(null);

  const formatMoney = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleReclassifyAI = async () => {
    setLoading(true);
    setReclassifiedNotice(null);
    const res = await reclassifyAllTransactionsWithAI();
    setLoading(false);

    if (res.success) {
      setReclassifiedNotice(`${res.count} transações foram recategorizadas pela IA!`);
      setTimeout(() => setReclassifiedNotice(null), 4000);
      window.location.reload();
    }
  };

  const hasData = data.categories && data.categories.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-gray-900/80 via-black/90 to-black border border-white/10 backdrop-blur-2xl shadow-2xl space-y-6"
    >
      {/* Cabeçalho do Gráfico */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" /> Inteligência Financeira
          </div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            Maiores Gastos do Mês por Categoria
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Categorização preditiva automatizada de todas as suas despesas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-right">
            <div className="text-[10px] text-gray-400 uppercase font-medium">Total de Gastos</div>
            <div className="text-lg font-black text-white">{formatMoney(data.totalSpent)}</div>
          </div>

          <button
            onClick={handleReclassifyAI}
            disabled={loading}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-amber-900/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Processando..." : "Categorizar Tudo com IA"}
          </button>
        </div>
      </div>

      {reclassifiedNotice && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>{reclassifiedNotice}</span>
        </motion.div>
      )}

      {hasData ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Gráfico de Rosca Recharts */}
          <div className="lg:col-span-5 h-64 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="amount"
                >
                  {data.categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="p-3 rounded-xl bg-black/90 border border-white/20 text-white text-xs shadow-2xl backdrop-blur-md">
                          <div className="font-bold flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            {item.name}
                          </div>
                          <div className="text-base font-extrabold mt-1">{formatMoney(item.amount)}</div>
                          <div className="text-[10px] text-gray-400">{item.percentage}% do total do mês</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] text-gray-400 font-semibold uppercase">Maior Gasto</span>
              <span className="text-sm font-black text-white truncate max-w-[120px]">
                {data.categories[0]?.name}
              </span>
            </div>
          </div>

          {/* Lista Detalhada com Barras de Progresso */}
          <div className="lg:col-span-7 space-y-3">
            {data.categories.map((cat, idx) => {
              const IconComp = ICON_MAP[cat.icon] || Tag;
              return (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 font-medium text-white">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: `${cat.color}30`, color: cat.color }}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span>{cat.name}</span>
                      {idx === 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                          #1 Maior Gasto
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-gray-400 text-[11px]">{cat.percentage}%</span>
                      <span className="font-bold text-white text-sm">{formatMoney(cat.amount)}</span>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400 space-y-3">
          <PieIcon className="w-12 h-12 mx-auto text-gray-600 animate-pulse" />
          <p className="text-sm font-medium">Nenhuma despesa registrada no mês atual.</p>
          <p className="text-xs text-gray-500">Cadastre novas transações para ver o gráfico de inteligência por IA.</p>
        </div>
      )}
    </motion.div>
  );
}
