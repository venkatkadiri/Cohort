/**
 * Shared Cursor-Based Pagination Utilities
 */

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

export interface CursorPayload {
  id: number | string
  createdAt?: string
}

/**
 * Universal Base64 string encoding
 */
function toBase64(str: string): string {
  if (typeof globalThis !== 'undefined' && typeof (globalThis as any).Buffer !== 'undefined') {
    return (globalThis as any).Buffer.from(str, 'utf-8').toString('base64')
  }
  if (typeof btoa !== 'undefined') {
    return btoa(unescape(encodeURIComponent(str)))
  }
  return str
}

/**
 * Universal Base64 string decoding
 */
function fromBase64(str: string): string {
  if (typeof globalThis !== 'undefined' && typeof (globalThis as any).Buffer !== 'undefined') {
    return (globalThis as any).Buffer.from(str, 'base64').toString('utf-8')
  }
  if (typeof atob !== 'undefined') {
    return decodeURIComponent(escape(atob(str)))
  }
  return str
}

/**
 * Encodes a cursor payload into an opaque Base64 string
 */
export function encodeCursor(payload: CursorPayload): string {
  const json = JSON.stringify(payload)
  return toBase64(json)
}

/**
 * Decodes an opaque Base64 cursor string into a CursorPayload
 */
export function decodeCursor(cursor?: string | null): CursorPayload | null {
  if (!cursor) return null
  try {
    const json = fromBase64(cursor)
    return JSON.parse(json)
  } catch {
    return null
  }
}

/**
 * Helper to paginate an in-memory or database slice using cursor semantics
 */
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
