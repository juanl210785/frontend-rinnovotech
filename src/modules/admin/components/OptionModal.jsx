import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { adminApi } from '../../../api/admin';
import {
  Sliders,
  Plus,
  Trash2,
  X,
  Edit2,
  Check,
  Loader2,
  Tag,
} from 'lucide-react';

export const OptionModal = ({
  isOpen,
  onClose,
  initialOption = null, // Si viene lleno -> Modo Edición; si es null -> Modo Crear
  subcategoryId = null,
  onSaved,
}) => {
  const isEditing = !!initialOption;

  const [name, setName] = useState('');
  const [type, setType] = useState('text');
  const [featuresList, setFeaturesList] = useState([]);
  const [newFeatureValue, setNewFeatureValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [addingFeature, setAddingFeature] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialOption) {
      setName(initialOption.name || '');
      setType(initialOption.type || 'text');
      setFeaturesList(initialOption.features || []);
    } else {
      setName('');
      setType('text');
      setFeaturesList([]);
    }
    setNewFeatureValue('');
    setError(null);
  }, [initialOption, isOpen]);

  if (!isOpen) return null;

  // Guardar (Crear o Editar nombre/tipo de opción)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError(null);

    try {
      if (isEditing) {
        // Actualizar opción existente
        const res = await adminApi.updateOption(initialOption.id, {
          name: name.trim(),
          type,
        });
        const updatedOpt = res.data || res;
        // Conservar features locales actualizadas
        updatedOpt.features = featuresList;
        onSaved(updatedOpt);
        onClose();
      } else {
        // Crear nueva opción con features iniciales
        const features = featuresList.map((f) => ({ value: f.value }));
        const res = await adminApi.createOption({
          name: name.trim(),
          type,
          features: features.length > 0 ? features : undefined,
        });

        const createdOpt = res.data || res;

        // Si tenemos subcategoría seleccionada, vincularla
        if (subcategoryId && createdOpt.id) {
          try {
            await adminApi.syncSubcategoryOptions(subcategoryId, [createdOpt.id]);
          } catch (syncErr) {
            console.warn('Error vinculando a subcategoría:', syncErr);
          }
        }

        onSaved(createdOpt);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la opción.');
    } finally {
      setSaving(false);
    }
  };

  // Añadir un valor individual (Feature)
  const handleAddFeature = async (e) => {
    e.preventDefault();
    const val = newFeatureValue.trim();
    if (!val) return;

    if (isEditing) {
      // En modo edición se persiste directo en Laravel
      setAddingFeature(true);
      try {
        const res = await adminApi.addFeature(initialOption.id, { value: val });
        const savedFeature = res.data || res;
        setFeaturesList((prev) => [...prev, savedFeature]);
        setNewFeatureValue('');
      } catch (err) {
        setError(err.response?.data?.message || 'Error al añadir valor.');
      } finally {
        setAddingFeature(false);
      }
    } else {
      // En modo creación se almacena localmente hasta enviar el formulario
      setFeaturesList((prev) => [
        ...prev,
        { id: `temp-${Date.now()}-${prev.length}`, value: val },
      ]);
      setNewFeatureValue('');
    }
  };

  // Eliminar un Feature individual
  const handleDeleteFeature = async (feature) => {
    if (isEditing && typeof feature.id === 'number') {
      try {
        await adminApi.deleteFeature(feature.id);
        setFeaturesList((prev) => prev.filter((f) => f.id !== feature.id));
      } catch (err) {
        setError(err.response?.data?.message || 'Error al eliminar valor.');
      }
    } else {
      setFeaturesList((prev) => prev.filter((f) => f.id !== feature.id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isEditing ? `Editar Opción: ${initialOption.name}` : 'Crear Nueva Opción'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isEditing
                  ? 'Modifica el nombre y añade o elimina valores (features).'
                  : 'Se asociará a la subcategoría seleccionada.'}
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

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Nombre de la Opción *
              </label>
              <Input
                required
                placeholder="Ej: Pantalla, Procesador, Color..."
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
                <option value="text">Texto / Píldora (RAM, Pantalla)</option>
                <option value="color">Muestra de Color</option>
                <option value="select">Lista Desplegable</option>
              </select>
            </div>
          </div>

          {/* Sección de Valores (Features) */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Valores / Opciones Disponibles ({featuresList.length})
            </label>

            {/* Input para agregar nuevo valor */}
            <div className="flex gap-2">
              <Input
                placeholder="Ej: 14 pulgadas, Core i7, Blanco..."
                value={newFeatureValue}
                onChange={(e) => setNewFeatureValue(e.target.value)}
                className="py-2 text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature(e);
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddFeature}
                isLoading={addingFeature}
                className="shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Añadir Valor
              </Button>
            </div>

            {/* Lista de píldoras de valores existentes */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 min-h-[70px] flex flex-wrap gap-2 items-center">
              {featuresList.length === 0 ? (
                <span className="text-xs text-slate-400 italic">
                  Aún no has agregado valores. Escribe arriba (ej: "14 pulgadas") y presiona Añadir.
                </span>
              ) : (
                featuresList.map((f) => (
                  <span
                    key={f.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs"
                  >
                    <Tag className="w-3 h-3 text-blue-600" />
                    <span>{f.value}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteFeature(f)}
                      className="text-slate-400 hover:text-rose-500 cursor-pointer ml-1"
                      title="Eliminar este valor"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" size="md" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={saving}>
              {isEditing ? 'Guardar Cambios' : 'Crear Opción'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
