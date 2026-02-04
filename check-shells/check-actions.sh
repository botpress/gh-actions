#!/bin/bash

ROOT_DIR="${1:-.github/actions}"
if [ ! -d "$ROOT_DIR" ]; then
  echo "Error: Directory '$ROOT_DIR' does not exist."
  exit 1
fi

source "$(dirname "$0")/common.sh"

ACTION_FILES="$(find "$ROOT_DIR" -type f -name action.yml)"
ERRORS_COUNT=0

for file in $ACTION_FILES; do
  if [ "$(yq -c '.runs | has("steps")' "$file")" != "true" ]; then
    continue
  fi

  echo "${GROUP}Checking action file: $file"

  while IFS= read -r step; do

    name=$(echo "$step" | yq -r '.name // .run' | head -1)
    line=$(echo "$step" | yq -r '.line // ""')
    script=$(echo "$step" | yq -r '.run')
  
    echo "Checking step: $name ($file:$line)"
  
    # SC2148: script missing shebang
    # SC2296: github variables expansion: ${{something}}
    errors=$(echo "$script" | shellcheck - -f json -x -P "$(dirname "$file")" -e SC2148 -e SC2296)

    display_shellcheck_errors "$errors" "$script" "$file" "$line"
    
    ((ERRORS_COUNT+=$(echo "$errors" | yq 'length')))

  done < <(yq -o=json -I=0 '.runs.steps[]? | select(has("run")) | {"line": (.run | line), "name": .name, "run": .run}' "$file")

  echo "${END_GROUP}"
done

if [ "$ERRORS_COUNT" -gt 0 ]; then
  echo "There are $ERRORS_COUNT action issues."
  exit 1
else
  echo "No action issues found."
fi
