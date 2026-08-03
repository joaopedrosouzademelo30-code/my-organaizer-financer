import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getMonthlyCategorySpending, getTransactions } from "@/server/actions/transactions";
import { ReportsClient } from "./ReportsClient";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id || "";

  const now = new Date();
  const monthYear = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const accounts = await prisma.account.findMany({ where: { userId } });
  const totalBalance = accounts.reduce((acc, a) => acc + parseFloat(a.balance.toString()), 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const monthTxs = await prisma.transaction.findMany({
    where: { userId, date: { gte: startOfMonth, lte: endOfMonth } },
    include: { category: true }
  });

  const income = monthTxs.filter(t => t.type === "INCOME").reduce((acc, t) => acc + parseFloat(t.amount.toString()), 0);
  const expense = monthTxs.filter(t => t.type === "EXPENSE").reduce((acc, t) => acc + parseFloat(t.amount.toString()), 0);

  const categorySpending = await getMonthlyCategorySpending();

  return (
    <div className="relative w-full min-h-screen bg-black overflow-y-auto">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black pointer-events-none" />

      <div className="relative z-10 p-6 md:p-12 max-w-5xl mx-auto">
        <ReportsClient
          reportData={{
            userName: session?.user?.name || "Usuário Gemini",
            monthYear,
            totalBalance,
            monthlyIncome: income,
            monthlyExpenses: expense,
            netMargin: income - expense,
            categories: categorySpending.categories,
            recentTransactions: monthTxs.slice(0, 8).map(t => ({
              id: t.id,
              description: t.description,
              amount: t.amount.toString(),
              type: t.type,
              date: t.date.toISOString(),
              category: t.category?.name
            })),
            aiAdvice: `Neste mês de ${monthYear}, suas despesas totais foram de R$ ${expense.toFixed(2)}. Com entradas de R$ ${income.toFixed(2)}, sua margem financeira é positiva. Mantenha os aportes nas suas metas e monitore as categorias de maior peso.`
          }}
        />
      </div>
    </div>
  );
}
