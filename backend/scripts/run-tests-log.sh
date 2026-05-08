#!/usr/bin/env bash
# Run maven tests and tee output into repo-root logs/ with timestamped filename
set -euo pipefail

BACKEND_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ROOT_DIR="$(cd "$BACKEND_DIR/.." && pwd)"
LOG_DIR="$ROOT_DIR/logs"

mkdir -p "$LOG_DIR"
cd "$BACKEND_DIR"
TS=$(date +%Y%m%d-%H%M%S)
LOGFILE="$LOG_DIR/backend-mvn-test-$TS.log"
LATEST="$LOG_DIR/backend-mvn-test-latest.log"
echo "Running mvn test, logging to ${LOGFILE}"
./mvnw -B -e test 2>&1 | tee "${LOGFILE}"
cp -f "${LOGFILE}" "${LATEST}"
exit ${PIPESTATUS[0]}
