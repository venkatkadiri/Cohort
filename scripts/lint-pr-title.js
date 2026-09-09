#!/usr/bin/env node

const allowedTypes = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
  'deps',
]

const title = process.argv[2]

if (!title) {
  console.log('Usage: pnpm lint:pr "<pull-request-title>"')
  console.log('Example: pnpm lint:pr "feat(booking): add stripe checkout"')
  process.exit(1)
}

// Regex matching: type(scope)?: description or type: description
const regex = new RegExp(`^(${allowedTypes.join('|')})(\\([\\w\\-\\.\\/]+\\))?:\\s+.+$`)

if (regex.test(title)) {
  console.log(`✅ Valid PR title: "${title}"`)
  process.exit(0)
} else {
  console.error(`❌ Invalid PR title: "${title}"`)
  console.error(`Format must follow: <type>(<scope>): <description> or <type>: <description>`)
  console.error(`Allowed types: ${allowedTypes.join(', ')}`)
  process.exit(1)
}
