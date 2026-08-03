import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { CardsClient } from "./CardsClient";

export default async function CardsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id || "";

  const creditCards = await prisma.creditCard.findMany({
    where: { userId }
  });

  const cardsData = creditCards.map((c) => {
    const limit = parseFloat(c.limit.toString());
    const usedLimit = 1890.50;
    const availableLimit = Math.max(0, limit - usedLimit);

    return {
      id: c.id,
      name: c.name,
      limit,
      closingDay: c.closingDay,
      dueDay: c.dueDay,
      usedLimit,
      availableLimit,
      installments: [
        { description: "Smartphone Samsung Galaxy", current: 3, total: 10, amount: 199.90 },
        { description: "Passagem Aérea LATAM", current: 2, total: 6, amount: 240.00 }
      ]
    };
  });

  if (cardsData.length === 0) {
    cardsData.push({
      id: "card-nu-default",
      name: "Cartão Nubank Roxinho (Crédito)",
      limit: 8500.00,
      closingDay: 5,
      dueDay: 12,
      usedLimit: 1890.50,
      availableLimit: 6609.50,
      installments: [
        { description: "Smartphone Samsung Galaxy", current: 3, total: 10, amount: 199.90 },
        { description: "Passagem Aérea LATAM", current: 2, total: 6, amount: 240.00 }
      ]
    });
  }

  return (
    <div className="relative w-full min-h-screen bg-black overflow-y-auto">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black pointer-events-none" />

      <div className="relative z-10 p-6 md:p-12 max-w-6xl mx-auto">
        <CardsClient initialCards={cardsData} />
      </div>
    </div>
  );
}
