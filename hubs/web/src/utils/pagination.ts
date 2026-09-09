export interface PageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor: string | null
  endCursor: string | null
  totalCount: number
}

export interface CursorPaginatedResult<T> {
  items: T[]
  pageInfo: PageInfo
}

export function encodeCursor(payload: { id: number | string; createdAt?: string }): string {
  const json = JSON.stringify(payload)
  if (typeof window !== 'undefined') {
    return btoa(unescape(encodeURIComponent(json)))
  }
  return Buffer.from(json, 'utf-8').toString('base64')
}

export function decodeCursor(cursor?: string | null): { id: number | string; createdAt?: string } | null {
  if (!cursor) return null
  try {
    let json: string
    if (typeof window !== 'undefined') {
      json = decodeURIComponent(escape(atob(cursor)))
    } else {
      json = Buffer.from(cursor, 'base64').toString('utf-8')
    }
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function paginateWithCursor<T extends { id: number | string; createdAt?: string }>(
  items: T[],
  limit: number = 20,
  cursor?: string | null,
  totalCount?: number
): CursorPaginatedResult<T> {
  const decoded = decodeCursor(cursor)
  let startIndex = 0

  if (decoded) {
    const foundIndex = items.findIndex((item) => String(item.id) === String(decoded.id))
    if (foundIndex !== -1) {
      startIndex = foundIndex + 1
    }
  }

  const sliced = items.slice(startIndex, startIndex + limit)
  const hasNextPage = startIndex + limit < items.length
  const hasPreviousPage = startIndex > 0

  const startCursor =
    sliced.length > 0 ? encodeCursor({ id: sliced[0].id, createdAt: sliced[0].createdAt }) : null
  const endCursor =
    sliced.length > 0
      ? encodeCursor({
          id: sliced[sliced.length - 1].id,
          createdAt: sliced[sliced.length - 1].createdAt,
        })
      : null

  return {
    items: sliced,
    pageInfo: {
      hasNextPage,
      hasPreviousPage,
      startCursor,
      endCursor,
      totalCount: totalCount ?? items.length,
    },
  }
}
