import React from 'react';
import { Laptop, ShieldCheck, Zap, Lock } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-sm mt-20 border-t border-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Laptop className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base">
                Rinnovo<span className="text-blue-500">Tech</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm max-w-sm leading-relaxed">
              Equipos de computación de alto rendimiento, laptops renovadas con garantía y componentes con verificación instantánea de Pago Móvil Banco de Venezuela.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Garantía Certificada
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-blue-400" />
                Validación BDV en Segundos
              </span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Navegación</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/" className="hover:text-white transition-colors">Catálogo de Laptops</a></li>
              <li><a href="/" className="hover:text-white transition-colors">Componentes y RAM</a></li>
              <li><a href="/checkout" className="hover:text-white transition-colors">Verificar Pago Móvil</a></li>
            </ul>
          </div>

          {/* Security */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Seguridad</h4>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-white text-xs font-medium">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                Pagos Cifrados BDV
              </div>
              <p className="text-[11px] text-slate-400">
                Verificación directa de referencia mediante API bancaria sin intermediarios ni demoras.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} RinnovoTech C.A. Todos los derechos reservados.</p>
          <p className="font-mono text-[11px]">Tasa referencial BCV en tiempo real</p>
        </div>
      </div>
    </footer>
  );
};
