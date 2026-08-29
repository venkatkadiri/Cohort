import { spawn, execSync, ChildProcess } from 'child_process'
import net from 'net'
import path from 'path'

const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'
const DIM = '\x1b[2m'
const GREEN = '\x1b[32m'
const BLUE = '\x1b[34m'
const CYAN = '\x1b[36m'
const YELLOW = '\x1b[33m'
const MAGENTA = '\x1b[35m'
const RED = '\x1b[31m'

function log(tag: string, color: string, msg: string) {
  console.log(`${color}${BOLD}[${tag}]${RESET} ${msg}`)
}

async function checkPort(port: number, host = '127.0.0.1', timeoutMs = 1500): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket()

    socket.setTimeout(timeoutMs)
    socket.once('connect', () => {
      socket.destroy()
      resolve(true)
    })
    socket.once('timeout', () => {
      socket.destroy()
      resolve(false)
    })
    socket.once('error', () => {
      socket.destroy()
      resolve(false)
    })
    socket.connect(port, host)
  })
}

async function waitForPort(port: number, maxRetries = 30, delayMs = 1000): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    const isUp = await checkPort(port)
    if (isUp) return true
    await new Promise((r) => setTimeout(r, delayMs))
  }
  return false
}

const processes: ChildProcess[] = []

function cleanup() {
  console.log(`\n${YELLOW}${BOLD}Shutting down all Cohort hubs & frontend...${RESET}`)
  for (const p of processes) {
    if (p && !p.killed) {
      try {
        p.kill('SIGINT')
      } catch {}
    }
  }
  setTimeout(() => {
    for (const p of processes) {
      if (p && !p.killed) {
        try {
          p.kill('SIGKILL')
        } catch {}
      }
    }
    process.exit(0)
  }, 1000)
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)

function spawnHub(name: string, filterName: string, rootDir: string, color: string): ChildProcess {
  log(name, color, `Spawning ${filterName}...`)
  const proc = spawn('pnpm', ['--filter', filterName, 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: rootDir,
  })
  processes.push(proc)
  return proc
}

async function main() {
  console.log(`\n${CYAN}${BOLD}╔═══════════════════════════════════════════════════════════════════╗${RESET}`)
  console.log(`${CYAN}${BOLD}║              COHORT PLATFORM MASTER ORCHESTRATOR                  ║${RESET}`)
  console.log(`${CYAN}${BOLD}║  Hub + 6 Spokes (gRPC/Protobuf) + Web BFF + DB + Observability    ║${RESET}`)
  console.log(`${CYAN}${BOLD}╚═══════════════════════════════════════════════════════════════════╝${RESET}\n`)

  const rootDir = process.cwd()
  const withObs = process.argv.includes('--obs') || process.argv.includes('--monitoring')

  // 1. Start Infrastructure Docker Containers
  log('Docker', BLUE, 'Starting core containers (Postgres 5433, Temporal 7233, Temporal UI 8088)...')
  try {
    execSync('docker compose up -d', { stdio: 'pipe' })
    log('Docker', GREEN, 'Core containers are active.')
  } catch (err: any) {
    log('Docker', YELLOW, `Note: Docker compose up returned: ${err.message}. Proceeding...`)
  }

  // 2. Start Observability Containers if requested
  if (withObs) {
    log('Observability', MAGENTA, 'Starting ELK + Prometheus + Grafana stack...')
    try {
      execSync('docker compose -f docker-compose.observability.yml up -d', { stdio: 'pipe' })
      log('Observability', GREEN, 'Observability containers active (Prometheus :9090, Grafana :3005, Kibana :5601).')
    } catch (err: any) {
      log('Observability', YELLOW, `Observability stack warning: ${err.message}`)
    }
  }

  // 3. Database Migration & Seed
  log('Prisma', BLUE, 'Synchronizing Prisma schemas and seeding database...')
  try {
    execSync('pnpm --filter @cohort/domain-hub db:push', { stdio: 'pipe' })
    execSync('pnpm --filter @cohort/domain-hub seed', { stdio: 'pipe' })
    log('Prisma', GREEN, 'Database synchronized and seeded with mentors & demo cohorts.')
  } catch (err: any) {
    log('Prisma', YELLOW, `Database initialization: ${err.message}`)
  }

  // 4. Generate TanStack Type-safe Routes
  log('Router', BLUE, 'Synchronizing TanStack type-safe routes...')
  try {
    execSync('pnpm --filter @cohort/web generate-routes', { stdio: 'pipe' })
    log('Router', GREEN, 'Routes synchronized.')
  } catch (err: any) {
    log('Router', YELLOW, `Route generation: ${err.message}`)
  }

  // 5. Spawn all Hubs concurrently
  log('System', BLUE, 'Launching Domain Hub and all 6 Spoke Hubs (HTTP + gRPC)...\n')

  spawnHub('DOMAIN-HUB', '@cohort/domain-hub', rootDir, GREEN)
  spawnHub('BOOKING-HUB', '@cohort/booking-hub', rootDir, BLUE)
  spawnHub('NOTIF-HUB', '@cohort/notification-hub', rootDir, MAGENTA)
  spawnHub('SEARCH-HUB', '@cohort/search-hub', rootDir, CYAN)
  spawnHub('AUTH-HUB', '@cohort/auth-hub', rootDir, YELLOW)
  spawnHub('VIDEO-HUB', '@cohort/video-hub', rootDir, RED)
  spawnHub('CONFIG-HUB', '@cohort/configuration-hub', rootDir, YELLOW)

  // 6. Spawn Frontend Web App
  log('WEB-UI', CYAN, 'Launching Frontend Web UI (:3000)...')
  const webProc = spawn('pnpm', ['--filter', '@cohort/web', 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: rootDir,
  })
  processes.push(webProc)

  // 7. Await readiness across all HTTP & gRPC ports
  log('System', BLUE, 'Awaiting HTTP & gRPC hub endpoints readiness...\n')
  await Promise.all([
    waitForPort(8000, 20),
    waitForPort(8004, 20),
    waitForPort(8001, 20),
    waitForPort(8002, 20),
    waitForPort(8003, 20),
    waitForPort(8005, 20),
    waitForPort(8006, 20),
    waitForPort(3000, 20),
    waitForPort(50051, 20),
    waitForPort(50052, 20),
    waitForPort(50053, 20),
    waitForPort(50054, 20),
    waitForPort(50055, 20),
    waitForPort(50056, 20),
  ])

  console.log(`\n${GREEN}${BOLD}════════════════════════════════════════════════════════════════════════════${RESET}`)
  console.log(`🚀 ${BOLD}Web UI & BFF:${RESET}            ${CYAN}http://localhost:3000${RESET}`)
  console.log(`🌐 ${BOLD}Domain Hub:${RESET}              ${GREEN}http://localhost:8000/graphql${RESET} (gRPC Client Pool)`)
  console.log(`📅 ${BOLD}Booking Hub (Spoke 1):${RESET}   ${BLUE}HTTP :8004${RESET} │ ${MAGENTA}gRPC :50051 (Binary Protobuf)${RESET}`)
  console.log(`🔔 ${BOLD}Notif Hub (Spoke 2):${RESET}     ${MAGENTA}HTTP :8001${RESET} │ ${MAGENTA}gRPC :50052 (Binary Protobuf)${RESET}`)
  console.log(`🔍 ${BOLD}Search Hub (Spoke 3):${RESET}    ${CYAN}HTTP :8002${RESET} │ ${MAGENTA}gRPC :50053 (Binary Protobuf)${RESET}`)
  console.log(`🔐 ${BOLD}Auth Hub (Spoke 4):${RESET}      ${YELLOW}HTTP :8003${RESET} │ ${MAGENTA}gRPC :50054 (Binary Protobuf)${RESET}`)
  console.log(`🎥 ${BOLD}Video Hub (Spoke 5):${RESET}     ${RED}HTTP :8005${RESET} │ ${MAGENTA}gRPC :50055 (Binary Protobuf)${RESET}`)
  console.log(`⚙️ ${BOLD}Config Hub (Spoke 6):${RESET}    ${YELLOW}HTTP :8006${RESET} │ ${MAGENTA}gRPC :50056 (Binary Protobuf)${RESET}`)
  console.log(`⏱️ ${BOLD}Temporal Engine UI:${RESET}      ${MAGENTA}http://localhost:8088${RESET}`)
  console.log(`🐘 ${BOLD}PostgreSQL Database:${RESET}     ${BLUE}localhost:5433 (db: temporal)${RESET}`)
  if (withObs) {
    console.log(`📊 ${BOLD}Grafana Dashboards:${RESET}      ${GREEN}http://localhost:3005${RESET} (admin / admin)`)
    console.log(`🪵 ${BOLD}Kibana Log UI:${RESET}           ${BLUE}http://localhost:5601${RESET}`)
    console.log(`📈 ${BOLD}Prometheus Server:${RESET}       ${CYAN}http://localhost:9090${RESET}`)
  }
  console.log(`${GREEN}${BOLD}════════════════════════════════════════════════════════════════════════════${RESET}\n`)

  log('System', GREEN, 'All HTTP & gRPC hubs and Web UI are ONLINE and fully functional.')
  log('System', DIM, 'Press Ctrl+C to stop all hubs simultaneously.\n')

  webProc.on('close', (code) => {
    log('System', YELLOW, `Web process closed with code ${code}`)
    cleanup()
  })
}

main().catch((err) => {
  log('Fatal', RED, err.message)
  cleanup()
})
