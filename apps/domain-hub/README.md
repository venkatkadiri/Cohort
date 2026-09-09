# domain-hub

Central domain orchestration service coordinating business processes, scheduling workflows, and GraphQL federation.

---

## 📌 Service Specifications
- **Package Location**: `apps/domain-hub`
- **HTTP Port**: `:8000`
- **gRPC Port**: `:50051`
- **Health Check**: `http://localhost:8000/health`
- **Prometheus Metrics**: `http://localhost:8000/metrics`

---

## 💻 Local Development

### 1. Running Locally
```bash
# Start in development mode (with hot-reload)
pnpm --filter @cohort/domain-hub dev

# Typecheck TypeScript code
pnpm --filter @cohort/domain-hub typecheck

# Build production bundle
pnpm --filter @cohort/domain-hub build
```

### 2. Docker Containerization
A multi-stage, rootless production Dockerfile is maintained at `apps/domain-hub/Dockerfile`:
```bash
# Build Docker image
docker build -f apps/domain-hub/Dockerfile -t domain-hub:latest .

# Run container locally
docker run -p 8000:8000 domain-hub:latest
```

---

## 🌿 Git & Pull Request Best Practices

### 1. Branch Naming Standards
- Feature branches: `feature/domain-hub/<short-description>` (e.g. `feature/domain-hub/add-filter-options`)
- Bugfix branches: `fix/domain-hub/<short-description>` (e.g. `fix/domain-hub/handle-null-pointer`)
- Chore branches: `chore/domain-hub/<short-description>`

### 2. PR Title Conventions (Conventional Commits)
All PR titles are strictly verified by CI (`.github/workflows/_Validate.Lint.PR.yaml`). The title must follow:

```text
<type>(<scope>): <description>
```

- **Allowed Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`, `deps`
- **Scope**: Must match this package name: `(domain-hub)`
- **Examples**:
  - `feat(domain-hub): add webhook notification dispatcher`
  - `fix(domain-hub): correct database connection retry logic`
  - `refactor(domain-hub): migrate configuration parser to strict schema`

### 3. Local PR Title Validation
Verify your proposed PR title locally before submitting:
```bash
pnpm lint:pr "feat(domain-hub): support real-time updates"
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
pnpm --filter @cohort/domain-hub typecheck
# or verify across all monorepo packages:
pnpm typecheck
```

---

## ☁️ Azure Terraform Infrastructure Best Practices

The cloud infrastructure for this package is self-contained under `apps/domain-hub/terraform/`.

### 1. Version-Driven Infrastructure Evolution
- **Version Tracking**: The `service_version` variable in `terraform.tfvars` tracks the semantic release (e.g. `0.0.1`, `0.0.2`, `1.0.0`).
- **Feature Flags**: Flags like `storage_backend` (`filesystem` vs `blob_storage`) allow cloud resources to provision conditionally as the package matures .

### 2. Validating Terraform Configurations
```bash
# Validate Terraform syntax
./cohort-tools.sh tf domain-hub validate
# or validate across all packages:
./cohort-tools.sh tf:validate:all

# Run Terraform plan (dry-run)
./cohort-tools.sh tf domain-hub plan
```

### 3. Cloud Resource Standards
- Resources are scoped to `cohort-${var.environment}-rg`.
- Workload identity is bound via `azurerm_user_assigned_identity`.
- All resources inherit standard tags: `Project`, `Service`, `Version`, and `Environment`.

---

## ⚓ Helm 3 & Kubernetes Deployment

Package-level Helm charts are maintained at `apps/domain-hub/helm/`:
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
./scripts/minikube.sh build-images domain-hub

# Deploy to local cluster
./scripts/minikube.sh deploy dev
```

---

## 🚀 CI/CD & Automated Release Workflows

The package includes dedicated pipelines under `apps/domain-hub/.github/`:
1. **`workflows/releaseApplication.yaml`**:
   - Builds `apps/domain-hub/Dockerfile`.
   - Pushes image to `ghcr.io/${{ github.repository_owner }}/domain-hub` (without JFrog).
   - Tags image with commit SHA, `:latest`, and semantic version.
2. **`workflows/deployApplication.yaml`**:
   - Deploys `apps/domain-hub/helm` chart across environments (`override_envs`) and regions (`override_regions`).
3. **Renovate & Release-Please Chore PRs**:
   - Creates chore PRs titled `chore(domain-hub): release`.
   - Automatically bumps `image.tag` in `apps/domain-hub/helm/values.yaml` and version in `Chart.yaml`.
