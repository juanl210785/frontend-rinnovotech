import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useBcv } from '../../../hooks/useBcv';
import { useCart } from '../../../context/CartContext';
import { useActiveOrder } from '../../../context/ActiveOrderContext';
import { ShoppingBag, ArrowRight, Layers, Cpu, HardDrive, Check, Loader2 } from 'lucide-react';

export const ProductCard = ({ product }) => {
  const { formatUSD, formatBs } = useBcv();
  const { addItem } = useCart();
  const { activeOrder, addItemToActiveOrder } = useActiveOrder();

  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const primaryVariant = product.variants?.[0] || {};
  const priceUSD = parseFloat(primaryVariant.price || product.price || 0);
  const stock = primaryVariant.stock ?? product.stock ?? 0;
  const isOutOfStock = stock <= 0;
  const imageUrl =
    primaryVariant.image_url ||
    product.image_url ||
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80';

  const categoryName =
    product.subcategory?.name ||
    product.category?.name ||
    'Laptops';

  const hasMultipleVariants = (product.variants?.length || 0) > 1;

  // Extraer las features/atributos de la variante (RAM, Procesador, Almacenamiento, etc.)
  const features = primaryVariant.features || [];

  const handleAddToCart = async () => {
    if (activeOrder) {
      setAdding(true);
      const res = await addItemToActiveOrder(primaryVariant.id || product.id, 1);
      setAdding(false);
      if (res.success) {
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2200);
      } else {
        alert(res.message);
      }
    } else {
      addItem(product, primaryVariant, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  return (
    <Card hoverEffect className="flex flex-col h-full group p-5 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800">
      {/* Imagen de la variante física y etiquetas */}
      <div className="relative aspect-[4/3] rounded-2xl bg-slate-100 dark:bg-slate-800/60 overflow-hidden mb-4 flex items-center justify-center p-4">
        {product.condition && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant={product.condition === 'Nuevo' ? 'success' : 'blue'}>
              {product.condition}
            </Badge>
          </div>
        )}

        {hasMultipleVariants && (
          <div className="absolute top-3 right-3 z-10">
            <Badge variant="default" className="text-[10px] font-mono">
              <Layers className="w-3 h-3 mr-1" /> {product.variants.length} Opciones
            </Badge>
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <Badge variant="danger">Agotado</Badge>
          </div>
        )}

        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Detalles del Producto */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span className="uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400">
              {categoryName}
            </span>
          </div>

          <Link to={`/producto/${product.id}`} className="group-hover:text-blue-600 transition-colors">
            <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Especificaciones Técnicas Reales (Píldoras de Procesador, RAM, SSD) */}
          {features.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {features.map((f) => (
                <span
                  key={f.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono font-medium text-slate-700 dark:text-slate-300"
                >
                  {f.option?.name?.toLowerCase().includes('procesador') && <Cpu className="w-3 h-3 text-blue-500" />}
                  {f.option?.name?.toLowerCase().includes('ram') && <HardDrive className="w-3 h-3 text-emerald-500" />}
                  <span>{f.value}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {product.description || 'Equipo verificado y garantizado con entrega inmediata.'}
            </p>
          )}
        </div>

        {/* Precios y Acciones */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-end justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              {hasMultipleVariants ? 'Desde' : 'Precio'}
            </span>
            <span className="block text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatUSD(priceUSD)}
            </span>
            <span className="block text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
              Bs. {formatBs(priceUSD)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant={justAdded ? 'primary' : 'secondary'}
              title={
                activeOrder
                  ? 'Sumar a orden activa en reserva'
                  : 'Agregar al carrito'
              }
              disabled={isOutOfStock || adding}
              onClick={handleAddToCart}
              className={`rounded-xl w-10 h-10 transition-all ${
                justAdded ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
              }`}
            >
              {adding ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              ) : justAdded ? (
                <Check className="w-4 h-4 text-white animate-in zoom-in-50" />
              ) : (
                <ShoppingBag className="w-4 h-4 text-slate-700 dark:text-slate-200" />
              )}
            </Button>
            <Link to={`/producto/${product.id}`}>
              <Button size="icon" variant="primary" className="rounded-xl w-10 h-10" title="Ver opciones">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};
