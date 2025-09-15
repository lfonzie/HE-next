#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const authFile = path.join(__dirname, '../lib/auth.ts');
const authDevFile = path.join(__dirname, '../lib/auth-dev.ts');
const authBackupFile = path.join(__dirname, '../lib/auth-backup.ts');

function toggleAuth() {
  try {
    // Verificar se existe backup
    if (fs.existsSync(authBackupFile)) {
      // Restaurar autenticação normal
      fs.copyFileSync(authBackupFile, authFile);
      fs.unlinkSync(authBackupFile);
      console.log('✅ Autenticação normal restaurada (com banco Neon)');
    } else {
      // Fazer backup e usar autenticação de desenvolvimento
      fs.copyFileSync(authFile, authBackupFile);
      fs.copyFileSync(authDevFile, authFile);
      console.log('✅ Autenticação de desenvolvimento ativada');
      console.log('📧 Email: dev@hubedu.ia');
      console.log('🔑 Senha: dev123');
    }
  } catch (error) {
    console.error('❌ Erro ao alternar autenticação:', error);
  }
}

toggleAuth();
