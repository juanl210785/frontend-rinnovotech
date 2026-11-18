import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Edit2,
  Trash2,
  Sliders,
  Tag,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados Base
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('Reacondicionado Grado A');
  const [status, setStatus] = useState('Activo');
  const [subcategoryId, setSubcategoryId] = useState('');

  // Opciones de la Subcategoría
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Modal para Crear / Editar Opción
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState(null);

  // Variantes
  const [variants, setVariants] = useState([]);

  // Estados generales
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProductAndCategories = async () => {
      setLoading(true);
      try {
        const [prodRes, catsRes] = await Promise.all([
          adminApi.getProductById(id),
          adminApi.getCategories(),
        ]);

        const catList = catsRes.data || (Array.isArray(catsRes) ? catsRes : []);
        setCategories(catList);

        const prod = prodRes.data || prodRes;
        setName(prod.name || '');
        setDescription(prod.description || '');
        setCondition(prod.condition || 'Reacondicionado Grado A');
        setStatus(prod.status || 'Activo');
        setSubcategoryId(prod.subcategory?.id || prod.subcategory_id || '');

        // Formatear variantes existentes con sus IDs de features
        if (prod.variants && prod.variants.length > 0) {
          const mappedVariants = prod.variants.map((v) => ({
            id: v.id,
            label: v.features?.map((f) => f.value).join(' / ') || v.sku || `Variante #${v.id}`,
            features: v.features?.map((f) => f.id) || [],
            sku: v.sku || '',
            price: v.price?.toString() || '0.00',
            stock: v.stock?.toString() || '0',
            imagePreview: v.image_url || null,
            imageFile: null,
          }));
          setVariants(mappedVariants);
        }
      } catch (err) {
        setError('No se pudo cargar la información del producto.');
      } finally {
        setLoading(false);
      }
    };

    loadProductAndCategories();
  }, [id]);

  // Cargar opciones cuando se define o cambia la subcategoría
  useEffect(() => {
    if (!subcategoryId) return;

    const fetchSubcategoryOptions = async () => {
      setLoadingOptions(true);
      try {
        const res = await adminApi.getSubcategoryOptions(subcategoryId);
        const list = res.options || res.data || [];
        setSubcategoryOptions(Array.isArray(list) ? list : []);
      } catch (err) {
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

  const handleDeleteOption = async (optionId, optionName) => {
    if (!window.confirm(`¿Estás seguro de eliminar la opción "${optionName}" y todos sus valores?`)) {
      return;
    }
    try {
      await adminApi.deleteOption(optionId);
      setSubcategoryOptions((prev) => prev.filter((o) => o.id !== optionId));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (variants.length === 0) {
      setError('El producto debe conservar al menos una variante.');
      return;
    }

    setError(null);
    setSaving(true);

    try {
      // Sincronizar en option_subcategory
      if (subcategoryId && subcategoryOptions.length > 0) {
        try {
          const optIds = subcategoryOptions.map((o) => o.id);
          await adminApi.syncSubcategoryOptions(subcategoryId, optIds);
        } catch (syncErr) {
          console.warn('Advertencia en syncSubcategoryOptions:', syncErr);
        }
      }

      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('condition', condition);
      formData.append('status', status);
      formData.append('subcategory_id', subcategoryId);

      variants.forEach((v, index) => {
        if (typeof v.id === 'number') {
          formData.append(`variants[${index}][id]`, v.id);
        }
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

      await adminApi.updateProduct(id, formData);

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        navigate('/admin');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar el producto.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-500">Cargando datos del producto #{id}...</p>
        </div>
      </div>
    );
  }

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
                Editar Producto #{id}
              </h1>
              <p className="text-xs text-slate-500">
                Gestiona las opciones de la subcategoría y actualiza las variantes independientes.
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
              type="submit"
              variant="primary"
              size="sm"
              isLoading={saving}
              onClick={handleSubmit}
            >
              Guardar Cambios
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bloque 1: Datos Base */}
          <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2">
              <Package className="w-4 h-4" />
              1. Ficha del Producto Base
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Nombre / Modelo del Producto *
                </label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Estado en Tienda *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Activo">Activo (Visible en tienda)</option>
                  <option value="Inactivo">Inactivo (Oculto)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Subcategoría *
                </label>
                <select
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Nuevo">Nuevo (Sellado de Fábrica)</option>
                  <option value="Reacondicionado Grado A">Reacondicionado Grado A</option>
                  <option value="Reacondicionado Grado B">Reacondicionado Grado B</option>
                  <option value="Usado">Usado Certificado</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Descripción Detallada
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </Card>

          {/* Bloque 2: Opciones de la Subcategoría */}
          <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  2. Opciones y Atributos de esta Subcategoría
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gestiona las opciones disponibles para asignar a cada variante física.
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

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingOption(opt);
                            setIsOptionModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                          title="Editar opción y añadir valores"
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

          {/* Bloque 3: Variantes Físicas Independientes */}
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
              Guardar Cambios del Producto
            </Button>
          </div>
        </form>
      </div>

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
