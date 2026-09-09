import { appRouter } from './appRouter'
import { createTRPCContext } from './context'

export async function createTRPCCaller() {
  const ctx = await createTRPCContext()
  return appRouter.createCaller(ctx)
}
