"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { askGeminiAssistant } from "@/lib/gemini";

export async function askAIChatAction(userPrompt: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Não autorizado" };
  }

  const userId = session.user.id;

  const accounts = await prisma.account.findMany({ where: { userId } });
  const totalBalance = accounts.reduce((acc, a) => acc + parseFloat(a.balance.toString()), 0);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const monthlyTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: startOfMonth, lte: endOfMonth }
    },
    include: { category: true }
  });

  const income = monthlyTransactions
    .filter(t => t.type === "INCOME")
    .reduce((acc, t) => acc + parseFloat(t.amount.toString()), 0);

  const expense = monthlyTransactions
    .filter(t => t.type === "EXPENSE")
    .reduce((acc, t) => acc + parseFloat(t.amount.toString()), 0);

  const reply = await askGeminiAssistant(userPrompt, {
    balance: totalBalance,
    monthlyIncome: income,
    monthlyExpenses: expense,
    recentTransactions: monthlyTransactions.map(t => ({
      description: t.description,
      amount: parseFloat(t.amount.toString()),
      type: t.type,
      category: t.category?.name
    }))
  });

  return { reply };
}
