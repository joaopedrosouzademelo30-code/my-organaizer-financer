"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, X, Upload, CheckCircle2, RefreshCw, AlertCircle } from "lucide-react";
import { parseAndInsertReceiptAction } from "@/server/actions/receipts";

interface ReceiptUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReceiptUploaderModal({ isOpen, onClose, onSuccess }: ReceiptUploaderModalProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Cole ou digite o texto da fatura/comprovante.");
      return;
    }
    setError(null);
    setLoading(true);

    const res = await parseAndInsertReceiptAction(text);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setResult(res.transaction);
      onSuccess();
    }
  };

  const sampleTexts = [
    "Comprovante PIX Enviado R$ 380,50 para Mecânica do Jair Ltda em 03/08/2026",
    "Fatura Cartão: Supermercado Pão de Açúcar Valor R$ 245,90 em 02/08/2026",
    "Posto Shell Gasolina Comum R$ 180,00 Débito NuConta"
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-gray-900 via-gray-900 to-black border border-amber-500/30 p-8 shadow-2xl text-white overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Importar Comprovante / Fatura via IA</h2>
              <p className="text-xs text-amber-300 font-medium">Reconhecimento OCR Gemini 2.5</p>
            </div>
          </div>

          {result ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">Transação Importada!</h3>
                <p className="text-xs text-gray-300 mt-1">A IA Gemini leu e cadastrou no seu extrato.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-2">
                <div className="text-xs text-gray-400">Descrição: <span className="font-bold text-white">{result.description}</span></div>
                <div className="text-xs text-gray-400">Valor: <span className="font-mono text-emerald-400 font-bold">R$ {parseFloat(result.amount).toFixed(2)}</span></div>
                <div className="text-xs text-gray-400">Categoria: <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold">{result.categoryName}</span></div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-purple-600 text-white font-bold shadow-lg transition-all"
              >
                Concluir
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Cole o Texto do Comprovante PIX ou Fatura
                </label>
                <textarea
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Ex: Comprovante de Transferência PIX R$ 180,00 para Posto Shell..."
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                />
              </div>

              <div>
                <span className="block text-[11px] font-semibold text-gray-400 uppercase mb-2">
                  Exemplos para Testar:
                </span>
                <div className="space-y-2">
                  {sampleTexts.map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => setText(sample)}
                      className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-left text-xs text-purple-200 border border-white/5 transition-colors font-mono truncate"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold shadow-lg shadow-amber-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" /> Processando com IA Gemini...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" /> Extrair e Cadastrar Transação
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
