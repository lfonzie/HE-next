// components/InventoryPanel.tsx - Painel de inventário
'use client';

import React, { useState } from 'react';
import { LabItem } from '../types/lab';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Beaker, Atom, Calculator, Wrench } from 'lucide-react';

interface InventoryPanelProps {
  items: LabItem[];
  onItemDrag: (item: LabItem) => void;
  selectedCategory?: string;
  onCategoryChange: (category: string) => void;
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({
  items,
  onItemDrag,
  selectedCategory,
  onCategoryChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { id: 'all', name: 'Todos', icon: Beaker },
    { id: 'vessel', name: 'Vidrarias', icon: Beaker },
    { id: 'reagent', name: 'Reagentes', icon: Atom },
    { id: 'instrument', name: 'Instrumentos', icon: Calculator },
    { id: 'physics', name: 'Física', icon: Wrench }
  ];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.kind === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleItemClick = (item: LabItem) => {
    onItemDrag(item);
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Inventário</h3>
        
        {/* Barra de pesquisa */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar itens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filtros */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
          >
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
          </button>
        </div>

        {/* Categorias */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3"
            >
              <div className="grid grid-cols-2 gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => onCategoryChange(category.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <category.icon className="h-4 w-4" />
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lista de itens */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleItemClick(item)}
              className="bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-colors"
            >
              {/* Ícone do item */}
              <div className="flex justify-center mb-2">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  item.kind === 'vessel' ? 'bg-blue-100 text-blue-600' :
                  item.kind === 'reagent' ? 'bg-yellow-100 text-yellow-600' :
                  item.kind === 'instrument' ? 'bg-green-100 text-green-600' :
                  item.kind === 'physics' ? 'bg-purple-100 text-purple-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {item.kind === 'vessel' && <Beaker className="h-6 w-6" />}
                  {item.kind === 'reagent' && <Atom className="h-6 w-6" />}
                  {item.kind === 'instrument' && <Calculator className="h-6 w-6" />}
                  {item.kind === 'physics' && <Wrench className="h-6 w-6" />}
                </div>
              </div>

              {/* Nome do item */}
              <h4 className="text-sm font-medium text-gray-800 text-center mb-1">
                {item.name}
              </h4>

              {/* Tipo */}
              <p className="text-xs text-gray-500 text-center">
                {item.kind === 'vessel' && 'Vidraria'}
                {item.kind === 'reagent' && 'Reagente'}
                {item.kind === 'instrument' && 'Instrumento'}
                {item.kind === 'physics' && 'Física'}
              </p>

              {/* Propriedades */}
              {item.props && Object.keys(item.props).length > 0 && (
                <div className="mt-2 text-xs text-gray-600">
                  {Object.entries(item.props).slice(0, 2).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span>{key}:</span>
                      <span>{typeof value === 'number' ? value.toFixed(2) : String(value)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Restrições */}
              {item.constraints && item.constraints.length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {item.constraints.slice(0, 2).map(constraint => (
                      <span
                        key={constraint}
                        className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded"
                      >
                        {constraint}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Beaker className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhum item encontrado</p>
            <p className="text-sm">Tente ajustar os filtros</p>
          </div>
        )}
      </div>

      {/* Estatísticas */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Total: {items.length}</span>
          <span>Filtrados: {filteredItems.length}</span>
        </div>
      </div>
    </div>
  );
};
