"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { parseReceiptWithGemini } from "@/lib/gemini";
import { categorizeTransactionWithAI } from "@/lib/aiCategorizer";
import { revalidatePath } from "next/cache";

export async function parseAndInsertReceiptAction(receiptText: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Não autorizado" };
  }

  const userId = session.user.id;

  if (!receiptText || receiptText.trim().length < 5) {
    return { error: "Por favor, cole ou envie um comprovante com texto legível." };
  }

  try {
    const extracted = await parseReceiptWithGemini(receiptText);
    const aiCategory = categorizeTransactionWithAI(extracted.description);

    let category = await prisma.category.findFirst({
      where: { userId, name: aiCategory.name }
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          userId,
          name: aiCategory.name,
          type: extracted.type || "EXPENSE",
          color: aiCategory.color,
          icon: aiCategory.icon
        }
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount: extracted.amount || 150.00,
        description: extracted.description || "Comprovante Importado",
        type: extracted.type || "EXPENSE",
        date: new Date(),
        categoryId: category.id,
        status: "COMPLETED",
        tags: ["OCR Gemini", "Comprovante"]
      }
    });

    revalidatePath("/");
    revalidatePath("/transactions");
    revalidatePath("/connections");
    revalidatePath("/wealth");

    return {
      success: true,
      transaction: {
        ...transaction,
        amount: transaction.amount.toString(),
        categoryName: category.name
      }
    };
  } catch (err) {
    console.error("Erro ao importar comprovante:", err);
    return { error: "Ocorreu um erro ao processar o comprovante com a IA Gemini." };
  }
}
