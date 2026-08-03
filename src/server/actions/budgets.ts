"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getBudgets() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { budgets: [], alerts: [] };

  const userId = session.user.id;
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
  const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

  let categories = await prisma.category.findMany({
    where: { userId }
  });

  if (categories.length === 0) {
    const defaultCats = [
      { name: "Alimentação & Restaurantes", type: "EXPENSE", color: "#F97316", icon: "Utensils" },
      { name: "Veículos & Mecânica", type: "EXPENSE", color: "#EAB308", icon: "Car" },
      { name: "Transporte & Combustível", type: "EXPENSE", color: "#3B82F6", icon: "Fuel" },
      { name: "Mercado & Supermercado", type: "EXPENSE", color: "#22C55E", icon: "ShoppingCart" }
    ];

    for (const d of defaultCats) {
      await prisma.category.create({
        data: { userId, ...d }
      });
    }

    categories = await prisma.category.findMany({ where: { userId } });
  }

  const existingBudgets = await prisma.budget.findMany({
    where: { userId, month: currentMonth, year: currentYear }
  });

  const monthTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      date: { gte: startOfMonth, lte: endOfMonth }
    }
  });

  const budgetList = categories.map(cat => {
    const b = existingBudgets.find(item => item.categoryId === cat.id);
    const limit = b ? parseFloat(b.amountLimit.toString()) : 1500.00;

    const spent = monthTransactions
      .filter(t => t.categoryId === cat.id)
      .reduce((acc, t) => acc + parseFloat(t.amount.toString()), 0);

    const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      categoryColor: cat.color || "#6B7280",
      categoryIcon: cat.icon || "Tag",
      limit,
      spent,
      remaining: Math.max(0, limit - spent),
      percentage,
      isOverLimit: spent > limit,
      isWarning: percentage >= 80 && spent <= limit
    };
  });

  const alerts: string[] = [];
  const overspent = budgetList.filter(b => b.isOverLimit);
  const warnings = budgetList.filter(b => b.isWarning);

  if (overspent.length > 0) {
    alerts.push(`🚨 Atenção! Você estourou o teto de orçamento nas categorias: ${overspent.map(o => o.categoryName).join(", ")}.`);
  }

  if (warnings.length > 0) {
    alerts.push(`⚠️ Alerta IA: Você atingiu mais de 80% do limite mensal em: ${warnings.map(w => w.categoryName).join(", ")}.`);
  }

  if (alerts.length === 0) {
    alerts.push("✅ Excelente! Todos os seus orçamentos por categoria estão dentro da margem segura neste mês.");
  }

  return {
    budgets: budgetList,
    alerts
  };
}

export async function setCategoryBudget(categoryId: string, amountLimit: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Não autorizado" };

  const userId = session.user.id;
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const existing = await prisma.budget.findFirst({
    where: { userId, categoryId, month: currentMonth, year: currentYear }
  });

  if (existing) {
    await prisma.budget.update({
      where: { id: existing.id },
      data: { amountLimit }
    });
  } else {
    await prisma.budget.create({
      data: {
        userId,
        categoryId,
        amountLimit,
        month: currentMonth,
        year: currentYear
      }
    });
  }

  revalidatePath("/budgets");
  revalidatePath("/");
  return { success: true };
}
