"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Plus, Sparkles, TrendingUp, Calendar, Trash2, CheckCircle2, DollarSign } from "lucide-react";
import { createGoal, addDepositToGoal, deleteGoal } from "@/server/actions/goals";

interface GoalItem {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  progressPercentage: number;
  aiAdvice: string;
}

export function GoalsClient({ initialGoals }: { initialGoals: GoalItem[] }) {
  const [goals, setGoals] = useState(initialGoals);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");

  const formatMoney = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoalId || !depositAmount) return;

    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return;

    const res = await addDepositToGoal(depositGoalId, amt);
    if (res.success) {
      setGoals(prev =>
        prev.map(g => {
          if (g.id === depositGoalId) {
            const updatedCurr = g.currentAmount + amt;
            return {
              ...g,
              currentAmount: updatedCurr,
              progressPercentage: Math.min(100, Math.round((updatedCurr / g.targetAmount) * 100))
            };
          }
          return g;
        })
      );
      setDepositGoalId(null);
      setDepositAmount("");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja apagar esta meta?")) return;
    await deleteGoal(id);
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Target className="w-8 h-8 text-amber-400" /> Metas & Reserva de Emergência
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Planejamento inteligente e acompanhamento de conquistas impulsionado pela IA Gemini.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold shadow-lg shadow-purple-900/30 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" /> Criar Nova Meta
        </button>
      </div>

      {/* Grid de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((g) => (
          <motion.div
            key={g.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-gray-900/80 via-black to-black border border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-semibold border border-amber-500/20">
                  {g.progressPercentage >= 100 ? "🎉 Concluída" : "Em Progresso"}
                </span>
                <h3 className="text-2xl font-extrabold text-white mt-2">{g.name}</h3>
                {g.deadline && (
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Prazo: {new Date(g.deadline).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>

              <button
                onClick={() => handleDelete(g.id)}
                className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Progresso & Valores */}
            <div className="space-y-2">
              <div className="flex justify-between items-end text-xs">
                <span className="text-gray-400 font-medium">Acumulado</span>
                <span className="font-mono text-xl font-bold text-white">
                  {formatMoney(g.currentAmount)}{" "}
                  <span className="text-xs text-gray-500 font-normal">/ {formatMoney(g.targetAmount)}</span>
                </span>
              </div>

              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${g.progressPercentage}%` }}
                  transition={{ duration: 1 }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-purple-600 shadow-inner"
                />
              </div>

              <div className="text-right text-[11px] text-amber-300 font-bold font-mono">
                {g.progressPercentage}% alcançado
              </div>
            </div>

            {/* Dica da IA Gemini */}
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/30 text-xs text-purple-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{g.aiAdvice}</span>
            </div>

            {/* Ação de Aporte */}
            <button
              onClick={() => setDepositGoalId(g.id)}
              className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" /> Guardar Dinheiro nesta Meta
            </button>
          </motion.div>
        ))}

        {goals.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400 bg-white/5 rounded-3xl border border-white/5 space-y-3">
            <Target className="w-12 h-12 mx-auto text-amber-400/50" />
            <p className="font-semibold text-white">Nenhuma meta criada ainda.</p>
            <p className="text-xs text-gray-500">Crie sua primeira meta para receber orientações financeiras da IA Gemini.</p>
          </div>
        )}
      </div>

      {/* Modal de Nova Meta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-8 rounded-3xl bg-gray-900 border border-white/20 shadow-2xl text-white space-y-6"
          >
            <h3 className="text-xl font-bold text-white">Criar Nova Meta Financeira</h3>
            <form
              action={async (fd) => {
                await createGoal(fd);
                setIsModalOpen(false);
                window.location.reload();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Nome da Meta</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Ex: Viagem de Férias, Reserva 6 Meses"
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Valor Objetivo (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  name="targetAmount"
                  placeholder="10000"
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Prazo Estimado (Opcional)</label>
                <input
                  type="date"
                  name="deadline"
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-white/10 text-gray-300 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400"
                >
                  Salvar Meta
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal de Aporte */}
      {depositGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm p-6 rounded-3xl bg-gray-900 border border-white/20 text-white space-y-4"
          >
            <h3 className="text-lg font-bold text-white">Adicionar Aporte à Meta</h3>
            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Valor do Aporte (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="500,00"
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDepositGoalId(null)}
                  className="flex-1 py-3 rounded-2xl bg-white/10 text-gray-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500"
                >
                  Confirmar Aporte
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
