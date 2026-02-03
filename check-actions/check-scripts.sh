#!/bin/bash

SCRIPT_FILES="$(find . -type f -name '*.sh')"
ERRORS=0

for script in $SCRIPT_FILES; do
  echo "::group::Checking script file: $script"

  shellcheck "$script" || ((ERRORS++))

  echo "::endgroup::"
done

if [ "$ERRORS" -gt 0 ]; then
  echo "There are $ERRORS issues."
  exit 1
else
  echo "No script issues found."
fi
