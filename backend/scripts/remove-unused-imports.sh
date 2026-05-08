#!/usr/bin/env bash
set -euo pipefail
# Remove unused import lines from Java source files under src/main/java
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
find "$ROOT_DIR/src/main/java" -name "*.java" -print0 | while IFS= read -r -d '' file; do
  # collect import lines
  imports=$(awk '/^import /{print}' "$file" )
  if [ -z "$imports" ]; then
    continue
  fi
  tmp=$(mktemp)
  cp "$file" "$tmp"
  while IFS= read -r imp; do
    # skip blank
    if [ -z "$imp" ]; then
      continue
    fi
    # get simple name from import (handle static and wildcard)
    line=$(echo "$imp" | sed 's/^import //' | sed 's/;//' | sed 's/^static //')
    # wildcard imports can't be safely removed
    if echo "$line" | grep -q '\*$'; then
      continue
    fi
    simple=$(echo "$line" | awk -F. '{print $NF}')
    # check if simple name occurs in file excluding import lines
    if ! grep -q "\b${simple}\b" <(grep -v '^import ' "$tmp"); then
      # remove the import from tmp
      awk -v imp_line="$imp" '!/^import /{print} /^import /{if($0!=imp_line) print}' "$tmp" > "$tmp".new && mv "$tmp".new "$tmp"
    fi
  done <<< "$imports"
  mv "$tmp" "$file"
done
echo "Unused import cleanup complete."
