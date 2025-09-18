#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENEM_BASE_PATH = path.join(process.cwd(), 'QUESTOES_ENEM', 'public');

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function cleanupInvalidQuestions() {
  log('=== CLEANING UP INVALID ENEM QUESTIONS ===');
  
  if (!fs.existsSync(ENEM_BASE_PATH)) {
    log('ENEM base path not found, skipping cleanup');
    return;
  }
  
  const years = fs.readdirSync(ENEM_BASE_PATH).filter(year => 
    year.match(/^\d{4}$/) && fs.statSync(path.join(ENEM_BASE_PATH, year)).isDirectory()
  );
  
  let totalRemoved = 0;
  
  for (const year of years) {
    const yearPath = path.join(ENEM_BASE_PATH, year);
    const questionsDir = path.join(yearPath, 'questions');
    
    if (!fs.existsSync(questionsDir)) {
      continue;
    }
    
    const questionDirs = fs.readdirSync(questionsDir);
    let yearRemoved = 0;
    
    for (const questionDir of questionDirs) {
      const questionPath = path.join(questionsDir, questionDir);
      const detailsPath = path.join(questionPath, 'details.json');
      
      // Check if it's a directory and doesn't have details.json
      if (fs.statSync(questionPath).isDirectory() && !fs.existsSync(detailsPath)) {
        try {
          fs.rmSync(questionPath, { recursive: true, force: true });
          yearRemoved++;
          totalRemoved++;
          log(`Removed invalid question directory: ${year}/${questionDir}`);
        } catch (error) {
          log(`Error removing ${questionPath}: ${error.message}`);
        }
      }
    }
    
    if (yearRemoved > 0) {
      log(`Year ${year}: Removed ${yearRemoved} invalid question directories`);
    }
  }
  
  log(`=== CLEANUP COMPLETE: ${totalRemoved} invalid question directories removed ===`);
}

// Run cleanup
cleanupInvalidQuestions();
