import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { VariantRepeater } from '../components/VariantRepeater';
import { OptionModal } from '../components/OptionModal';
import { adminApi } from '../../../api/admin';
import {
  ArrowLeft,
  Package,
  Layers,
  Plus,
  Check,
  Edit2,
  Trash2,
  Info,
  Sliders,
  Tag,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminCreateProduct = () => {
  const navigate = useNavigate();

  // 1. Datos Base del Producto
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('Reacondicionado Grado A');
  const [subcategoryId, setSubcategoryId] = useState('');

  // 2. Opciones de la Subcategoría
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Modal para Crear o Editar Opción
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState(null);

  // 3. Matriz de Variantes
  const [variants, setVariants] = useState([
    {
      id: `variant-initial-1`,
      label: 'Variante #1',
      features: [], // Arreglo de IDs de features para esta variante
      sku: '',
      price: '400.00',
      stock: '1',
      imageFile: null,
      imagePreview: null,
    },
  ]);

  // Categorías de la base de datos
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Cargar categorías iniciales
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await adminApi.getCategories();
        const list = res.data || (Array.isArray(res) ? res : []);
        setCategories(list);
        if (list[0]?.subcategories?.[0]) {
          setSubcategoryId(list[0].subcategories[0].id);
        }
      } catch (err) {
        console.warn('Error cargando categorías:', err);
      }
    };
    loadCategories();
  }, []);

  // Cada vez que cambia la subcategoría, cargar sus opciones asociadas desde Laravel
  useEffect(() => {
    if (!subcategoryId) return;

    const fetchSubcategoryOptions = async () => {
      setLoadingOptions(true);
      try {
        const res = await adminApi.getSubcategoryOptions(subcategoryId);
        const list = res.options || res.data || [];
        setSubcategoryOptions(Array.isArray(list) ? list : []);
      } catch (err) {
        // Si aún no tiene opciones vinculadas, cargar todas las opciones globales de fallback
        try {
          const allOptsRes = await adminApi.getOptions();
          const allOpts = allOptsRes.data || (Array.isArray(allOptsRes) ? allOptsRes : []);
          setSubcategoryOptions(allOpts);
        } catch {
          setSubcategoryOptions([]);
        }
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchSubcategoryOptions();
  }, [subcategoryId]);

  // Manejar creación o edición de opciones desde el modal
  const handleOptionSaved = (savedOption) => {
    setSubcategoryOptions((prev) => {
      const index = prev.findIndex((o) => o.id === savedOption.id);
      if (index > -1) {
        const updated = [...prev];
        updated[index] = savedOption;
        return updated;
      }
      return [...prev, savedOption];
    });
  };

  // Eliminar opción completa
  const handleDeleteOption = async (optionId, optionName) => {
    if (!window.confirm(`¿Estás seguro de eliminar la opción "${optionName}" y todos sus valores?`)) {
      return;
    }
    try {
      await adminApi.deleteOption(optionId);
      setSubcategoryOptions((prev) => prev.filter((o) => o.id !== optionId));

      // Limpiar de las variantes cualquier feature de esa opción
      setVariants((prev) =>
        prev.map((v) => ({
          ...v,
          features: v.features.filter((fId) => fId !== optionId),
        }))
      );
    } catch (err) {
      alert('Error al eliminar la opción.');
    }
  };

  // Envío del Formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (variants.length === 0) {
      setError('Debes configurar al menos una variante con precio y stock.');
      return;
    }

    setError(null);
    setSaving(true);

    try {
      // 1. Sincronizar en option_subcategory todas las opciones de esta subcategoría
      if (subcategoryId && subcategoryOptions.length > 0) {
        try {
          const optIds = subcategoryOptions.map((o) => o.id);
          await adminApi.syncSubcategoryOptions(subcategoryId, optIds);
        } catch (syncErr) {
          console.warn('Advertencia en syncSubcategoryOptions:', syncErr);
        }
      }

      // 2. Crear el Producto
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('condition', condition);
      formData.append('subcategory_id', subcategoryId || '1');

      // 3. Enviar las variantes con sus features exclusivas
      variants.forEach((v, index) => {
        formData.append(`variants[${index}][sku]`, v.sku || '');
        formData.append(`variants[${index}][price]`, v.price || '0.00');
        formData.append(`variants[${index}][stock]`, v.stock || '0');

        if (v.imageFile) {
          formData.append(`variants[${index}][image]`, v.imageFile);
        }

        if (v.features && v.features.length > 0) {
          v.features.forEach((fId, fIdx) => {
            formData.append(`variants[${index}][features][${fIdx}]`, fId);
          });
        }
      });

      await adminApi.createProduct(formData);

      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        navigate('/admin');
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Error al guardar el producto. Verifique los datos obligatorios.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Crear Nuevo Producto & Variantes
              </h1>
              <p className="text-xs text-slate-500">
                Configura la ficha base, gestiona las opciones de la subcategoría y define cada variante física.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin')}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={saving}
              onClick={handleSubmit}
            >
              Publicar Producto
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bloque 1: Ficha del Producto Base */}
          <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2">
              <Package className="w-4 h-4" />
              1. Ficha del Producto Base
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Nombre / Modelo del Producto *
                </label>
                <Input
                  required
                  placeholder="Ej: Dell Latitude 5410, Lenovo ThinkPad T14..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Subcategoría del Catálogo *
                </label>
                <select
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  {categories.map((cat) => (
                    <optgroup key={cat.id} label={cat.name}>
                      {cat.subcategories?.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Condición del Equipo *
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="Nuevo">Nuevo (Sellado de Fábrica)</option>
                  <option value="Reacondicionado Grado A">Reacondicionado Grado A (Impecable)</option>
                  <option value="Reacondicionado Grado B">Reacondicionado Grado B (Detalles leves)</option>
                  <option value="Usado">Usado Certificado</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Descripción General del Equipo
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalles sobre teclado retroiluminado, duración de batería, cargador original incluido..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </Card>

          {/* Bloque 2: Opciones de la Subcategoría (Crear, Editar y Eliminar) */}
          <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  2. Opciones y Atributos de esta Subcategoría
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gestiona las características disponibles (Pantalla, Procesador, RAM, Color) para luego asignarlas por variante.
                </p>
              </div>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingOption(null);
                  setIsOptionModalOpen(true);
                }}
                className="text-xs shadow-md shadow-blue-500/20"
              >
                <Plus className="w-3.5 h-3.5" /> + Nueva Opción
              </Button>
            </div>

            {loadingOptions ? (
              <div className="py-6 text-center text-xs text-slate-400 font-mono">
                Cargando opciones de la subcategoría...
              </div>
            ) : subcategoryOptions.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <p className="text-xs text-slate-500">
                  Esta subcategoría aún no tiene opciones asignadas.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingOption(null);
                    setIsOptionModalOpen(true);
                  }}
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar primera opción (ej: Pantalla)
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subcategoryOptions.map((opt) => (
                  <div
                    key={opt.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          {opt.name}
                        </span>
                      </div>

                      {/* Botones de Editar y Eliminar Opción */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingOption(opt);
                            setIsOptionModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                          title="Editar opción y añadir/quitar valores"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteOption(opt.id, opt.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Eliminar opción"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Valores de la opción */}
                    <div className="flex flex-wrap gap-1.5">
                      {opt.features?.map((f) => (
                        <span
                          key={f.id}
                          className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                        >
                          {f.value}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Bloque 3: Matriz de Variantes Físicas Independientes */}
          <VariantRepeater
            options={subcategoryOptions}
            variants={variants}
            onChangeVariants={setVariants}
          />

          {/* Botones de Guardar */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate('/admin')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={saving}
              className="shadow-md shadow-blue-500/20"
            >
              Guardar y Publicar Producto
            </Button>
          </div>
        </form>
      </div>

      {/* Modal para Crear y Editar Opciones con sus Valores */}
      <OptionModal
        isOpen={isOptionModalOpen}
        onClose={() => setIsOptionModalOpen(false)}
        initialOption={editingOption}
        subcategoryId={subcategoryId}
        onSaved={handleOptionSaved}
      />
    </div>
  );
};
