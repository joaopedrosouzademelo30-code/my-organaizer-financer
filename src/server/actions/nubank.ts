"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { bankConfigs } from "@/lib/bankConfig";

export async function connectBankAccount(bankCode: string, cpf: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Não autorizado. Faça login novamente." };
  }

  const userId = session.user.id;
  const config = bankConfigs[bankCode] || bankConfigs["NUBANK"];

  if (!cpf || cpf.replace(/\D/g, "").length !== 11) {
    return { error: "Por favor, informe um CPF válido (11 dígitos)." };
  }

  try {
    let defaultCategory = await prisma.category.findFirst({
      where: { userId, name: `Sincronizado ${config.name}` }
    });

    if (!defaultCategory) {
      defaultCategory = await prisma.category.create({
        data: {
          userId,
          name: `Sincronizado ${config.name}`,
          type: "EXPENSE",
          color: config.color,
          icon: "Landmark"
        }
      });
    }

    let account = await prisma.account.findFirst({
      where: { userId, bank: config.code }
    });

    if (!account) {
      account = await prisma.account.create({
        data: {
          userId,
          name: config.accountName,
          type: "CHECKING",
          bank: config.code,
          balance: config.initialBalance,
          isSynced: true,
          lastSyncedAt: new Date()
        }
      });
    } else {
      account = await prisma.account.update({
        where: { id: account.id },
        data: {
          isSynced: true,
          lastSyncedAt: new Date()
        }
      });
    }

    let creditCard = await prisma.creditCard.findFirst({
      where: { userId, name: config.cardName }
    });

    if (!creditCard) {
      creditCard = await prisma.creditCard.create({
        data: {
          userId,
          name: config.cardName,
          limit: config.initialLimit,
          closingDay: 5,
          dueDay: 12
        }
      });
    }

    const existingTxCount = await prisma.transaction.count({
      where: { userId, accountId: account.id }
    });

    if (existingTxCount === 0) {
      const sampleTransactions = [
        {
          userId,
          accountId: account.id,
          categoryId: defaultCategory.id,
          amount: 45.00,
          type: "INCOME",
          date: new Date(),
          description: config.sampleIncome,
          status: "COMPLETED",
          tags: [config.name, "Sincronizado"]
        },
        {
          userId,
          accountId: account.id,
          creditCardId: creditCard.id,
          categoryId: defaultCategory.id,
          amount: 154.90,
          type: "EXPENSE",
          date: new Date(Date.now() - 86400000),
          description: config.sampleExpense,
          status: "COMPLETED",
          tags: [config.name, "Cartão"]
        }
      ];

      await prisma.transaction.createMany({
        data: sampleTransactions
      });
    }

    revalidatePath("/");
    revalidatePath("/transactions");
    revalidatePath("/connections");
    revalidatePath("/wealth");

    return {
      success: true,
      account: {
        ...account,
        balance: account.balance.toString()
      },
      creditCard: {
        ...creditCard,
        limit: creditCard.limit.toString()
      }
    };
  } catch (err: any) {
    console.error(`Erro ao conectar conta ${config.name}:`, err);
    return { error: `Ocorreu um erro ao conectar sua conta ${config.name}.` };
  }
}

export async function connectNubankAccount(cpf: string) {
  return connectBankAccount("NUBANK", cpf);
}

export async function getAllBankStatuses() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { accounts: [], creditCards: [], recentTransactions: [] };
  }

  const userId = session.user.id;

  const accounts = await prisma.account.findMany({
    where: { userId, isSynced: true }
  });

  const creditCards = await prisma.creditCard.findMany({
    where: { userId }
  });

  const recentTransactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 8,
    include: { category: true }
  });

  return {
    accounts: accounts.map(a => ({
      ...a,
      balance: a.balance.toString(),
      lastSyncedAt: a.lastSyncedAt ? a.lastSyncedAt.toISOString() : null
    })),
    creditCards: creditCards.map(c => ({
      ...c,
      limit: c.limit.toString()
    })),
    recentTransactions: recentTransactions.map(t => ({
      ...t,
      amount: t.amount.toString(),
      date: t.date.toISOString()
    }))
  };
}

export async function getNubankStatus() {
  const all = await getAllBankStatuses();
  const nubankAccount = all.accounts.find(a => a.bank === "NUBANK");
  const nubankCard = all.creditCards.find(c => c.name.includes("Nubank"));

  return {
    isConnected: !!nubankAccount,
    lastSyncedAt: nubankAccount?.lastSyncedAt || null,
    account: nubankAccount || null,
    creditCard: nubankCard || null,
    recentTransactions: all.recentTransactions.filter(t => t.tags?.includes("Nubank"))
  };
}

export async function syncBankData(bankCode: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Não autorizado" };
  }

  const userId = session.user.id;
  const account = await prisma.account.findFirst({
    where: { userId, bank: bankCode }
  });

  if (!account || !account.isSynced) {
    return { error: "Nenhuma conta vinculada a este banco." };
  }

  try {
    const updated = await prisma.account.update({
      where: { id: account.id },
      data: { lastSyncedAt: new Date() }
    });

    revalidatePath("/");
    revalidatePath("/transactions");
    revalidatePath("/connections");
    revalidatePath("/wealth");

    return { success: true, lastSyncedAt: updated.lastSyncedAt?.toISOString() };
  } catch (err) {
    return { error: "Erro ao sincronizar dados com o banco." };
  }
}

export async function syncNubankData() {
  return syncBankData("NUBANK");
}

export async function disconnectBankAccount(bankCode: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Não autorizado" };
  }

  const userId = session.user.id;

  const account = await prisma.account.findFirst({
    where: { userId, bank: bankCode }
  });

  if (account) {
    await prisma.account.update({
      where: { id: account.id },
      data: { isSynced: false }
    });
  }

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/connections");
  revalidatePath("/wealth");

  return { success: true };
}

export async function disconnectNubankAccount() {
  return disconnectBankAccount("NUBANK");
}
