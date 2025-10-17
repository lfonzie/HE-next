// components/StockroomPanel.tsx - Sistema de estoque inspirado no ChemCollective
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Beaker, 
  TestTube, 
  Droplet, 
  Search, 
  Filter,
  ChevronDown,
  ChevronRight,
  Info,
  Copy,
  Trash2
} from 'lucide-react';

interface StockroomItem {
  id: string;
  name: string;
  category: 'reagents' | 'glassware' | 'equipment';
  subcategory: string;
  icon: React.ComponentType<any>;
  properties: {
    concentration?: number;
    unit?: string;
    pH?: number;
    density?: number;
    formula?: string;
    molarMass?: number;
    color?: string;
    hazard?: string;
    capacity?: number;
    range?: number[];
    material?: string;
    precision?: number;
    calibration?: string;
  };
  description?: string;
  usage?: string[];
}

interface StockroomPanelProps {
  onItemSelect: (item: StockroomItem) => void;
  onItemDuplicate: (item: StockroomItem) => void;
  onItemInfo: (item: StockroomItem) => void;
}

export const StockroomPanel: React.FC<StockroomPanelProps> = ({
  onItemSelect,
  onItemDuplicate,
  onItemInfo
}) => {
  const [activeTab, setActiveTab] = useState<'reagents' | 'glassware' | 'equipment'>('reagents');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['acids', 'bases']));
  const [selectedItem, setSelectedItem] = useState<StockroomItem | null>(null);

  // Banco de dados de reagentes inspirado no ChemCollective
  const stockroomItems: StockroomItem[] = [
    // Ácidos
    {
      id: 'hcl-01',
      name: 'Ácido Clorídrico 1.0 M',
      category: 'reagents',
      subcategory: 'acids',
      icon: Droplet,
      properties: {
        concentration: 1.0,
        unit: 'M',
        pH: 0.0,
        density: 1.02,
        formula: 'HCl',
        molarMass: 36.46,
        color: 'incolor',
        hazard: 'corrosive'
      },
      description: 'Ácido forte, usado em titulações e síntese',
      usage: ['titration', 'synthesis', 'pH_adjustment']
    },
    {
      id: 'hcl-01m',
      name: 'Ácido Clorídrico 0.1 M',
      category: 'reagents',
      subcategory: 'acids',
      icon: Droplet,
      properties: {
        concentration: 0.1,
        unit: 'M',
        pH: 1.0,
        density: 1.00,
        formula: 'HCl',
        molarMass: 36.46,
        color: 'incolor',
        hazard: 'corrosive'
      },
      description: 'Solução diluída para titulações precisas',
      usage: ['titration', 'standardization']
    },
    {
      id: 'h2so4-01',
      name: 'Ácido Sulfúrico 1.0 M',
      category: 'reagents',
      subcategory: 'acids',
      icon: Droplet,
      properties: {
        concentration: 1.0,
        unit: 'M',
        pH: 0.0,
        density: 1.06,
        formula: 'H2SO4',
        molarMass: 98.08,
        color: 'incolor',
        hazard: 'corrosive'
      },
      description: 'Ácido diprótico forte, usado em síntese',
      usage: ['synthesis', 'dehydration', 'catalysis']
    },
    {
      id: 'hno3-01',
      name: 'Ácido Nítrico 1.0 M',
      category: 'reagents',
      subcategory: 'acids',
      icon: Droplet,
      properties: {
        concentration: 1.0,
        unit: 'M',
        pH: 0.0,
        density: 1.04,
        formula: 'HNO3',
        molarMass: 63.01,
        color: 'incolor',
        hazard: 'oxidizing'
      },
      description: 'Ácido oxidante forte',
      usage: ['oxidation', 'nitration', 'analysis']
    },

    // Bases
    {
      id: 'naoh-01',
      name: 'Hidróxido de Sódio 1.0 M',
      category: 'reagents',
      subcategory: 'bases',
      icon: Droplet,
      properties: {
        concentration: 1.0,
        unit: 'M',
        pH: 14.0,
        density: 1.04,
        formula: 'NaOH',
        molarMass: 40.00,
        color: 'incolor',
        hazard: 'corrosive'
      },
      description: 'Base forte, usado em titulações',
      usage: ['titration', 'saponification', 'pH_adjustment']
    },
    {
      id: 'naoh-01m',
      name: 'Hidróxido de Sódio 0.1 M',
      category: 'reagents',
      subcategory: 'bases',
      icon: Droplet,
      properties: {
        concentration: 0.1,
        unit: 'M',
        pH: 13.0,
        density: 1.00,
        formula: 'NaOH',
        molarMass: 40.00,
        color: 'incolor',
        hazard: 'corrosive'
      },
      description: 'Solução diluída para titulações',
      usage: ['titration', 'standardization']
    },
    {
      id: 'koh-01',
      name: 'Hidróxido de Potássio 1.0 M',
      category: 'reagents',
      subcategory: 'bases',
      icon: Droplet,
      properties: {
        concentration: 1.0,
        unit: 'M',
        pH: 14.0,
        density: 1.05,
        formula: 'KOH',
        molarMass: 56.11,
        color: 'incolor',
        hazard: 'corrosive'
      },
      description: 'Base forte alternativa ao NaOH',
      usage: ['titration', 'saponification']
    },

    // Indicadores
    {
      id: 'phenolphthalein',
      name: 'Fenolftaleína',
      category: 'reagents',
      subcategory: 'indicators',
      icon: Droplet,
      properties: {
        concentration: 0.1,
        unit: '%',
        pH: 8.3,
        formula: 'C20H14O4',
        molarMass: 318.33,
        color: 'incolor/rosa',
        hazard: 'none'
      },
      description: 'Indicador ácido-base, vira rosa em pH > 8.3',
      usage: ['acid_base_titration', 'pH_indicator']
    },
    {
      id: 'bromothymol',
      name: 'Azul de Bromotimol',
      category: 'reagents',
      subcategory: 'indicators',
      icon: Droplet,
      properties: {
        concentration: 0.1,
        unit: '%',
        pH: 7.0,
        formula: 'C27H28Br2O5S',
        molarMass: 624.38,
        color: 'amarelo/azul',
        hazard: 'none'
      },
      description: 'Indicador para pH neutro',
      usage: ['pH_indicator', 'neutralization']
    },

    // Vidraria
    {
      id: 'beaker-100',
      name: 'Béquer 100 mL',
      category: 'glassware',
      subcategory: 'beakers',
      icon: Beaker,
      properties: {
        capacity: 100,
        unit: 'mL',
        material: 'vidro',
        precision: 5
      },
      description: 'Recipiente para misturas e aquecimento',
      usage: ['mixing', 'heating', 'storage']
    },
    {
      id: 'beaker-250',
      name: 'Béquer 250 mL',
      category: 'glassware',
      subcategory: 'beakers',
      icon: Beaker,
      properties: {
        capacity: 250,
        unit: 'mL',
        material: 'vidro',
        precision: 5
      },
      description: 'Recipiente padrão para experimentos',
      usage: ['mixing', 'heating', 'storage']
    },
    {
      id: 'erlenmeyer-250',
      name: 'Erlenmeyer 250 mL',
      category: 'glassware',
      subcategory: 'flasks',
        icon: Beaker,
      properties: {
        capacity: 250,
        unit: 'mL',
        material: 'vidro',
        precision: 5
      },
      description: 'Frasco cônico para titulações',
      usage: ['titration', 'mixing', 'storage']
    },
    {
      id: 'burette-50',
      name: 'Bureta 50 mL',
      category: 'glassware',
      subcategory: 'burettes',
      icon: TestTube,
      properties: {
        capacity: 50,
        unit: 'mL',
        material: 'vidro',
        precision: 0.1
      },
      description: 'Para adição precisa de volumes',
      usage: ['titration', 'precise_delivery']
    },
    {
      id: 'pipette-10',
      name: 'Pipeta 10 mL',
      category: 'glassware',
      subcategory: 'pipettes',
      icon: TestTube,
      properties: {
        capacity: 10,
        unit: 'mL',
        material: 'vidro',
        precision: 0.02
      },
      description: 'Para medição precisa de volumes',
      usage: ['precise_measurement', 'transfer']
    },

    // Equipamentos
    {
      id: 'phmeter',
      name: 'pHmetro',
      category: 'equipment',
      subcategory: 'meters',
      icon: Info,
      properties: {
        range: [0, 14],
        precision: 0.01,
        calibration: '3-point'
      },
      description: 'Medidor de pH digital',
      usage: ['pH_measurement', 'acid_base_analysis']
    },
    {
      id: 'balance',
      name: 'Balança Analítica',
      category: 'equipment',
      subcategory: 'balances',
      icon: Info,
      properties: {
        capacity: 200,
        unit: 'g',
        precision: 0.0001
      },
      description: 'Para pesagem precisa',
      usage: ['weighing', 'gravimetric_analysis']
    },
    {
      id: 'thermometer',
      name: 'Termômetro',
      category: 'equipment',
      subcategory: 'thermometers',
      icon: Info,
      properties: {
        range: [-10, 110],
        unit: '°C',
        precision: 0.1
      },
      description: 'Medição de temperatura',
      usage: ['temperature_measurement', 'calorimetry']
    }
  ];

  const filteredItems = stockroomItems.filter(item => {
    const matchesTab = item.category === activeTab;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.properties.formula?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.subcategory]) {
      acc[item.subcategory] = [];
    }
    acc[item.subcategory].push(item);
    return acc;
  }, {} as Record<string, StockroomItem[]>);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleItemClick = (item: StockroomItem) => {
    setSelectedItem(item);
    onItemSelect(item);
  };

  const handleContextMenu = (e: React.MouseEvent, item: StockroomItem) => {
    e.preventDefault();
    // Implementar menu de contexto
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Estoque (Stockroom)</h3>
        
        {/* Barra de pesquisa */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar reagentes, vidraria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'reagents', label: 'Reagentes', icon: Droplet },
            { id: 'glassware', label: 'Vidraria', icon: Beaker },
            { id: 'equipment', label: 'Equipamentos', icon: Info }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de itens */}
      <div className="flex-1 overflow-y-auto p-4">
        {Object.entries(groupedItems).map(([subcategory, items]) => (
          <div key={subcategory} className="mb-4">
            {/* Cabeçalho da categoria */}
            <button
              onClick={() => toggleCategory(subcategory)}
              className="flex items-center space-x-2 w-full text-left py-2 hover:bg-gray-50 rounded-lg px-2"
            >
              {expandedCategories.has(subcategory) ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
              <span className="font-medium text-gray-700 capitalize">
                {subcategory.replace('_', ' ')}
              </span>
              <span className="text-sm text-gray-500">({items.length})</span>
            </button>

            {/* Itens da categoria */}
            <AnimatePresence>
              {expandedCategories.has(subcategory) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-6 space-y-2"
                >
                  {items.map(item => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onClick={() => handleItemClick(item)}
                      onContextMenu={(e) => handleContextMenu(e, item)}
                      className={`p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors ${
                        selectedItem?.id === item.id ? 'bg-blue-50 border-blue-300' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          item.category === 'reagents' ? 'bg-blue-100 text-blue-600' :
                          item.category === 'glassware' ? 'bg-green-100 text-green-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </h4>
                          
                          {item.properties.formula && (
                            <p className="text-xs text-gray-600 font-mono">
                              {item.properties.formula}
                            </p>
                          )}
                          
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.properties.concentration && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                                {item.properties.concentration} {item.properties.unit}
                              </span>
                            )}
                            {item.properties.pH !== undefined && (
                              <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded">
                                pH {item.properties.pH}
                              </span>
                            )}
                            {item.properties.capacity && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                {item.properties.capacity} {item.properties.unit}
                              </span>
                            )}
                            {item.properties.hazard && item.properties.hazard !== 'none' && (
                              <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded">
                                {item.properties.hazard}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhum item encontrado</p>
            <p className="text-sm">Tente ajustar os filtros</p>
          </div>
        )}
      </div>

      {/* Painel de informações do item selecionado */}
      {selectedItem && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">Informações</h4>
            <div className="flex space-x-2">
              <button
                onClick={() => onItemDuplicate(selectedItem)}
                className="p-1 text-gray-600 hover:text-gray-800"
                title="Duplicar"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={() => onItemInfo(selectedItem)}
                className="p-1 text-gray-600 hover:text-gray-800"
                title="Mais informações"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">
            {selectedItem.description}
          </p>
          
          {selectedItem.usage && (
            <div className="text-xs text-gray-500">
              <span className="font-medium">Uso:</span> {selectedItem.usage.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
