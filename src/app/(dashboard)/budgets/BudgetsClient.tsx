"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PieChart, Sparkles, AlertTriangle, CheckCircle2, Edit3, Save } from "lucide-react";
import { setCategoryBudget } from "@/server/actions/budgets";

interface BudgetsClientProps {
  initialData: {
    budgets: Array<{
      categoryId: string;
      categoryName: string;
      categoryColor: string;
      categoryIcon: string;
      limit: number;
      spent: number;
      remaining: number;
      percentage: number;
      isOverLimit: boolean;
      isWarning: boolean;
    }>;
    alerts: string[];
  };
}

export function BudgetsClient({ initialData }: BudgetsClientProps) {
  const [budgets, setBudgets] = useState(initialData.budgets || []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLimit, setEditLimit] = useState("");

  const formatMoney = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleSaveLimit = async (catId: string) => {
    const newLimit = parseFloat(editLimit);
    if (isNaN(newLimit) || newLimit <= 0) return;

    const res = await setCategoryBudget(catId, newLimit);
    if (res.success) {
      setBudgets(prev =>
        prev.map(b => {
          if (b.categoryId === catId) {
            const percentage = Math.round((b.spent / newLimit) * 100);
            return {
              ...b,
              limit: newLimit,
              remaining: Math.max(0, newLimit - b.spent),
              percentage,
              isOverLimit: b.spent > newLimit,
              isWarning: percentage >= 80 && b.spent <= newLimit
            };
          }
          return b;
        })
      );
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <PieChart className="w-8 h-8 text-purple-400" /> Teto de Orçamentos & Alertas IA
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Controle de limites por categoria e monitoramento automatizado contra gastos excessivos.
          </p>
        </div>
      </div>

      {/* Cards de Alertas por IA Gemini */}
      <div className="space-y-3">
        {initialData.alerts.map((alertText, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-4 rounded-2xl border text-xs font-semibold flex items-start gap-3 backdrop-blur-md ${
              alertText.includes("Atenção")
                ? "bg-red-500/10 border-red-500/30 text-red-300"
                : alertText.includes("Alerta")
                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{alertText}</span>
          </motion.div>
        ))}
      </div>

      {/* Lista de Orçamentos por Categoria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((b) => (
          <motion.div
            key={b.categoryId}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-3xl border backdrop-blur-2xl transition-all relative overflow-hidden flex flex-col justify-between space-y-4 ${
              b.isOverLimit
                ? "bg-gradient-to-br from-red-950/30 via-gray-900 to-black border-red-500/40"
                : b.isWarning
                ? "bg-gradient-to-br from-amber-950/30 via-gray-900 to-black border-amber-500/40"
                : "bg-white/5 border-white/10"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md"
                  style={{ backgroundColor: `${b.categoryColor}40`, color: b.categoryColor }}
                >
                  ●
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{b.categoryName}</h3>
                  <div className="text-[11px] text-gray-400">
                    {b.isOverLimit
                      ? "🚨 Limite Excedido"
                      : b.isWarning
                      ? "⚠️ Próximo do Limite"
                      : "✅ Dentro da Margem"}
                  </div>
                </div>
              </div>

              {editingId === b.categoryId ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editLimit}
                    onChange={(e) => setEditLimit(e.target.value)}
                    placeholder={b.limit.toString()}
                    className="w-24 px-2 py-1 rounded-lg bg-black border border-white/20 text-white text-xs font-mono"
                  />
                  <button
                    onClick={() => handleSaveLimit(b.categoryId)}
                    className="p-1.5 rounded-lg bg-emerald-600 text-white"
                  >
                    <Save className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditingId(b.categoryId);
                    setEditLimit(b.limit.toString());
                  }}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Valores de Consumo */}
            <div className="space-y-2">
              <div className="flex justify-between items-end text-xs">
                <span className="text-gray-400">Gasto Atual: <strong className="text-white">{formatMoney(b.spent)}</strong></span>
                <span className="text-gray-400">Teto Definido: <strong className="text-white">{formatMoney(b.limit)}</strong></span>
              </div>

              {/* Barra de Progresso */}
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, b.percentage)}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-full rounded-full ${
                    b.isOverLimit ? "bg-red-500" : b.isWarning ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] font-mono pt-1">
                <span className="text-gray-400">Disponível: {formatMoney(b.remaining)}</span>
                <span
                  className={`font-bold ${
                    b.isOverLimit ? "text-red-400" : b.isWarning ? "text-amber-400" : "text-emerald-400"
                  }`}
                >
                  {b.percentage}% do limite
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
