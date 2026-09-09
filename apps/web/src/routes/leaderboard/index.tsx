import { createFileRoute } from '@tanstack/react-router'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'

import { CreditProgressBar } from '../../components/CreditProgressBar'
import { LeaderboardWidget } from '../../components/LeaderboardWidget'
import { BadgesShowcase } from '../../components/BadgesShowcase'

export const Route = createFileRoute('/leaderboard/')({
  component: LeaderboardPage,
})

function LeaderboardPage() {
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, sm: 5 } }}>
      <Stack spacing={4}>
        {/* Boot.dev Style Global Leaderboards & Live Learning Stream */}
        <LeaderboardWidget />

        {/* Student Credit Progress & Level Progression */}
        <CreditProgressBar />

        {/* Badges Showcase Matrix */}
        <BadgesShowcase />
      </Stack>
    </Container>
  )
}
