import { useState, useEffect, useCallback } from 'react';
import { bcvApi } from '../api/bcv';

// Función para formatear fechas ISO en formato legible para humanos
const formatHumanDate = (dateString) => {
  if (!dateString) return null;
  try {
    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) return dateString;
    return new Intl.DateTimeFormat('es-VE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(parsed);
  } catch {
    return dateString;
  }
};

export const useBcv = () => {
  const [rate, setRate] = useState(() => {
    const cached = localStorage.getItem('rinnovo_bcv_rate');
    return cached ? parseFloat(cached) : 896.12;
  });
  const [date, setDate] = useState(() => {
    const cachedDate = localStorage.getItem('rinnovo_bcv_date');
    return cachedDate || formatHumanDate(new Date());
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bcvApi.getRate();
      const rateData = res.data || res;
      const currentRate = parseFloat(
        rateData.rate || rateData.dollar || rateData.price || (rateData.data && rateData.data.rate) || 0
      );

      // Convertir el ISO '2026-11-06T00:00:00-04:00' a formato humano '6 nov 2026'
      const rawDate = rateData.last_updated || rateData.date || new Date();
      const humanFormattedDate = formatHumanDate(rawDate);

      if (currentRate > 0) {
        setRate(currentRate);
        setDate(humanFormattedDate);
        localStorage.setItem('rinnovo_bcv_rate', currentRate.toString());
        localStorage.setItem('rinnovo_bcv_date', humanFormattedDate);
      }
    } catch (err) {
      console.warn('No se pudo actualizar la tasa BCV:', err.message);
      setError('Error al obtener la tasa oficial');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRate();
    const interval = setInterval(fetchRate, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchRate]);

  // Conversión pura
  const toBs = useCallback(
    (amountUsd) => {
      const activeRate = rate || 896.12;
      const val = parseFloat(amountUsd || 0);
      if (isNaN(val)) return 0;
      return val * activeRate;
    },
    [rate]
  );

  // Formato Bs. venezolano
  const formatBs = useCallback(
    (amountUsd) => {
      const bs = toBs(amountUsd);
      return new Intl.NumberFormat('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(bs);
    },
    [toBs]
  );

  const formatUSD = useCallback((amountUsd) => {
    const val = parseFloat(amountUsd || 0);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(isNaN(val) ? 0 : val);
  }, []);

  return {
    rate,
    date,
    loading,
    error,
    refreshRate: fetchRate,
    toBs,
    formatBs,
    formatUSD,
  };
};
