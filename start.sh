#!/usr/bin/env bash
# ==============================================================================
# Cohort Microservices Platform & Frontend Master Runner
# Usage:
#   ./start.sh          # Starts all microservices + Web UI + DB + Temporal
#   ./start.sh --obs    # Starts all services + ELK Stack + Prometheus + Grafana
# ==============================================================================

set -e

# Run master TypeScript orchestrator via tsx
npx tsx scripts/start-all.ts "$@"
