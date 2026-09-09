import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { resolve } from 'node:path'

const args = process.argv.slice(2)
const serviceName = args[0]

if (!serviceName) {
  console.error('Usage: pnpm scaffold:service <service-name> [port]')
  process.exit(1)
}

const customPort = args[1] ? Number(args[1]) : 8000
const safeName = serviceName
  .trim()
  .replace(/[^a-z0-9-]+/g, '-')
  .toLowerCase()
const packageName = `@cohort/${safeName}`
const targetDir = resolve(process.cwd(), 'hubs', safeName)

if (existsSync(targetDir)) {
  console.error(`Service already exists at ${targetDir}`)
  process.exit(1)
}

// 1. Create Application Directories
mkdirSync(resolve(targetDir, 'src', 'config'), { recursive: true })
mkdirSync(resolve(targetDir, 'src', 'services'), { recursive: true })
mkdirSync(resolve(targetDir, 'src', 'repositories'), { recursive: true })
mkdirSync(resolve(targetDir, 'src', 'utils'), { recursive: true })

// 2. Write package.json and tsconfig.json
const packageJson = `{
  "name": "${packageName}",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@cohort/observability": "workspace:*",
    "@temporalio/client": "^1.11.0",
    "cors": "^2.8.5",
    "dotenv": "^17.4.2",
    "express": "^4.21.2",
    "prom-client": "^15.1.3"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^22.10.2",
    "tsx": "^4.23.12",
    "typescript": "^6.0.2"
  }
}
`

const tsconfig = `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts"]
}
`

const configFile = `export const config = {
  port: Number(process.env.PORT || ${customPort}),
  nodeEnv: process.env.NODE_ENV || 'development',
  serviceName: '${safeName}',
  temporalAddress: process.env.TEMPORAL_ADDRESS || 'temporal:7233',
  logLevel: process.env.LOG_LEVEL || 'info',
}
`

const loggerFile = `import { createLogger } from '@cohort/observability'

export const logger = createLogger('${safeName}')
`

const metricsFile = `import client from 'prom-client'

export const register = client.register
client.collectDefaultMetrics({ register })

export const serviceRequestsTotal = new client.Counter({
  name: '${safeName.replace(/-/g, '_')}_requests_total',
  help: 'Total requests handled by the service',
  labelNames: ['route', 'method', 'status'],
})
`

const healthFile = `export function healthCheck() {
  return {
    status: 'ok',
    service: '${safeName}',
    timestamp: new Date().toISOString(),
  }
}
`

const appFile = `import express from 'express'
import cors from 'cors'
import { config } from './config/index.js'
import { logger } from './logger.js'
import { healthCheck } from './health.js'
import { register, serviceRequestsTotal } from './metrics.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.json(healthCheck())
  })

  app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', register.contentType)
    res.end(await register.metrics())
  })

  app.get('/api/health', (_req, res) => {
    serviceRequestsTotal.inc({ route: '/api/health', method: 'GET', status: '200' })
    res.json({ service: '${safeName}', ok: true })
  })

  return app
}
`

const indexFile = `import { config } from './config/index.js'
import { logger } from './logger.js'
import { createApp } from './app.js'

const app = createApp()

app.listen(config.port, () => {
  logger.info('service started', { port: config.port, service: config.serviceName })
})
`

writeFileSync(resolve(targetDir, 'package.json'), packageJson)
writeFileSync(resolve(targetDir, 'tsconfig.json'), tsconfig)
writeFileSync(resolve(targetDir, 'src', 'config', 'index.ts'), configFile)
writeFileSync(resolve(targetDir, 'src', 'logger.ts'), loggerFile)
writeFileSync(resolve(targetDir, 'src', 'metrics.ts'), metricsFile)
writeFileSync(resolve(targetDir, 'src', 'health.ts'), healthFile)
writeFileSync(resolve(targetDir, 'src', 'app.ts'), appFile)
writeFileSync(resolve(targetDir, 'src', 'index.ts'), indexFile)

// 3. Write Dedicated Production Dockerfile
const dockerfile = `# ==============================================================================
# ${safeName} Microservice Dockerfile
# ==============================================================================

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.5.0 --activate
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY observability ./observability
COPY hubs/${safeName} ./hubs/${safeName}

RUN pnpm --filter @cohort/${safeName}... install --frozen-lockfile
RUN pnpm --filter @cohort/${safeName} build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=${customPort}

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/hubs/${safeName}/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/hubs/${safeName}/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/hubs/${safeName}/node_modules ./hubs/${safeName}/node_modules

USER nodejs

EXPOSE ${customPort}
CMD ["node", "dist/index.js"]
`
writeFileSync(resolve(targetDir, 'Dockerfile'), dockerfile)

// 4. Create Dedicated Helm 3 Chart directly inside the package (hubs/<name>/helm)
const chartDir = resolve(targetDir, 'helm')
const templatesDir = resolve(chartDir, 'templates')
mkdirSync(templatesDir, { recursive: true })

// 4a. Chart.yaml
const chartYaml = `apiVersion: v2
name: ${safeName}
description: ${safeName} Microservice Helm Chart for Cohort Platform
type: application
version: 1.0.0
appVersion: "1.0.0"
`
writeFileSync(resolve(chartDir, 'Chart.yaml'), chartYaml)

// 4b. _helpers.tpl
const helpersTpl = `{{/*
Expand the name of the chart.
*/}}
{{- define "${safeName}.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "${safeName}.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "${safeName}.labels" -}}
helm.sh/chart: {{ include "${safeName}.name" . }}-{{ .Chart.Version | replace "+" "_" }}
{{ include "${safeName}.selectorLabels" . }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "${safeName}.selectorLabels" -}}
app.kubernetes.io/name: {{ include "${safeName}.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app: ${safeName}
{{- end }}
`
writeFileSync(resolve(templatesDir, '_helpers.tpl'), helpersTpl)

// 4c. configmap.yaml
const configMapYaml = `apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ include "${safeName}.fullname" . }}-config
  labels:
    {{- include "${safeName}.labels" . | nindent 4 }}
data:
  PORT: {{ .Values.service.port | quote }}
  NODE_ENV: {{ .Values.env.NODE_ENV | default "production" | quote }}
  TEMPORAL_ADDRESS: {{ .Values.env.TEMPORAL_ADDRESS | default "temporal:7233" | quote }}
`
writeFileSync(resolve(templatesDir, 'configmap.yaml'), configMapYaml)

// 4d. service.yaml
const serviceYaml = `apiVersion: v1
kind: Service
metadata:
  name: {{ include "${safeName}.fullname" . }}
  labels:
    {{- include "${safeName}.labels" . | nindent 4 }}
spec:
  type: {{ .Values.service.type }}
  ports:
    - port: {{ .Values.service.port }}
      targetPort: ${customPort}
      name: http
      protocol: TCP
  selector:
    {{- include "${safeName}.selectorLabels" . | nindent 4 }}
`
writeFileSync(resolve(templatesDir, 'service.yaml'), serviceYaml)

// 4e. deployment.yaml
const deploymentYaml = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "${safeName}.fullname" . }}
  labels:
    {{- include "${safeName}.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "${safeName}.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "${safeName}.selectorLabels" . | nindent 8 }}
    spec:
      containers:
        - name: ${safeName}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - containerPort: ${customPort}
              name: http
          envFrom:
            - configMapRef:
                name: {{ include "${safeName}.fullname" . }}-config
          readinessProbe:
            httpGet:
              path: {{ .Values.probes.readinessPath }}
              port: ${customPort}
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: {{ .Values.probes.livenessPath }}
              port: ${customPort}
            initialDelaySeconds: 15
            periodSeconds: 20
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
`
writeFileSync(resolve(templatesDir, 'deployment.yaml'), deploymentYaml)

// 4f. hpa.yaml
const hpaYaml = `{{- if .Values.autoscaling.enabled }}
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ include "${safeName}.fullname" . }}
  labels:
    {{- include "${safeName}.labels" . | nindent 4 }}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ include "${safeName}.fullname" . }}
  minReplicas: {{ .Values.autoscaling.minReplicas }}
  maxReplicas: {{ .Values.autoscaling.maxReplicas }}
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: {{ .Values.autoscaling.targetCPUUtilizationPercentage }}
{{- end }}
`
writeFileSync(resolve(templatesDir, 'hpa.yaml'), hpaYaml)

// 4g. pdb.yaml
const pdbYaml = `{{- if .Values.podDisruptionBudget.enabled }}
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: {{ include "${safeName}.fullname" . }}
  labels:
    {{- include "${safeName}.labels" . | nindent 4 }}
spec:
  minAvailable: {{ .Values.podDisruptionBudget.minAvailable }}
  selector:
    matchLabels:
      {{- include "${safeName}.selectorLabels" . | nindent 6 }}
{{- end }}
`
writeFileSync(resolve(templatesDir, 'pdb.yaml'), pdbYaml)

// 4h. Values files
const baseValuesYaml = `replicaCount: 1

image:
  repository: cohort/${safeName}
  tag: "0.1.0" # Target for CI/CD automated chore PRs
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: ${customPort}

probes:
  readinessPath: /health
  livenessPath: /health

env:
  NODE_ENV: production
  TEMPORAL_ADDRESS: temporal:7233

resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 256Mi

autoscaling:
  enabled: false
  minReplicas: 1
  maxReplicas: 5
  targetCPUUtilizationPercentage: 80

podDisruptionBudget:
  enabled: false
  minAvailable: 1
`
writeFileSync(resolve(chartDir, 'values.yaml'), baseValuesYaml)

const devValuesYaml = `# Environment: dev-eu-west1 (Ireland)
replicaCount: 1

resources:
  requests:
    cpu: 50m
    memory: 64Mi
  limits:
    cpu: 250m
    memory: 128Mi

autoscaling:
  enabled: false

podDisruptionBudget:
  enabled: false
`
writeFileSync(resolve(chartDir, 'values-dev-eu-west1.yaml'), devValuesYaml)

const stageValuesYaml = `# Environment: staging
replicaCount: 2

resources:
  requests:
    cpu: 150m
    memory: 256Mi
  limits:
    cpu: 500m
    memory: 512Mi

autoscaling:
  enabled: false

podDisruptionBudget:
  enabled: true
  minAvailable: 1
`
writeFileSync(resolve(chartDir, 'values-stage.yaml'), stageValuesYaml)

const prodValuesYaml = `# Environment: production (High-Availability & Auto-scaling)
replicaCount: 3

resources:
  requests:
    cpu: 250m
    memory: 512Mi
  limits:
    cpu: 1000m
    memory: 1Gi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 75

podDisruptionBudget:
  enabled: true
  minAvailable: 2
`
writeFileSync(resolve(chartDir, 'values-prod.yaml'), prodValuesYaml)

// 5. Update Umbrella Chart Dependencies (helm/cohort-platform/Chart.yaml)
const umbrellaChartPath = resolve(process.cwd(), 'helm', 'cohort-platform', 'Chart.yaml')
if (existsSync(umbrellaChartPath)) {
  let content = readFileSync(umbrellaChartPath, 'utf-8')
  if (!content.includes(`name: ${safeName}`)) {
    content += `  - name: ${safeName}
    version: 1.0.0
    repository: "file://../../hubs/${safeName}/helm"
`
    writeFileSync(umbrellaChartPath, content)
    console.log(`Registered ${safeName} in helm/cohort-platform/Chart.yaml dependencies`)
  }
}

// 6. Update Umbrella Chart Values (helm/cohort-platform/values.yaml)
const umbrellaValuesPath = resolve(process.cwd(), 'helm', 'cohort-platform', 'values.yaml')
if (existsSync(umbrellaValuesPath)) {
  let valuesContent = readFileSync(umbrellaValuesPath, 'utf-8')
  if (!valuesContent.includes(`${safeName}:`)) {
    valuesContent += `\n${safeName}:\n  enabled: true\n`
    writeFileSync(umbrellaValuesPath, valuesContent)
    console.log(`Registered ${safeName} in helm/cohort-platform/values.yaml`)
  }
}

// 7. Auto-refresh Helm Umbrella Dependencies
try {
  execSync('helm dependency update helm/cohort-platform', { stdio: 'pipe' })
  console.log(`Updated Helm dependency cache in helm/cohort-platform`)
} catch {}

// 8. Generate Package-Owned Azure Terraform Infrastructure (hubs/<safeName>/terraform/)
const serviceTerraformDir = resolve(targetDir, 'terraform')
mkdirSync(serviceTerraformDir, { recursive: true })

const tfProviders = `terraform {
  required_version = ">= 1.5.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

provider "azurerm" {
  features {}
  resource_provider_registrations = "none"
}
`
writeFileSync(resolve(serviceTerraformDir, 'providers.tf'), tfProviders)

const tfVariables = `variable "service_name" {
  description = "Name of the service package"
  type        = string
  default     = "${safeName}"
}

variable "service_version" {
  description = "Semantic version of the service"
  type        = string
  default     = "0.1.0"
}

variable "environment" {
  description = "Deployment environment (dev, stage, prod)"
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Azure Region/Location"
  type        = string
  default     = "westeurope"
}

variable "resource_group_name" {
  description = "Target Azure Resource Group"
  type        = string
  default     = "cohort-dev-rg"
}

variable "storage_backend" {
  description = "Storage strategy for service assets: 'filesystem' or 'blob_storage'"
  type        = string
  default     = "filesystem"

  validation {
    condition     = contains(["filesystem", "blob_storage"], var.storage_backend)
    error_message = "storage_backend must be either 'filesystem' or 'blob_storage'."
  }
}
`
writeFileSync(resolve(serviceTerraformDir, 'variables.tf'), tfVariables)

const tfMain = `# 1. Managed User Assigned Identity for the service
resource "azurerm_user_assigned_identity" "identity" {
  name                = "cohort-\${var.environment}-\${var.service_name}-id"
  location            = var.location
  resource_group_name = var.resource_group_name

  tags = {
    Project     = "cohort"
    Service     = var.service_name
    Version     = var.service_version
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# 2. Azure Blob Storage (Conditionally provisioned based on service version / storage_backend)
locals {
  is_blob_storage      = var.storage_backend == "blob_storage"
  clean_name           = replace(var.service_name, "-", "")
  storage_account_name = substr("cohort\${var.environment}\${local.clean_name}st", 0, 24)
}

resource "azurerm_storage_account" "storage" {
  count                    = local.is_blob_storage ? 1 : 0
  name                     = local.storage_account_name
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = {
    Project        = "cohort"
    Service        = var.service_name
    Version        = var.service_version
    Environment    = var.environment
    StorageBackend = var.storage_backend
    ManagedBy      = "Terraform"
  }
}

resource "azurerm_storage_container" "assets" {
  count                 = local.is_blob_storage ? 1 : 0
  name                  = "assets"
  storage_account_name  = azurerm_storage_account.storage[0].name
  container_access_type = "private"
}
`
writeFileSync(resolve(serviceTerraformDir, 'main.tf'), tfMain)

const tfOutputs = `output "service_name" {
  description = "Name of the service"
  value       = var.service_name
}

output "service_version" {
  description = "Active version of the service"
  value       = var.service_version
}

output "storage_backend" {
  description = "Active storage strategy ('filesystem' or 'blob_storage')"
  value       = var.storage_backend
}

output "identity_id" {
  description = "Managed Identity Resource ID"
  value       = azurerm_user_assigned_identity.identity.id
}

output "identity_client_id" {
  description = "Managed Identity Client ID"
  value       = azurerm_user_assigned_identity.identity.client_id
}

output "storage_account_name" {
  description = "Azure Storage Account name (present when blob_storage is enabled)"
  value       = local.is_blob_storage ? azurerm_storage_account.storage[0].name : null
}

output "storage_container_name" {
  description = "Azure Blob Storage container name (present when blob_storage is enabled)"
  value       = local.is_blob_storage ? azurerm_storage_container.assets[0].name : null
}
`
writeFileSync(resolve(serviceTerraformDir, 'outputs.tf'), tfOutputs)

const tfVars = `# ==============================================================================
# ${safeName} Azure Terraform Configuration
# ==============================================================================
service_name        = "${safeName}"
service_version     = "0.1.0"
environment         = "dev"
location            = "westeurope"
resource_group_name = "cohort-dev-rg"
storage_backend     = "filesystem"
`
writeFileSync(resolve(serviceTerraformDir, 'terraform.tfvars'), tfVars)
console.log(`Created package Azure Terraform configuration at: ${serviceTerraformDir}`)

// 9. Generate Package-Owned GitHub CI/CD Workflows (hubs/<safeName>/.github/)
const pkgGithubWorkflowsDir = resolve(targetDir, '.github', 'workflows')
mkdirSync(pkgGithubWorkflowsDir, { recursive: true })

const pkgReleaseYaml = `name: ${safeName}.Release.Application

run-name: Build & Publish ${safeName} (\${{ inputs.image_tag || github.sha }})

on:
  workflow_dispatch:
    inputs:
      image_tag:
        description: 'Docker image tag (defaults to commit SHA)'
        required: false
        default: ''
      docker_repository:
        description: 'Target container registry (defaults to ghcr.io)'
        required: false
        default: ''
  push:
    branches:
      - main
    paths:
      - 'hubs/${safeName}/**'

defaults:
  run:
    shell: bash

jobs:
  build-and-publish:
    name: Docker.Build.Publish
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Resolve Image Name & Tag
        id: meta
        run: |
          REGISTRY="\${{ inputs.docker_repository || vars.DOCKER_REGISTRY || 'ghcr.io' }}"
          REPO_OWNER="$(echo "\${{ github.repository_owner }}" | tr '[:upper:]' '[:lower:]')"
          IMAGE_NAME="\${REGISTRY}/\${REPO_OWNER}/${safeName}"
          
          VERSION=""
          if [ -f "hubs/${safeName}/helm/values.yaml" ]; then
            VERSION=$(grep -E '^\\s*tag:' "hubs/${safeName}/helm/values.yaml" | awk '{print $2}' | tr -d '"' || true)
          fi
          
          TAG="\${{ inputs.image_tag }}"
          if [ -z "$TAG" ]; then
            TAG="\${VERSION:-\${GITHUB_SHA::8}}"
          fi
          
          echo "image_name=\${IMAGE_NAME}" >> $GITHUB_OUTPUT
          echo "tag=\${TAG}" >> $GITHUB_OUTPUT
          echo "version=\${VERSION}" >> $GITHUB_OUTPUT

      - name: Log in to Registry
        uses: docker/login-action@v3
        with:
          registry: \${{ inputs.docker_repository && '' || vars.DOCKER_REGISTRY || 'ghcr.io' }}
          username: \${{ secrets.DOCKER_USERNAME || github.actor }}
          password: \${{ secrets.DOCKER_PASSWORD || secrets.GITHUB_TOKEN }}

      - name: Build and Push Docker Image
        uses: docker/build-push-action@v6
        with:
          context: .
          file: hubs/${safeName}/Dockerfile
          push: \${{ github.event_name != 'pull_request' }}
          tags: |
            \${{ steps.meta.outputs.image_name }}:\${{ steps.meta.outputs.tag }}
            \${{ steps.meta.outputs.image_name }}:latest
            \${{ steps.meta.outputs.version != '' && format('{0}:{1}', steps.meta.outputs.image_name, steps.meta.outputs.version) || '' }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
`
writeFileSync(resolve(pkgGithubWorkflowsDir, 'releaseApplication.yaml'), pkgReleaseYaml)

const pkgDeployYaml = `name: ${safeName}.Deploy.Application

run-name: Deploy ${safeName} to \${{ inputs.override_envs || 'dev-eu-west1' }}

on:
  repository_dispatch:
    types:
      - ${safeName}-published
      - artifacts-published

  workflow_dispatch:
    inputs:
      override_envs:
        required: true
        default: '["dev-eu-west1"]'
        description: 'Target environments (JSON array, e.g. ["dev-eu-west1","stage","prod"])'
      override_regions:
        required: false
        default: '["eu-west-1"]'
        description: 'Target regions (JSON array)'
      override_target_revision:
        required: true
        default: main
        description: 'Git ref to deploy'

defaults:
  run:
    shell: bash

jobs:
  parse-matrix:
    name: Prepare Matrix
    runs-on: ubuntu-latest
    outputs:
      environments: \${{ steps.set-matrix.outputs.envs }}
    steps:
      - name: Parse Environments
        id: set-matrix
        run: |
          ENVS='\${{ inputs.override_envs }}'
          if [ -z "$ENVS" ] || [ "$ENVS" == "[]" ]; then
            ENVS='["dev-eu-west1"]'
          fi
          echo "envs=\${ENVS}" >> $GITHUB_OUTPUT

  deploy:
    name: Helm.Deploy
    needs: parse-matrix
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        env: \${{ fromJson(needs.parse-matrix.outputs.environments) }}
    steps:
      - name: Checkout Target Revision
        uses: actions/checkout@v4
        with:
          ref: \${{ inputs.override_target_revision || github.ref }}

      - name: Set up Helm 3
        uses: azure/setup-helm@v4
        with:
          version: v3.17.1

      - name: Set Environment Configuration
        id: env-config
        run: |
          ENV_NAME="\${{ matrix.env }}"
          case "$ENV_NAME" in
            dev|dev-eu-west1)
              echo "namespace=cohort-dev-eu-west1" >> $GITHUB_OUTPUT
              echo "values_file=hubs/${safeName}/helm/values-dev-eu-west1.yaml" >> $GITHUB_OUTPUT
              ;;
            stage)
              echo "namespace=cohort-stage" >> $GITHUB_OUTPUT
              echo "values_file=hubs/${safeName}/helm/values-stage.yaml" >> $GITHUB_OUTPUT
              ;;
            prod)
              echo "namespace=cohort-prod" >> $GITHUB_OUTPUT
              echo "values_file=hubs/${safeName}/helm/values-prod.yaml" >> $GITHUB_OUTPUT
              ;;
            *)
              echo "namespace=cohort-\${ENV_NAME}" >> $GITHUB_OUTPUT
              echo "values_file=hubs/${safeName}/helm/values-\${ENV_NAME}.yaml" >> $GITHUB_OUTPUT
              ;;
          esac

      - name: Deploy Package Helm Chart
        run: |
          NAMESPACE="\${{ steps.env-config.outputs.namespace }}"
          VALUES_FILE="\${{ steps.env-config.outputs.values_file }}"
          
          echo "🚀 Deploying ${safeName} to \${{ matrix.env }}..."
          helm upgrade --install ${safeName} "hubs/${safeName}/helm" \\
            -f "$VALUES_FILE" \\
            --namespace "$NAMESPACE" \\
            --create-namespace \\
            --dry-run
`
writeFileSync(resolve(pkgGithubWorkflowsDir, 'deployApplication.yaml'), pkgDeployYaml)

const pkgReleaseConfig = {
  'group-pull-request-title-pattern': 'chore${scope}: release',
  'release-type': 'simple',
  'include-component-in-tag': false,
  packages: {
    '.': {
      'package-name': safeName,
      component: safeName,
      'changelog-path': 'CHANGELOG.md',
      'extra-files': [
        {
          type: 'generic',
          path: 'helm/values.yaml',
        },
        {
          type: 'generic',
          path: 'helm/Chart.yaml',
        },
      ],
    },
  },
}
writeFileSync(
  resolve(targetDir, '.github', 'release-config.json'),
  JSON.stringify(pkgReleaseConfig, null, 2) + '\n',
)
console.log(`Created package GitHub CI/CD workflows at: ${pkgGithubWorkflowsDir}`)

// Update Root .release-please-config.json and .release-please-manifest.json
const rootReleaseConfigPath = resolve(process.cwd(), '.release-please-config.json')
if (existsSync(rootReleaseConfigPath)) {
  const rootConfig = JSON.parse(readFileSync(rootReleaseConfigPath, 'utf-8'))
  if (!rootConfig.packages[`hubs/${safeName}`]) {
    rootConfig.packages[`hubs/${safeName}`] = {
      'package-name': safeName,
      component: safeName,
      'changelog-path': 'CHANGELOG.md',
      'extra-files': [
        {
          type: 'generic',
          path: `hubs/${safeName}/helm/values.yaml`,
        },
        {
          type: 'generic',
          path: `hubs/${safeName}/helm/Chart.yaml`,
        },
      ],
    }
    writeFileSync(rootReleaseConfigPath, JSON.stringify(rootConfig, null, 2) + '\n')
    console.log(`Registered hubs/${safeName} in .release-please-config.json`)
  }
}

const rootReleaseManifestPath = resolve(process.cwd(), '.release-please-manifest.json')
if (existsSync(rootReleaseManifestPath)) {
  const rootManifest = JSON.parse(readFileSync(rootReleaseManifestPath, 'utf-8'))
  if (!rootManifest[`hubs/${safeName}`]) {
    rootManifest[`hubs/${safeName}`] = '0.1.0'
    writeFileSync(rootReleaseManifestPath, JSON.stringify(rootManifest, null, 2) + '\n')
    console.log(`Registered hubs/${safeName} in .release-please-manifest.json`)
  }
}

// 10. Generate Package README with Best Practices (hubs/<safeName>/README.md)
const readmeContent = `# ${safeName}

Microservice component of the Cohort platform responsible for ${safeName} operations.

---

## 📌 Service Specifications
- **Package Location**: \`hubs/${safeName}\`
- **HTTP Port**: \`:${customPort}\`
- **Health Check**: \`http://localhost:${customPort}/health\`
- **Prometheus Metrics**: \`http://localhost:${customPort}/metrics\`

---

## 💻 Local Development

### 1. Running Locally
\`\`\`bash
# Start in development mode
pnpm --filter @cohort/${safeName} dev

# Typecheck TypeScript code
pnpm --filter @cohort/${safeName} typecheck

# Build production bundle
pnpm --filter @cohort/${safeName} build
\`\`\`

### 2. Docker Containerization
\`\`\`bash
# Build Docker image
docker build -f hubs/${safeName}/Dockerfile -t ${safeName}:latest .

# Run container locally
docker run -p ${customPort}:${customPort} ${safeName}:latest
\`\`\`

---

## 🌿 Git & Pull Request Best Practices

### 1. Branch Naming Standards
- Feature branches: \`feature/${safeName}/<short-description>\`
- Bugfix branches: \`fix/${safeName}/<short-description>\`
- Chore branches: \`chore/${safeName}/<short-description>\`

### 2. PR Title Conventions (Conventional Commits)
All PR titles are strictly verified by CI (\`.github/workflows/_Validate.Lint.PR.yaml\`). The title must follow:

\`\`\`text
<type>(<scope>): <description>
\`\`\`

- **Allowed Types**: \`feat\`, \`fix\`, \`docs\`, \`style\`, \`refactor\`, \`perf\`, \`test\`, \`build\`, \`ci\`, \`chore\`, \`revert\`, \`deps\`
- **Scope**: Must match this package name: \`(${safeName})\`
- **Examples**:
  - \`feat(${safeName}): implement event consumer\`
  - \`fix(${safeName}): resolve configuration validation error\`
  - \`chore(${safeName}): update internal dependencies\`

### 3. Local PR Title Validation
Verify your PR title before opening a pull request:
\`\`\`bash
pnpm lint:pr "feat(${safeName}): add feature description"
\`\`\`

---

## 🔍 Code Quality, Formatting & Linting

### 1. Prettier Formatting
\`\`\`bash
# Check formatting
pnpm format

# Auto-format files
pnpm format:fix
\`\`\`

### 2. Unused Dependency Detection
\`\`\`bash
pnpm deps:check
\`\`\`

### 3. TypeScript Type Safety
\`\`\`bash
pnpm --filter @cohort/${safeName} typecheck
\`\`\`

---

## ☁️ Azure Terraform Infrastructure Best Practices

The cloud infrastructure for this package is self-contained under \`hubs/${safeName}/terraform/\`.

### 1. Version-Driven Infrastructure Evolution
- **Version Tracking**: The \`service_version\` variable in \`terraform.tfvars\` tracks the release version.
- **Feature Flags**: Flags like \`storage_backend\` (\`filesystem\` vs \`blob_storage\`) allow cloud resources to provision conditionally as the package matures.

### 2. Validating Terraform Configurations
\`\`\`bash
# Validate Terraform syntax
./cohort-tools.sh tf ${safeName} validate

# Run Terraform plan (dry-run)
./cohort-tools.sh tf ${safeName} plan
\`\`\`

---

## ⚓ Helm 3 & Kubernetes Deployment

Package-level Helm charts are maintained at \`hubs/${safeName}/helm/\`:
- \`values.yaml\`: Base settings with \`image.tag\` (updated automatically by GitOps chore PRs).
- \`values-dev-eu-west1.yaml\`: Dev environment parameters.
- \`values-stage.yaml\`: Staging parameters.
- \`values-prod.yaml\`: Production parameters with HPA and PDB enabled.

### 1. Helm Chart Linting & Manifest Rendering
\`\`\`bash
# Lint Helm chart
./cohort-tools.sh helm:lint

# Render Kubernetes manifests
./cohort-tools.sh helm:template:dev
./cohort-tools.sh helm:template:prod
\`\`\`

### 2. Local Kubernetes Testing (Minikube)
\`\`\`bash
# Build image directly into Minikube daemon
./scripts/minikube.sh build-images ${safeName}

# Deploy to local cluster
./scripts/minikube.sh deploy dev
\`\`\`

---

## 🚀 CI/CD & Automated Release Workflows

The package includes dedicated pipelines under \`hubs/${safeName}/.github/\`:
1. **\`workflows/releaseApplication.yaml\`**: Builds and pushes Docker images to container registry without JFrog.
2. **\`workflows/deployApplication.yaml\`**: Deploys the package's Helm chart across environments and regions.
3. **Renovate & Release-Please Chore PRs**: Opens chore PRs titled \`chore(${safeName}): release\` that bump the version and update Helm values.
`
writeFileSync(resolve(targetDir, 'README.md'), readmeContent)
console.log(`Created package best practices README at: ${resolve(targetDir, 'README.md')}`)

console.log(`\n=============================================================`)
console.log(`Scaffolded new microservice at: ${targetDir}`)
console.log(`Created dedicated Dockerfile at: ${resolve(targetDir, 'Dockerfile')}`)
console.log(`Created Helm 3 chart at: ${chartDir}`)
console.log(`Created Azure Terraform config at: ${serviceTerraformDir}`)
console.log(`Created GitHub CI/CD workflows at: ${pkgGithubWorkflowsDir}`)
console.log(`Created best practices README at: ${resolve(targetDir, 'README.md')}`)
console.log(`Next steps:`)
console.log(`  1. pnpm install`)
console.log(`  2. pnpm --dir hubs/${safeName} dev`)
console.log(`=============================================================\n`)
