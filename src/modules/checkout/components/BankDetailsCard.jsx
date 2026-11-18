import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useClipboard } from '../../../hooks/useClipboard';
import {
  Building2,
  Copy,
  Check,
  Smartphone,
  Hash,
  User,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const BankDetailsCard = ({
  bank = '0102 - Banco de Venezuela',
  phone = '0412-1234567',
  idNumber = 'J-501234567',
  accountName = 'RinnovoTech C.A.',
  amountBs = '0,00',
}) => {
  const { copy, isCopied } = useClipboard();

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white border-slate-800 p-6 space-y-6 shadow-xl relative overflow-hidden">
      {/* Resplandor Fintech */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cabecera */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-semibold block">
              CANAL DE PAGO MÓVIL DIRECTO
            </span>
            <h4 className="text-sm font-black text-white">{bank}</h4>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          API Conciliación Activa
        </div>
      </div>

      {/* Monto Exacto en Bolívares */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
        <div>
          <span className="block text-[11px] font-mono text-slate-400">
            MONTO EXACTO A TRANSFERIR:
          </span>
          <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 tracking-tight">
            Bs. {amountBs}
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => copy(amountBs.replace(/[^0-9,]/g, ''), 'amount')}
          className="bg-slate-900 border-slate-700 text-slate-200 hover:text-white"
        >
          {isCopied('amount') ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" /> Copiar Monto
            </>
          )}
        </Button>
      </div>

      {/* Grid de Datos: Teléfono y RIF */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Teléfono */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="block text-[11px] text-slate-400 flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-slate-400" /> Teléfono Pago Móvil
            </span>
            <span className="font-mono font-bold text-white text-sm tracking-wide mt-0.5 block">
              {phone}
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => copy(phone.replace(/[^0-9]/g, ''), 'phone')}
            className="hover:bg-slate-800 text-slate-300"
            title="Copiar Teléfono"
          >
            {isCopied('phone') ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Cédula / RIF */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="block text-[11px] text-slate-400 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-slate-400" /> RIF / Cédula BDV
            </span>
            <span className="font-mono font-bold text-white text-sm tracking-wide mt-0.5 block">
              {idNumber}
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => copy(idNumber.replace(/[^0-9JVEGjveg]/g, ''), 'rif')}
            className="hover:bg-slate-800 text-slate-300"
            title="Copiar RIF"
          >
            {isCopied('rif') ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Titular */}
      <div className="text-xs text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Beneficiario: <strong className="text-slate-200">{accountName}</strong>
          </span>
        </div>

        <span className="text-[11px] font-mono text-slate-500">
          Transferencia sin comisión
        </span>
      </div>
    </Card>
  );
};
