import { createServerFn } from '@tanstack/react-start'
import { createUserSchema, updateUserSchema } from '../../dtos/user.dto'
import { graphqlApi } from '../graphql/client'

export const listUsers = createServerFn({ method: 'GET' }).handler(async () => {
  const users = await graphqlApi.listUsers()
  return (users || []).map((u) => ({
    ...u,
    _count: {
      eventTypes: u.count?.eventTypes ?? 0,
      bookings: u.count?.bookings ?? 0,
    },
  }))
})

export const getUserById = createServerFn({ method: 'GET' })
  .validator((id: number) => id)
  .handler(async ({ data: id }) => {
    return graphqlApi.getUserById(id)
  })

export const createUserFn = createServerFn({ method: 'POST' })
  .validator(createUserSchema)
  .handler(async ({ data }) => {
    return graphqlApi.createUser(data)
  })

export const updateUserFn = createServerFn({ method: 'POST' })
  .validator((data: { id: number; patch: unknown }) => data)
  .handler(async ({ data }) => {
    const patch = updateUserSchema.parse(data.patch)
    return graphqlApi.updateUser({ id: data.id, ...patch })
  })

export const deleteUserFn = createServerFn({ method: 'POST' })
  .validator((id: number) => id)
  .handler(async ({ data: id }) => {
    return graphqlApi.deleteUser(id)
  })