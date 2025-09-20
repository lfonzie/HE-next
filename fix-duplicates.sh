#!/bin/bash

# Script to fix duplicate dynamic exports
echo "Fixing duplicate dynamic exports..."

# Find all route files with duplicate dynamic exports
find app/api -name "route.ts" -o -name "route.js" | while read file; do
  echo "Processing: $file"
  
  # Count occurrences of dynamic export
  count=$(grep -c "export const dynamic" "$file" 2>/dev/null || echo "0")
  
  if [ "$count" -gt 1 ]; then
    echo "  🔧 Fixing duplicates in $file"
    
    # Remove all dynamic exports and add only one
    sed -i.bak '/export const dynamic/d' "$file"
    
    # Add one dynamic export after the first import
    sed -i.bak '/^import.*$/a\
\
// Prevent prerendering of this API route\
export const dynamic = '\''force-dynamic'\'';
' "$file"
    
    # Remove backup file
    rm "$file.bak"
    echo "  ✅ Fixed duplicates in $file"
  else
    echo "  ⏭️  No duplicates in $file"
  fi
done

echo "Done!"
