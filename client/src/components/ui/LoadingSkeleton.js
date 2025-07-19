import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Hero Skeleton */}
      <div className="mb-8">
        <div className="h-96 bg-dark-800 rounded-xl mb-4"></div>
      </div>

      {/* Movie Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {[...Array(10)].map((_, index) => (
          <div key={index} className="space-y-3">
            <div className="aspect-[2/3] bg-dark-800 rounded-lg"></div>
            <div className="h-4 bg-dark-800 rounded"></div>
            <div className="h-3 bg-dark-800 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;
