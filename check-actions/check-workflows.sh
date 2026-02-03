#!/bin/bash

WORKFLOW_FILES="$(find .github/workflows -type f -name '*.yml')"
ERRORS=0

for workflow in $WORKFLOW_FILES; do
  echo "::group::Checking workflow file: $workflow"

  while IFS= read -r step; do

    NAME=$(echo "$step" | yq -r '.name // .run' | head -1)
    echo "Checking step: $NAME"

    # SC2148: script missing shebang
    # SC2296: github variables expansion: ${ {something} }
    printf '%s\n' "$step" | yq -r '.run' | shellcheck - -e SC2148 -e SC2296 || ((ERRORS++))

  done < <(yq '.jobs[]?.steps[]? | select(has("run"))' "$workflow" | jq -c '.')

  echo "::endgroup::"
done

if [ "$ERRORS" -gt 0 ]; then
  echo "There are $ERRORS issues."
  exit 1
else
  echo "No workflow issues found."
fi
