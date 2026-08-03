"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getGoalAISuggestion } from "@/lib/gemini";
import { revalidatePath } from "next/cache";

export async function getGoals() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const userId = session.user.id;
  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: { currentAmount: "desc" }
  });

  return goals.map(g => {
    const target = parseFloat(g.targetAmount.toString());
    const current = parseFloat(g.currentAmount.toString());
    const deadlineStr = g.deadline ? g.deadline.toISOString() : null;

    return {
      id: g.id,
      name: g.name,
      targetAmount: target,
      currentAmount: current,
      deadline: deadlineStr,
      progressPercentage: target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0,
      aiAdvice: getGoalAISuggestion(g.name, target, current, deadlineStr)
    };
  });
}

export async function createGoal(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Não autorizado" };

  const name = formData.get("name") as string;
  const targetStr = formData.get("targetAmount") as string;
  const deadlineStr = formData.get("deadline") as string;

  if (!name || !targetStr) {
    return { error: "Informe o nome e o valor objetivo da meta." };
  }

  try {
    await prisma.goal.create({
      data: {
        userId: session.user.id,
        name,
        targetAmount: parseFloat(targetStr),
        currentAmount: 0.00,
        deadline: deadlineStr ? new Date(deadlineStr) : null
      }
    });

    revalidatePath("/goals");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { error: "Erro ao criar meta" };
  }
}

export async function addDepositToGoal(goalId: string, amount: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Não autorizado" };

  const userId = session.user.id;
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId }
  });

  if (!goal) return { error: "Meta não encontrada" };

  const newAmount = parseFloat(goal.currentAmount.toString()) + amount;

  await prisma.goal.update({
    where: { id: goalId },
    data: { currentAmount: newAmount }
  });

  revalidatePath("/goals");
  revalidatePath("/");
  return { success: true };
}

export async function deleteGoal(goalId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Não autorizado" };

  await prisma.goal.deleteMany({
    where: { id: goalId, userId: session.user.id }
  });

  revalidatePath("/goals");
  revalidatePath("/");
  return { success: true };
}
