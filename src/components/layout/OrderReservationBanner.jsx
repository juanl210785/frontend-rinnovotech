import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useActiveOrder } from '../../context/ActiveOrderContext';
import { Clock, ArrowRight, X, AlertCircle } from 'lucide-react';

export const OrderReservationBanner = () => {
  const { activeOrder, hasActiveOrder, formattedTime, isExpired, cancelActiveOrder } = useActiveOrder();
  const location = useLocation();

  if (!hasActiveOrder) return null;

  const isCheckoutPage = location.pathname === '/checkout';

  return (
    <div className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-slate-900 text-white shadow-lg shadow-blue-500/20 border-b border-blue-500/30 transition-all animate-in fade-in slide-in-from-top-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Info de la Orden y Tasa */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white shrink-0">
            {isExpired ? (
              <AlertCircle className="w-4 h-4 text-rose-300" />
            ) : (
              <Clock className="w-4 h-4 animate-spin" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-200 block font-bold">
                RESERVA DE STOCK · ORDEN #{activeOrder.id} · {activeOrder.items?.reduce((acc, i) => acc + (i.quantity || 1), 0) || 1} {(activeOrder.items?.reduce((acc, i) => acc + (i.quantity || 1), 0) || 1) === 1 ? 'equipo' : 'equipos'}
              </span>
              {isExpired && (
                <span className="px-1.5 py-0.2 rounded bg-rose-500/80 text-white text-[9px] font-mono uppercase font-bold">
                  Expirada
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-slate-100">
              {isExpired ? (
                <span>El tiempo de reserva de tu orden finalizó. Puedes descartarla o generar una nueva.</span>
              ) : (
                <span>
                  Tasa congelada a <strong>Bs. {activeOrder.rate ? parseFloat(activeOrder.rate).toFixed(2) : '896.12'}</strong> para tu Pago Móvil.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Contador y Acciones */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-1.5 rounded-2xl border border-blue-400/30 font-mono shrink-0">
            <span className="text-[10px] text-slate-400 uppercase">
              {isExpired ? 'Estado:' : 'Expira en:'}
            </span>
            <span className={`text-sm font-black ${isExpired ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isExpired ? '00:00' : formattedTime}
            </span>
          </div>

          {!isCheckoutPage && (
            <Link
              to="/checkout"
              className="px-3.5 py-1.5 rounded-2xl bg-white hover:bg-blue-50 text-blue-600 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
            >
              <span>Completar Pago</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <button
            type="button"
            onClick={async () => {
              if (window.confirm(`¿Deseas cancelar la orden #${activeOrder.id} y devolver el equipo reservado al stock disponible?`)) {
                await cancelActiveOrder();
              }
            }}
            className="p-1.5 rounded-xl text-blue-200/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Cancelar orden y liberar stock (Rollback)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
