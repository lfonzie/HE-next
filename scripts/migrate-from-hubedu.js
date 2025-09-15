#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

console.log('🚀 Starting migration from HubEdu.ai_ to HE-next...');

async function copyFile(source, destination) {
  try {
    const sourcePath = path.join('/Users/lf/Documents/HubEdu.ai_', source);
    const destPath = path.join('/Users/lf/Documents/HE-next', destination);
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    if (await fs.access(sourcePath).then(() => true).catch(() => false)) {
      await fs.copyFile(sourcePath, destPath);
      console.log(`✅ Copied: ${source} → ${destination}`);
      return true;
    } else {
      console.log(`⚠️ File not found: ${source}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error copying ${source}:`, error.message);
    return false;
  }
}

async function copyDirectory(source, destination) {
  try {
    const sourcePath = path.join('/Users/lf/Documents/HubEdu.ai_', source);
    const destPath = path.join('/Users/lf/Documents/HE-next', destination);
    if (!await fs.access(sourcePath).then(() => true).catch(() => false)) {
      console.log(`⚠️ Directory not found: ${source}`);
      return false;
    }
    await fs.mkdir(destPath, { recursive: true });
    const items = await fs.readdir(sourcePath);
    let copiedCount = 0;
    for (const item of items) {
      const sourceItem = path.join(sourcePath, item);
      const destItem = path.join(destPath, item);
      const stats = await fs.stat(sourceItem);
      if (stats.isDirectory()) {
        await copyDirectory(path.join(source, item), path.join(destination, item));
      } else {
        await fs.copyFile(sourceItem, destItem);
        copiedCount++;
      }
    }
    console.log(`✅ Copied directory: ${source} (${copiedCount} files)`);
    return true;
  } catch (error) {
    console.error(`❌ Error copying directory ${source}:`, error.message);
    return false;
  }
}

const migrationItems = [
  { type: 'file', source: 'client/src/components/TIInteractive.tsx', dest: 'components/ti-interactive/TIInteractive.tsx' },
  { type: 'file', source: 'server/api/ti/hint.ts', dest: 'app/api/ti/hint/route.ts' },
  { type: 'file', source: 'server/api/achievements.ts', dest: 'app/api/achievements/route.ts' },
  { type: 'file', source: 'server/api/analytics.ts', dest: 'app/api/analytics/route.ts' },
  { type: 'directory', source: 'client/src/lib', dest: 'lib' },
  { type: 'directory', source: 'client/src/utils', dest: 'utils' },
  { type: 'directory', source: 'client/src/hooks', dest: 'hooks' },
  { type: 'directory', source: 'shared/types', dest: 'types' },
];

(async () => {
  console.log('\n📁 Migrating files and directories...');
  let successCount = 0;
  for (const item of migrationItems) {
    if (item.type === 'file') {
      if (await copyFile(item.source, item.dest)) successCount++;
    } else if (item.type === 'directory') {
      if (await copyDirectory(item.source, item.dest)) successCount++;
    }
  }

  console.log(`\n📊 Migration Summary:`);
  console.log(`✅ Success: ${successCount}/${migrationItems.length}`);
  console.log(`❌ Failures: ${migrationItems.length - successCount}/${migrationItems.length}`);

  if (successCount === migrationItems.length) {
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npm install');
    console.log('2. Run: npx prisma db push');
    console.log('3. Run: npx prisma generate');
    console.log('4. Run: npm run dev');
  } else {
    console.log('\n⚠️ Migration completed with errors.');
    console.log('Check the files listed above and copy manually if necessary.');
  }
})();

