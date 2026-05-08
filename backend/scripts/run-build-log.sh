#!/usr/bin/env bash
# Run maven build and tee output into repo-root logs/ with timestamped filename
set -euo pipefail

BACKEND_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ROOT_DIR="$(cd "$BACKEND_DIR/.." && pwd)"
LOG_DIR="$ROOT_DIR/logs"

mkdir -p "$LOG_DIR"
cd "$BACKEND_DIR"
TS=$(date +%Y%m%d-%H%M%S)
LOGFILE="$LOG_DIR/backend-mvn-build-$TS.log"
LATEST="$LOG_DIR/backend-mvn-build-latest.log"
echo "Running mvn package, logging to ${LOGFILE}"
./mvnw -DskipTests -B -e package 2>&1 | tee "${LOGFILE}"
cp -f "${LOGFILE}" "${LATEST}"
exit ${PIPESTATUS[0]}
