"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Printer, Download, Sparkles, TrendingUp, ArrowDownLeft, ArrowUpRight, CheckCircle2, Shield } from "lucide-react";

interface ReportsClientProps {
  reportData: {
    userName: string;
    monthYear: string;
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    netMargin: number;
    categories: Array<{ name: string; amount: number; percentage: string }>;
    recentTransactions: Array<{ id: string; description: string; amount: string; type: string; date: string; category?: string }>;
    aiAdvice: string;
  };
}

export function ReportsClient({ reportData }: ReportsClientProps) {
  const formatMoney = (val: number | string) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-24 text-white">
      {/* Botões de Ação na Tela (escondidos ao imprimir) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-indigo-400" /> Relatório Financeiro Mensal
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Balanço consolidado de receitas, despesas, extrato e análise da IA Gemini.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white font-bold shadow-lg shadow-indigo-900/30 transition-all flex items-center justify-center gap-2"
        >
          <Printer className="w-5 h-5" /> Imprimir / Salvar em PDF
        </button>
      </div>

      {/* Relatório Formatado (Legível tanto na Tela quanto em PDF) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 md:p-12 rounded-3xl bg-gradient-to-b from-gray-900/90 via-black to-black border border-white/10 shadow-2xl space-y-8 print:bg-white print:text-black print:border-none print:shadow-none print:p-0"
      >
        {/* Cabeçalho do Relatório */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10 print:border-gray-300">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-lg print:text-indigo-700">
              <Sparkles className="w-5 h-5 text-amber-400 print:text-amber-600" /> Finanças Gemini AI
            </div>
            <h2 className="text-2xl font-black text-white print:text-black mt-1">
              Relatório Executivo Mensal
            </h2>
            <p className="text-xs text-gray-400 print:text-gray-600 mt-0.5">
              Cliente: {reportData.userName} • Período: {reportData.monthYear}
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-gray-400 print:text-gray-600 uppercase font-semibold">Status de Autenticação</div>
            <div className="text-sm font-bold text-emerald-400 print:text-emerald-700 flex items-center gap-1 justify-end">
              <Shield className="w-4 h-4" /> Balanço Verificado
            </div>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 print:bg-gray-100 print:border-gray-300">
            <div className="text-xs text-gray-400 print:text-gray-600 font-medium">Entradas Totais do Mês</div>
            <div className="text-2xl font-black text-emerald-400 print:text-emerald-700 mt-1">
              +{formatMoney(reportData.monthlyIncome)}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 print:bg-gray-100 print:border-gray-300">
            <div className="text-xs text-gray-400 print:text-gray-600 font-medium">Saídas Totais do Mês</div>
            <div className="text-2xl font-black text-red-400 print:text-red-700 mt-1">
              -{formatMoney(reportData.monthlyExpenses)}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 print:bg-gray-100 print:border-gray-300">
            <div className="text-xs text-gray-400 print:text-gray-600 font-medium">Margem Líquida Retida</div>
            <div className="text-2xl font-black text-indigo-300 print:text-indigo-800 mt-1">
              {formatMoney(reportData.netMargin)}
            </div>
          </div>
        </div>

        {/* Análise Financeira da IA Gemini */}
        <div className="p-6 rounded-2xl bg-purple-950/20 border border-purple-800/30 print:bg-purple-50 print:border-purple-200 text-xs text-purple-200 print:text-purple-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-300 print:text-amber-800 text-sm">
            <Sparkles className="w-4 h-4" /> Parecer Executivo da IA Gemini
          </div>
          <p className="leading-relaxed">{reportData.aiAdvice}</p>
        </div>

        {/* Detalhamento por Categoria */}
        <div>
          <h3 className="text-base font-bold text-white print:text-black mb-4">
            Distribuição de Gastos por Categoria
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {reportData.categories.map((cat) => (
              <div
                key={cat.name}
                className="p-3.5 rounded-xl bg-white/5 border border-white/5 print:bg-gray-50 print:border-gray-200 flex justify-between items-center text-xs"
              >
                <span className="font-semibold text-gray-200 print:text-gray-800">{cat.name}</span>
                <div className="font-mono text-right">
                  <span className="text-gray-400 print:text-gray-500 mr-2">{cat.percentage}%</span>
                  <span className="font-bold text-white print:text-black">{formatMoney(cat.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Extrato de Lançamentos Recentes */}
        <div>
          <h3 className="text-base font-bold text-white print:text-black mb-4">
            Extrato de Lançamentos Recentes
          </h3>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 print:border-gray-300 text-gray-400 print:text-gray-600 font-semibold uppercase">
                <th className="py-3">Data</th>
                <th className="py-3">Descrição</th>
                <th className="py-3">Categoria</th>
                <th className="py-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 print:divide-gray-200">
              {reportData.recentTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="py-3 text-gray-400 print:text-gray-600 font-mono">
                    {new Date(tx.date).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="py-3 font-bold text-white print:text-black">{tx.description}</td>
                  <td className="py-3 text-gray-300 print:text-gray-700">{tx.category || "Geral"}</td>
                  <td className={`py-3 text-right font-mono font-bold ${tx.type === "INCOME" ? "text-emerald-400 print:text-emerald-700" : "text-white print:text-black"}`}>
                    {tx.type === "INCOME" ? "+" : "-"}{formatMoney(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
