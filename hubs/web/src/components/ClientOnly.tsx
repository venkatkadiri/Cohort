import React, { useSyncExternalStore } from 'react'

interface ClientOnlyProps {
  children: React.ReactNode | (() => React.ReactNode)
  fallback?: React.ReactNode
}

const emptySubscribe = () => () => {}

/**
 * Hydration-safe Client Island wrapper.
 * Ensures the wrapped component only renders in the browser,
 * rendering the provided fallback skeleton during Server-Side Rendering (SSR).
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )

  if (!isClient) {
    return <>{fallback}</>
  }

  return <>{typeof children === 'function' ? children() : children}</>
}
