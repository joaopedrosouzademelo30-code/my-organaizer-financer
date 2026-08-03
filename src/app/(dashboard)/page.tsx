import { getTransactions } from "@/server/actions/transactions";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  // Busca as transações de verdade no banco de dados (Server-Side)
  const transactions = await getTransactions();

  // Processa a matemática para o Dashboard
  let balance = 0;
  let income = 0;
  let expense = 0;

  transactions.forEach(t => {
    const val = parseFloat(t.amount.toString()); // Convertendo de Decimal para float
    if (t.type === 'INCOME') {
      income += val;
      balance += val;
    } else {
      expense += val;
      balance -= val;
    }
  });

  return <DashboardClient balance={balance} income={income} expense={expense} />;
}
