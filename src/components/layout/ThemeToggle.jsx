import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = ({ showLabel = false, className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center gap-2 p-1.5 rounded-2xl border transition-all duration-300 cursor-pointer select-none ${
        isDark
          ? 'bg-slate-900 border-slate-700/80 text-amber-300 hover:border-slate-600 shadow-sm'
          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-xs'
      } ${className}`}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label="Alternar tema claro y oscuro"
    >
      {/* Switch visual animado */}
      <div
        className={`w-6 h-6 rounded-xl flex items-center justify-center transition-all duration-300 transform ${
          isDark
            ? 'bg-slate-800 text-amber-300 rotate-0 shadow-inner'
            : 'bg-blue-50 text-blue-600 rotate-180 shadow-xs'
        }`}
      >
        {isDark ? <Moon className="w-3.5 h-3.5 fill-amber-300/20" /> : <Sun className="w-3.5 h-3.5" />}
      </div>

      {showLabel && (
        <span className="text-xs font-semibold pr-2 text-slate-700 dark:text-slate-300">
          {isDark ? 'Modo Oscuro' : 'Modo Claro'}
        </span>
      )}
    </button>
  );
};
