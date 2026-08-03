export interface AICategoryResult {
  name: string;
  color: string;
  icon: string;
}

const CATEGORY_RULES: Array<{
  name: string;
  color: string;
  icon: string;
  keywords: string[];
}> = [
  {
    name: "Veículos & Mecânica",
    color: "#EAB308", // Amarelo
    icon: "Wrench",
    keywords: [
      "mecanica", "mecânica", "oficina", "pneu", "lataria", "funilaria",
      "autopeças", "auto pecas", "troca de oleo", "troca de óleo", "alinhamento",
      "balanceamento", "revisão auto", "revisao auto", "mecanico"
    ]
  },
  {
    name: "Alimentação & Restaurantes",
    color: "#F97316", // Laranja
    icon: "Utensils",
    keywords: [
      "restaurante", "pizzaria", "padaria", "churrascaria", "hamburgueria",
      "burger", "ifood", "rappi", "mcdonalds", "mc donalds", "outback",
      "starbucks", "bistrô", "bistro", "sushi", "lanche", "café", "cafe",
      "bar ", "pub ", "gastronomia", "comida"
    ]
  },
  {
    name: "Mercado & Supermercado",
    color: "#22C55E", // Verde
    icon: "ShoppingCart",
    keywords: [
      "supermercado", "mercado", "hipermercado", "pao de acucar", "pão de açúcar",
      "carrefour", "extra", "assai", "assaí", "atacadão", "atacadao", "hortifruti",
      "açougue", "acougue", "feira", "sacolão", "sacolao"
    ]
  },
  {
    name: "Transporte & Combustível",
    color: "#3B82F6", // Azul
    icon: "Fuel",
    keywords: [
      "uber", "99", "99app", "cabify", "posto", "gasolina", "etanol",
      "diesel", "shell", "ipiranga", "br petrobras", "estacionamento",
      "pedagio", "pedágio", "sem parar", "veloe", "metro", "metrô", "passagem"
    ]
  },
  {
    name: "Saúde & Farmácia",
    color: "#EF4444", // Vermelho
    icon: "HeartPulse",
    keywords: [
      "farmacia", "farmácia", "drogaria", "drogasil", "droga raia", "pague menos",
      "hospital", "clinica", "clínica", "consultorio", "consultório", "laboratorio",
      "laboratório", "exame", "medico", "médico", "dentista", "psicologo"
    ]
  },
  {
    name: "Entretenimento & Lazer",
    color: "#A855F7", // Roxo
    icon: "Tv",
    keywords: [
      "netflix", "spotify", "prime video", "disney", "hbo", "cinema",
      "cinemark", "ingressos", "steam", "playstation", "xbox", "nintendo",
      "show", "teatro", "evento", "game", "jogos"
    ]
  },
  {
    name: "Moradia & Contas",
    color: "#06B6D4", // Ciano
    icon: "Home",
    keywords: [
      "aluguel", "condominio", "condomínio", "enel", "sabesp", "cpfl",
      "luz", "agua", "água", "energia", "gas ", "gás", "internet", "claro",
      "vivo", "tim", "iptu", "manutenção casa"
    ]
  },
  {
    name: "Compras & Vestuário",
    color: "#EC4899", // Rosa
    icon: "ShoppingBag",
    keywords: [
      "zara", "renner", "c&a", "riachuelo", "magalu", "luiza", "amazon",
      "shopee", "ali express", "aliexpress", "mercadolivre", "mercado livre",
      "loja", "roupas", "calçados", "calcados", "eletronicos"
    ]
  },
  {
    name: "Investimentos & Rendimentos",
    color: "#10B981", // Esmeralda
    icon: "TrendingUp",
    keywords: [
      "rendimento", "proventos", "dividendos", "tesouro", "cdi", "resgate",
      "investimento", "bolsa de valores", "fii", "ações"
    ]
  }
];

export function categorizeTransactionWithAI(description: string): AICategoryResult {
  if (!description) {
    return { name: "Geral", color: "#6B7280", icon: "Tag" };
  }

  const normalized = description
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  for (const rule of CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      const normalizedKw = kw
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      if (normalized.includes(normalizedKw)) {
        return {
          name: rule.name,
          color: rule.color,
          icon: rule.icon
        };
      }
    }
  }

  return {
    name: "Outros / Diversos",
    color: "#6B7280",
    icon: "Tag"
  };
}
