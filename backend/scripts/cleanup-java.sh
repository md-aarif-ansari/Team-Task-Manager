#!/usr/bin/env bash
# Remove duplicate imports and collapse excessive blank lines in Java source files under backend/src
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
find "$ROOT_DIR/src/main/java" -name "*.java" -print0 | while IFS= read -r -d '' file; do
  tmp=$(mktemp)
  awk '
    BEGIN{ inImport=0 }
    /^\s*package / { print; next }
    /^\s*import / {
      if (!seen[$0]++) print; next
    }
    { print }
  ' "$file" > "$tmp"
  # collapse multiple blank lines
  awk 'BEGIN{ blank=0 } /^\s*$/ { blank++; if(blank<=1) print; next } { blank=0; print }' "$tmp" > "$file".new
  mv "$file".new "$file"
  rm -f "$tmp"
done

echo "Cleanup completed." 
