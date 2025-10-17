// components/ContextMenu.tsx - Menu de contexto para itens da bancada
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, 
  Trash2, 
  Edit, 
  RotateCw, 
  Move, 
  Info, 
  Settings,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Download,
  Upload
} from 'lucide-react';

interface ContextMenuOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  disabled?: boolean;
  destructive?: boolean;
  separator?: boolean;
}

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  item: {
    id: string;
    name: string;
    type: string;
    properties: Record<string, any>;
  } | null;
  onDuplicate: (itemId: string) => void;
  onDelete: (itemId: string) => void;
  onEdit: (itemId: string) => void;
  onRotate: (itemId: string) => void;
  onMove: (itemId: string) => void;
  onToggleVisibility: (itemId: string) => void;
  onToggleLock: (itemId: string) => void;
  onExport: (itemId: string) => void;
  onImport: (itemId: string) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  position,
  onClose,
  item,
  onDuplicate,
  onDelete,
  onEdit,
  onRotate,
  onMove,
  onToggleVisibility,
  onToggleLock,
  onExport,
  onImport
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 150);
  };

  const handleAction = (action: () => void) => {
    action();
    handleClose();
  };

  if (!isOpen || !item) return null;

  const menuOptions: ContextMenuOption[] = [
    {
      id: 'duplicate',
      label: 'Duplicar',
      icon: <Copy className="h-4 w-4" />,
      action: () => handleAction(() => onDuplicate(item.id))
    },
    {
      id: 'edit',
      label: 'Editar Propriedades',
      icon: <Edit className="h-4 w-4" />,
      action: () => handleAction(() => onEdit(item.id))
    },
    {
      id: 'rotate',
      label: 'Rotacionar',
      icon: <RotateCw className="h-4 w-4" />,
      action: () => handleAction(() => onRotate(item.id))
    },
    {
      id: 'move',
      label: 'Mover',
      icon: <Move className="h-4 w-4" />,
      action: () => handleAction(() => onMove(item.id))
    },
    {
      id: 'separator1',
      label: '',
      icon: null,
      action: () => {},
      separator: true
    },
    {
      id: 'visibility',
      label: item.properties.visible ? 'Ocultar' : 'Mostrar',
      icon: item.properties.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />,
      action: () => handleAction(() => onToggleVisibility(item.id))
    },
    {
      id: 'lock',
      label: item.properties.locked ? 'Desbloquear' : 'Bloquear',
      icon: item.properties.locked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />,
      action: () => handleAction(() => onToggleLock(item.id))
    },
    {
      id: 'separator2',
      label: '',
      icon: null,
      action: () => {},
      separator: true
    },
    {
      id: 'export',
      label: 'Exportar',
      icon: <Download className="h-4 w-4" />,
      action: () => handleAction(() => onExport(item.id))
    },
    {
      id: 'import',
      label: 'Importar',
      icon: <Upload className="h-4 w-4" />,
      action: () => handleAction(() => onImport(item.id))
    },
    {
      id: 'separator3',
      label: '',
      icon: null,
      action: () => {},
      separator: true
    },
    {
      id: 'delete',
      label: 'Remover',
      icon: <Trash2 className="h-4 w-4" />,
      action: () => handleAction(() => onDelete(item.id)),
      destructive: true
    }
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg py-2 min-w-48"
          style={{
            left: position.x,
            top: position.y,
            maxHeight: '400px',
            overflowY: 'auto'
          }}
        >
          {/* Cabeçalho do item */}
          <div className="px-4 py-2 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-800">{item.name}</h4>
                <p className="text-xs text-gray-500 capitalize">{item.type}</p>
              </div>
            </div>
          </div>

          {/* Opções do menu */}
          <div className="py-1">
            {menuOptions.map((option, index) => (
              <React.Fragment key={option.id}>
                {option.separator ? (
                  <div className="my-1 border-t border-gray-200" />
                ) : (
                  <button
                    onClick={option.action}
                    disabled={option.disabled}
                    className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                      option.disabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : option.destructive
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Informações adicionais */}
          <div className="px-4 py-2 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <p>ID: {item.id}</p>
              <p>Tipo: {item.type}</p>
              {item.properties.volume && (
                <p>Volume: {item.properties.volume} mL</p>
              )}
              {item.properties.concentration && (
                <p>Concentração: {item.properties.concentration} M</p>
              )}
              {item.properties.temperature && (
                <p>Temperatura: {item.properties.temperature}°C</p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook para gerenciar o menu de contexto
export const useContextMenu = () => {
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    item: any;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    item: null
  });

  const openContextMenu = (event: React.MouseEvent, item: any) => {
    event.preventDefault();
    event.stopPropagation();
    
    setContextMenu({
      isOpen: true,
      position: { x: event.clientX, y: event.clientY },
      item
    });
  };

  const closeContextMenu = () => {
    setContextMenu(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  return {
    contextMenu,
    openContextMenu,
    closeContextMenu
  };
};
