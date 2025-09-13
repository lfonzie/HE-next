// systemMessages.ts
import { MODULES } from '../lib/modules';

export function getAllModules() {
  return MODULES;
}

export function getModuleById(id: string) {
  return MODULES[id as keyof typeof MODULES];
}

export function getModuleName(id: string) {
  const moduleData = getModuleById(id);
  return moduleData?.label || 'Desconhecido';
}
