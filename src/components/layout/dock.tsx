"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowRightLeft, PieChart, Wallet, Landmark, Target, CreditCard, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Transações", href: "/transactions", icon: ArrowRightLeft },
  { name: "Cartões", href: "/cards", icon: CreditCard },
  { name: "Orçamentos", href: "/budgets", icon: PieChart },
  { name: "Metas", href: "/goals", icon: Target },
  { name: "Patrimônio", href: "/wealth", icon: Wallet },
  { name: "Relatórios", href: "/reports", icon: FileText },
  { name: "Conexões", href: "/connections", icon: Landmark },
];

export function Dock() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.nav 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="flex items-center gap-2 p-3 rounded-3xl bg-white/20 dark:bg-black/40 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-2xl"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href} className="group relative outline-none">
              <motion.div
                whileHover={{ scale: 1.2, y: -5 }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-2xl transition-colors duration-300",
                  isActive
                    ? "bg-white/40 dark:bg-white/20 text-gray-900 dark:text-white shadow-inner"
                    : "text-gray-700 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-white/10"
                )}
              >
                <Icon className="w-5 h-5 stroke-[2.5]" />
              </motion.div>
              {/* Tooltip */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/70 backdrop-blur-md text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                {item.name}
              </div>
            </Link>
          );
        })}
      </motion.nav>
    </div>
  );
}
