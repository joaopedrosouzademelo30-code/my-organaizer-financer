"use client";

import { motion } from "framer-motion";
import { CompoundInterestSimulator } from "@/components/wealth/CompoundInterestSimulator";

export default function WealthPage() {
  return (
    <div className="relative w-full min-h-screen bg-black overflow-y-auto pb-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black pointer-events-none" />

      <div className="relative z-10 p-6 md:p-12 max-w-6xl mx-auto space-y-10">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-left"
        >
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-indigo-300 to-purple-400 drop-shadow-2xl">
            Patrimônio & Investimentos
          </h1>
          <p className="text-gray-300 max-w-2xl text-lg font-medium mt-2">
            Simulação de juros compostos, alocação de carteira e projeção de independência financeira por IA.
          </p>
        </motion.div>

        {/* Componente do Simulador */}
        <CompoundInterestSimulator />
      </div>
    </div>
  );
}
