import React, { useState, useEffect, useCallback } from 'react';
import { productsApi } from '../../../api/products';
import { adminApi } from '../../../api/admin';
import { ProductCard } from '../components/ProductCard';
import { ProductFilters } from '../components/ProductFilters';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import {
  Search,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Laptop,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const CatalogPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de Filtros
  const [search, setSearch] = useState('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState('Todos');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [orderBy, setOrderBy] = useState('latest');

  // Paginación del Backend
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Cargar Categorías reales de la BD
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await adminApi.getCategories();
        const list = res.data || res;
        setCategories(Array.isArray(list) ? list : []);
      } catch (err) {
        console.warn('Error al cargar categorías:', err);
      }
    };
    fetchCategories();
  }, []);

  // Cargar Productos desde la API de Laravel con parámetros
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: 9,
      };

      if (search.trim()) params.search = search.trim();
      if (selectedSubcategoryId) params.subcategory_id = selectedSubcategoryId;
      if (selectedCondition !== 'Todos') params.condition = selectedCondition;
      if (priceRange.min) params.min_price = priceRange.min;
      if (priceRange.max) params.max_price = priceRange.max;
      if (orderBy) params.order_by = orderBy;

      const res = await productsApi.getAll(params);

      const items = res.data || (Array.isArray(res) ? res : []);
      setProducts(items);

      if (res.meta) {
        setCurrentPage(res.meta.current_page || 1);
        setTotalPages(res.meta.last_page || 1);
        setTotalItems(res.meta.total || items.length);
      } else {
        setTotalPages(1);
        setTotalItems(items.length);
      }
    } catch (err) {
      console.warn('Error al conectar con la API de productos:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, selectedSubcategoryId, selectedCondition, priceRange, orderBy]);

  useEffect(() => {
    // Debounce sutil para el buscador
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedSubcategoryId(null);
    setSelectedCondition('Todos');
    setPriceRange({ min: '', max: '' });
    setOrderBy('latest');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-10">
      {/* Hero Bento Banner Estilo Modern Fintech */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-950 text-white p-8 sm:p-12 shadow-2xl shadow-blue-900/20">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-100">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              Equipos de Computación & Variantes Garantizadas
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              TU TECNOLOGÍA AL DÍA. <br />
              <span className="text-blue-300">PAGOS EN TIEMPO REAL.</span>
            </h1>

            <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-xl">
              Laptops corporativas e insumos de computación de alto nivel. Selecciona tu configuración exacta, paga en segundos vía Pago Móvil Banco de Venezuela con tasa oficial BCV.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-blue-200">
              <span className="flex items-center gap-2 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> 6 Meses de Garantía
              </span>
              <span className="flex items-center gap-2 font-medium">
                <Zap className="w-4 h-4 text-amber-300" /> Conciliación BDV en Segundos
              </span>
            </div>
          </div>

          {/* Tarjeta Bento Auxiliar (Tasa & Confianza) */}
          <div className="lg:col-span-4 hidden lg:block">
            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-blue-200">Seguridad BDV</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-xs text-white leading-relaxed">
                Cada referencia bancaria es validada al instante sin capturas de pantalla ni tiempos de espera.
              </p>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-blue-200">
                <span>CONVERSIÓN DUAL</span>
                <span className="text-white font-bold">100% BCV</span>
              </div>
            </div>
          </div>
        </div>

        {/* Resplandor de fondo */}
        <div className="absolute right-0 -bottom-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Barra de Filtros Rápidos, Buscador & Ordenamiento */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <Input
            icon={Search}
            placeholder="Buscar por modelo, procesador, SKU o marca..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Ordenador */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="latest">Más Recientes</option>
              <option value="name">Nombre (A - Z)</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Total: <span className="font-bold text-slate-900 dark:text-white">{totalItems}</span>
          </div>
        </div>
      </div>

      {/* Grid Principal con Sidebar de Filtros */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filtros */}
        <div className="lg:col-span-1">
          <ProductFilters
            categories={categories}
            selectedSubcategoryId={selectedSubcategoryId}
            onSelectSubcategory={(id) => {
              setSelectedSubcategoryId(id);
              setCurrentPage(1);
            }}
            selectedCondition={selectedCondition}
            onSelectCondition={(cond) => {
              setSelectedCondition(cond);
              setCurrentPage(1);
            }}
            priceRange={priceRange}
            onChangePriceRange={(range) => {
              setPriceRange(range);
              setCurrentPage(1);
            }}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Rejilla de Productos */}
        <div className="lg:col-span-3 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-80 rounded-3xl bg-slate-200/70 dark:bg-slate-800/60 animate-pulse border border-slate-200 dark:border-slate-800"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
              <Laptop className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No se encontraron productos
              </h3>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                No hay coincidencias con los filtros aplicados. Intenta restablecer los filtros para ver todo el catálogo.
              </p>
              <Button size="sm" variant="outline" onClick={handleResetFilters}>
                Restablecer Filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Paginación Avanzada Conectada al Backend */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs font-mono text-slate-500">
                Página <strong className="text-slate-900 dark:text-white">{currentPage}</strong> de {totalPages}
              </span>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage <= 1 || loading}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="rounded-xl px-3"
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage >= totalPages || loading}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="rounded-xl px-3"
                >
                  Siguiente <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
