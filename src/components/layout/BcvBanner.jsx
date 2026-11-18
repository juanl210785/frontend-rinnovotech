import React from 'react';
import { useBcv } from '../../hooks/useBcv';
import { RefreshCw, TrendingUp } from 'lucide-react';

export const BcvBanner = () => {
  const { rate, date, loading, refreshRate } = useBcv();

  return (
    <div className="bg-slate-900 text-slate-100 text-xs py-2 px-4 border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium text-slate-300 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Tasa Oficial BCV:
          </span>
          <span className="font-mono font-bold text-white tracking-wide">
            {rate ? `Bs. ${rate.toFixed(2)}` : 'Consultando...'}
          </span>
          <span className="hidden sm:inline text-slate-400 text-[11px]">
            / USD {date && `· ${date}`}
          </span>
        </div>

        <button
          onClick={refreshRate}
          disabled={loading}
          className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
          title="Actualizar tasa"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          <span className="hidden md:inline text-[11px]">Actualizar</span>
        </button>
      </div>
    </div>
  );
};
