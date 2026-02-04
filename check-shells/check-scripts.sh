#!/bin/bash

ROOT_DIR="${1:-.}"

if [ ! -d "$ROOT_DIR" ]; then
  echo "Error: Directory '$ROOT_DIR' does not exist."
  exit 1
fi

source "$(dirname "$0")/common.sh"

SCRIPT_FILES="$(find "$ROOT_DIR" -type f -name '*.sh')"
ERRORS_COUNT=0

for file in $SCRIPT_FILES; do
  echo "${GROUP}Checking script file: $file"

  errors=$(shellcheck "$file" -f json -x -P "$(dirname "$file")")
  
  display_shellcheck_errors "$errors" "$(cat "$file")" "$file"

  ((ERRORS_COUNT+=$(echo "$errors" | yq 'length')))

  echo "${END_GROUP}"
done

if [ "$ERRORS_COUNT" -gt 0 ]; then
  echo "There are $ERRORS_COUNT script issues."
  exit 1
else
  echo "No script issues found."
fi
