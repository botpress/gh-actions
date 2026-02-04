#!/bin/bash

ROOT_DIR="${1:-.github/actions}"
if [ ! -d "$ROOT_DIR" ]; then
  echo "Error: Directory '$ROOT_DIR' does not exist."
  exit 1
fi

source "$(dirname "$0")/common.sh"

files="$(find "$ROOT_DIR" -type f -name action.yml | sed 's|^\./||')"
errors_count=0

for file in $files; do
  if [ "$(yq -c '.runs | has("steps")' "$file")" != "true" ]; then
    continue
  fi

  group "Checking action file: $file"
  file_errors_count=0

  while IFS= read -r step; do

    name=$(echo "$step" | yq -r '.name // .run' | head -1)
    line=$(echo "$step" | yq -r '.line // ""')
    script=$(echo "$step" | yq -r '.run')
  
    echo "Checking step: $name ($file:$line)"
  
    # SC2148: script missing shebang
    # SC2296: github variables expansion: ${{something}}
    errors=$(echo "$script" | shellcheck - -f json -x -P "$(dirname "$file")" -e SC2148 -e SC2296)

    display_shellcheck_errors "$errors" "$script" "$file" "$line"
    
    ((file_errors_count += $(echo "$errors" | yq 'length')))

  done < <(yq -o=json -I=0 '.runs.steps[]? | select(has("run")) | {"line": (.run | line), "name": .name, "run": .run}' "$file")

  end_group
  if [ "$file_errors_count" -gt 0 ]; then
    display_error "$file_errors_count issues found in $file."
  fi
  ((errors_count += file_errors_count))
done

if [ "$errors_count" -gt 0 ]; then
  display_error "There are $errors_count action issues."
  exit 1
else
  echo "No action issues found."
fi
