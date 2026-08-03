"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { categorizeTransactionWithAI } from "@/lib/aiCategorizer";

export async function createTransaction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Não autorizado" };
  }

  const userId = session.user.id;
  const amountStr = formData.get("amount") as string;
  const description = formData.get("description") as string;
  const type = formData.get("type") as string; // INCOME, EXPENSE
  const dateStr = formData.get("date") as string;

  if (!amountStr || !description || !type || !dateStr) {
    return { error: "Preencha todos os campos obrigatórios." };
  }

  // Categorização Automática por IA
  const aiCategory = categorizeTransactionWithAI(description);

  let category = await prisma.category.findFirst({
    where: { userId, name: aiCategory.name }
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        userId,
        name: aiCategory.name,
        type: type as any,
        color: aiCategory.color,
        icon: aiCategory.icon
      }
    });
  }

  try {
    await prisma.transaction.create({
      data: {
        userId,
        amount: parseFloat(amountStr),
        description,
        type,
        date: new Date(dateStr),
        categoryId: category.id,
        status: "COMPLETED",
      }
    });

    revalidatePath("/");
    revalidatePath("/transactions");
    revalidatePath("/connections");
    revalidatePath("/wealth");
    return { success: true };
  } catch (err) {
    return { error: "Erro ao criar transação" };
  }
}

export async function getTransactions() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    include: { category: true }
  });

  return transactions.map(t => ({
    ...t,
    amount: t.amount.toString(),
  }));
}

export async function getMonthlyCategorySpending() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { categories: [], totalSpent: 0 };

  const userId = session.user.id;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      date: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    },
    include: { category: true }
  });

  const categoryMap: Record<string, { name: string; amount: number; color: string; icon: string }> = {};
  let totalSpent = 0;

  for (const t of transactions) {
    const amt = parseFloat(t.amount.toString());
    totalSpent += amt;
    const catName = t.category?.name || "Geral";
    const catColor = t.category?.color || "#6B7280";
    const catIcon = t.category?.icon || "Tag";

    if (!categoryMap[catName]) {
      categoryMap[catName] = {
        name: catName,
        amount: 0,
        color: catColor,
        icon: catIcon
      };
    }
    categoryMap[catName].amount += amt;
  }

  const categoriesList = Object.values(categoryMap).map(c => ({
    ...c,
    percentage: totalSpent > 0 ? ((c.amount / totalSpent) * 100).toFixed(1) : "0"
  })).sort((a, b) => b.amount - a.amount);

  return {
    categories: categoriesList,
    totalSpent
  };
}

export async function reclassifyAllTransactionsWithAI() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Não autorizado" };

  const userId = session.user.id;

  const transactions = await prisma.transaction.findMany({
    where: { userId }
  });

  let reclassifiedCount = 0;

  for (const t of transactions) {
    const aiCategory = categorizeTransactionWithAI(t.description);

    let category = await prisma.category.findFirst({
      where: { userId, name: aiCategory.name }
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          userId,
          name: aiCategory.name,
          type: t.type as any,
          color: aiCategory.color,
          icon: aiCategory.icon
        }
      });
    }

    await prisma.transaction.update({
      where: { id: t.id },
      data: { categoryId: category.id }
    });

    reclassifiedCount++;
  }

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/connections");

  return { success: true, count: reclassifiedCount };
}
