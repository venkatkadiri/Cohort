import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/credits/')({
  component: () => <Navigate to="/credits/buy" />,
})
