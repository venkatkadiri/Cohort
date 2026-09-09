#!/usr/bin/env bash
set -e

# ==============================================================================
# Cohort Platform Minikube Multi-Environment Orchestrator
# ==============================================================================

WORKSPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_minikube() {
  if ! command -v minikube >/dev/null 2>&1; then
    log_error "Minikube is not installed or not in your PATH."
    echo ""
    echo "To install Minikube on macOS, run:"
    echo "  brew install minikube"
    echo ""
    echo "Or visit: https://minikube.sigs.k8s.io/docs/start/"
    exit 1
  fi
}

check_kubectl() {
  if command -v kubectl >/dev/null 2>&1; then
    KUBECTL="kubectl"
  elif command -v minikube >/dev/null 2>&1; then
    KUBECTL="minikube kubectl --"
  else
    log_warn "Kubectl not found locally, falling back to containerized kubectl."
    KUBECTL="${WORKSPACE_DIR}/cohort-tools.sh run kubectl"
  fi
}

check_helm() {
  if command -v helm >/dev/null 2>&1; then
    HELM="helm"
  else
    log_warn "Helm 3 not found locally, falling back to containerized helm."
    HELM="${WORKSPACE_DIR}/cohort-tools.sh run helm"
  fi
}

get_env_config() {
  local env_arg="$1"
  case "$env_arg" in
    dev|dev-eu-west1)
      TARGET_ENV="dev-eu-west1"
      NAMESPACE="cohort-dev-eu-west1"
      VALUES_FILE="${WORKSPACE_DIR}/helm/cohort-platform/values-dev-eu-west1.yaml"
      ;;
    stage)
      TARGET_ENV="stage"
      NAMESPACE="cohort-stage"
      VALUES_FILE="${WORKSPACE_DIR}/helm/cohort-platform/values-stage.yaml"
      ;;
    prod)
      TARGET_ENV="prod"
      NAMESPACE="cohort-prod"
      VALUES_FILE="${WORKSPACE_DIR}/helm/cohort-platform/values-prod.yaml"
      ;;
    *)
      log_error "Unknown environment: '$env_arg'. Must be 'dev', 'stage', or 'prod'."
      exit 1
      ;;
  esac
}

start_minikube() {
  check_minikube
  local cpus="${CPUS:-4}"
  local memory="${MEMORY:-8192}"

  if minikube status >/dev/null 2>&1; then
    log_info "Minikube is already running."
  else
    log_info "Starting Minikube (CPUs: $cpus, Memory: ${memory}MB, Driver: docker)..."
    minikube start --cpus="$cpus" --memory="$memory" --driver=docker
  fi

  log_info "Enabling essential addons (ingress, metrics-server)..."
  minikube addons enable ingress
  minikube addons enable metrics-server
  log_success "Minikube cluster is ready with ingress and metrics-server enabled."
}

stop_minikube() {
  check_minikube
  log_info "Stopping Minikube cluster..."
  minikube stop
  log_success "Minikube stopped."
}

build_images() {
  check_minikube
  log_info "Configuring Docker environment to use Minikube's Docker daemon..."
  eval $(minikube docker-env)

  local filter_service="$1"
  local services=(
    "domain-hub"
    "booking-hub"
    "notification-hub"
    "search-hub"
    "auth-hub"
    "video-hub"
    "configuration-hub"
    "leader-hub"
    "transaction-hub"
    "web"
  )

  if [ -n "$filter_service" ]; then
    services=("$filter_service")
  fi

  for svc in "${services[@]}"; do
    local dockerfile="${WORKSPACE_DIR}/hubs/${svc}/Dockerfile"
    local values_file="${WORKSPACE_DIR}/hubs/${svc}/helm/values.yaml"
    if [ ! -f "$dockerfile" ]; then
      log_warn "No Dockerfile found for '$svc' at $dockerfile. Skipping."
      continue
    fi

    # Read image tag from values.yaml (or default to 1.0.0)
    local tag="1.0.0"
    if [ -f "$values_file" ]; then
      local parsed_tag=$(grep -E '^\s*tag:' "$values_file" | awk '{print $2}' | tr -d '"' || true)
      if [ -n "$parsed_tag" ]; then
        tag="$parsed_tag"
      fi
    fi

    log_info "Building image for '$svc' (tags: $svc:latest, $svc:$tag)..."
    docker build -f "$dockerfile" -t "${svc}:latest" -t "${svc}:${tag}" "$WORKSPACE_DIR"
    log_success "Built image '${svc}:${tag}' inside Minikube."
  done

  log_success "All images built successfully into Minikube's Docker daemon."
}

deploy_env() {
  local env_name="${1:-dev}"
  get_env_config "$env_name"
  check_helm
  check_kubectl

  log_info "Deploying Cohort Platform to environment '$TARGET_ENV' (Namespace: $NAMESPACE)..."
  $HELM upgrade --install cohort-platform "${WORKSPACE_DIR}/helm/cohort-platform" \
    -f "$VALUES_FILE" \
    --namespace "$NAMESPACE" \
    --create-namespace

  log_success "Successfully deployed cohort-platform to '$NAMESPACE'!"
  echo ""
  show_status "$env_name"
}

show_status() {
  local env_name="$1"
  check_kubectl

  if [ -z "$env_name" ] || [ "$env_name" == "all" ]; then
    local namespaces=("cohort-dev-eu-west1" "cohort-stage" "cohort-prod")
    for ns in "${namespaces[@]}"; do
      if $KUBECTL get namespace "$ns" >/dev/null 2>&1; then
        echo -e "\n${BLUE}=== Namespace: $ns ===${NC}"
        $KUBECTL get pods,svc,ingress,hpa -n "$ns"
      fi
    done
  else
    get_env_config "$env_name"
    echo -e "\n${BLUE}=== Namespace: $NAMESPACE ($TARGET_ENV) ===${NC}"
    $KUBECTL get pods,svc,ingress,hpa -n "$NAMESPACE"
  fi
}

start_tunnel() {
  check_minikube
  log_info "Starting Minikube tunnel for local Ingress and LoadBalancer routing..."
  log_warn "This command requires sudo privileges and will stay in the foreground."
  minikube tunnel
}

show_hosts() {
  check_minikube
  local ip=$(minikube ip 2>/dev/null || echo "127.0.0.1")
  echo "Add the following lines to your /etc/hosts file to access services locally:"
  echo ""
  echo "$ip cohort.mesh dev-eu-west1.cohort.mesh stage.cohort.mesh prod.cohort.mesh"
  echo "$ip api.cohort.mesh api.dev-eu-west1.cohort.mesh api.stage.cohort.mesh api.prod.cohort.mesh"
}

clean_env() {
  local env_name="$1"
  check_helm
  check_kubectl

  if [ -z "$env_name" ]; then
    log_error "Usage: ./scripts/minikube.sh clean <dev|stage|prod|all>"
    exit 1
  fi

  if [ "$env_name" == "all" ]; then
    for env_i in "dev" "stage" "prod"; do
      clean_env "$env_i"
    done
    return
  fi

  get_env_config "$env_name"
  log_info "Cleaning up release in namespace '$NAMESPACE'..."
  $HELM uninstall cohort-platform --namespace "$NAMESPACE" || true
  $KUBECTL delete namespace "$NAMESPACE" || true
  log_success "Cleaned up namespace '$NAMESPACE'."
}

install_argocd() {
  check_minikube
  check_kubectl
  check_helm

  log_info "Setting up ArgoCD GitOps in Minikube..."
  $KUBECTL create namespace argocd --dry-run=client -o yaml | $KUBECTL apply -f -

  log_info "Installing official ArgoCD via Helm..."
  $HELM repo add argo https://argoproj.github.io/argo-helm 2>/dev/null || true
  $HELM repo update argo 2>/dev/null || true
  $HELM upgrade --install argo-cd argo/argo-cd \
    --namespace argocd \
    -f "${WORKSPACE_DIR}/argocd/install/values-argocd.yaml" || {
      log_warn "Helm install from remote repo failed (network/offline). Falling back to declarative manifests..."
      $KUBECTL apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml || true
    }

  log_info "Applying Cohort ArgoCD AppProject and ApplicationSet..."
  $KUBECTL apply -f "${WORKSPACE_DIR}/argocd/appproject.yaml" || true
  $KUBECTL apply -f "${WORKSPACE_DIR}/argocd/applicationset.yaml" || true

  log_info "Waiting for ArgoCD server to become ready..."
  $KUBECTL wait --for=condition=available --timeout=120s deployment/argo-cd-argocd-server -n argocd 2>/dev/null || true

  local argocd_pass=$($KUBECTL -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" 2>/dev/null | base64 -d 2>/dev/null || echo "admin")
  log_success "ArgoCD GitOps installed successfully!"
  echo ""
  echo -e "  🐙 ${BOLD}ArgoCD Dashboard:${NC}  http://localhost:8080 (or http://argocd.cohort.local with tunnel)"
  echo -e "  👤 ${BOLD}Username:${NC}          admin"
  echo -e "  🔑 ${BOLD}Password:${NC}          ${argocd_pass}"
  echo ""
  echo "To launch UI port-forwarding, run: ./scripts/open-uis.sh dev"
}

open_uis() {
  "${WORKSPACE_DIR}/scripts/open-uis.sh" "${1:-dev}"
}

show_help() {
  cat <<EOF
Cohort Platform Minikube Multi-Environment Orchestrator
Usage: ./scripts/minikube.sh <command> [args...]

Available Commands:
  start                       Start Minikube with Docker driver and enable ingress/metrics-server
  stop                        Stop the running Minikube cluster
  build-images [service]      Build service Docker images directly into Minikube's daemon
  deploy <dev|stage|prod>     Deploy all platform microservices & infra to the target environment
  argocd                      Install ArgoCD GitOps, apply AppProject & ApplicationSet, print credentials
  uis [dev|stage|prod]        Open and port-forward all UIs (ArgoCD, Web, Kibana, Temporal, Grafana)
  status [dev|stage|prod|all] Show pods, services, ingresses, and HPAs
  tunnel                      Run minikube tunnel for local ingress routing
  hosts                       Show /etc/hosts entries mapping to Minikube IP
  clean <dev|stage|prod|all>  Tear down environment release and namespace
  dashboard                   Open Kubernetes web dashboard
  help                        Show this help message

Examples:
  ./scripts/minikube.sh start
  ./scripts/minikube.sh argocd
  ./scripts/minikube.sh uis dev
  ./scripts/minikube.sh deploy dev
  ./scripts/minikube.sh status all
EOF
}

CMD="${1:-help}"
shift || true

case "$CMD" in
  start)
    start_minikube "$@"
    ;;
  stop)
    stop_minikube
    ;;
  build-images)
    build_images "$@"
    ;;
  deploy)
    deploy_env "$@"
    ;;
  argocd)
    install_argocd
    ;;
  uis)
    open_uis "$@"
    ;;
  status)
    show_status "$@"
    ;;
  tunnel)
    start_tunnel
    ;;
  hosts)
    show_hosts
    ;;
  clean)
    clean_env "$@"
    ;;
  dashboard)
    check_minikube
    minikube dashboard
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    log_error "Unknown command: $CMD"
    echo ""
    show_help
    exit 1
    ;;
esac
