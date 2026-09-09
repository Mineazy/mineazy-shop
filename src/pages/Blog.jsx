// src/pages/Blog.jsx - FINAL FIX using category _id instead of slug

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, User, Search, Filter, Clock, Eye, TrendingUp } from 'lucide-react';
import { BlogSkeleton } from '../components/Common/Loading';
import { ErrorMessage } from '../components/Common/ErrorBoundary';
import { useBlogCategories, useFeaturedBlogPosts } from '../hooks/useBlog';
import { blogAPI } from '../services/api';
import Seo from '../components/Common/Seo';
import {
  getBlogTitle,
  getBlogExcerpt,
  getBlogImageUrl,
  getBlogAuthor,
  getBlogCategory,
  getBlogTags,
  formatBlogDate,
  formatViewCount,
  calculateReadingTime,
  getBlogContent,
  normalizeBlogResponse,
  ensureBlogArray
} from '../utils/blogUtils';
import aboutBanner from '../assets/about-us-banner-mineazy.webp';

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState(searchParams.get('category') || '');
  const currentPage = parseInt(searchParams.get('page')) || 1;

  // State for posts
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState(null);

  // Fetch categories
  const { categories, loading: categoriesLoading } = useBlogCategories();

  // Fetch featured posts
  const { posts: featuredPosts, loading: featuredLoading } = useFeaturedBlogPosts(5);

  // Fetch posts whenever filters change
  useEffect(() => {
    fetchPosts();
  }, [selectedCategoryId, searchTerm, currentPage]);

  const fetchPosts = async () => {
    setPostsLoading(true);
    setPostsError(null);

    try {
      const params = {
        page: currentPage,
        limit: 12,
        status: 'published'
      };

      // IMPORTANT: Add category ID (not slug) if selected
      if (selectedCategoryId && selectedCategoryId.trim()) {
        params.category = selectedCategoryId; // This is the _id
      }

      // Add search filter if exists
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const response = await blogAPI.getAll(params);

      const normalized = normalizeBlogResponse(response.data);

      setPosts(ensureBlogArray(normalized.posts));
      setPagination(normalized.pagination);
    } catch (error) {
      console.error('❌ Failed to fetch posts:', error);
      setPostsError(error.response?.data?.message || error.message || 'Failed to fetch blog posts');
      setPosts([]);
      setPagination(null);
    } finally {
      setPostsLoading(false);
    }
  };

  // Update URL params when filters change
  const updateURLParams = (newParams) => {
    const params = new URLSearchParams();
    
    if (newParams.search && newParams.search.trim()) {
      params.set('search', newParams.search.trim());
    }
    if (newParams.category && newParams.category.trim()) {
      params.set('category', newParams.category.trim());
    }
    if (newParams.page && newParams.page > 1) {
      params.set('page', newParams.page.toString());
    }
    
    setSearchParams(params);
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedSearch = searchTerm.trim();
    setSearchTerm(trimmedSearch);
    updateURLParams({ search: trimmedSearch, page: 1, category: selectedCategoryId });
  };

  // Handle category selection - NOW USING _id
  const handleCategoryChange = (categoryId) => {
    setSelectedCategoryId(categoryId);
    updateURLParams({ category: categoryId, page: 1, search: searchTerm });
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    updateURLParams({ page: newPage, category: selectedCategoryId, search: searchTerm });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategoryId('');
    setSearchParams({});
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (selectedCategoryId.trim()) count++;
    return count;
  };

  // Get category name for display using _id
  const getSelectedCategoryName = () => {
    if (!selectedCategoryId) return null;
    const category = categories.find(cat => cat._id === selectedCategoryId);
    return category?.name || 'Selected Category';
  };

  const loading = postsLoading || categoriesLoading;

  const pageTitle = searchTerm ? `Search: ${searchTerm}` : selectedCategoryId ? getSelectedCategoryName() : 'Mining Industry Insights';
  const pageDescription = 'Expert mining industry insights, equipment reviews, and trends from Zimbabwe\'s leading mining solutions provider.';

  return (
    <div className="min-h-screen bg-gray-50">
      <Seo
        title={pageTitle}
        description={pageDescription}
        keywords="mining blog Zimbabwe, mining industry insights, mining equipment reviews, mining tips"
        canonicalUrl={window.location.href}
        ogType="blog"
      />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={aboutBanner}
            alt="Mining Industry Insights"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 to-secondary/70"></div>
        </div>
        
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-2 mb-6">
              <TrendingUp className="w-4 h-4 text-primary mr-2" />
              <span className="text-primary text-sm font-medium">Mining Industry Insights</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Stay Ahead in <span className="text-primary">Mining</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-200 leading-relaxed max-w-3xl mx-auto mb-8">
              Expert insights, latest technologies, and industry trends from Zimbabwe's 
              leading mining solutions provider.
            </p>
            
            {/* Hero Search */}
            <div className="max-w-xl mx-auto">
              <form onSubmit={handleSearch} className="relative">
                <div className="flex">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search articles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-l-xl text-gray-900 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="bg-primary text-secondary px-8 py-4 rounded-r-xl font-semibold hover:bg-primary/90 transition-colors focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Categories - NOW USING _id */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-secondary to-secondary/90 text-white p-6">
                <h3 className="text-lg font-semibold">Browse Categories</h3>
              </div>
              <div className="p-4 space-y-2">
                {categoriesLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleCategoryChange('')}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                        selectedCategoryId === '' 
                          ? 'bg-primary text-secondary shadow-md' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">All Articles</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {pagination?.totalPosts || posts.length}
                        </span>
                      </div>
                    </button>
                    
                    {categories.map(category => (
                      <button
                        key={category._id}
                        onClick={() => handleCategoryChange(category._id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                          selectedCategoryId === category._id
                            ? 'bg-primary text-secondary shadow-md' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{category.name}</span>
                          {category.postCount > 0 && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              {category.postCount}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Popular Posts */}
            {!featuredLoading && featuredPosts.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-secondary to-secondary/90 text-white p-6">
                  <h3 className="text-lg font-semibold">Popular This Month</h3>
                </div>
                <div className="p-4 space-y-4">
                  {featuredPosts.map((post, index) => {
                    const title = getBlogTitle(post);
                    
                    return (
                      <Link
                        key={post._id}
                        to={`/blog/${post.slug}`}
                        className="block group hover:bg-gray-50 p-3 rounded-lg transition-colors"
                      >
                        <div className="flex space-x-3">
                          <div className="flex-shrink-0">
                            <img
                              src={getBlogImageUrl(post, 'thumbnail')}
                              alt={title}
                              className="w-16 h-16 rounded-lg object-cover"
                              loading="lazy"
                            />
                            <div className="mt-2 text-center">
                              <span className="inline-flex items-center justify-center w-6 h-6 bg-primary text-secondary rounded-full text-xs font-bold">
                                {index + 1}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-primary transition-colors mb-2">
                              {title}
                            </h4>
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Eye className="w-3 h-3" />
                                <span>{formatViewCount(post.viewCount || 0)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{calculateReadingTime(getBlogContent(post))}m</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Filters */}
            {getActiveFiltersCount() > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Active Filters ({getActiveFiltersCount()})
                </h3>
                <div className="space-y-2 mb-4">
                  {searchTerm && (
                    <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                      <span className="text-sm text-gray-600">Search: "{searchTerm}"</span>
                    </div>
                  )}
                  {selectedCategoryId && (
                    <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                      <span className="text-sm text-gray-600">
                        Category: {getSelectedCategoryName()}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={clearFilters}
                  className="w-full btn-outline flex items-center justify-center space-x-2"
                >
                  <span>Clear All</span>
                </button>
              </div>
            )}
          </div>

          {/* Main Content - Articles Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <BlogSkeleton key={index} />
                ))}
              </div>
            ) : postsError ? (
              <ErrorMessage
                title="Failed to Load Articles"
                message={postsError}
                onRetry={fetchPosts}
              />
            ) : posts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Articles Found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchTerm || selectedCategoryId 
                    ? "We couldn't find any articles matching your criteria. Try adjusting your search terms or browse all categories."
                    : 'No blog posts are currently available. Check back soon for new content!'
                  }
                </p>
                {getActiveFiltersCount() > 0 && (
                  <button onClick={clearFilters} className="btn-primary">
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Results Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {searchTerm ? `Search: "${searchTerm}"` :
                       selectedCategoryId ? `Category: ${getSelectedCategoryName()}` :
                       'All Articles'}
                    </h2>
                    <p className="text-gray-600">
                      {pagination ? `${pagination.totalPosts} articles found` : `${posts.length} articles`}
                      {currentPage > 1 && ` • Page ${currentPage}`}
                    </p>
                  </div>
                </div>

                {/* Articles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {posts.map((post) => {
                    const title = getBlogTitle(post);
                    const excerpt = getBlogExcerpt(post);
                    const imageUrl = getBlogImageUrl(post);
                    const author = getBlogAuthor(post);
                    const category = getBlogCategory(post);
                    const tags = getBlogTags(post);
                    const readingTime = calculateReadingTime(getBlogContent(post));
                    
                    return (
                      <article key={post._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                        <Link to={`/blog/${post.slug}`} className="block">
                          <div className="relative overflow-hidden">
                            <img
                              src={imageUrl}
                              alt={title}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                        </Link>
                        
                        <div className="p-6">
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatBlogDate(post.publishedAt)}</span>
                            </div>
                            {category && (
                              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                {category.name}
                              </span>
                            )}
                          </div>
                          
                          <Link to={`/blog/${post.slug}`}>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                              {title}
                            </h3>
                          </Link>
                          
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                            {excerpt}
                          </p>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <User className="w-3 h-3" />
                                <span>{author.firstName || author.name}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{readingTime}m</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Eye className="w-3 h-3" />
                              <span>{post.viewCount || 0}</span>
                            </div>
                          </div>
                          
                          {tags.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-1">
                              {tags.slice(0, 3).map(tag => (
                                <button
                                  key={tag}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setSearchTerm(tag);
                                    updateURLParams({ search: tag, page: 1, category: '' });
                                  }}
                                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-primary hover:text-secondary transition-colors"
                                >
                                  #{tag}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-12">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-600">
                          Page {pagination.currentPage} of {pagination.totalPages} 
                          ({pagination.totalPosts} articles)
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm font-medium"
                          >
                            Previous
                          </button>

                          <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                              const pageNum = i + 1;
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => handlePageChange(pageNum)}
                                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    currentPage === pageNum
                                      ? 'bg-primary text-secondary shadow-md'
                                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>

                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= pagination.totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm font-medium"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Newsletter Section */}
      {!loading && !postsError && (
        <section className="bg-gradient-to-r from-secondary to-secondary/90 text-white py-16 mt-12">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Stay Updated with Mining Insights
              </h2>
              <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                Get the latest industry news, equipment reviews, and expert analysis 
                delivered straight to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-6 py-4 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                />
                <button className="bg-primary text-secondary px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg">
                  Subscribe Now
                </button>
              </div>
              <p className="text-sm text-gray-300 mt-4">
                Join 2,500+ mining professionals. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Blog