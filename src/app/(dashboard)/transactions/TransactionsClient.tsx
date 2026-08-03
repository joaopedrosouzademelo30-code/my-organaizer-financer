"use client";

import { useState } from "react";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { CategorySpendingChart } from "@/components/charts/CategorySpendingChart";
import { ReceiptUploaderModal } from "@/components/receipts/ReceiptUploaderModal";
import { motion } from 'framer-motion';
import { Upload, Sparkles } from "lucide-react";

interface TransactionsClientProps {
  initialTransactions: any[];
  monthlySpending: {
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

export function TransactionsClient({ initialTransactions, monthlySpending }: TransactionsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  return (
    <div className="pointer-events-auto mt-8 pb-32 space-y-10">
      {/* Cabeçalho */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2"
      >
        <div>
          <h2 className="text-4xl font-black text-white drop-shadow-md tracking-tight">Transações</h2>
          <p className="text-gray-300 font-medium drop-shadow-sm mt-1">Categorização Inteligente com IA & Fluxo em Tempo Real.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsReceiptModalOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-purple-600 border border-white/20 text-white px-5 py-3 rounded-full hover:scale-105 active:scale-95 transition-all font-bold text-xs shadow-lg flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" /> Importar Nota com IA
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 border border-white/20 text-white px-6 py-3 rounded-full hover:scale-105 active:scale-95 transition-all font-bold text-xs shadow-lg"
          >
            + Nova Transação
          </button>
        </div>
      </motion.div>

      {/* Gráfico de Gastos por Categoria da IA */}
      <CategorySpendingChart initialData={monthlySpending} />

      {/* Tabela de Transações */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Histórico de Lançamentos</h3>
          <span className="text-xs text-gray-400 font-mono">{initialTransactions.length} registros</span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-5 font-semibold text-xs uppercase tracking-widest text-gray-400">Data</th>
              <th className="p-5 font-semibold text-xs uppercase tracking-widest text-gray-400">Descrição</th>
              <th className="p-5 font-semibold text-xs uppercase tracking-widest text-gray-400">Categoria (IA)</th>
              <th className="p-5 font-semibold text-xs uppercase tracking-widest text-gray-400 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {initialTransactions.map((t) => (
              <tr key={t.id} className="hover:bg-white/10 transition-colors group">
                <td className="p-5 text-sm text-gray-300 font-medium font-mono">
                  {new Date(t.date).toLocaleDateString("pt-BR", { timeZone: 'UTC' })}
                </td>
                <td className="p-5 text-sm font-bold text-white group-hover:text-blue-300 transition-colors">{t.description}</td>
                <td className="p-5 text-sm">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold border text-white"
                    style={{
                      backgroundColor: `${t.category?.color || '#6B7280'}25`,
                      borderColor: `${t.category?.color || '#6B7280'}50`
                    }}
                  >
                    {t.category?.name || "Geral"}
                  </span>
                </td>
                <td className={`p-5 text-sm text-right font-black tracking-wide font-mono ${t.type === 'INCOME' ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]' : 'text-white'}`}>
                  {t.type === 'INCOME' ? '+' : '-'} R$ {Number(t.amount).toFixed(2).replace('.', ',')}
                </td>
              </tr>
            ))}
            {initialTransactions.length === 0 && (
              <tr>
                <td colSpan={4} className="p-16 text-center text-gray-400 font-medium">Fluxo vazio. Clique em "Nova Transação" para injetar dados na sua árvore.</td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Modal de Criação (Transação) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-2xl flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-gray-900/80 backdrop-blur-3xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/20"
          >
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h3 className="font-bold text-xl text-white tracking-tight">Nova Transação com IA</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              <TransactionForm onSuccess={() => {
                setIsModalOpen(false);
                window.location.reload();
              }} />
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Importação de Comprovantes via OCR Gemini */}
      <ReceiptUploaderModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        onSuccess={() => {
          setIsReceiptModalOpen(false);
          window.location.reload();
        }}
      />
    </div>
  );
}
