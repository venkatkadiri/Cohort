# configuration-hub

Centralized tenant configuration, feature flags, and dynamic platform parameters.

---

## 📌 Service Specifications
- **Package Location**: `hubs/configuration-hub`
- **HTTP Port**: `:8006`
- **gRPC Port**: `:50056`
- **Health Check**: `http://localhost:8006/health`
- **Prometheus Metrics**: `http://localhost:8006/metrics`

---

## 💻 Local Development

### 1. Running Locally
```bash
# Start in development mode (with hot-reload)
pnpm --filter @cohort/configuration-hub dev

# Typecheck TypeScript code
pnpm --filter @cohort/configuration-hub typecheck

# Build production bundle
pnpm --filter @cohort/configuration-hub build
```

### 2. Docker Containerization
A multi-stage, rootless production Dockerfile is maintained at `hubs/configuration-hub/Dockerfile`:
```bash
# Build Docker image
docker build -f hubs/configuration-hub/Dockerfile -t configuration-hub:latest .

# Run container locally
docker run -p 8006:8006 configuration-hub:latest
```

---

## 🌿 Git & Pull Request Best Practices

### 1. Branch Naming Standards
- Feature branches: `feature/configuration-hub/<short-description>` (e.g. `feature/configuration-hub/add-filter-options`)
- Bugfix branches: `fix/configuration-hub/<short-description>` (e.g. `fix/configuration-hub/handle-null-pointer`)
- Chore branches: `chore/configuration-hub/<short-description>`

### 2. PR Title Conventions (Conventional Commits)
All PR titles are strictly verified by CI (`.github/workflows/_Validate.Lint.PR.yaml`). The title must follow:

```text
<type>(<scope>): <description>
```

- **Allowed Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`, `deps`
- **Scope**: Must match this package name: `(configuration-hub)`
- **Examples**:
  - `feat(configuration-hub): add webhook notification dispatcher`
  - `fix(configuration-hub): correct database connection retry logic`
  - `refactor(configuration-hub): migrate configuration parser to strict schema`

### 3. Local PR Title Validation
Verify your proposed PR title locally before submitting:
```bash
pnpm lint:pr "feat(configuration-hub): support real-time updates"
```

---

## 🔍 Code Quality, Formatting & Linting

### 1. Prettier Formatting
Code formatting is enforced across all TypeScript, JSON, and YAML files:
```bash
# Check formatting without modifying files
pnpm format

# Auto-format all files according to .prettierrc
pnpm format:fix
```

### 2. Unused Dependency Detection
Keep dependencies lean and secure:
```bash
pnpm deps:check
```

### 3. TypeScript Type Safety
Always ensure zero TypeScript compilation errors:
```bash
pnpm --filter @cohort/configuration-hub typecheck
# or verify across all monorepo packages:
pnpm typecheck
```

---

## ☁️ Azure Terraform Infrastructure Best Practices

The cloud infrastructure for this package is self-contained under `hubs/configuration-hub/terraform/`.

### 1. Version-Driven Infrastructure Evolution
- **Version Tracking**: The `service_version` variable in `terraform.tfvars` tracks the semantic release (e.g. `0.0.1`, `0.0.2`, `1.0.0`).
- **Feature Flags**: Flags like `storage_backend` (`filesystem` vs `blob_storage`) allow cloud resources to provision conditionally as the package matures .

### 2. Validating Terraform Configurations
```bash
# Validate Terraform syntax
./cohort-tools.sh tf configuration-hub validate
# or validate across all packages:
./cohort-tools.sh tf:validate:all

# Run Terraform plan (dry-run)
./cohort-tools.sh tf configuration-hub plan
```

### 3. Cloud Resource Standards
- Resources are scoped to `cohort-${var.environment}-rg`.
- Workload identity is bound via `azurerm_user_assigned_identity`.
- All resources inherit standard tags: `Project`, `Service`, `Version`, and `Environment`.

---

## ⚓ Helm 3 & Kubernetes Deployment

Package-level Helm charts are maintained at `hubs/configuration-hub/helm/`:
- `values.yaml`: Base settings with `image.tag` (updated automatically by GitOps chore PRs).
- `values-dev-eu-west1.yaml`: Dev environment parameters.
- `values-stage.yaml`: Staging parameters.
- `values-prod.yaml`: Production parameters with HPA and PDB enabled.

### 1. Helm Chart Linting & Manifest Rendering
```bash
# Lint Helm chart
./cohort-tools.sh helm:lint

# Render Kubernetes manifests
./cohort-tools.sh helm:template:dev
./cohort-tools.sh helm:template:prod
```

### 2. Local Kubernetes Testing (Minikube)
```bash
# Build image directly into Minikube daemon
./scripts/minikube.sh build-images configuration-hub

# Deploy to local cluster
./scripts/minikube.sh deploy dev
```

---

## 🚀 CI/CD & Automated Release Workflows

The package includes dedicated pipelines under `hubs/configuration-hub/.github/`:
1. **`workflows/releaseApplication.yaml`**:
   - Builds `hubs/configuration-hub/Dockerfile`.
   - Pushes image to `ghcr.io/${{ github.repository_owner }}/configuration-hub` (without JFrog).
   - Tags image with commit SHA, `:latest`, and semantic version.
2. **`workflows/deployApplication.yaml`**:
   - Deploys `hubs/configuration-hub/helm` chart across environments (`override_envs`) and regions (`override_regions`).
3. **Renovate & Release-Please Chore PRs**:
   - Creates chore PRs titled `chore(configuration-hub): release`.
   - Automatically bumps `image.tag` in `hubs/configuration-hub/helm/values.yaml` and version in `Chart.yaml`.
