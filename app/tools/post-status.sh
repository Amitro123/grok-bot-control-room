#!/usr/bin/env bash
set -euo pipefail
set +x
exec node "$(dirname "$0")/post-status.mjs" "$@"
