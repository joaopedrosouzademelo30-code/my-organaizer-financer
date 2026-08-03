"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

export async function registerUser(data: FormData) {
  const name = data.get("name") as string;
  const email = data.get("email") as string;
  const password = data.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Todos os campos são obrigatórios" };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Este e-mail já está em uso" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
      },
    });

    return { success: true };
  } catch (error) {
    return { error: "Erro ao criar usuário" };
  }
}
