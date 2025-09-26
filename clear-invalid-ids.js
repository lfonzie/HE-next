#!/usr/bin/env node

/**
 * Script para limpar IDs inválidos do localStorage
 * Execute no console do navegador
 */

console.log('🧹 Limpando IDs inválidos do localStorage...');

// Função para validar UUID
const isValidUUID = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Limpar localStorage
const chatCid = localStorage.getItem('chat:cid');
if (chatCid && !isValidUUID(chatCid)) {
  console.log(`❌ ID inválido encontrado: ${chatCid}`);
  localStorage.removeItem('chat:cid');
  console.log('✅ ID inválido removido do localStorage');
} else if (chatCid) {
  console.log(`✅ ID válido encontrado: ${chatCid}`);
} else {
  console.log('ℹ️ Nenhum ID encontrado no localStorage');
}

// Limpar URL
const url = new URL(window.location.href);
const urlCid = url.searchParams.get('cid');
if (urlCid && !isValidUUID(urlCid)) {
  console.log(`❌ ID inválido na URL: ${urlCid}`);
  url.searchParams.delete('cid');
  window.history.replaceState({}, '', url.toString());
  console.log('✅ ID inválido removido da URL');
} else if (urlCid) {
  console.log(`✅ ID válido na URL: ${urlCid}`);
} else {
  console.log('ℹ️ Nenhum ID encontrado na URL');
}

console.log('🎉 Limpeza concluída! Recarregue a página para gerar um novo UUID válido.');
