#!/bin/bash

ROOT_DIR="${1:-.github/workflows}"


if [ ! -d "$ROOT_DIR" ]; then
  echo "Error: Directory '$ROOT_DIR' does not exist."
  exit 1
fi

WORKFLOW_FILES="$(find "$ROOT_DIR" -type f -name '*.yml')"
ERRORS=0

for workflow in $WORKFLOW_FILES; do
  echo "::group::Checking workflow file: $workflow"

  while IFS= read -r step; do

    NAME=$(echo "$step" | yq -r '.name // .run' | head -1)
    echo "Checking step: $NAME"

    # SC2148: script missing shebang
    # SC2296: github variables expansion: ${{something}}
    if (printf '%s\n' "$step" | yq -r '.run' | shellcheck - -e SC2148 -e SC2296); then
      echo "No issues found."
    else
      ((ERRORS++))
    fi

  done < <(yq -o=json -I=0 '.jobs[]?.steps[]? | select(has("run"))' "$workflow")

  echo "::endgroup::"
done

if [ "$ERRORS" -gt 0 ]; then
  echo "There are $ERRORS workflow issues."
  exit 1
else
  echo "No workflow issues found."
fi
