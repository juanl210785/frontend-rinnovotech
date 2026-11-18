import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import {
  Sparkles,
  Trash2,
  DollarSign,
  Package,
  Image as ImageIcon,
  Check,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Plus,
  X,
} from 'lucide-react';

// ─── Inline Attribute Picker (collapsible, per variant) ──────────────────────
const AttributePicker = ({ options, selectedFeatureIds, onToggle, onClose }) => {
  if (options.length === 0) {
    return (
      <div className="mt-2 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs">
        No hay opciones configuradas aún. Agrega opciones en el Bloque 2 de arriba.
      </div>
    );
  }

  return (
    <div className="mt-2 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800/60 shadow-lg shadow-blue-500/5 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
          Selecciona los atributos para esta variante
        </span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {options.map((opt) => (
        <div key={opt.id} className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            {opt.name}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(opt.features || []).map((feat) => {
              const isSelected = selectedFeatureIds.includes(feat.id);
              return (
                <button
                  key={feat.id}
                  type="button"
                  onClick={() => onToggle(feat.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-500/20'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:text-blue-600'
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 shrink-0" />}
                  {feat.value}
                </button>
              );
            })}
            {(!opt.features || opt.features.length === 0) && (
              <span className="text-[11px] text-slate-400 italic">
                Sin valores — edita esta opción arriba
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Tiny Selected Feature Chips ─────────────────────────────────────────────
const FeatureChips = ({ options, selectedFeatureIds }) => {
  if (selectedFeatureIds.length === 0) return null;

  const allFeatures = options.flatMap((o) =>
    (o.features || []).map((f) => ({ ...f, optionName: o.name }))
  );

  const chips = selectedFeatureIds
    .map((id) => allFeatures.find((f) => f.id === id))
    .filter(Boolean);

  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {chips.map((f) => (
        <span
          key={f.id}
          className="inline-flex items-center px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-[10px] font-semibold text-blue-700 dark:text-blue-300"
        >
          {f.value}
        </span>
      ))}
    </div>
  );
};

// ─── Main VariantRepeater ─────────────────────────────────────────────────────
export const VariantRepeater = ({
  options = [],
  variants = [],
  onChangeVariants,
}) => {
  // Index of the variant whose picker is currently open (null = none)
  const [openPickerIndex, setOpenPickerIndex] = useState(null);

  const handleAddVariant = () => {
    onChangeVariants([
      ...variants,
      {
        id: `temp-${Date.now()}-${variants.length}`,
        label: `Variante #${variants.length + 1}`,
        features: [],
        sku: '',
        price: '400.00',
        stock: '1',
        imageFile: null,
        imagePreview: null,
      },
    ]);
  };

  const updateVariantField = (index, field, value) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    onChangeVariants(updated);
  };

  const handleVariantImageChange = (index, e) => {
    const file = e.target.files?.[0];
    if (file) {
      const updated = [...variants];
      updated[index] = {
        ...updated[index],
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      };
      onChangeVariants(updated);
    }
  };

  const removeVariant = (index) => {
    if (variants.length <= 1) {
      alert('Debe existir al menos una variante para este producto.');
      return;
    }
    if (openPickerIndex === index) setOpenPickerIndex(null);
    else if (openPickerIndex !== null && openPickerIndex > index)
      setOpenPickerIndex(openPickerIndex - 1);
    onChangeVariants(variants.filter((_, i) => i !== index));
  };

  const handleToggleFeature = (variantIndex, featureId) => {
    const updated = [...variants];
    const v = { ...updated[variantIndex] };
    const features = Array.isArray(v.features) ? [...v.features] : [];
    const exists = features.includes(featureId);
    const newFeatures = exists
      ? features.filter((id) => id !== featureId)
      : [...features, featureId];

    // Rebuild auto-label
    const allFeatures = options.flatMap((o) => o.features || []);
    const labels = newFeatures
      .map((id) => allFeatures.find((f) => f.id === id)?.value)
      .filter(Boolean);

    v.features = newFeatures;
    v.label =
      labels.length > 0 ? labels.join(' / ') : `Variante #${variantIndex + 1}`;
    updated[variantIndex] = v;
    onChangeVariants(updated);
  };

  const togglePicker = (index) => {
    setOpenPickerIndex(openPickerIndex === index ? null : index);
  };

  return (
    <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 space-y-6">
      {/* ── Section Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2">
            <Package className="w-4 h-4" />
            3. Matriz de Variantes Físicas ({variants.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cada variante es independiente. Pulsa{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Atributos ↓
            </span>{' '}
            en cada fila para seleccionar sus especificaciones.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleAddVariant}
          className="text-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> + Añadir Variante
        </Button>
      </div>

      {/* ── Variant Cards ──────────────────────────────────────────── */}
      <div className="space-y-4">
        {variants.map((v, idx) => {
          const inputId = `variant-file-input-${v.id || idx}`;
          const currentFeatureIds = Array.isArray(v.features) ? v.features : [];
          const isPickerOpen = openPickerIndex === idx;

          return (
            <div
              key={v.id || idx}
              className="rounded-3xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/90 dark:border-slate-800 overflow-hidden transition-shadow hover:shadow-sm"
            >
              {/* Row strip header */}
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] font-mono shrink-0">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate flex-1">
                  {currentFeatureIds.length > 0
                    ? v.label || `Variante #${idx + 1}`
                    : `Variante #${idx + 1}`}
                </span>
                {currentFeatureIds.length > 0 && (
                  <span className="text-[10px] font-mono text-blue-500 shrink-0">
                    {currentFeatureIds.length} atrib.
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeVariant(idx)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0"
                  title="Eliminar esta variante"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Main fields row */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">

                  {/* Photo — 3 cols */}
                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                      Foto Física
                    </label>
                    <input
                      type="file"
                      id={inputId}
                      accept="image/*"
                      onChange={(e) => handleVariantImageChange(idx, e)}
                      className="sr-only"
                    />
                    <label
                      htmlFor={inputId}
                      className="flex items-center gap-2 p-2 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-white dark:bg-slate-900 cursor-pointer transition-all group h-[52px]"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                        {v.imagePreview ? (
                          <img
                            src={v.imagePreview}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-[10px] font-semibold text-slate-700 dark:text-slate-300 truncate group-hover:text-blue-600 transition-colors">
                          {v.imageFile ? v.imageFile.name : 'Subir foto'}
                        </span>
                        <span className="block text-[9px] text-slate-400 font-mono">
                          {v.imageFile
                            ? `${(v.imageFile.size / 1024).toFixed(0)} KB · cambiar`
                            : 'PNG · JPG · WEBP'}
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Atributos button — 3 cols */}
                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                      Atributos
                    </label>
                    <button
                      type="button"
                      onClick={() => togglePicker(idx)}
                      className={`w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-2xl border text-xs font-semibold transition-all cursor-pointer h-[52px] ${
                        isPickerOpen
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25'
                          : currentFeatureIds.length > 0
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:text-blue-600'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 min-w-0">
                        <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          {currentFeatureIds.length > 0
                            ? `${currentFeatureIds.length} seleccionado${currentFeatureIds.length !== 1 ? 's' : ''}`
                            : 'Seleccionar...'}
                        </span>
                      </span>
                      {isPickerOpen ? (
                        <ChevronUp className="w-3 h-3 shrink-0" />
                      ) : (
                        <ChevronDown className="w-3 h-3 shrink-0" />
                      )}
                    </button>

                    {/* Selected chips shown below the button */}
                    <FeatureChips
                      options={options}
                      selectedFeatureIds={currentFeatureIds}
                    />
                  </div>

                  {/* SKU — 2 cols */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                      SKU
                    </label>
                    <Input
                      mono
                      placeholder="SKU-001"
                      value={v.sku}
                      onChange={(e) => updateVariantField(idx, 'sku', e.target.value)}
                      className="py-2 text-xs font-mono h-[52px]"
                    />
                  </div>

                  {/* Price — 2 cols */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                      Precio (USD) *
                    </label>
                    <Input
                      mono
                      required
                      type="number"
                      step="0.01"
                      placeholder="400.00"
                      icon={DollarSign}
                      value={v.price}
                      onChange={(e) => updateVariantField(idx, 'price', e.target.value)}
                      className="py-2 text-sm font-bold h-[52px]"
                    />
                  </div>

                  {/* Stock — 2 cols */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                      Stock *
                    </label>
                    <Input
                      mono
                      required
                      type="number"
                      placeholder="1"
                      value={v.stock}
                      onChange={(e) => updateVariantField(idx, 'stock', e.target.value)}
                      className="py-2 text-sm font-bold text-center h-[52px]"
                    />
                  </div>
                </div>

                {/* ── Inline Collapsible Attribute Picker ───────────── */}
                {isPickerOpen && (
                  <AttributePicker
                    options={options}
                    selectedFeatureIds={currentFeatureIds}
                    onToggle={(featureId) => handleToggleFeature(idx, featureId)}
                    onClose={() => setOpenPickerIndex(null)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Empty State ──────────────────────────────────────────────── */}
      {variants.length === 0 && (
        <div className="py-10 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
          <p className="text-sm text-slate-400">No hay variantes todavía.</p>
          <Button type="button" variant="primary" size="sm" onClick={handleAddVariant}>
            <Plus className="w-3.5 h-3.5" /> Crear primera variante
          </Button>
        </div>
      )}
    </Card>
  );
};
