import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = ({ size = 'md', text = 'Loading...', center = true }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const containerClasses = center 
    ? 'flex flex-col items-center justify-center min-h-32'
    : 'flex items-center space-x-2';

  return (
    <div className={containerClasses}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-600 font-medium ${center ? 'mt-2' : ''}`}>
          {text}
        </p>
      )}
    </div>
  );
};

// Skeleton loader for product cards
export const ProductSkeleton = () => {
  return (
    <div className="card animate-pulse">
      <div className="h-48 bg-gray-200 rounded-t-xl"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export const BlogSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:400%_100%] animate-shimmer"></div>
      
      {/* Content skeleton */}
      <div className="p-6 space-y-4">
        {/* Meta info skeleton */}
        <div className="flex items-center space-x-3">
          <div className="h-3 bg-gray-200 rounded w-20"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
        </div>
        
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 rounded w-full"></div>
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        </div>
        
        {/* Excerpt skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        
        {/* Footer skeleton */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-3 bg-gray-200 rounded w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-10"></div>
        </div>
        
        {/* Tags skeleton */}
        <div className="flex flex-wrap gap-1">
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="h-6 bg-gray-200 rounded-full w-14"></div>
        </div>
      </div>
    </div>
  );
};

// Featured blog post skeleton
export const FeaturedBlogSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 animate-pulse mb-12">
      <div className="lg:flex">
        {/* Image skeleton */}
        <div className="lg:w-1/2 h-64 lg:h-80 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:400%_100%] animate-shimmer"></div>
        
        {/* Content skeleton */}
        <div className="lg:w-1/2 p-8 space-y-4">
          {/* Badge and meta */}
          <div className="flex items-center space-x-4">
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          
          {/* Title */}
          <div className="space-y-3">
            <div className="h-7 bg-gray-200 rounded w-full"></div>
            <div className="h-7 bg-gray-200 rounded w-4/5"></div>
          </div>
          
          {/* Excerpt */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-11/12"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-4">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Blog post detail skeleton
export const BlogPostSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="hidden md:flex items-center space-x-2">
              <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-8 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header skeleton */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 mb-8 animate-pulse">
            {/* Featured image skeleton */}
            <div className="aspect-video bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:400%_100%] animate-shimmer"></div>
            
            {/* Content skeleton */}
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                {/* Author skeleton */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                
                {/* Share buttons skeleton */}
                <div className="flex items-center space-x-3">
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                  <div className="flex space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content skeleton */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8 animate-pulse">
            <div className="p-8 lg:p-12 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-32 mb-8"></div>
              
              {/* Paragraphs skeleton */}
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-11/12"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                  {i < 7 && <div className="h-6"></div>}
                </div>
              ))}
              
              {/* Tags skeleton */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-16 mb-4"></div>
                <div className="flex flex-wrap gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-8 bg-gray-200 rounded-full w-20"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Related posts skeleton */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-pulse">
            <div className="p-8">
              <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg overflow-hidden">
                    <div className="h-40 bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sidebar skeleton
export const BlogSidebarSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Search skeleton */}
      <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded mb-3"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>

      {/* Categories skeleton */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
        <div className="h-16 bg-gray-200"></div>
        <div className="p-4 space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>

      {/* Popular posts skeleton */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
        <div className="h-16 bg-gray-200"></div>
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-3">
              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Add shimmer animation styles to your CSS
export const shimmerStyles = `
  @keyframes shimmer {
    0% { background-position: -400% 0; }
    100% { background-position: 400% 0; }
  }
  
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
`;

// Full page loader
export const PageLoader = () => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-semibold text-gray-700">Loading...</p>
        <p className="text-sm text-gray-500 mt-1">Please wait while we prepare your content</p>
      </div>
    </div>
  );
};

export default Loading;