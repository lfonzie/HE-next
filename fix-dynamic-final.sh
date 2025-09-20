#!/bin/bash

# Script to completely fix dynamic exports
echo "Completely fixing dynamic exports..."

# Find all route files
find app/api -name "route.ts" -o -name "route.js" | while read file; do
  echo "Processing: $file"
  
  # Create a temporary file
  temp_file=$(mktemp)
  
  # Process the file line by line
  in_imports=true
  dynamic_added=false
  
  while IFS= read -r line; do
    # If we're still in imports and hit a non-import line, add dynamic export
    if [ "$in_imports" = true ] && [[ ! "$line" =~ ^import.*$ ]] && [[ ! "$line" =~ ^//.*$ ]] && [[ ! "$line" =~ ^$ ]]; then
      if [ "$dynamic_added" = false ]; then
        echo "" >> "$temp_file"
        echo "// Prevent prerendering of this API route" >> "$temp_file"
        echo "export const dynamic = 'force-dynamic';" >> "$temp_file"
        echo "" >> "$temp_file"
        dynamic_added=true
      fi
      in_imports=false
    fi
    
    # Skip any existing dynamic exports
    if [[ "$line" =~ export.*dynamic ]]; then
      continue
    fi
    
    # Skip duplicate comments
    if [[ "$line" =~ "Prevent prerendering" ]] && [ "$dynamic_added" = true ]; then
      continue
    fi
    
    echo "$line" >> "$temp_file"
  done < "$file"
  
  # Replace the original file
  mv "$temp_file" "$file"
  echo "  ✅ Fixed $file"
done

echo "Done!"
