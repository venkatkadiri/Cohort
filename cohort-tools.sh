#!/usr/bin/env bash
set -e

# ==============================================================================
# Cohort Platform Tooling Wrapper (Zero Host Dependencies)
# ==============================================================================

IMAGE_NAME="cohort-tools:latest"
WORKSPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Verify docker is installed
if ! command -v docker >/dev/null 2>&1; then
  echo "❌ Error: Docker is not installed or not in PATH."
  echo "Please install Docker Desktop or Docker Engine to use cohort-tools."
  exit 1
fi

# Build image if it does not exist
ensure_image() {
  if ! docker image inspect "$IMAGE_NAME" >/dev/null 2>&1; then
    echo "📦 Building tooling container image '$IMAGE_NAME'..."
    docker build -f "${WORKSPACE_DIR}/docker/Dockerfile.tools" -t "$IMAGE_NAME" "$WORKSPACE_DIR"
    echo "✅ Tooling container image ready."
  fi
}

# Run command inside container
run_in_container() {
  ensure_image
  local it_flags=""
  if [ -t 0 ] && [ -t 1 ]; then
    it_flags="-it"
  fi

  # Run container mapping host UID and GID so created files have proper ownership
  docker run $it_flags --rm \
    --user "$(id -u):$(id -g)" \
    -v "${WORKSPACE_DIR}:/workspace" \
    -w /workspace \
    "$IMAGE_NAME" \
    "$@"
}

show_help() {
  cat <<EOF
Cohort Platform Containerized Tooling CLI
Usage: ./cohort-tools.sh <command> [args...]

Available Commands:
  build                             Rebuild the '$IMAGE_NAME' utility container
  scaffold <name> [port]            Scaffold a new microservice with Dockerfile, Helm chart & Terraform
  helm:lint                         Lint all package and infrastructure Helm charts
  helm:dep:up                       Update Helm chart dependencies for cohort-platform
  helm:template:dev                 Render Helm manifests for dev-eu-west1 environment
  helm:template:stage               Render Helm manifests for stage environment
  helm:template:prod                Render Helm manifests for prod environment
  tf <service> <command> [args...]  Run Terraform command in apps/<service>/terraform (init, validate, plan)
  tf:init:all                       Initialize Terraform for all packages in apps/*/terraform
  tf:validate:all                   Validate Terraform syntax across all packages
  run <command...>                  Execute an arbitrary command inside the utility container
  sh | bash                         Open an interactive shell inside the utility container
  help                              Show this help message

Examples:
  ./cohort-tools.sh scaffold analytics-hub 8009
  ./cohort-tools.sh helm:lint
  ./cohort-tools.sh tf video-hub validate
  ./cohort-tools.sh tf video-hub plan
  ./cohort-tools.sh tf:validate:all
  ./cohort-tools.sh run pnpm typecheck
EOF
}

CMD="${1:-help}"
shift || true

case "$CMD" in
  build)
    echo "🔨 Building $IMAGE_NAME..."
    docker build --no-cache -f "${WORKSPACE_DIR}/docker/Dockerfile.tools" -t "$IMAGE_NAME" "$WORKSPACE_DIR"
    ;;
  scaffold)
    if [ -z "$1" ]; then
      echo "❌ Usage: ./cohort-tools.sh scaffold <service-name> [port]"
      exit 1
    fi
    echo "🚀 Running service scaffolding inside container for '$1'..."
    run_in_container pnpm exec tsx scripts/scaffold-service.ts "$@"
    ;;
  helm:lint)
    echo "🔍 Linting Helm charts..."
    run_in_container bash -c "helm lint apps/*/helm && helm lint helm/infrastructure/* && helm lint helm/cohort-platform"
    ;;
  helm:dep:up)
    echo "📦 Updating Helm chart dependencies..."
    run_in_container bash -c "helm dependency update ./helm/cohort-platform"
    ;;
  helm:template:dev)
    run_in_container helm template cohort-platform ./helm/cohort-platform -f ./helm/cohort-platform/values-dev-eu-west1.yaml "$@"
    ;;
  helm:template:stage)
    run_in_container helm template cohort-platform ./helm/cohort-platform -f ./helm/cohort-platform/values-stage.yaml "$@"
    ;;
  helm:template:prod)
    run_in_container helm template cohort-platform ./helm/cohort-platform -f ./helm/cohort-platform/values-prod.yaml "$@"
    ;;
  tf)
    SERVICE="$1"
    TF_CMD="$2"
    if [ -z "$SERVICE" ] || [ -z "$TF_CMD" ]; then
      echo "❌ Usage: ./cohort-tools.sh tf <service-name> <terraform-command> [args...]"
      echo "Example: ./cohort-tools.sh tf video-hub validate"
      exit 1
    fi
    shift 2 || true
    TF_DIR="apps/${SERVICE}/terraform"
    if [ ! -d "${WORKSPACE_DIR}/${TF_DIR}" ]; then
      echo "❌ Error: Terraform directory '${TF_DIR}' does not exist."
      exit 1
    fi
    echo "☁️ Running 'terraform $TF_CMD' for service '$SERVICE'..."
    run_in_container terraform -chdir="$TF_DIR" "$TF_CMD" "$@"
    ;;
  tf:init:all)
    echo "🌐 Initializing Terraform across all packages..."
    for tf_dir in "${WORKSPACE_DIR}"/apps/*/terraform; do
      if [ -d "$tf_dir" ]; then
        svc=$(basename "$(dirname "$tf_dir")")
        echo "Initializing apps/$svc/terraform..."
        run_in_container terraform -chdir="apps/$svc/terraform" init -input=false
      fi
    done
    echo "✅ All packages initialized."
    ;;
  tf:validate:all)
    echo "🔍 Validating Terraform configurations across all packages..."
    run_in_container bash -c '
      failed=0
      for tf_dir in apps/*/terraform; do
        if [ -d "$tf_dir" ]; then
          svc=$(basename "$(dirname "$tf_dir")")
          echo -n "Validating apps/$svc/terraform... "
          if terraform -chdir="$tf_dir" validate >/dev/null 2>&1; then
            echo "✅ VALID"
          else
            echo "❌ FAILED"
            terraform -chdir="$tf_dir" validate
            failed=1
          fi
        fi
      done
      if [ $failed -eq 0 ]; then
        echo "🎉 All package Terraform configurations are valid!"
      else
        exit 1
      fi
    '
    ;;
  run)
    run_in_container bash -c "$*"
    ;;
  sh|bash)
    run_in_container /bin/bash
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    echo "❌ Unknown command: $CMD"
    echo ""
    show_help
    exit 1
    ;;
esac
