import React, { Suspense } from 'react'
import { Await } from '@tanstack/react-router'
import { Spinner } from './ui'

interface StreamingBoundaryProps<T> {
  promise: Promise<T>
  fallback?: React.ReactNode
  children: (data: T) => React.ReactNode
}

/**
 * Reusable Streaming Boundary combining React Suspense and TanStack Router <Await>.
 * Seamlessly resolves deferred SSR data streams on both server and client.
 */
export function StreamingBoundary<T>({
  promise,
  fallback = (
    <div className="flex items-center justify-center p-8">
      <Spinner className="w-8 h-8 text-[#FF3E00]" />
    </div>
  ),
  children,
}: StreamingBoundaryProps<T>) {
  return (
    <Suspense fallback={fallback}>
      <Await promise={promise} fallback={fallback}>
        {(data: T) => children(data)}
      </Await>
    </Suspense>
  )
}
