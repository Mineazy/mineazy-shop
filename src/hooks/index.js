import { useState, useEffect, useCallback, useRef } from 'react';
import { productsAPI, blogAPI } from '../services/api';

// Hook for managing API calls
export const useAPI = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall(...args);
      setData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Hook for managing products
export const useProducts = (params = {}) => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async (searchParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productsAPI.getAll({ ...params, ...searchParams });
      setProducts(response.data.data.products);
      setPagination(response.data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    pagination,
    loading,
    error,
    refetch: fetchProducts,
  };
};

// Hook for managing single product
export const useProduct = (productId) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await productsAPI.getById(productId);
        setProduct(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  return { product, loading, error };
};

// Enhanced Blog Hooks - Add these to src/hooks/index.js

// Hook for managing blog posts with proper API endpoints
export const useBlogPosts = (params = {}) => {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async (searchParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      const mergedParams = { ...params, ...searchParams };


      // Choose the appropriate endpoint based on parameters
      if (mergedParams.search || mergedParams.q) {
        // Use search endpoint
        response = await blogAPI.search({
          q: mergedParams.search || mergedParams.q,
          page: mergedParams.page || 1,
          limit: mergedParams.limit || 12
        });
      } else if (mergedParams.category) {
        // Use category endpoint - handle both slug and ID
        const categoryParam = mergedParams.category;
        response = await blogAPI.getByCategory(categoryParam, {
          page: mergedParams.page || 1,
          limit: mergedParams.limit || 12
        });
      } else if (mergedParams.author) {
        // Use author endpoint
        response = await blogAPI.getByAuthor(mergedParams.author, {
          page: mergedParams.page || 1,
          limit: mergedParams.limit || 12
        });
      } else if (mergedParams.popular) {
        // Use popular endpoint
        response = await blogAPI.getPopular({
          limit: mergedParams.limit || 12,
          days: mergedParams.days || 30
        });
      } else {
        // Use published endpoint for general listing
        response = await blogAPI.getPublished({
          page: mergedParams.page || 1,
          limit: mergedParams.limit || 12
        });
      }


      if (response.data.success) {
        const data = response.data.data;
        
        // Handle different response structures according to API documentation
        if (Array.isArray(data)) {
          // Simple array response (for popular posts)
          setPosts(data);
          setPagination(null);
        } else {
          // Object response with pagination
          setPosts(data || []);
          setPagination(response.data.pagination || {
            page: response.data.pagination?.page || 1,
            pages: response.data.pagination?.pages || 1,
            total: response.data.pagination?.total || data.length || 0,
            limit: response.data.pagination?.limit || 12
          });
        }
      } else {
        throw new Error(response.data.message || 'Invalid response format');
      }
    } catch (err) {
      console.error('Failed to fetch blog posts:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch blog posts';
      setError(errorMessage);
      setPosts([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    pagination,
    loading,
    error,
    refetch: fetchPosts,
  };
};

// Hook for managing a single blog post
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
        
        // Get blog by slug
        const response = await blogAPI.getBySlug(slug);
        
        if (response.data.success && response.data.data) {
          const postData = response.data.data;
          setPost(postData);
          
          // Fetch related posts if we have the blog ID
          if (postData._id) {
            try {
              const relatedResponse = await blogAPI.getRelated(postData._id, { limit: 3 });
              
              if (relatedResponse.data.success) {
                setRelatedPosts(relatedResponse.data.data || []);
              }
            } catch (relatedError) {
              console.warn('Failed to fetch related posts:', relatedError);
              // Don't fail the whole request for related posts
              setRelatedPosts([]);
            }
          }
        } else {
          throw new Error('Blog post not found');
        }
      } catch (err) {
        console.error('Failed to fetch blog post:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch blog post';
        setError(errorMessage);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  return { post, relatedPosts, loading, error };
};

// Hook for managing blog categories
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
        
        if (response.data.success) {
          setCategories(response.data.data || []);
        } else {
          throw new Error('Failed to fetch categories');
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch categories';
        setError(errorMessage);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};

// Hook for managing popular blog posts
export const usePopularBlogPosts = (params = {}) => {
  const [popularPosts, setPopularPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPopularPosts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await blogAPI.getPopular({
          limit: params.limit || 5,
          days: params.days || 30
        });
        
        if (response.data.success) {
          setPopularPosts(response.data.data || []);
        } else {
          throw new Error('Failed to fetch popular posts');
        }
      } catch (err) {
        console.error('Failed to fetch popular posts:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch popular posts';
        setError(errorMessage);
        setPopularPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularPosts();
  }, [params.limit, params.days]);

  return { popularPosts, loading, error };
};

// Hook for blog search with debouncing
export const useBlogSearch = (initialQuery = '', debounceMs = 300) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const debouncedQuery = useDebounce(query, debounceMs);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    const searchPosts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await blogAPI.search({
          q: debouncedQuery,
          limit: 10
        });
        
        if (response.data.success) {
          setResults(response.data.data || []);
        } else {
          throw new Error('Search failed');
        }
      } catch (err) {
        console.error('Blog search error:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Search failed';
        setError(errorMessage);
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
    results,
    loading,
    error,
    hasResults: results.length > 0
  };
};

// Hook for debouncing values
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook for local storage
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

// Hook for intersection observer (for lazy loading)
export const useIntersectionObserver = (ref, options) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
};

// Hook for window size
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// Hook for click outside
export const useClickOutside = (callback) => {
  const ref = useRef();

  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [callback]);

  return ref;
};

// Hook for form handling
export const useForm = (initialValues, validationSchema) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    if (validationSchema && validationSchema[name]) {
      const error = validationSchema[name](values[name], values);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const validate = () => {
    if (!validationSchema) return true;

    const newErrors = {};
    let isValid = true;

    Object.keys(validationSchema).forEach(field => {
      const error = validationSchema[field](values[field], values);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(validationSchema).reduce((acc, field) => ({ ...acc, [field]: true }), {}));
    return isValid;
  };

  const handleSubmit = async (onSubmit) => {
    const isValid = validate();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    validate,
  };
};