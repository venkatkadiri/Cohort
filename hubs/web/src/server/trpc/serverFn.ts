import { createServerFn } from '@tanstack/react-start'
import { appRouter } from './appRouter'
import { createTRPCContext } from './context'

export const trpcProcedureServerFn = createServerFn({ method: 'POST' })
  .validator((data: { path: string; input: any; type: 'query' | 'mutation' }) => data)
  .handler(async ({ data }) => {
    const ctx = await createTRPCContext()
    const caller: any = appRouter.createCaller(ctx)

    const pathSegments = data.path.split('.')
    let procedureTarget = caller
    for (const segment of pathSegments) {
      if (!procedureTarget || !(segment in procedureTarget)) {
        throw new Error(`Invalid tRPC path: "${data.path}" - segment "${segment}" not found`)
      }
      procedureTarget = procedureTarget[segment]
    }

    if (typeof procedureTarget !== 'function') {
      throw new Error(`tRPC target for "${data.path}" is not an executable procedure`)
    }

    return procedureTarget(data.input)
  })
