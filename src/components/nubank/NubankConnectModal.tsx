"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { connectBankAccount } from "@/server/actions/nubank";
import { bankConfigs } from "@/lib/bankConfig";
import { Shield, CheckCircle2, Lock, Smartphone, RefreshCw, X, Landmark, CreditCard } from "lucide-react";

interface BankConnectModalProps {
  isOpen: boolean;
  bankCode?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function NubankConnectModal({ isOpen, bankCode = "NUBANK", onClose, onSuccess }: BankConnectModalProps) {
  const [selectedBank, setSelectedBank] = useState<string>(bankCode);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [cpf, setCpf] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentConfig = bankConfigs[selectedBank] || bankConfigs["NUBANK"];

  const formatCPF = (val: string) => {
    const numbers = val.replace(/\D/g, "").slice(0, 11);
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
  };

  const handleCpfSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length !== 11) {
      setError("Por favor, digite um CPF válido com 11 dígitos.");
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1000);
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      setError("Digite o código de verificação enviado pelo seu banco.");
      return;
    }
    setError(null);
    setLoading(true);

    const res = await connectBankAccount(selectedBank, cpf);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setStep(3);
      onSuccess();
    }
  };

  const handleClose = () => {
    setStep(1);
    setCpf("");
    setPin("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-gradient-to-b from-gray-900 via-gray-900 to-black border border-white/10 p-8 shadow-2xl text-white"
        >
          {/* Botão Fechar */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Selector de Bancos (se no passo 1) */}
          {step === 1 && (
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Selecione a Instituição Financeira
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {Object.values(bankConfigs).map((b) => (
                  <button
                    key={b.code}
                    type="button"
                    onClick={() => setSelectedBank(b.code)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap border ${
                      selectedBank === b.code
                        ? "bg-white/20 text-white border-white/40 shadow-md"
                        : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10"
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: b.color }} />
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cabeçalho do Banco Selecionado */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg font-black text-white text-lg"
              style={{ backgroundColor: currentConfig.color }}
            >
              {currentConfig.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Conectar {currentConfig.name}
              </h2>
              <p className="text-xs text-gray-400 font-medium">Sincronização Direta Open Finance</p>
            </div>
          </div>

          {/* Indicador de Passos */}
          <div className="flex items-center gap-2 mb-8">
            <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-emerald-500" : "bg-white/10"}`} />
            <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-emerald-500" : "bg-white/10"}`} />
            <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? "bg-emerald-500" : "bg-white/10"}`} />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-3"
            >
              <span>{error}</span>
            </motion.div>
          )}

          {/* Passo 1: Digitar CPF */}
          {step === 1 && (
            <form onSubmit={handleCpfSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  CPF do Titular no {currentConfig.name}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(formatCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    required
                    className="w-full px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono text-lg"
                  />
                  <Shield className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/30 text-xs text-emerald-200 space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-emerald-300">
                  <Lock className="w-4 h-4" /> Conexão Criptografada BCB (Open Finance)
                </div>
                <p className="text-gray-400">
                  Seus dados são protegidos por tokens de autenticação criptografados.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: currentConfig.color }}
                className="w-full py-4 rounded-2xl text-white font-bold shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" /> Conectando ao {currentConfig.name}...
                  </>
                ) : (
                  `Continuar para ${currentConfig.name}`
                )}
              </button>
            </form>
          )}

          {/* Passo 2: Verificação 2FA no App */}
          {step === 2 && (
            <form onSubmit={handle2FASubmit} className="space-y-6">
              <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-pulse">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-white mb-1">Autorização Solicitada</h3>
                <p className="text-xs text-gray-400">
                  Digite a chave de segurança / PIN de autorização para o CPF <span className="font-mono text-emerald-300">{cpf}</span>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Código de Autenticação / PIN
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••••"
                  maxLength={6}
                  required
                  className="w-full px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white text-center tracking-[0.5em] text-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: currentConfig.color }}
                className="w-full py-4 rounded-2xl text-white font-bold shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" /> Importando Extrato...
                  </>
                ) : (
                  "Sincronizar Conta e Cartões"
                )}
              </button>
            </form>
          )}

          {/* Passo 3: Conexão Concluída */}
          {step === 3 && (
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>

              <div>
                <h3 className="text-2xl font-black text-white">{currentConfig.name} Conectado!</h3>
                <p className="text-sm text-gray-300 mt-1">
                  Sua conta e cartões foram sincronizados em tempo real.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                    <Landmark className="w-4 h-4 text-emerald-400" /> {currentConfig.accountName}
                  </div>
                  <div className="text-lg font-bold text-white">
                    R$ {currentConfig.initialBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-emerald-400">● Sincronizado</div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                    <CreditCard className="w-4 h-4 text-emerald-400" /> {currentConfig.cardName}
                  </div>
                  <div className="text-lg font-bold text-white">
                    R$ {currentConfig.initialLimit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-gray-400">Limite Disponível</div>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg transition-all"
              >
                Concluir e Ver Painel
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
