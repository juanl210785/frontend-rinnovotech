import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { adminApi } from '../../../api/admin';
import { Sliders, Plus, Check, Loader2, Sparkles, X } from 'lucide-react';

export const QuickOptionModal = ({ isOpen, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('text');
  const [featuresText, setFeaturesText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError(null);

    // Separar features por comas: "8GB, 16GB, 32GB" -> [{ value: "8GB" }, ...]
    const features = featuresText
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0)
      .map((val) => ({ value: val }));

    try {
      const res = await adminApi.createOption({
        name: name.trim(),
        type,
        features,
      });

      const createdOpt = res.data || res;
      onCreated(createdOpt);
      setName('');
      setFeaturesText('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la nueva opción.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Crear Opción al Vuelo
              </h3>
              <p className="text-[11px] text-slate-500">
                Se agregará al catálogo global para reutilizarse.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Nombre de la Opción
            </label>
            <Input
              required
              placeholder="Ej: Memoria RAM, Color, Capacidad SSD"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Tipo de Visualización
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="text">Texto / Píldora (RAM, SSD, Talla)</option>
              <option value="color">Muestra de Color Hexagonal</option>
              <option value="select">Lista Desplegable</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Valores / Features Iniciales (Separados por coma)
            </label>
            <Input
              placeholder="Ej: 8GB, 16GB, 32GB"
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
            />
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              Tip: Escribe las opciones separadas por coma para crearlas juntas.
            </p>
          </div>

          {error && (
            <p className="text-xs text-rose-500 font-medium">{error}</p>
          )}

          <div className="flex items-center gap-3 pt-3">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={saving}
              className="flex-1"
            >
              Guardar y Usar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
