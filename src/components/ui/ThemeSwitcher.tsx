"use client";

import { useState, useEffect } from "react";
import { Palette, Check } from "lucide-react";

export const THEMES = [
  { id: "nubank", name: "Roxo Nubank", color: "#820AD1" },
  { id: "cyberpunk", name: "Neon Cyberpunk", color: "#EC4899" },
  { id: "emerald", name: "Emerald Pro", color: "#10B981" },
  { id: "indigo", name: "Dark Glass", color: "#6366F1" }
];

export function ThemeSwitcher() {
  const [activeTheme, setActiveTheme] = useState("nubank");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("gemini_theme");
    if (saved) setActiveTheme(saved);
  }, []);

  const handleSelectTheme = (id: string) => {
    setActiveTheme(id);
    localStorage.setItem("gemini_theme", id);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md"
      >
        <Palette className="w-4 h-4 text-purple-400" />
        <span className="hidden sm:inline">Tema: {THEMES.find(t => t.id === activeTheme)?.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 p-2 rounded-2xl bg-black/90 border border-white/20 shadow-2xl backdrop-blur-2xl z-50 space-y-1">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleSelectTheme(theme.id)}
              className={`w-full p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all border ${
                activeTheme === theme.id
                  ? "bg-white/15 text-white border-white/30"
                  : "text-gray-400 border-transparent hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: theme.color }} />
                <span>{theme.name}</span>
              </div>
              {activeTheme === theme.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
