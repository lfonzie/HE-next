#!/bin/bash

# Script to add dynamic = 'force-dynamic' to all API routes
echo "Adding dynamic = 'force-dynamic' to all API routes..."

# Find all route files
find app/api -name "route.ts" -o -name "route.js" | while read file; do
  echo "Processing: $file"
  
  # Check if the file already has dynamic export
  if ! grep -q "export const dynamic" "$file"; then
    # Add the dynamic export after the imports
    sed -i.bak '/^import.*$/a\
\
// Prevent prerendering of this API route\
export const dynamic = '\''force-dynamic'\'';
' "$file"
    
    # Remove backup file
    rm "$file.bak"
    echo "  ✅ Added dynamic export to $file"
  else
    echo "  ⏭️  Already has dynamic export: $file"
  fi
done

echo "Done!"
