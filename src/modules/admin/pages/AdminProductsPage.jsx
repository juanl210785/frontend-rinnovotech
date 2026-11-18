import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { adminApi } from '../../../api/admin';
import { AdminHeader } from '../components/AdminHeader';
import {
  Laptop,
  Package,
  ShoppingCart,
  Plus,
  ArrowLeft,
  LogOut,
  Layers,
  Activity,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const AdminProductsPage = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Paginación del Backend
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: 10,
      };
      if (search.trim()) params.search = search.trim();

      const res = await adminApi.getProducts(params);
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
      console.warn('Error al obtener productos para admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, search]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Estás seguro de eliminar el producto "${name}"? Se borrarán sus variantes y fotos asociadas.`)) {
      return;
    }
    setDeletingId(id);
    try {
      await adminApi.deleteProduct(id);
      fetchProducts();
    } catch (err) {
      alert('Error al eliminar el producto.');
    } finally {
      setDeletingId(null);
    }
  };

  // Cálculo de métricas
  const totalVariantsCount = products.reduce((acc, p) => acc + (p.variants?.length || 0), 0);
  const lowStockCount = products.filter((p) =>
    p.variants?.some((v) => (v.stock ?? 0) <= 2)
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-8 transition-colors duration-300 selection:bg-blue-600 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Encabezado y Navegación Tabular Unificada */}
        <AdminHeader />

        {/* Encabezado Principal y Acción */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Gestión de Inventario & Equipos
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Catálogo sincronizado en tiempo real con la base de datos de Laravel.
            </p>
          </div>

          <Link to="/admin/productos/crear">
            <Button variant="primary" size="md" className="shadow-md shadow-blue-500/20">
              <Plus className="w-4 h-4" /> Nuevo Producto
            </Button>
          </Link>
        </div>

        {/* Métricas Fintech Vivas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800/80 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total Productos</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {totalItems} Registrados
              </h3>
            </div>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800/80 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">SKUs en Inventario</p>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {totalVariantsCount} Variantes
              </h3>
            </div>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800/80 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Stock Bajo (≤ 2)</p>
              <h3 className="text-2xl font-black text-amber-600 dark:text-amber-300 mt-0.5">
                {lowStockCount} Modelos
              </h3>
            </div>
          </Card>
        </div>

        {/* Tabla de Productos con Búsqueda Real */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800/80 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Inventario Activo</h3>
            </div>

            <div className="w-full sm:w-72">
              <Input
                icon={Search}
                placeholder="Filtrar por nombre o modelo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-12 text-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs font-mono text-slate-400">Sincronizando con Laravel...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No se encontraron productos registrados.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-mono uppercase text-[11px] tracking-wider">
                    <th className="pb-3">Producto / Modelo</th>
                    <th className="pb-3">Subcategoría</th>
                    <th className="pb-3">Precio (Desde)</th>
                    <th className="pb-3">Variantes / Stock</th>
                    <th className="pb-3">Condición</th>
                    <th className="pb-3">Estado</th>
                    <th className="pb-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-600 dark:text-slate-300">
                  {products.map((p) => {
                    const firstVar = p.variants?.[0] || {};
                    const totalStock = p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) ?? 0;
                    const price = firstVar.price ? `$${parseFloat(firstVar.price).toFixed(2)}` : 'N/A';

                    return (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                          {firstVar.image_url ? (
                            <img
                              src={firstVar.image_url}
                              alt="thumb"
                              className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                            />
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                          )}
                          <span className="line-clamp-1">{p.name}</span>
                        </td>
                        <td className="py-3.5 text-slate-500 dark:text-slate-400">
                          {p.subcategory?.name || 'General'}
                        </td>
                        <td className="py-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {price}
                        </td>
                        <td className="py-3.5 font-mono">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {p.variants?.length || 0}
                          </span>{' '}
                          var. ({totalStock} un.)
                        </td>
                        <td className="py-3.5">
                          <Badge variant="blue">{p.condition || 'Reacondicionado'}</Badge>
                        </td>
                        <td className="py-3.5">
                          <Badge variant={p.status === 'Activo' ? 'success' : 'default'}>
                            {p.status || 'Activo'}
                          </Badge>
                        </td>
                        <td className="py-3.5 text-right space-x-2">
                          <Link
                            to={`/producto/${p.id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 inline-block transition-colors"
                            title="Ver en la tienda"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <Link
                            to={`/admin/productos/editar/${p.id}`}
                            className="p-1.5 rounded-lg text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-block transition-colors"
                            title="Editar producto y variantes"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            disabled={deletingId === p.id}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 cursor-pointer inline-block transition-colors disabled:opacity-50"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-mono text-slate-400">
                Página {currentPage} de {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage <= 1 || loading}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="rounded-xl px-2.5"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage >= totalPages || loading}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="rounded-xl px-2.5"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
