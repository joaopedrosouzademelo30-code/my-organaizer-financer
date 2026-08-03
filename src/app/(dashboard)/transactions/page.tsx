import { getTransactions, getMonthlyCategorySpending } from "@/server/actions/transactions";
import { TransactionsClient } from "./TransactionsClient";
import Spline from '@splinetool/react-spline';
import { Suspense } from 'react';

export default async function TransactionsPage() {
  const transactions = await getTransactions();
  const monthlySpending = await getMonthlyCategorySpending();

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col">
      {/* Background Spline 3D */}
      <div className="absolute inset-0 w-full h-full opacity-60">
        <Suspense fallback={<div className="flex items-center justify-center w-full h-full text-white/50">Carregando Cena 3D...</div>}>
          <Spline scene="https://prod.spline.design/dGSozpRn1eB2ZwBj/scene.splinecode" />
        </Suspense>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none mix-blend-overlay"></div>

      <div className="relative z-10 p-4 md:p-10 h-full overflow-y-auto w-full max-w-6xl mx-auto pointer-events-none scrollbar-hide">
        <TransactionsClient initialTransactions={transactions} monthlySpending={monthlySpending} />
      </div>
    </div>
  );
}
