import { spawn, execSync, ChildProcess } from 'child_process'
import net from 'net'
import path from 'path'

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

async function checkPort(port: number, host = '127.0.0.1', timeoutMs = 2000): Promise<boolean> {
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
  log('System', YELLOW, 'Shutting down dev environment...')
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

async function main() {
  console.log(`\n${CYAN}${BOLD}╔════════════════════════════════════════════════════╗${RESET}`)
  console.log(`${CYAN}${BOLD}║        COHORT MONOREPO FULL-STACK RUNNER           ║${RESET}`)
  console.log(`${CYAN}${BOLD}║     apps/web (BFF) + Domain Hub (GraphQL/gRPC)     ║${RESET}`)
  console.log(`${CYAN}${BOLD}╚════════════════════════════════════════════════════╝${RESET}\n`)

  const rootDir = process.cwd()

  // 1. Start Docker Containers
  log('Docker', BLUE, 'Starting containers (Postgres, Temporal, Temporal UI)...')
  try {
    execSync('docker compose up -d', { stdio: 'inherit' })
    log('Docker', GREEN, 'Containers active.')
  } catch (err: any) {
    log('Docker', RED, `Failed to run docker compose up: ${err.message}`)
    process.exit(1)
  }

  // 2. Wait for Postgres (port 5433)
  log('Postgres', BLUE, 'Waiting for PostgreSQL on port 5433...')
  const pgReady = await waitForPort(5433, 20)
  if (pgReady) {
    log('Postgres', GREEN, 'PostgreSQL is ready on port 5433.')
  } else {
    log('Postgres', YELLOW, 'PostgreSQL port check timed out, proceeding anyway...')
  }

  // 3. Database Schema Push & Seed
  log('Prisma', BLUE, 'Synchronizing Prisma schema & database...')
  try {
    execSync('pnpm --filter @cohort/domain-hub db:push', { stdio: 'pipe' })
    execSync('pnpm --filter @cohort/domain-hub seed', { stdio: 'pipe' })
    log('Prisma', GREEN, 'Database schema synchronized and seeded.')
  } catch (err: any) {
    log('Prisma', YELLOW, `Database initialization warning: ${err.message}`)
  }

  // 4. Sync Route Tree
  log('Routes', BLUE, 'Generating type-safe routes (pnpm --filter @cohort/web generate-routes)...')
  try {
    execSync('pnpm --filter @cohort/web generate-routes', { stdio: 'pipe' })
    log('Routes', GREEN, 'Routes synchronized.')
  } catch (err: any) {
    log('Routes', YELLOW, `Route generation warning: ${err.message}`)
  }

  // 5. Launch Express + GraphQL Domain Hub
  log('Express', BLUE, 'Launching Express + GraphQL Domain Hub on port 8000...')
  const domainProc = spawn('pnpm', ['--filter', '@cohort/domain-hub', 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: rootDir,
  })
  processes.push(domainProc)

  log('Express', BLUE, 'Waiting for GraphQL server on port 8000...')
  await waitForPort(8000, 15)
  log('Express', GREEN, 'Express Domain Hub is online (GraphQL :8000).')

  console.log(`\n${GREEN}${BOLD}======================================================${RESET}`)
  console.log(`🚀 ${BOLD}Cohort Web App (BFF):${RESET}      ${CYAN}http://localhost:3000${RESET}`)
  console.log(`⚡ ${BOLD}GraphQL Endpoint:${RESET}          ${GREEN}http://localhost:8000/graphql${RESET}`)
  console.log(`🩺 ${BOLD}Domain Hub Health:${RESET}         ${GREEN}http://localhost:8000/health${RESET}`)
  console.log(`⏱️ ${BOLD}Temporal Web UI:${RESET}           ${MAGENTA}http://localhost:8088${RESET}`)
  console.log(`🐘 ${BOLD}PostgreSQL DB:${RESET}             ${BLUE}localhost:5433 (db: temporal)${RESET}`)
  console.log(`${GREEN}${BOLD}======================================================${RESET}\n`)

  // 6. Launch Web App (BFF)
  log('Web', CYAN, 'Launching Vite + TanStack Start web frontend on port 3000...')
  const webProc = spawn('pnpm', ['--filter', '@cohort/web', 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: rootDir,
  })
  processes.push(webProc)

  webProc.on('close', (code) => {
    log('Web', YELLOW, `Web process exited with code ${code}`)
    cleanup()
  })
}

main().catch((err) => {
  log('Fatal', RED, err.message)
  cleanup()
})
