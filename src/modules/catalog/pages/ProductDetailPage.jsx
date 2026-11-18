import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsApi } from '../../../api/products';
import { useBcv } from '../../../hooks/useBcv';
import { useCart } from '../../../context/CartContext';
import { useActiveOrder } from '../../../context/ActiveOrderContext';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  ArrowLeft,
  Check,
  Shield,
  Zap,
  ShoppingBag,
  Layers,
  Cpu,
  HardDrive,
  Monitor,
  Palette,
  Info,
  Loader2,
} from 'lucide-react';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatUSD, formatBs, rate } = useBcv();
  const { addItem } = useCart();
  const { activeOrder, addItemToActiveOrder } = useActiveOrder();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productsApi.getById(id);
        const item = res.data || res;
        setProduct(item);

        if (item.variants && item.variants.length > 0) {
          setSelectedVariant(item.variants[0]);
        }
      } catch (err) {
        console.error('Error al cargar producto:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-mono text-slate-500">Cargando ficha del producto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-slate-500 text-sm">No se encontró el producto solicitado.</p>
        <Link to="/">
          <Button variant="primary">Volver al catálogo</Button>
        </Link>
      </div>
    );
  }

  const activeVariant = selectedVariant || product.variants?.[0] || {};
  const currentPrice = parseFloat(activeVariant.price || 0);
  const currentStock = activeVariant.stock ?? 0;
  const isOutOfStock = currentStock <= 0;
  const currentImageUrl =
    activeVariant.image_url ||
    product.variants?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80';

  const handleAddToCart = async () => {
    if (activeOrder) {
      setSubmitting(true);
      const res = await addItemToActiveOrder(activeVariant.id || product.id, 1);
      setSubmitting(false);
      if (res.success) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2500);
      } else {
        alert(res.message);
      }
    } else {
      addItem(product, activeVariant, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    if (activeOrder) {
      setSubmitting(true);
      const res = await addItemToActiveOrder(activeVariant.id || product.id, 1);
      setSubmitting(false);
      if (res.success) {
        navigate('/checkout');
      } else {
        alert(res.message);
      }
    } else {
      addItem(product, activeVariant, 1);
      navigate('/checkout');
    }
  };

  // Características asignadas a la variante activa
  const features = activeVariant.features || [];

  return (
    <div className="space-y-8">
      {/* Botón de retroceso */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Galería de la Variante */}
        <div className="space-y-4">
          <div className="aspect-[4/3] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 flex items-center justify-center overflow-hidden shadow-sm">
            <img
              src={currentImageUrl}
              alt={product.name}
              className="max-h-full max-w-full object-contain transition-all duration-300"
            />
          </div>

          {/* Miniaturas de variantes con foto */}
          {product.variants?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border p-2 overflow-hidden cursor-pointer transition-all shrink-0 ${
                    activeVariant?.id === v.id
                      ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                  title={v.sku || `Variante #${v.id}`}
                >
                  <img
                    src={v.image_url || currentImageUrl}
                    alt="variante"
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ficha Técnica y Selector de Variantes */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={isOutOfStock ? 'danger' : 'success'} withDot>
                {isOutOfStock ? 'Agotado' : `En Stock (${currentStock} disponibles)`}
              </Badge>
              {product.condition && <Badge variant="blue">{product.condition}</Badge>}
              {activeVariant?.sku && (
                <span className="text-xs font-mono text-slate-400">
                  SKU: {activeVariant.sku}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {product.name}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {product.subcategory?.name || 'Equipos de Computación'}
            </p>
          </div>

          {/* Especificaciones Técnicas de la Variante Activa */}
          {features.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                Especificaciones de esta variante
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {features.map((f) => (
                  <div
                    key={f.id}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700"
                  >
                    <span className="block text-[10px] uppercase font-mono text-slate-400">
                      {f.option?.name || 'Característica'}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs mt-0.5 flex items-center gap-1">
                      {f.option?.name?.toLowerCase().includes('procesador') && <Cpu className="w-3 h-3 text-blue-500" />}
                      {f.option?.name?.toLowerCase().includes('ram') && <HardDrive className="w-3 h-3 text-emerald-500" />}
                      {f.option?.name?.toLowerCase().includes('pantalla') && <Monitor className="w-3 h-3 text-amber-500" />}
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Caja de Precio Dinámico Dual */}
          <div className="p-6 rounded-3xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {formatUSD(currentPrice)}
              </span>
              <span className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400">
                Bs. {formatBs(currentPrice)}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Calculado según tasa oficial BCV: <strong className="text-slate-700 dark:text-slate-300">Bs. {rate ? rate.toFixed(2) : '896.12'} / USD</strong>
            </p>
          </div>

          {/* Selector de Variantes Físicas */}
          {product.variants && product.variants.length > 1 && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Configuraciones Disponibles
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((variant) => {
                  const isSelected = activeVariant?.id === variant.id;
                  const label =
                    variant.features?.map((f) => f.value).join(' / ') ||
                    variant.sku ||
                    `Opción $${variant.price}`;

                  return (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/25'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-500'
                      }`}
                    >
                      <span>{label}</span>
                      <span className="font-mono opacity-90">${parseFloat(variant.price).toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Descripción */}
          {product.description && (
            <div className="pt-2">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Botones de Compra */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              size="lg"
              variant="primary"
              className="flex-1"
              disabled={isOutOfStock || submitting}
              onClick={handleAddToCart}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 text-white animate-spin" /> Actualizando orden...
                </>
              ) : added ? (
                <>
                  <Check className="w-5 h-5 text-white" />{' '}
                  {activeOrder ? `¡Sumado a la Orden #${activeOrder.id}!` : '¡Agregado al Carrito!'}
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />{' '}
                  {activeOrder ? 'Sumar a esta Orden' : 'Agregar al Carrito'}
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              disabled={isOutOfStock || submitting}
              onClick={handleBuyNow}
            >
              {activeOrder ? 'Ir a Pagar Orden' : 'Comprar Ahora'}
            </Button>
          </div>

          {/* Garantías BDV */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800">
            <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
              <Shield className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Garantía técnica directa de 6 meses en piezas y mano de obra.</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
              <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>Verificación instantánea de Pago Móvil BDV.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
