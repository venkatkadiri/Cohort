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
const targetDir = resolve(process.cwd(), 'apps', safeName)

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
COPY packages ./packages
COPY apps/${safeName} ./apps/${safeName}

RUN pnpm --filter @cohort/${safeName}... install --frozen-lockfile
RUN pnpm --filter @cohort/${safeName} build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=${customPort}

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/apps/${safeName}/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/apps/${safeName}/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/${safeName}/node_modules ./apps/${safeName}/node_modules

USER nodejs

EXPOSE ${customPort}
CMD ["node", "dist/index.js"]
`
writeFileSync(resolve(targetDir, 'Dockerfile'), dockerfile)

// 4. Create Dedicated Helm 3 Chart directly inside the package (apps/<name>/helm)
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
    repository: "file://../../apps/${safeName}/helm"
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

console.log(`\n=============================================================`)
console.log(`Scaffolded new microservice at: ${targetDir}`)
console.log(`Created dedicated Dockerfile at: ${resolve(targetDir, 'Dockerfile')}`)
console.log(`Created Helm 3 chart at: ${chartDir}`)
console.log(`Next steps:`)
console.log(`  1. pnpm install`)
console.log(`  2. pnpm --dir apps/${safeName} dev`)
console.log(`=============================================================\n`)
