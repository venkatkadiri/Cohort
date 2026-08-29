import { spawn, execSync, ChildProcess } from 'child_process'
import net from 'net'

const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'
const GREEN = '\x1b[32m'
const BLUE = '\x1b[34m'
const CYAN = '\x1b[36m'
const YELLOW = '\x1b[33m'
const MAGENTA = '\x1b[35m'
const RED = '\x1b[31m'

function log(tag: string, color: string, msg: string) {
  console.log(`${color}${BOLD}[${tag}]${RESET} ${msg}`)
}

async function checkPort(port: number, host = '127.0.0.1', timeoutMs = 1000): Promise<boolean> {
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
  console.log(`\n${YELLOW}${BOLD}Shutting down all backend hubs...${RESET}`)
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
  console.log(`${CYAN}${BOLD}║             COHORT PLATFORM HUBS RUNNER (BACKEND ONLY)            ║${RESET}`)
  console.log(`${CYAN}${BOLD}║       Domain Hub + 6 Spoke Hubs (HTTP + gRPC / Protobuf)          ║${RESET}`)
  console.log(`${CYAN}${BOLD}╚═══════════════════════════════════════════════════════════════════╝${RESET}\n`)

  const rootDir = process.cwd()

  // 1. Start Docker Core
  log('Docker', BLUE, 'Starting core containers (Postgres 5433, Temporal 7233)...')
  try {
    execSync('docker compose up -d', { stdio: 'pipe' })
  } catch (err: any) {
    log('Docker', YELLOW, `Docker note: ${err.message}`)
  }

  // 2. Database Sync
  log('Prisma', BLUE, 'Synchronizing DB schemas and seeding...')
  try {
    execSync('pnpm --filter @cohort/domain-hub db:push', { stdio: 'pipe' })
    execSync('pnpm --filter @cohort/domain-hub seed', { stdio: 'pipe' })
  } catch (err: any) {
    log('Prisma', YELLOW, `DB note: ${err.message}`)
  }

  // 3. Spawn All Hubs
  log('System', BLUE, 'Launching Domain Hub and 6 Spoke Hubs...\n')

  spawnHub('DOMAIN-HUB', '@cohort/domain-hub', rootDir, GREEN)
  spawnHub('BOOKING-HUB', '@cohort/booking-hub', rootDir, BLUE)
  spawnHub('NOTIF-HUB', '@cohort/notification-hub', rootDir, MAGENTA)
  spawnHub('SEARCH-HUB', '@cohort/search-hub', rootDir, CYAN)
  spawnHub('AUTH-HUB', '@cohort/auth-hub', rootDir, YELLOW)
  spawnHub('VIDEO-HUB', '@cohort/video-hub', rootDir, RED)
  spawnHub('CONFIG-HUB', '@cohort/configuration-hub', rootDir, YELLOW)

  await Promise.all([
    waitForPort(8000, 20),
    waitForPort(8004, 20),
    waitForPort(8001, 20),
    waitForPort(8002, 20),
    waitForPort(8003, 20),
    waitForPort(8005, 20),
    waitForPort(8006, 20),
    waitForPort(50051, 20),
    waitForPort(50052, 20),
    waitForPort(50053, 20),
    waitForPort(50054, 20),
    waitForPort(50055, 20),
    waitForPort(50056, 20),
  ])

  console.log(`\n${GREEN}${BOLD}════════════════════════════════════════════════════════════════════════════${RESET}`)
  console.log(`🌐 ${BOLD}Domain Hub:${RESET}              ${GREEN}http://localhost:8000/graphql${RESET}`)
  console.log(`📅 ${BOLD}Booking Hub (Spoke 1):${RESET}   ${BLUE}HTTP :8004${RESET} │ ${MAGENTA}gRPC :50051${RESET}`)
  console.log(`🔔 ${BOLD}Notif Hub (Spoke 2):${RESET}     ${MAGENTA}HTTP :8001${RESET} │ ${MAGENTA}gRPC :50052${RESET}`)
  console.log(`🔍 ${BOLD}Search Hub (Spoke 3):${RESET}    ${CYAN}HTTP :8002${RESET} │ ${MAGENTA}gRPC :50053${RESET}`)
  console.log(`🔐 ${BOLD}Auth Hub (Spoke 4):${RESET}      ${YELLOW}HTTP :8003${RESET} │ ${MAGENTA}gRPC :50054${RESET}`)
  console.log(`🎥 ${BOLD}Video Hub (Spoke 5):${RESET}     ${RED}HTTP :8005${RESET} │ ${MAGENTA}gRPC :50055${RESET}`)
  console.log(`⚙️ ${BOLD}Config Hub (Spoke 6):${RESET}    ${YELLOW}HTTP :8006${RESET} │ ${MAGENTA}gRPC :50056${RESET}`)
  console.log(`${GREEN}${BOLD}════════════════════════════════════════════════════════════════════════════${RESET}\n`)
}

main().catch(console.error)
