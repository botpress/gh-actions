#!/bin/bash

ROOT_DIR="${1:-.github/workflows}"
if [ ! -d "$ROOT_DIR" ]; then
  echo "Error: Directory '$ROOT_DIR' does not exist."
  exit 1
fi

source "$(dirname "$0")/common.sh"

WORKFLOW_FILES="$(find "$ROOT_DIR" -type f -name '*.yml' | sed 's|^\./||')"
ERRORS_COUNT=0

for file in $WORKFLOW_FILES; do
  echo "${GROUP}Checking workflow file: $file"

  while IFS= read -r step; do

    name=$(echo "$step" | yq -r '.name // .run' | head -1)
    line=$(echo "$step" | yq -r '.line // ""')
    script=$(echo "$step" | yq -r '.run')

    echo "Checking step: $name ($file:$line)"

    # SC2148: script missing shebang
    # SC2296: github variables expansion: ${{something}}
    errors=$(echo "$script" | shellcheck - -f json -x -e SC2148 -e SC2296)

    display_shellcheck_errors "$errors" "$script" "$file" "$line"
    
    ((ERRORS_COUNT+=$(echo "$errors" | yq 'length')))

  done < <(yq -o=json -I=0 '.jobs[]?.steps[]? | select(has("run")) | {"line": (.run | line), "name": .name, "run": .run}' "$file")

  echo "${END_GROUP}"
done

if [ "$ERRORS_COUNT" -gt 0 ]; then
  echo "There are $ERRORS_COUNT workflow issues."
  exit 1
else
  echo "No workflow issues found."
fi
