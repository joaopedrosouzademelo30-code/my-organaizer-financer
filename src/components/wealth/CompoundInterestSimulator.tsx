"use client";

import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, Sparkles, DollarSign, Clock, ShieldCheck, PieChart } from "lucide-react";

export function CompoundInterestSimulator() {
  const [initialAmount, setInitialAmount] = useState(5000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [years, setYears] = useState(10);
  const [annualRate, setAnnualRate] = useState(12); // 12% ao ano (ex: CDB 100% CDI)

  const calculateProjection = () => {
    const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
    const totalMonths = years * 12;

    const data = [];
    let currentInvested = initialAmount;
    let currentTotal = initialAmount;

    for (let month = 0; month <= totalMonths; month++) {
      if (month % 12 === 0 || month === totalMonths) {
        data.push({
          year: `Ano ${month / 12}`,
          invested: Math.round(currentInvested),
          total: Math.round(currentTotal),
          interest: Math.round(currentTotal - currentInvested)
        });
      }

      currentTotal = currentTotal * (1 + monthlyRate) + monthlyContribution;
      currentInvested += monthlyContribution;
    }

    return data;
  };

  const projectionData = calculateProjection();
  const finalResult = projectionData[projectionData.length - 1];

  const formatMoney = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 rounded-3xl bg-gradient-to-br from-gray-900/90 via-black to-black border border-white/10 backdrop-blur-2xl shadow-2xl space-y-8 text-white"
    >
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" /> Multiplicação de Patrimônio
          </div>
          <h2 className="text-3xl font-black text-white">Simulador de Juros Compostos</h2>
          <p className="text-xs text-gray-400 mt-1">
            Veja o efeito da bola de neve do tempo e dos aportes contínuos no seu futuro.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-right">
            <div className="text-[10px] text-gray-400 uppercase font-medium">Patrimônio Projetado</div>
            <div className="text-2xl font-black text-emerald-400">
              {formatMoney(finalResult.total)}
            </div>
          </div>
        </div>
      </div>

      {/* Controles do Simulador */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Valor Inicial (R$)</label>
          <input
            type="number"
            value={initialAmount}
            onChange={(e) => setInitialAmount(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Aporte Mensal (R$)</label>
          <input
            type="number"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Tempo (Anos)</label>
          <input
            type="number"
            value={years}
            min={1}
            max={40}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Taxa Anual estimada (%)</label>
          <input
            type="number"
            step="0.5"
            value={annualRate}
            onChange={(e) => setAnnualRate(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Gráfico de Área Comparativo Recharts */}
      <div className="h-72 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={projectionData}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="year" stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="p-4 rounded-2xl bg-black/90 border border-white/20 text-white text-xs shadow-2xl backdrop-blur-md space-y-1">
                      <div className="font-bold text-gray-400">{data.year}</div>
                      <div className="text-emerald-400 font-black text-sm">Total Acumulado: {formatMoney(data.total)}</div>
                      <div className="text-indigo-300 font-semibold">Total Investido do Bolso: {formatMoney(data.invested)}</div>
                      <div className="text-amber-300 font-bold">Juros Compostos Ganhos: {formatMoney(data.interest)}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area type="monotone" dataKey="total" name="Patrimônio Total" stroke="#10B981" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={3} />
            <Area type="monotone" dataKey="invested" name="Valor Investido" stroke="#6366F1" fillOpacity={1} fill="url(#colorInvested)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Sugestão de Alocação por IA Gemini */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/30 to-indigo-950/30 border border-purple-800/30 space-y-3">
        <div className="flex items-center gap-2 font-bold text-purple-300 text-sm">
          <Sparkles className="w-5 h-5 text-amber-400" /> Recomendação de Alocação por IA Gemini
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          Para atingir <strong className="text-emerald-400">{formatMoney(finalResult.total)}</strong> em {years} anos com segurança, a IA recomenda diversificar seu aporte mensal de {formatMoney(monthlyContribution)} da seguinte forma:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="text-xs text-gray-400">Renda Fixa / Tesouro SELIC (50%)</div>
            <div className="text-base font-bold text-emerald-400">{formatMoney(monthlyContribution * 0.5)}/mês</div>
            <div className="text-[10px] text-gray-500">Liquidez e Reserva</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="text-xs text-gray-400">Fundos Imobiliários (30%)</div>
            <div className="text-base font-bold text-indigo-400">{formatMoney(monthlyContribution * 0.3)}/mês</div>
            <div className="text-[10px] text-gray-500">Dividendos Mensais Isentos</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="text-xs text-gray-400">Ações & ETFs Global (20%)</div>
            <div className="text-base font-bold text-purple-400">{formatMoney(monthlyContribution * 0.2)}/mês</div>
            <div className="text-[10px] text-gray-500">Crescimento de Longo Prazo</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
