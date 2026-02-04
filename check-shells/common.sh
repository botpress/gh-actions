#!/bin/bash

if [ "$GITHUB_ACTIONS" = "true" ]; then
  GROUP="::group::"
  END_GROUP="::endgroup::"
  display_error() {
    echo "::error file=$5,line=$6,endLine=$7,col=$8,endColumn=$9,title=$1::SC$2: $3 ($5:$6-$7)"
    echo "::notice::https://www.shellcheck.net/wiki/SC$2"
    # shellcheck disable=SC2001
    echo "$4" | sed 's/^/\t/'
  }
else
  # shellcheck disable=SC2034
  GROUP="▶ "
  # shellcheck disable=SC2034
  END_GROUP=""
  display_error() {
    echo "[$1] SC$2: $3 ($5:$6-$7)"
    echo -e "\tSee: https://www.shellcheck.net/wiki/SC$2"
    # shellcheck disable=SC2001
    echo "$4" | sed 's/^/\t/'
  }
fi

display_shellcheck_errors() {
  local errors="$1"
  local script="$2"
  local file="$3"
  local start_line=${4:-0}

  if [ "$(echo "$errors" | yq 'length')" -eq 0 ]; then
    echo "No issues found."
  else
    while IFS= read -r error; do
      error_line=$((start_line + $(echo "$error" | yq -r '.line')))
      error_endline=$((start_line + $(echo "$error" | yq -r '.endLine')))
      error_column=$(echo "$error" | yq -r '.column')
      error_endcolumn=$(echo "$error" | yq -r '.endColumn')
      level=$(echo "$error" | yq -r '.level')
      code=$(echo "$error" | yq -r '.code')
      message=$(echo "$error" | yq -r '.message')
      content=$(printf '%s\n' "$script" | sed -n "$(echo "$error" | yq -r '.line'),$(echo "$error" | yq -r '.endLine')p")
      display_error "$level" "$code" "$message" "$content" "$file" "$error_line" "$error_endline" "$error_column" "$error_endcolumn"
    done < <(printf '%s\n' "$errors" | yq -o=json -I=0 '.[]')
  fi
}