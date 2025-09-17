#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

console.log('🧪 Testing migration...');

const criticalFiles = [
  'components/ti-interactive/TIInteractive.tsx',
  'app/api/ti/hint/route.ts',
  'app/api/achievements/route.ts',
  'app/api/analytics/route.ts',
  'components/gamification/AchievementSystem.tsx',
  'components/analytics/AnalyticsDashboard.tsx',
];

(async () => {
  console.log('\n📋 Checking critical files...');
  let passedTests = 0;
  for (const file of criticalFiles) {
    const filePath = path.join('/Users/lf/Documents/HE-next', file);
    if (await fs.access(filePath).then(() => true).catch(() => false)) {
      console.log(`✅ ${file} - OK`);
      passedTests++;
    } else {
      console.log(`❌ ${file} - MISSING`);
    }
  }

  console.log('\n📦 Checking dependencies...');
  const packageJson = JSON.parse(await fs.readFile('/Users/lf/Documents/HE-next/package.json', 'utf8'));
  const requiredDeps = ['recharts', '@tanstack/react-query', 'class-variance-authority', 'clsx', 'tailwind-merge'];
  let depsOk = 0;
  for (const dep of requiredDeps) {
    if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
      console.log(`✅ ${dep} - OK`);
      depsOk++;
    } else {
      console.log(`❌ ${dep} - MISSING`);
    }
  }

  console.log(`\n📊 Test Results:`);
  console.log(`✅ Files: ${passedTests}/${criticalFiles.length}`);
  console.log(`✅ Dependencies: ${depsOk}/${requiredDeps.length}`);

  if (passedTests === criticalFiles.length && depsOk === requiredDeps.length) {
    console.log('\n🎉 All tests passed!');
    console.log('✅ Migration validated successfully!');
  } else {
    console.log('\n⚠️ Some tests failed.');
    console.log('Check the items listed above.');
  }
})();

