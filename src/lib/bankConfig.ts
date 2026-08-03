export interface BankConfig {
  code: string;
  name: string;
  accountName: string;
  cardName: string;
  color: string;
  initialBalance: number;
  initialLimit: number;
  sampleIncome: string;
  sampleExpense: string;
}

export const bankConfigs: Record<string, BankConfig> = {
  NUBANK: {
    code: "NUBANK",
    name: "Nubank",
    accountName: "NuConta - Débito & PIX Nubank",
    cardName: "Cartão Nubank Roxinho (Crédito)",
    color: "#820AD1",
    initialBalance: 4850.75,
    initialLimit: 8500.00,
    sampleIncome: "Rendimento Automático NuConta (Débito)",
    sampleExpense: "Supermercado - Cartão Débito Nubank"
  },
  ITAU: {
    code: "ITAU",
    name: "Itaú Unibanco",
    accountName: "Conta Corrente & Débito Itaú",
    cardName: "Cartão Itaú Uniclass (Crédito)",
    color: "#EC7000",
    initialBalance: 6200.00,
    initialLimit: 12000.00,
    sampleIncome: "Depósito de Salário Itaú",
    sampleExpense: "Posto Shell - Cartão Itaú"
  },
  BRADESCO: {
    code: "BRADESCO",
    name: "Bradesco",
    accountName: "Conta Bradesco Prime",
    cardName: "Cartão Bradesco Elo Nanquim",
    color: "#CC092F",
    initialBalance: 3410.50,
    initialLimit: 9500.00,
    sampleIncome: "Transferência Recebida Bradesco",
    sampleExpense: "Farmácia Raia - Cartão Bradesco"
  },
  BB: {
    code: "BB",
    name: "Banco do Brasil",
    accountName: "Conta Corrente Banco do Brasil",
    cardName: "Cartão Ourocard Visa",
    color: "#0038A8",
    initialBalance: 2890.30,
    initialLimit: 7000.00,
    sampleIncome: "Restituição Imposto de Renda - BB",
    sampleExpense: "Restaurante Paris 6 - Ourocard"
  },
  SANTANDER: {
    code: "SANTANDER",
    name: "Santander",
    accountName: "Conta Santander Select",
    cardName: "Cartão Santander SX",
    color: "#EC0000",
    initialBalance: 5120.90,
    initialLimit: 11000.00,
    sampleIncome: "Cashback Santander Esfera",
    sampleExpense: "Lojas Americanas - Santander"
  },
  INTER: {
    code: "INTER",
    name: "Banco Inter",
    accountName: "Conta Digital Inter",
    cardName: "Cartão Inter Black",
    color: "#FF7A00",
    initialBalance: 1980.40,
    initialLimit: 6500.00,
    sampleIncome: "Proventos de Fundos Imobiliários Inter",
    sampleExpense: "Uber Eats - Cartão Inter"
  },
  C6: {
    code: "C6",
    name: "C6 Bank",
    accountName: "Conta C6 Bank",
    cardName: "Cartão C6 Carbon",
    color: "#242424",
    initialBalance: 7340.00,
    initialLimit: 15000.00,
    sampleIncome: "Transferência PIX C6 Bank",
    sampleExpense: "Passagem Aérea LATAM - C6 Carbon"
  }
};
