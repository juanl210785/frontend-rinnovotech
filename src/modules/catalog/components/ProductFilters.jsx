import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Filter, SlidersHorizontal, Check, RefreshCw, DollarSign } from 'lucide-react';

export const ProductFilters = ({
  categories = [],
  selectedSubcategoryId = null,
  onSelectSubcategory,
  selectedCondition = 'Todos',
  onSelectCondition,
  priceRange = { min: '', max: '' },
  onChangePriceRange,
  onResetFilters,
}) => {
  const conditions = [
    { label: 'Todos', value: 'Todos' },
    { label: 'Nuevo (Sellado)', value: 'Nuevo' },
    { label: 'Reacondicionado Grado A', value: 'Reacondicionado Grado A' },
    { label: 'Reacondicionado Grado B', value: 'Reacondicionado Grado B' },
    { label: 'Usado Certificado', value: 'Usado' },
  ];

  return (
    <div className="space-y-6">
      {/* Botón Reset */}
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          Filtros de Búsqueda
        </h3>
        <button
          onClick={onResetFilters}
          className="text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Limpiar
        </button>
      </div>

      {/* Categorías y Subcategorías del Backend */}
      <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Categorías
          </h4>
        </div>

        <div className="space-y-1">
          <button
            onClick={() => onSelectSubcategory(null)}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
              selectedSubcategoryId === null
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>Todos los equipos</span>
            {selectedSubcategoryId === null && <Check className="w-3.5 h-3.5 text-blue-600" />}
          </button>

          {categories.map((cat) => (
            <div key={cat.id} className="pt-2">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pb-1">
                {cat.name}
              </span>
              <div className="space-y-0.5">
                {cat.subcategories?.map((sub) => {
                  const isActive = selectedSubcategoryId === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => onSelectSubcategory(sub.id)}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="line-clamp-1">{sub.name}</span>
                      {isActive && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Condición */}
      <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
          Condición
        </h4>
        <div className="space-y-1">
          {conditions.map((cond) => {
            const isActive = selectedCondition === cond.value;
            return (
              <button
                key={cond.value}
                onClick={() => onSelectCondition(cond.value)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>{cond.label}</span>
                {isActive && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Rango de Precios */}
      <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-blue-600" />
          Precio ($ USD)
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => onChangePriceRange({ ...priceRange, min: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => onChangePriceRange({ ...priceRange, max: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
