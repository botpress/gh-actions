#!/bin/bash

ROOT_DIR="${1:-.}"

if [ ! -d "$ROOT_DIR" ]; then
  echo "Error: Directory '$ROOT_DIR' does not exist."
  exit 1
fi

SCRIPT_FILES="$(find "$ROOT_DIR" -type f -name '*.sh')"
ERRORS=0

for script in $SCRIPT_FILES; do
  echo "::group::Checking script file: $script"

  if (shellcheck "$script"); then
    echo "No issues found."
  else
    ((ERRORS++))
  fi

  echo "::endgroup::"
done

if [ "$ERRORS" -gt 0 ]; then
  echo "There are $ERRORS script issues."
  exit 1
else
  echo "No script issues found."
fi
