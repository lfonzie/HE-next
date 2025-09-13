#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files that need image fixes
const filesToFix = [
  'app/demo/page.tsx',
  'app/demo-register/page.tsx',
  'app/privacidade/page.tsx',
  'app/termos/page.tsx',
  'components/layout/CollapsibleSidebar.tsx',
  'components/layout/MobileSidebar.tsx',
  'components/layout/UnifiedSidebar.tsx'
];

function fixImageTags(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Add Image import if not present and has img tags
  if (!content.includes('import Image from') && content.includes('<img')) {
    const lines = content.split('\n');
    let insertIndex = 0;
    
    // Find the last import statement
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        insertIndex = i + 1;
      }
    }
    
    lines.splice(insertIndex, 0, "import Image from 'next/image';");
    content = lines.join('\n');
  }
  
  // Replace img tags with Image components - more comprehensive pattern
  content = content.replace(
    /<img\s+([^>]*?)src={([^}]+)}\s+([^>]*?)alt={([^}]+)}\s+([^>]*?)className={([^}]+)}\s*([^>]*?)\s*\/>/g,
    (match, beforeSrc, src, betweenSrcAlt, alt, betweenAltClass, className, afterClass) => {
      // Extract width and height from className
      const widthMatch = className.match(/w-(\d+)/);
      const heightMatch = className.match(/h-(\d+)/);
      const width = widthMatch ? parseInt(widthMatch[1]) * 4 : 32;
      const height = heightMatch ? parseInt(heightMatch[1]) * 4 : 32;
      
      return `<Image 
        src={${src}}
        alt={${alt}}
        width={${width}}
        height={${height}}
        className={${className}}
        ${afterClass.trim()}
      />`;
    }
  );
  
  // Handle img tags without className
  content = content.replace(
    /<img\s+([^>]*?)src={([^}]+)}\s+([^>]*?)alt={([^}]+)}\s*([^>]*?)\s*\/>/g,
    (match, beforeSrc, src, betweenSrcAlt, alt, afterAlt) => {
      return `<Image 
        src={${src}}
        alt={${alt}}
        width={32}
        height={32}
        ${afterAlt.trim()}
      />`;
    }
  );
  
  // Handle img tags with different attribute orders
  content = content.replace(
    /<img\s+([^>]*?)className={([^}]+)}\s+([^>]*?)src={([^}]+)}\s+([^>]*?)alt={([^}]+)}\s*([^>]*?)\s*\/>/g,
    (match, beforeClass, className, betweenClassSrc, src, betweenSrcAlt, alt, afterAlt) => {
      const widthMatch = className.match(/w-(\d+)/);
      const heightMatch = className.match(/h-(\d+)/);
      const width = widthMatch ? parseInt(widthMatch[1]) * 4 : 32;
      const height = heightMatch ? parseInt(heightMatch[1]) * 4 : 32;
      
      return `<Image 
        src={${src}}
        alt={${alt}}
        width={${width}}
        height={${height}}
        className={${className}}
        ${afterAlt.trim()}
      />`;
    }
  );
  
  fs.writeFileSync(fullPath, content);
  console.log(`Fixed images in: ${filePath}`);
}

// Fix all files
filesToFix.forEach(fixImageTags);

console.log('All image fixes completed!');
