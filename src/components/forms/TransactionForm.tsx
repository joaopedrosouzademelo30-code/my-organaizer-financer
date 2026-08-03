"use client";

import { useState } from "react";
import { createTransaction } from "@/server/actions/transactions";

export function TransactionForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = await createTransaction(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setLoading(false);
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded-md">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-200">Descrição</label>
        <input name="description" type="text" required className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Supermercado" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-200">Valor (R$)</label>
          <input name="amount" type="number" step="0.01" required className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-200">Data</label>
          <input name="date" type="date" required className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-200">Tipo</label>
        <select name="type" className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="EXPENSE">Despesa</option>
          <option value="INCOME">Receita</option>
        </select>
      </div>

      <div className="pt-2">
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium shadow-sm">
          {loading ? "Salvando..." : "Salvar Transação"}
        </button>
      </div>
    </form>
  );
}
