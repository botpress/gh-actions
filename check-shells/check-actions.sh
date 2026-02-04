#!/bin/bash

ROOT_DIR="${1:-.github/actions}"

if [ ! -d "$ROOT_DIR" ]; then
  echo "Error: Directory '$ROOT_DIR' does not exist."
  exit 1
fi

if [ "$GITHUB_ACTIONS" = "true" ]; then
  GROUP="::group::"
  END_GROUP="::endgroup::"
  display_error() {
    echo "::error file=$5,line=$6,endLine=$7,col=$8,endColumn=$9::[$1] SC$2: $3"
  }
else
  GROUP="▶ "
  END_GROUP=""
  display_error() {
    echo "[$1] SC$2: $3 ($5:$6-$7)"
    echo -e "\t$4"
  }
fi

ACTION_FILES="$(find "$ROOT_DIR" -type f -name action.yml)"
ERRORS_COUNT=0

for FILE in $ACTION_FILES; do
  if [ "$(yq -c '.runs | has("steps")' "$FILE")" != "true" ]; then
    continue
  fi

  echo "${GROUP}Checking action file: $FILE"

  while IFS= read -r step; do

    NAME=$(echo "$step" | yq -r '.name // "Unnamed"')
    LINE=$(echo "$step" | yq -r '.line // ""')
  
    echo "Checking step: $NAME ($FILE:$LINE)"

    # SC2148: script missing shebang
    # SC2296: github variables expansion: ${{something}}
    ERRORS=$(printf '%s\n' "$step" | yq -r '.run' | shellcheck - -f json -e SC2148 -e SC2296)

    if [ $(printf '%s\n' "$ERRORS" | yq '. | length') -eq 0 ]; then
      echo "No issues found."
    else
      while IFS= read -r error; do
        ERROR_LINE=$((LINE + $(echo "$error" | yq -r '.line')))
        ERROR_ENDLINE=$((LINE + $(echo "$error" | yq -r '.endLine')))
        ERROR_COLUMN=$(echo "$error" | yq -r '.column')
        ERROR_ENDCOLUMN=$(echo "$error" | yq -r '.endColumn')
        LEVEL=$(echo "$error" | yq -r '.level')
        CODE=$(echo "$error" | yq -r '.code')
        MESSAGE=$(echo "$error" | yq -r '.message')
        CONTENT=$(printf '%s\n' "$step" | yq -r '.run' | sed -n "$(echo "$error" | yq -r '.line'),$(echo "$error" | yq -r '.endLine')p")
        display_error "$LEVEL" "$CODE" "$MESSAGE" "$CONTENT" "$FILE" "$ERROR_LINE" "$ERROR_ENDLINE" "$ERROR_COLUMN" "$ERROR_ENDCOLUMN"
        ((ERRORS_COUNT++))
      done < <(printf '%s\n' "$ERRORS" | yq -o=json -I=0 '.[]')
    fi

  done < <(yq -o=json -I=0 '.runs.steps[]? | select(has("run")) | {"line": (.run | line), "name": .name, "run": .run}' "$FILE")

  echo "${END_GROUP}"
done

if [ "$ERRORS_COUNT" -gt 0 ]; then
  echo "There are $ERRORS_COUNT action issues."
  exit 1
else
  echo "No action issues found."
fi
