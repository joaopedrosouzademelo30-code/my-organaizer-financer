"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Dock } from "@/components/layout/dock";
import { AIChatDrawer } from "@/components/chat/AIChatDrawer";
import { ReceiptUploaderModal } from "@/components/receipts/ReceiptUploaderModal";

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-black overflow-hidden font-sans">
      {/* Sidebar Retrátil na Esquerda */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenReceiptModal={() => {
          setIsReceiptModalOpen(true);
          setIsSidebarOpen(false);
        }}
        onOpenChatDrawer={() => {
          setIsChatOpen(true);
          setIsSidebarOpen(false);
        }}
      />

      {/* Conteúdo Principal com Transição Suave de Preenchimento */}
      <main
        className={`relative z-10 w-full h-full overflow-y-auto transition-all duration-300 pb-24 ${
          isSidebarOpen ? "md:pl-72" : "pl-0"
        }`}
      >
        {children}
      </main>

      {/* Dock Flutuante Inferior para Navegação */}
      <Dock />

      {/* Modal de Importação OCR Gemini */}
      <ReceiptUploaderModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        onSuccess={() => {
          setIsReceiptModalOpen(false);
          window.location.reload();
        }}
      />

      {/* Drawer de Chat com IA Gemini */}
      <AIChatDrawer
        isOpenExternal={isChatOpen}
        onCloseExternal={() => setIsChatOpen(false)}
      />
    </div>
  );
}
