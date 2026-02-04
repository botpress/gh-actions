#!/bin/bash

ROOT_DIR="${1:-.}"

if [ ! -d "$ROOT_DIR" ]; then
  echo "Error: Directory '$ROOT_DIR' does not exist."
  exit 1
fi

source "$(dirname "$0")/common.sh"

files="$(find "$ROOT_DIR" -type f -name '*.sh' | sed 's|^\./||')"
errors_count=0

for file in $files; do
  group "Checking script file: $file"
  file_errors_count=0

  errors=$(shellcheck "$file" -f json -x -P "$(dirname "$file")")
  
  display_shellcheck_errors "$errors" "$(cat "$file")" "$file"

  ((file_errors_count += $(echo "$errors" | yq 'length')))

  end_group
  if [ "$file_errors_count" -gt 0 ]; then
    display_error "$file_errors_count issues found in $file."
  fi
  ((errors_count += file_errors_count))
done

if [ "$errors_count" -gt 0 ]; then
  display_error "There are $errors_count script issues."
  exit 1
else
  echo "No script issues found."
fi
