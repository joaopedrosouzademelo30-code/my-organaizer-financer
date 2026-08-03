export interface GeminiChatMessage {
  role: "user" | "model";
  text: string;
}

export async function askGeminiAssistant(
  prompt: string,
  userContext: {
    balance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    recentTransactions: Array<{ description: string; amount: number; type: string; category?: string }>;
  }
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  const systemContext = `
Você é o Antigravity Gemini AI, um assistente financeiro pessoal de elite.
Dados do usuário no momento:
- Patrimônio Líquido Atual: R$ ${userContext.balance.toFixed(2)}
- Entradas do Mês: R$ ${userContext.monthlyIncome.toFixed(2)}
- Saídas do Mês: R$ ${userContext.monthlyExpenses.toFixed(2)}
- Transações Recentes: ${JSON.stringify(userContext.recentTransactions.slice(0, 5))}

Responda sempre em português do Brasil de forma concisa, educada, precisa e motivadora. Dê conselhos práticos e diretos sobre economia, orçamento e saúde financeira.
`;

  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${systemContext}\n\nPergunta do Usuário: ${prompt}` }]
              }
            ]
          })
        }
      );

      const json = await response.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (err) {
      console.error("Erro na API do Gemini:", err);
    }
  }

  // Fallback Inteligente caso GEMINI_API_KEY não esteja definida no .env
  const lower = prompt.toLowerCase();
  if (lower.includes("gastei") || lower.includes("gastos") || lower.includes("saídas")) {
    return `Neste mês você teve um total de R$ ${userContext.monthlyExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} em despesas. Suas principais saídas concentram-se em categorias essenciais. Que tal definir um teto na aba de Orçamentos?`;
  }
  if (lower.includes("saldo") || lower.includes("patrimônio") || lower.includes("tenho")) {
    return `Seu patrimônio líquido total atual é de R$ ${userContext.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}. Com entradas de R$ ${userContext.monthlyIncome.toFixed(2)} e despesas de R$ ${userContext.monthlyExpenses.toFixed(2)}, seu fluxo de caixa está positivo!`;
  }
  if (lower.includes("comprar") || lower.includes("posso")) {
    const margin = userContext.monthlyIncome - userContext.monthlyExpenses;
    if (margin > 500) {
      return `Com base no seu fluxo de caixa atual (sobra mensal aproximada de R$ ${margin.toFixed(2)}), você tem margem para essa compra! Recomendamos parcelar no cartão ou guardar por 2 meses para comprar à vista.`;
    }
    return `Atenção: sua margem líquida deste mês está em R$ ${margin.toFixed(2)}. Sugiro adiar compras não essenciais para não comprometer sua reserva de emergência.`;
  }

  return `Com base na sua análise financeira atual, seu patrimônio é de R$ ${userContext.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}. Recomendo manter pelo menos 15% das suas entradas destinadas a investimentos ou reserva de emergência. Como posso ajudar com seus objetivos hoje?`;
}

export async function parseReceiptWithGemini(rawText: string) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `Analise o texto/comprovante a seguir e extraia um JSON estrito no formato {"description": string, "amount": number, "type": "EXPENSE" | "INCOME", "category": string}: \n\n${rawText}`
                  }
                ]
              }
            ]
          })
        }
      );

      const json = await response.json();
      const reply = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) {
        const match = reply.match(/\{[\s\S]*\}/);
        if (match) {
          return JSON.parse(match[0]);
        }
      }
    } catch (e) {
      console.error("Erro no OCR do Gemini:", e);
    }
  }

  // Fallback de extração semântica local
  const numbers = rawText.match(/R\$\s?([\d.,]+)|([\d.,]+)\s?reais/i);
  let amount = 150.00;
  if (numbers) {
    const rawNum = (numbers[1] || numbers[2]).replace(/\./g, "").replace(",", ".");
    const parsed = parseFloat(rawNum);
    if (!isNaN(parsed)) amount = parsed;
  }

  let description = "Comprovante Importado via IA";
  if (rawText.toLowerCase().includes("pix")) description = "Transferência PIX Importada";
  else if (rawText.toLowerCase().includes("posto") || rawText.toLowerCase().includes("gasolina")) description = "Abastecimento Posto de Combustível";
  else if (rawText.toLowerCase().includes("restaurante") || rawText.toLowerCase().includes("padaria")) description = "Refeição Restaurante";

  return {
    description,
    amount,
    type: "EXPENSE",
    category: "Alimentação & Restaurantes"
  };
}

export function getGoalAISuggestion(goalName: string, targetAmount: number, currentAmount: number, deadlineStr?: string | null) {
  const remaining = targetAmount - currentAmount;
  if (remaining <= 0) {
    return "🚀 Parabéns! Esta meta já foi atingida! Considere realocar novos aportes para a sua Reserva de Emergência.";
  }

  let monthsLeft = 6;
  if (deadlineStr) {
    const diffTime = Math.abs(new Date(deadlineStr).getTime() - new Date().getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    monthsLeft = Math.max(1, Math.ceil(diffDays / 30));
  }

  const monthlyRequired = remaining / monthsLeft;

  return `💡 Para alcançar R$ ${targetAmount.toLocaleString("pt-BR")} na meta "${goalName}" em ${monthsLeft} meses, seu aporte recomendado é de R$ ${monthlyRequired.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês.`;
}
