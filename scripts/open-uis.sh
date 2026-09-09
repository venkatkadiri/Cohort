#!/usr/bin/env bash
# ==============================================================================
# Cohort Multi-Environment UI Dashboard & Port-Forwarding Orchestrator
# ==============================================================================

set -e

ENV_ARG="${1:-dev}"
case "$ENV_ARG" in
  dev|dev-eu-west1)
    TARGET_ENV="dev-eu-west1"
    NAMESPACE="cohort-dev-eu-west1"
    HOST_PREFIX="dev"
    ;;
  stage)
    TARGET_ENV="stage"
    NAMESPACE="cohort-stage"
    HOST_PREFIX="stage"
    ;;
  prod)
    TARGET_ENV="prod"
    NAMESPACE="cohort-prod"
    HOST_PREFIX="prod"
    ;;
  *)
    TARGET_ENV="$ENV_ARG"
    NAMESPACE="cohort-${ENV_ARG}"
    HOST_PREFIX="$ENV_ARG"
    ;;
esac

# Color palette
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BLUE}${BOLD}====================================================================${NC}"
echo -e "${CYAN}${BOLD}   🚀 Cohort Platform Multi-Environment UI Dashboard (${TARGET_ENV})   ${NC}"
echo -e "${BLUE}${BOLD}====================================================================${NC}"
echo ""

# Find kubectl command
if command -v kubectl >/dev/null 2>&1; then
  KUBECTL="kubectl"
elif command -v minikube >/dev/null 2>&1; then
  KUBECTL="minikube kubectl --"
else
  KUBECTL="./cohort-tools.sh run kubectl"
fi

PIDS=()

cleanup() {
  echo ""
  echo -e "${YELLOW}Shutting down UI port-forwards...${NC}"
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  echo -e "${GREEN}All port-forwards terminated.${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 1. ArgoCD UI (Namespace: argocd, Service: argocd-server or argo-cd-argocd-server)
ARGOCD_SVC=$($KUBECTL get svc -n argocd -l app.kubernetes.io/name=argocd-server -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || true)
if [ -z "$ARGOCD_SVC" ]; then
  ARGOCD_SVC=$($KUBECTL get svc -n argocd -o jsonpath='{.items[?(@.metadata.name=~"argocd-server")].metadata.name}' 2>/dev/null || true)
fi

ARGOCD_PASS=""
if $KUBECTL get secret -n argocd argocd-initial-admin-secret >/dev/null 2>&1; then
  ARGOCD_PASS=$($KUBECTL get secret -n argocd argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d 2>/dev/null || echo "")
fi

if [ -n "$ARGOCD_SVC" ]; then
  $KUBECTL port-forward -n argocd "svc/${ARGOCD_SVC}" 8080:80 >/dev/null 2>&1 &
  PIDS+=($!)
  echo -e "  🐙 ${BOLD}ArgoCD GitOps UI:${NC}    ${GREEN}http://localhost:8080${NC} (admin / ${ARGOCD_PASS:-'<custom>'})"
else
  echo -e "  🐙 ${YELLOW}ArgoCD GitOps UI:${NC}    (Not installed yet. Run 'pnpm argocd:install' to install)"
fi

# 2. Web Frontend UI (Namespace: $NAMESPACE, Service: *-web)
WEB_SVC=$($KUBECTL get svc -n "$NAMESPACE" -l app.kubernetes.io/name=web -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || true)
if [ -n "$WEB_SVC" ]; then
  $KUBECTL port-forward -n "$NAMESPACE" "svc/${WEB_SVC}" 3000:3000 >/dev/null 2>&1 &
  PIDS+=($!)
  echo -e "  🖥️  ${BOLD}Web Frontend UI:${NC}     ${GREEN}http://localhost:3000${NC} (Ingress: http://app.${HOST_PREFIX}.cohort.local)"
else
  echo -e "  🖥️  ${YELLOW}Web Frontend UI:${NC}     (Service not found in $NAMESPACE)"
fi

# 3. Kibana Observability UI (Namespace: $NAMESPACE, Service: kibana)
KIBANA_SVC=$($KUBECTL get svc -n "$NAMESPACE" kibana -o jsonpath='{.metadata.name}' 2>/dev/null || true)
if [ -n "$KIBANA_SVC" ]; then
  $KUBECTL port-forward -n "$NAMESPACE" "svc/${KIBANA_SVC}" 5601:5601 >/dev/null 2>&1 &
  PIDS+=($!)
  echo -e "  📊 ${BOLD}Kibana Logs & Search:${NC} ${GREEN}http://localhost:5601${NC} (Ingress: http://kibana.${HOST_PREFIX}.cohort.local)"
else
  echo -e "  📊 ${YELLOW}Kibana UI:${NC}            (Service not found in $NAMESPACE)"
fi

# 4. Temporal Web UI (Namespace: $NAMESPACE, Service: *-temporal-ui)
TEMPORAL_SVC=$($KUBECTL get svc -n "$NAMESPACE" -l app=temporal-ui -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || true)
if [ -n "$TEMPORAL_SVC" ]; then
  $KUBECTL port-forward -n "$NAMESPACE" "svc/${TEMPORAL_SVC}" 8233:8080 >/dev/null 2>&1 &
  PIDS+=($!)
  echo -e "  ⏳ ${BOLD}Temporal Workflows:${NC}   ${GREEN}http://localhost:8233${NC} (Ingress: http://temporal.${HOST_PREFIX}.cohort.local)"
else
  echo -e "  ⏳ ${YELLOW}Temporal UI:${NC}          (Service not found in $NAMESPACE)"
fi

# 5. Grafana Metrics UI (Namespace: $NAMESPACE, Service: grafana)
GRAFANA_SVC=$($KUBECTL get svc -n "$NAMESPACE" -l app.kubernetes.io/name=grafana -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || true)
if [ -n "$GRAFANA_SVC" ]; then
  $KUBECTL port-forward -n "$NAMESPACE" "svc/${GRAFANA_SVC}" 3001:3000 >/dev/null 2>&1 &
  PIDS+=($!)
  echo -e "  📈 ${BOLD}Grafana Observability:${NC} ${GREEN}http://localhost:3001${NC} (admin / admin)"
fi

echo ""
echo -e "${CYAN}Press ${BOLD}[Ctrl+C]${NC}${CYAN} to stop all UI port-forwarding sessions.${NC}"
wait
