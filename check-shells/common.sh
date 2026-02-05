#!/bin/bash

if [ "$GITHUB_ACTIONS" = "true" ]; then
  group() {
    echo "::group::$*"
  }
  end_group() {
    echo "::endgroup::"
  }
  display_shellcheck_error() {
    echo "::error file=$5,line=$6,endLine=$7,col=$8,endColumn=$9,title=$1::SC$2: $3 ($5:$6-$7)"
    echo "::notice::https://www.shellcheck.net/wiki/SC$2"
    # shellcheck disable=SC2001
    echo "$4" | sed 's/^/\t/'
  }
  display_error() {
    echo "::error::$1"
  }
else
  group() {
    echo "▶ $*"
  }
  end_group() {
    :
  }
  display_shellcheck_error() {
    echo "[$1] SC$2: $3 ($5:$6-$7)"
    echo -e "\tSee: https://www.shellcheck.net/wiki/SC$2"
    # shellcheck disable=SC2001
    echo "$4" | sed 's/^/\t/'
  }
  display_error() {
    echo "[error] $1"
  }
fi

display_shellcheck_errors() {
  local errors="$1"
  local script="$2"
  local file="$3"
  local start_line=${4:-0}

  while IFS= read -r error; do
    error_line=$((start_line + $(echo "$error" | yq -r '.line')))
    error_endline=$((start_line + $(echo "$error" | yq -r '.endLine')))
    error_column=$(echo "$error" | yq -r '.column')
    error_endcolumn=$(echo "$error" | yq -r '.endColumn')
    level=$(echo "$error" | yq -r '.level')
    code=$(echo "$error" | yq -r '.code')
    message=$(echo "$error" | yq -r '.message')
    content=$(printf '%s\n' "$script" | sed -n "$(echo "$error" | yq -r '.line'),$(echo "$error" | yq -r '.endLine')p")
    display_shellcheck_error "$level" "$code" "$message" "$content" "$file" "$error_line" "$error_endline" "$error_column" "$error_endcolumn"
  done < <(printf '%s\n' "$errors" | yq -o=json -I=0 '.[]')
}