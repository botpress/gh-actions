#!/usr/bin/env bash
# Idempotent cleanup for the db-tunnel composite action.
# Invoked via `bash <path>` from webiny/action-post-run as a post-job step.
set -uo pipefail

if [[ -n "${SSM_PID:-}" ]]; then
  if kill -0 "$SSM_PID" 2>/dev/null; then
    kill -TERM "$SSM_PID" 2>/dev/null || true
    sleep 1
    kill -KILL "$SSM_PID" 2>/dev/null || true
  fi
fi

# session-manager-plugin is a grandchild that often outlives SIGTERM on the parent.
pkill -TERM -f session-manager-plugin 2>/dev/null || true
sleep 1
pkill -KILL -f session-manager-plugin 2>/dev/null || true

exit 0
