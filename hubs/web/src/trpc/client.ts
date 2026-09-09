import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '../server/trpc/appRouter'
import { generateCorrelationId } from '@cohort/observability'

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: typeof window !== 'undefined' ? '/api/trpc' : 'http://localhost:3000/api/trpc',
      headers: () => ({
        'X-Correlation-ID': generateCorrelationId(),
      }),
    }),
  ],
})

export type { AppRouter }
