#!/bin/bash

ACTION_FILES="$(find . -type f -name action.yml)"
ERRORS=0

for action in $ACTION_FILES; do
  if [ "$(yq -c '.runs | has("steps")' "$action")" != "true" ]; then
    continue
  fi

  echo "::group::Checking action file: $action"

  while IFS= read -r step; do

    NAME=$(echo "$step" | yq -r '.name // "Unnamed"')
    echo "Checking step: $NAME"

    # SC2148: script missing shebang
    # SC2296: github variables expansion: ${ {something} }
    printf '%s\n' "$step" | yq -r '.run' | shellcheck - -e SC2148 -e SC2296 || ((ERRORS++))

  done < <(yq '.runs.steps[]? | select(has("run"))' "$action" | jq -c '.')

  echo "::endgroup::"
done

if [ "$ERRORS" -gt 0 ]; then
  echo "There are $ERRORS issues."
  exit 1
else
  echo "No action issues found."
fi
