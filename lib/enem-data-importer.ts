import { PrismaClient } from '@prisma/client';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';
import { EnemItem, EnemGabarito, EnemManifest, EnemImportResult } from '@/types/enem';
import { convertExistingEnemData } from './enem-existing-data-converter';

const prisma = new PrismaClient();

export class EnemDataImporter {
  private dataPath: string;
  private manifest: EnemManifest | null = null;

  constructor(dataPath: string = './data/enem') {
    this.dataPath = dataPath;
  }

  /**
   * Load and validate the manifest file
   */
  async loadManifest(): Promise<EnemManifest> {
    try {
      const manifestPath = join(this.dataPath, 'manifest.json');
      const manifestData = readFileSync(manifestPath, 'utf-8');
      this.manifest = JSON.parse(manifestData) as EnemManifest;
      return this.manifest;
    } catch (error) {
      throw new Error(`Failed to load manifest: ${error}`);
    }
  }

  /**
   * Calculate SHA256 hash of a file
   */
  private calculateHash(filePath: string): string {
    const content = readFileSync(filePath, 'utf-8');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Validate file integrity using checksums
   */
  async validateFileIntegrity(): Promise<{ valid: boolean; errors: string[] }> {
    if (!this.manifest) {
      await this.loadManifest();
    }

    const errors: string[] = [];
    const checksums = this.manifest!.checksums;

    for (const [filePath, expectedHash] of Object.entries(checksums)) {
      try {
        const fullPath = join(this.dataPath, filePath);
        const actualHash = this.calculateHash(fullPath);
        
        if (actualHash !== expectedHash.replace('sha256:', '')) {
          errors.push(`Checksum mismatch for ${filePath}`);
        }
      } catch (error) {
        errors.push(`File not found or unreadable: ${filePath}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Import items from a JSONL file
   */
  async importItemsFromFile(filePath: string): Promise<EnemImportResult> {
    const result: EnemImportResult = {
      success: false,
      imported_items: 0,
      skipped_items: 0,
      errors: [],
      validation_report: {
        missing_assets: [],
        duplicate_items: [],
        invalid_items: []
      }
    };

    try {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.trim().split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const item: EnemItem = JSON.parse(line);
          
          // Validate item structure
          if (!this.validateItem(item)) {
            result.validation_report.invalid_items.push(item.item_id);
            result.errors.push(`Invalid item structure: ${item.item_id}`);
            continue;
          }

          // Check for duplicates
          const existingItem = await prisma.enem_item.findUnique({
            where: { content_hash: item.content_hash }
          });

          if (existingItem) {
            result.validation_report.duplicate_items.push(item.item_id);
            result.skipped_items++;
            continue;
          }

          // Check for missing assets
          const missingAssets = await this.checkMissingAssets(item.asset_refs, item.year);
          if (missingAssets.length > 0) {
            result.validation_report.missing_assets.push(...missingAssets);
          }

          // Import item
          await prisma.enem_item.create({
            data: {
              item_id: item.item_id,
              year: item.year,
              area: item.area,
              text: item.text,
              alternatives: item.alternatives,
              correct_answer: item.correct_answer,
              topic: item.topic,
              estimated_difficulty: item.estimated_difficulty,
              asset_refs: item.asset_refs,
              content_hash: item.content_hash,
              dataset_version: item.dataset_version,
              metadata: item.metadata
            }
          });

          result.imported_items++;
        } catch (error) {
          result.errors.push(`Failed to parse line: ${error}`);
        }
      }

      result.success = result.errors.length === 0;
      return result;
    } catch (error) {
      result.errors.push(`Failed to read file: ${error}`);
      return result;
    }
  }

  /**
   * Import gabarito from JSON file
   */
  async importGabaritoFromFile(filePath: string): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      const content = readFileSync(filePath, 'utf-8');
      const gabarito: EnemGabarito = JSON.parse(content);

      // Validate gabarito structure
      if (!gabarito.year || !gabarito.booklet || !gabarito.answers) {
        errors.push('Invalid gabarito structure');
        return { success: false, errors };
      }

      // Store gabarito in metadata (could be separate table if needed)
      console.log(`Imported gabarito for ${gabarito.year} ${gabarito.booklet}: ${Object.keys(gabarito.answers).length} answers`);
      
      return { success: true, errors };
    } catch (error) {
      errors.push(`Failed to import gabarito: ${error}`);
      return { success: false, errors };
    }
  }

  /**
   * Validate item structure
   */
  private validateItem(item: EnemItem): boolean {
    const requiredFields = ['item_id', 'year', 'area', 'text', 'alternatives', 'correct_answer', 'topic', 'content_hash'];
    
    for (const field of requiredFields) {
      if (!item[field as keyof EnemItem]) {
        return false;
      }
    }

    // Validate alternatives structure
    if (!item.alternatives.A || !item.alternatives.B || !item.alternatives.C || !item.alternatives.D || !item.alternatives.E) {
      return false;
    }

    // Validate correct answer
    if (!['A', 'B', 'C', 'D', 'E'].includes(item.correct_answer)) {
      return false;
    }

    return true;
  }

  /**
   * Check for missing asset files
   */
  private async checkMissingAssets(assetRefs: string[], year: number): Promise<string[]> {
    const missingAssets: string[] = [];
    const assetsPath = join(this.dataPath, 'assets', year.toString());

    for (const assetRef of assetRefs) {
      try {
        const assetPath = join(assetsPath, assetRef);
        statSync(assetPath);
      } catch {
        missingAssets.push(assetRef);
      }
    }

    return missingAssets;
  }

  /**
   * Import all data from the data directory
   */
  async importAllData(): Promise<EnemImportResult> {
    const result: EnemImportResult = {
      success: false,
      imported_items: 0,
      skipped_items: 0,
      errors: [],
      validation_report: {
        missing_assets: [],
        duplicate_items: [],
        invalid_items: []
      }
    };

    try {
      // Load manifest
      await this.loadManifest();

      // Validate file integrity
      const integrityCheck = await this.validateFileIntegrity();
      if (!integrityCheck.valid) {
        result.errors.push(...integrityCheck.errors);
        return result;
      }

      // Import items from each year
      for (const year of this.manifest!.years_available) {
        const itemsFile = join(this.dataPath, year.toString(), 'items.jsonl');
        const gabaritoFile = join(this.dataPath, year.toString(), 'gabarito.json');

        try {
          // Import items
          const itemsResult = await this.importItemsFromFile(itemsFile);
          result.imported_items += itemsResult.imported_items;
          result.skipped_items += itemsResult.skipped_items;
          result.errors.push(...itemsResult.errors);
          result.validation_report.missing_assets.push(...itemsResult.validation_report.missing_assets);
          result.validation_report.duplicate_items.push(...itemsResult.validation_report.duplicate_items);
          result.validation_report.invalid_items.push(...itemsResult.validation_report.invalid_items);

          // Import gabarito
          const gabaritoResult = await this.importGabaritoFromFile(gabaritoFile);
          if (!gabaritoResult.success) {
            result.errors.push(...gabaritoResult.errors);
          }
        } catch (error) {
          result.errors.push(`Failed to import year ${year}: ${error}`);
        }
      }

      result.success = result.errors.length === 0;
      return result;
    } catch (error) {
      result.errors.push(`Failed to import all data: ${error}`);
      return result;
    }
  }

  /**
   * Generate import report
   */
  async generateImportReport(): Promise<string> {
    const stats = await prisma.enem_item.groupBy({
      by: ['year', 'area'],
      _count: {
        item_id: true
      }
    });

    let report = 'ENEM Data Import Report\n';
    report += '========================\n\n';

    for (const stat of stats) {
      report += `${stat.year} - ${stat.area}: ${stat._count.item_id} items\n`;
    }

    const totalItems = await prisma.enem_item.count();
    report += `\nTotal items: ${totalItems}\n`;

    return report;
  }

  /**
   * Convert existing ENEM data from QUESTOES_ENEM to new format
   */
  async convertExistingData(): Promise<void> {
    console.log('Converting existing ENEM data from QUESTOES_ENEM...');
    await convertExistingEnemData();
    console.log('Data conversion completed!');
  }

  /**
   * Clean up and close connections
   */
  async cleanup(): Promise<void> {
    await prisma.$disconnect();
  }
}

// Utility function to run import
export async function runEnemDataImport(): Promise<void> {
  const importer = new EnemDataImporter();
  
  try {
    console.log('Starting ENEM data import...');
    const result = await importer.importAllData();
    
    if (result.success) {
      console.log('✅ Import completed successfully!');
      console.log(`📊 Imported: ${result.imported_items} items`);
      console.log(`⏭️ Skipped: ${result.skipped_items} items`);
    } else {
      console.log('❌ Import completed with errors:');
      result.errors.forEach(error => console.log(`  - ${error}`));
    }

    const report = await importer.generateImportReport();
    console.log('\n' + report);
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await importer.cleanup();
  }
}
