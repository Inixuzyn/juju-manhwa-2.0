import React from 'react'

const SkeletonLoader = ({ count = 6, type = 'card', className = '' }) => {
  if (type === 'card') {
    return (
      <div className={`grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4 lg:gap-6 ${className}`}>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-2xl overflow-hidden bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300 dark:border-gray-700"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Image skeleton with fixed aspect ratio */}
            <div className="relative aspect-[2/3] bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>

            {/* Content skeleton */}
            <div className="p-4 space-y-3">
              {/* Title skeleton */}
              <div className="space-y-2">
                <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 rounded w-3/4"></div>
              </div>

              {/* Info skeleton */}
              <div className="flex items-center justify-between">
                <div className="h-3 w-16 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 rounded"></div>
                <div className="h-3 w-12 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 rounded"></div>
              </div>

              {/* Button skeleton */}
              <div className="h-9 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 rounded-lg mt-2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'detail') {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Hero skeleton */}
        <div className="animate-pulse bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 rounded-2xl h-96 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-48 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 rounded-2xl"></div>
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-10 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 rounded-xl"></div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (type === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse h-4 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 rounded"
            style={{ animationDelay: `${index * 50}ms`, width: `${index % 2 === 0 ? '100%' : '80%'}` }}
          ></div>
        ))}
      </div>
    )
  }

  if (type === 'button') {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse h-10 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 rounded-lg w-full"></div>
      </div>
    )
  }

  if (type === 'circle') {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse w-12 h-12 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 rounded-full"></div>
      </div>
    )
  }

  return null
}

export default SkeletonLoader