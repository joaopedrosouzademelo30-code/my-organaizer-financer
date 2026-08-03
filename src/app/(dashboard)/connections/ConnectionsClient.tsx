"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Landmark, CreditCard, Plus, ArrowUpRight, ArrowDownLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { syncBankData, disconnectBankAccount } from "@/server/actions/nubank";
import { bankConfigs } from "@/lib/bankConfig";
import { NubankConnectModal } from "@/components/nubank/NubankConnectModal";

interface ConnectionsClientProps {
  initialData: {
    accounts: Array<{
      id: string;
      name: string;
      balance: string;
      type: string;
      bank: string | null;
      isSynced: boolean;
      lastSyncedAt: string | null;
    }>;
    creditCards: Array<{
      id: string;
      name: string;
      limit: string;
      closingDay: number;
      dueDay: number;
    }>;
    recentTransactions: Array<{
      id: string;
      description: string;
      amount: string;
      type: string;
      date: string;
      category?: { name: string; color?: string | null } | null;
    }>;
  };
}

export function ConnectionsClient({ initialData }: ConnectionsClientProps) {
  const [accounts, setAccounts] = useState(initialData.accounts || []);
  const [creditCards, setCreditCards] = useState(initialData.creditCards || []);
  const [transactions, setTransactions] = useState(initialData.recentTransactions || []);
  
  const [selectedBankForModal, setSelectedBankForModal] = useState<string>("NUBANK");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncingBank, setSyncingBank] = useState<string | null>(null);

  const formatMoney = (val: string | number) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const openConnectModal = (bankCode: string) => {
    setSelectedBankForModal(bankCode);
    setIsModalOpen(true);
  };

  const handleSync = async (bankCode: string) => {
    setSyncingBank(bankCode);
    const res = await syncBankData(bankCode);
    setSyncingBank(null);
    if (res.success && res.lastSyncedAt) {
      setAccounts((prev) =>
        prev.map((acc) => (acc.bank === bankCode ? { ...acc, lastSyncedAt: res.lastSyncedAt! } : acc))
      );
    }
  };

  const handleDisconnect = async (bankCode: string) => {
    const config = bankConfigs[bankCode];
    if (!confirm(`Tem certeza que deseja desconectar o ${config?.name || bankCode}?`)) return;
    await disconnectBankAccount(bankCode);
    setAccounts((prev) => prev.filter((acc) => acc.bank !== bankCode));
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Conexões Bancárias & Open Finance
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Conecte seu banco principal (Nubank, Itaú, Bradesco, Santander, etc.) para sincronização automática de extratos e cartões.
          </p>
        </div>

        <button
          onClick={() => openConnectModal("NUBANK")}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:brightness-110 text-white font-bold shadow-lg shadow-purple-900/30 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" /> Conectar Novo Banco
        </button>
      </div>

      {/* Grid de Instituições Financeiras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(bankConfigs).map((config) => {
          const connectedAccount = accounts.find((a) => a.bank === config.code && a.isSynced);

          return (
            <motion.div
              key={config.code}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-3xl border backdrop-blur-2xl transition-all relative overflow-hidden flex flex-col justify-between ${
                connectedAccount
                  ? "bg-gradient-to-b from-white/10 via-gray-900/60 to-black border-emerald-500/40 shadow-xl"
                  : "bg-white/5 border-white/5 hover:border-white/20"
              }`}
            >
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-20"
                style={{ backgroundColor: config.color }}
              />

              <div>
                {/* Header do Card */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-md"
                      style={{ backgroundColor: config.color }}
                    >
                      {config.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{config.name}</h3>
                      <p className="text-xs text-gray-400">Open Finance BCB</p>
                    </div>
                  </div>

                  {connectedAccount ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-500 text-[10px] font-medium border border-white/5">
                      Disponível
                    </span>
                  )}
                </div>

                {/* Conteúdo da Conta Conectada */}
                {connectedAccount ? (
                  <div className="mt-4 space-y-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div>
                      <div className="text-xs text-gray-400 flex items-center justify-between">
                        <span>{config.accountName}</span>
                        <span className="text-emerald-400 text-[10px]">● Saldo em tempo real</span>
                      </div>
                      <div className="text-2xl font-black text-white mt-1">
                        {formatMoney(connectedAccount.balance)}
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-400 pt-2 border-t border-white/5 flex justify-between">
                      <span>Última sync:</span>
                      <span className="text-gray-300 font-mono">
                        {connectedAccount.lastSyncedAt ? formatDate(connectedAccount.lastSyncedAt) : "Recente"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 mt-2 mb-4 leading-relaxed">
                    Conecte sua conta do {config.name} para importar saldo, extrato e limite do cartão de forma 100% segura.
                  </p>
                )}
              </div>

              {/* Ações */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                {connectedAccount ? (
                  <>
                    <button
                      onClick={() => handleSync(config.code)}
                      disabled={syncingBank === config.code}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncingBank === config.code ? "animate-spin" : ""}`} />
                      {syncingBank === config.code ? "Sincronizando..." : "Sincronizar"}
                    </button>

                    <button
                      onClick={() => handleDisconnect(config.code)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium px-2 py-1"
                    >
                      Desconectar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => openConnectModal(config.code)}
                    className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Conectar {config.name}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Extrato Unificado de Transações Sincronizadas */}
      {transactions.length > 0 && (
        <div className="p-8 rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Extrato de Conexões Bancárias</h3>
              <p className="text-xs text-gray-400 mt-0.5">Últimas movimentações importadas via Open Finance</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" /> BCB Validado
            </div>
          </div>

          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      tx.type === "INCOME" ? "bg-emerald-500/20 text-emerald-400" : "bg-purple-500/20 text-purple-300"
                    }`}
                  >
                    {tx.type === "INCOME" ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{tx.description}</div>
                    <div className="text-xs text-gray-400">
                      {tx.category?.name || "Open Finance"} • {formatDate(tx.date)}
                    </div>
                  </div>
                </div>

                <div
                  className={`font-mono text-base font-bold ${
                    tx.type === "INCOME" ? "text-emerald-400" : "text-white"
                  }`}
                >
                  {tx.type === "INCOME" ? "+" : "-"}{formatMoney(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Conexão com Seleção de Banco */}
      <NubankConnectModal
        isOpen={isModalOpen}
        bankCode={selectedBankForModal}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          const config = bankConfigs[selectedBankForModal] || bankConfigs["NUBANK"];
          setAccounts((prev) => [
            ...prev.filter((a) => a.bank !== config.code),
            {
              id: `acc-${config.code}`,
              name: config.accountName,
              balance: config.initialBalance.toString(),
              type: "CHECKING",
              bank: config.code,
              isSynced: true,
              lastSyncedAt: new Date().toISOString()
            }
          ]);
        }}
      />
    </div>
  );
}
