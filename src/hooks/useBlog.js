// src/hooks/useBlog.js - Complete custom hooks for blog functionality

import { useState, useEffect, useCallback } from 'react';
import { blogAPI } from '../services/api';
import { normalizeBlogResponse, ensureBlogArray } from '../utils/blogUtils';

/**
 * Hook for managing blog posts with pagination and filters
 * @param {Object} initialParams - Initial query parameters
 * @returns {Object} Blog posts state and methods
 */
export const useBlogPosts = (initialParams = {}) => {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchPosts = useCallback(async (searchParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const mergedParams = { ...params, ...searchParams };

      const response = await blogAPI.getAll(mergedParams);
      const normalized = normalizeBlogResponse(response.data);
      
      setPosts(ensureBlogArray(normalized.posts));
      setPagination(normalized.pagination);
      
    } catch (err) {
      console.error('❌ useBlogPosts: Failed to fetch posts:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch blog posts');
      setPosts([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  return {
    posts: ensureBlogArray(posts),
    pagination,
    loading,
    error,
    refetch: fetchPosts,
    updateParams,
    setParams
  };
};

/**
 * Hook for managing a single blog post
 * @param {string} slug - Post slug
 * @returns {Object} Blog post state
 */
export const useBlogPost = (slug) => {
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      
      try {
        
        const response = await blogAPI.getBySlug(slug);
        const postData = response.data?.post || response.data;
        
        setPost(postData);
        
        // Fetch related posts
        if (postData?.slug) {
          try {
            const relatedResponse = await blogAPI.getRelated(postData.slug, { limit: 3 });
            const relatedData = relatedResponse.data?.posts || relatedResponse.data || [];
            setRelatedPosts(ensureBlogArray(relatedData));
          } catch (relatedError) {
            console.warn('⚠️ useBlogPost: Failed to fetch related posts:', relatedError);
            setRelatedPosts([]);
          }
        }
      } catch (err) {
        console.error('❌ useBlogPost: Failed to fetch post:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch blog post');
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  return { 
    post, 
    relatedPosts: ensureBlogArray(relatedPosts), 
    loading, 
    error 
  };
};

/**
 * Hook for managing blog categories
 * @returns {Object} Categories state
 */
export const useBlogCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await blogAPI.getCategories();
        
        const categoriesData = response.data?.categories || 
                              response.data?.data || 
                              response.data || 
                              [];
        
        setCategories(ensureBlogArray(categoriesData));
      } catch (err) {
        console.error('❌ useBlogCategories: Failed to fetch categories:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch categories');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { 
    categories: ensureBlogArray(categories), 
    loading, 
    error 
  };
};

/**
 * Hook for managing featured/popular blog posts
 * @param {number} limit - Number of posts to fetch
 * @returns {Object} Featured posts state
 */
export const useFeaturedBlogPosts = (limit = 5) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await blogAPI.getFeatured({ limit });
        
        const postsData = response.data?.posts || 
                         response.data?.data || 
                         response.data || 
                         [];
        
        setPosts(ensureBlogArray(postsData));
      } catch (err) {
        console.error('❌ useFeaturedBlogPosts: Failed to fetch featured posts:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch featured posts');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPosts();
  }, [limit]);

  return { 
    posts: ensureBlogArray(posts), 
    loading, 
    error 
  };
};

/**
 * Hook for blog search with debouncing
 * @param {string} initialQuery - Initial search query
 * @param {number} debounceMs - Debounce delay in milliseconds
 * @returns {Object} Search state and methods
 */
export const useBlogSearch = (initialQuery = '', debounceMs = 300) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Debounce the search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [query, debounceMs]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    const searchPosts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await blogAPI.search({ 
          search: debouncedQuery, 
          limit: 10 
        });
        
        const normalized = normalizeBlogResponse(response.data);
        setResults(ensureBlogArray(normalized.posts));
      } catch (err) {
        console.error('❌ useBlogSearch: Search failed:', err);
        setError(err.response?.data?.message || err.message || 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    searchPosts();
  }, [debouncedQuery]);

  return {
    query,
    setQuery,
    results: ensureBlogArray(results),
    loading,
    error,
    hasResults: results.length > 0
  };
};

/**
 * Hook for blog archive
 * @returns {Object} Archive state
 */
export const useBlogArchive = () => {
  const [archive, setArchive] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArchive = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await blogAPI.getArchive();
        
        const archiveData = response.data?.archive || 
                           response.data?.data || 
                           response.data || 
                           [];
        
        setArchive(ensureBlogArray(archiveData));
      } catch (err) {
        console.error('❌ useBlogArchive: Failed to fetch archive:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch archive');
        setArchive([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArchive();
  }, []);

  return { 
    archive: ensureBlogArray(archive), 
    loading, 
    error 
  };
};

/**
 * Hook for blog tags
 * @returns {Object} Tags state
 */
export const useBlogTags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await blogAPI.getTags();
        
        const tagsData = response.data?.tags || 
                        response.data?.data || 
                        response.data || 
                        [];
        
        setTags(ensureBlogArray(tagsData));
      } catch (err) {
        console.error('❌ useBlogTags: Failed to fetch tags:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch tags');
        setTags([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  return { 
    tags: ensureBlogArray(tags), 
    loading, 
    error 
  };
};

/**
 * Hook for posts by category
 * @param {string} categoryId - Category ID or slug
 * @param {Object} params - Additional query parameters
 * @returns {Object} Posts state
 */
export const useBlogPostsByCategory = (categoryId, params = {}) => {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!categoryId) {
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await blogAPI.getByCategory(categoryId, params);
        const normalized = normalizeBlogResponse(response.data);
        
        setPosts(ensureBlogArray(normalized.posts));
        setPagination(normalized.pagination);
      } catch (err) {
        console.error('❌ useBlogPostsByCategory: Failed:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch posts');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [categoryId, JSON.stringify(params)]);

  return { 
    posts: ensureBlogArray(posts), 
    pagination,
    loading, 
    error 
  };
};

/**
 * Hook for posts by tag
 * @param {string} tag - Tag name
 * @param {Object} params - Additional query parameters
 * @returns {Object} Posts state
 */
export const useBlogPostsByTag = (tag, params = {}) => {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tag) {
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await blogAPI.getByTag(tag, params);
        const normalized = normalizeBlogResponse(response.data);
        
        setPosts(ensureBlogArray(normalized.posts));
        setPagination(normalized.pagination);
      } catch (err) {
        console.error('❌ useBlogPostsByTag: Failed:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch posts');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [tag, JSON.stringify(params)]);

  return { 
    posts: ensureBlogArray(posts), 
    pagination,
    loading, 
    error 
  };
};

/**
 * Hook for posts by author
 * @param {string} authorId - Author ID
 * @param {Object} params - Additional query parameters
 * @returns {Object} Posts state
 */
export const useBlogPostsByAuthor = (authorId, params = {}) => {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authorId) {
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await blogAPI.getByAuthor(authorId, params);
        const normalized = normalizeBlogResponse(response.data);
        
        setPosts(ensureBlogArray(normalized.posts));
        setPagination(normalized.pagination);
      } catch (err) {
        console.error('❌ useBlogPostsByAuthor: Failed:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch posts');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [authorId, JSON.stringify(params)]);

  return { 
    posts: ensureBlogArray(posts), 
    pagination,
    loading, 
    error 
  };
};