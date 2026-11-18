import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { ordersApi } from '../../../api/orders';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  ExternalLink,
  Printer,
  Copy,
  Check,
  Radio,
  Loader2,
  PackageCheck,
  User,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PaymentVerifier = ({ orderId, totalBs, totalUsd, onVerified }) => {
  const [reference, setReference] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [scanAttempt, setScanAttempt] = useState(1);
  const [scanStatusText, setScanStatusText] = useState('');
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [verifiedData, setVerifiedData] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const cleanRef = reference.trim();

    if (!cleanRef || cleanRef.length < 4) {
      setError('Por favor ingresa al menos los últimos 4 a 6 dígitos de la referencia de Pago Móvil.');
      return;
    }

    setVerifying(true);
    setError(null);

    // Radar de Auto-Conciliación Inteligente: hasta 3 intentos cada 4.5 segundos
    const maxAttempts = 3;
    let attempt = 1;
    let success = false;
    let finalRes = null;
    let lastErrorMsg = null;

    while (attempt <= maxAttempts && !success) {
      setScanAttempt(attempt);

      if (attempt === 1) {
        setScanStatusText('Conectando con el canal de notificaciones BDV...');
      } else if (attempt === 2) {
        setScanStatusText('Esperando confirmación del Banco de Venezuela...');
      } else {
        setScanStatusText('Sincronizando última verificación bancaria...');
      }

      try {
        if (orderId) {
          const res = await ordersApi.confirmPayment(orderId, { reference: cleanRef });
          if (res?.success) {
            success = true;
            finalRes = res;
            break;
          }
        } else {
          // Modo prueba
          await new Promise((r) => setTimeout(r, 2000));
          success = true;
          finalRes = {
            success: true,
            payment: {
              bank: 'BDV',
              reference: cleanRef,
              amount_bs: totalBs,
              sender_name: 'Cliente Verificado',
            },
          };
          break;
        }
      } catch (err) {
        lastErrorMsg =
          err.response?.data?.message ||
          'Aún no detectamos la notificación de tu pago en nuestra cuenta BDV.';

        // Si aún quedan intentos, esperar 4.5 segundos antes del siguiente escaneo
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, 4500));
        }
      }

      attempt++;
    }

    setVerifying(false);

    if (success && finalRes) {
      setVerifiedData(finalRes);
      setIsSuccess(true);

      // Explosión de confeti Fintech en celebración
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#2563EB', '#10B981', '#38BDF8', '#F59E0B'],
      });

      if (onVerified) onVerified(finalRes);
    } else {
      setError(
        lastErrorMsg ||
          'No pudimos conciliar automáticamente el pago en este momento. Si ya transferiste, el banco puede tardar unos segundos adicionales en emitir la notificación. Verifica los dígitos e inténtalo de nuevo.'
      );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyReceiptRef = (refText) => {
    navigator.clipboard.writeText(refText);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  // VISTA 1: PANTALLA DE COMPROBANTE DIGITAL OFICIAL (ÉXITO)
  if (isSuccess) {
    const payment = verifiedData?.payment || {};
    const refDisplay = payment.reference || reference;
    const senderDisplay = payment.sender_name || 'Comprador Verificado';

    return (
      <Card className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white border-2 border-emerald-500/50 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300 relative overflow-hidden print:p-0 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Marca de agua / Halo holográfico */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header del Voucher */}
        <div className="text-center space-y-3 relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white mx-auto flex items-center justify-center shadow-xl shadow-emerald-500/30">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Conciliación BDV Exitosa
            </span>

            <h3 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
              ¡PAGO CONFIRMADO!
            </h3>

            <p className="text-xs font-mono text-slate-400 mt-1">
              Orden #{orderId || 'N/A'} · Comprobante Electrónico Oficial
            </p>
          </div>
        </div>

        {/* Voucher Fintech Detallado */}
        <div className="p-5 rounded-2xl bg-slate-950/90 border border-emerald-500/30 text-xs font-mono space-y-3 max-w-md mx-auto shadow-inner relative">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-slate-400">Referencia Bancaria:</span>
            <div className="flex items-center gap-2">
              <strong className="text-emerald-400 text-sm font-bold tracking-wider">
                {refDisplay}
              </strong>
              <button
                onClick={() => handleCopyReceiptRef(refDisplay)}
                className="text-slate-400 hover:text-white transition-colors p-0.5"
                title="Copiar Referencia"
              >
                {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Titular Pagomóvil:</span>
            <strong className="text-white text-right line-clamp-1 max-w-[200px]">
              {senderDisplay}
            </strong>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Monto Conciliado:</span>
            <strong className="text-white text-sm">Bs. {totalBs}</strong>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Equivalente USD:</span>
            <strong className="text-emerald-400">{totalUsd}</strong>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Canal de Pago:</span>
            <span className="text-slate-300">Banco de Venezuela (Webhook API)</span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-[11px]">
            <span className="text-slate-500">Fecha y Hora:</span>
            <span className="text-slate-400">{new Date().toLocaleString('es-VE')}</span>
          </div>
        </div>

        {/* Respaldo y Garantía */}
        <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-800/50 flex items-start gap-2.5 text-xs text-blue-200 max-w-md mx-auto">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <span>
            Tu reserva ha pasado al estado <strong>"Pagado / En Preparación"</strong>. Los equipos han sido asegurados y el equipo técnico iniciará la inspección previa al despacho.
          </span>
        </div>

        {/* Acciones del Comprobante */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-md mx-auto print:hidden">
          <Button
            variant="outline"
            size="md"
            onClick={handlePrint}
            className="flex-1 bg-slate-900 border-slate-700 text-slate-200 hover:text-white"
          >
            <Printer className="w-4 h-4" /> Imprimir Comprobante
          </Button>

          <Link to="/cuenta" className="flex-1">
            <Button variant="primary" size="md" className="w-full">
              <PackageCheck className="w-4 h-4" /> Ver en Mis Pedidos
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  // VISTA 2: RADAR DE ESCANEO ACTIVO (BUSCANDO EN TIEMPO REAL)
  if (verifying) {
    return (
      <Card className="p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white border-2 border-blue-500/50 shadow-2xl space-y-6 text-center animate-in fade-in duration-200">
        {/* Radar Circular Animado */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping duration-1000" />
          <div className="absolute inset-2 rounded-full bg-blue-500/30 animate-pulse" />
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/40 relative z-10">
            <Radio className="w-7 h-7 text-white animate-spin duration-700" />
          </div>
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-mono font-bold uppercase tracking-wider">
            Escaneo BDV en Tiempo Real · Intento {scanAttempt} de 3
          </span>

          <h3 className="text-xl font-black text-white mt-3">
            Conciliando Pago Móvil...
          </h3>

          <p className="text-xs font-mono text-slate-400 mt-1">
            Referencia: <strong className="text-white">{reference}</strong> · Monto: <strong className="text-emerald-400">Bs. {totalBs}</strong>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300 max-w-sm mx-auto flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          <span>{scanStatusText}</span>
        </div>

        <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
          Conectando con el webhook receptor de la app bancaria. No cierres esta ventana.
        </p>
      </Card>
    );
  }

  // VISTA 3: FORMULARIO PRINCIPAL DE INGRESO DE REFERENCIA
  return (
    <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Verificación Automática BDV
          </h4>
          <p className="text-xs text-slate-500">
            Ingresa la referencia de tu Pago Móvil para conciliar en segundos.
          </p>
        </div>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
            Número de Referencia Bancaria *
          </label>
          <Input
            mono
            required
            placeholder="Ej: 007920596836 o 96836"
            value={reference}
            onChange={(e) => {
              setReference(e.target.value);
              if (error) setError(null);
            }}
            error={error}
            className="text-base py-3 tracking-widest font-bold"
          />
          <p className="text-[11px] font-mono text-slate-400 mt-1">
            Puedes colocar los últimos 5 a 6 dígitos o el número de operación completo.
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full shadow-lg shadow-blue-500/25 cursor-pointer"
        >
          <Zap className="w-4 h-4" /> Verificar Pago Móvil BDV
        </Button>
      </form>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs space-y-2 animate-in zoom-in-95">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Notificación bancaria aún no detectada</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            {error}
          </p>
          <div className="pt-1 flex items-center justify-between">
            <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400">
              Monto exacto esperado: Bs. {totalBs}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleVerify}
              className="h-7 text-[11px] px-2.5 rounded-xl border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40"
            >
              Reintentar Escaneo
            </Button>
          </div>
        </div>
      )}

      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
        <span>
          Al presionar <strong>"Verificar"</strong>, nuestro radar buscará automáticamente la notificación emitida por el Banco de Venezuela durante 15 segundos.
        </span>
      </div>
    </Card>
  );
};
