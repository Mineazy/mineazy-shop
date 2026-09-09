// src/context/ProductContext.jsx - Updated for new backend API
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { productsAPI, getCachedData, setCachedData } from '../services/api';

// Initial state with guaranteed array types
const initialState = {
  // Products state - ALWAYS arrays
  products: [], // ✅ Always an array
  featuredProducts: [], // ✅ Always an array
  newArrivals: [], // ✅ Always an array
  popularProducts: [], // ✅ Always an array
  selectedProduct: null,
  
  // Categories state - ALWAYS arrays
  categories: [], // ✅ Always an array
  rootCategories: [], // ✅ Always an array
  categoryTree: [], // ✅ Always an array
  selectedCategory: null,
  
  // Search and filtering
  searchResults: [], // ✅ Always an array
  filters: {
    category: '',
    subcategory: '',
    search: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    limit: 20
  },
  
  // Pagination
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNext: false,
    hasPrev: false
  },
  
  // Loading states
  loading: {
    products: false,
    categories: false,
    featuredProducts: false,
    selectedProduct: false,
    search: false
  },
  
  // Error states
  errors: {
    products: null,
    categories: null,
    featuredProducts: null,
    selectedProduct: null,
    search: null
  },
  
  // Cache timestamps
  lastUpdated: {
    products: null,
    categories: null,
    featuredProducts: null
  }
};

// Action types
const PRODUCT_ACTIONS = {
  // Products actions
  LOAD_PRODUCTS_START: 'LOAD_PRODUCTS_START',
  LOAD_PRODUCTS_SUCCESS: 'LOAD_PRODUCTS_SUCCESS',
  LOAD_PRODUCTS_FAILURE: 'LOAD_PRODUCTS_FAILURE',
  
  // Featured products actions
  LOAD_FEATURED_START: 'LOAD_FEATURED_START',
  LOAD_FEATURED_SUCCESS: 'LOAD_FEATURED_SUCCESS',
  LOAD_FEATURED_FAILURE: 'LOAD_FEATURED_FAILURE',
  
  // Categories actions
  LOAD_CATEGORIES_START: 'LOAD_CATEGORIES_START',
  LOAD_CATEGORIES_SUCCESS: 'LOAD_CATEGORIES_SUCCESS',
  LOAD_CATEGORIES_FAILURE: 'LOAD_CATEGORIES_FAILURE',
  
  // Single product actions
  LOAD_PRODUCT_START: 'LOAD_PRODUCT_START',
  LOAD_PRODUCT_SUCCESS: 'LOAD_PRODUCT_SUCCESS',
  LOAD_PRODUCT_FAILURE: 'LOAD_PRODUCT_FAILURE',
  
  // Search actions
  SEARCH_START: 'SEARCH_START',
  SEARCH_SUCCESS: 'SEARCH_SUCCESS',
  SEARCH_FAILURE: 'SEARCH_FAILURE',
  
  // Filter actions
  SET_FILTERS: 'SET_FILTERS',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  SET_CATEGORY: 'SET_CATEGORY',
  
  // Utility actions
  CLEAR_ERRORS: 'CLEAR_ERRORS',
  RESET_STATE: 'RESET_STATE'
};

// Helper function to ensure array safety
const ensureArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [];
};

// Helper function to normalize product response
const normalizeProductResponse = (response) => {
  
  let products = [];
  let pagination = null;
  
  if (response.success && response.data) {
    // New backend format: { success: true, data: [...] } or { success: true, data: { products: [...], pagination: {...} } }
    if (Array.isArray(response.data)) {
      products = response.data;
    } else if (response.data.products) {
      products = ensureArray(response.data.products);
      pagination = response.data.pagination;
    }
  } else if (response.products) {
    // Alternative format
    products = ensureArray(response.products);
    pagination = response.pagination;
  } else if (Array.isArray(response)) {
    // Direct array response
    products = response;
  }
  
  return { products, pagination };
};

// Enhanced reducer with array safety
const productReducer = (state, action) => {
  switch (action.type) {
    case PRODUCT_ACTIONS.LOAD_PRODUCTS_START:
      return {
        ...state,
        loading: { ...state.loading, products: true },
        errors: { ...state.errors, products: null }
      };

    case PRODUCT_ACTIONS.LOAD_PRODUCTS_SUCCESS:
      return {
        ...state,
        products: ensureArray(action.payload.products),
        pagination: action.payload.pagination || state.pagination,
        loading: { ...state.loading, products: false },
        errors: { ...state.errors, products: null },
        lastUpdated: { ...state.lastUpdated, products: Date.now() }
      };

    case PRODUCT_ACTIONS.LOAD_PRODUCTS_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, products: false },
        errors: { ...state.errors, products: action.payload.error || action.payload },
        products: action.payload.keepProducts ? ensureArray(state.products) : []
      };

    case PRODUCT_ACTIONS.LOAD_FEATURED_START:
      return {
        ...state,
        loading: { ...state.loading, featuredProducts: true },
        errors: { ...state.errors, featuredProducts: null }
      };

    case PRODUCT_ACTIONS.LOAD_FEATURED_SUCCESS:
      return {
        ...state,
        featuredProducts: ensureArray(action.payload),
        loading: { ...state.loading, featuredProducts: false },
        errors: { ...state.errors, featuredProducts: null },
        lastUpdated: { ...state.lastUpdated, featuredProducts: Date.now() }
      };

    case PRODUCT_ACTIONS.LOAD_FEATURED_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, featuredProducts: false },
        errors: { ...state.errors, featuredProducts: action.payload },
        featuredProducts: []
      };

    case PRODUCT_ACTIONS.LOAD_CATEGORIES_START:
      return {
        ...state,
        loading: { ...state.loading, categories: true },
        errors: { ...state.errors, categories: null }
      };

    case PRODUCT_ACTIONS.LOAD_CATEGORIES_SUCCESS:
      const categories = ensureArray(action.payload.categories || action.payload);
      const rootCategories = categories.filter(cat => !cat.parent_category && cat.isActive !== false);
      
      return {
        ...state,
        categories,
        rootCategories,
        categoryTree: ensureArray(action.payload.tree),
        loading: { ...state.loading, categories: false },
        errors: { ...state.errors, categories: null },
        lastUpdated: { ...state.lastUpdated, categories: Date.now() }
      };

    case PRODUCT_ACTIONS.LOAD_CATEGORIES_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, categories: false },
        errors: { ...state.errors, categories: action.payload },
        categories: [],
        rootCategories: [],
        categoryTree: []
      };

    case PRODUCT_ACTIONS.LOAD_PRODUCT_START:
      return {
        ...state,
        loading: { ...state.loading, selectedProduct: true },
        errors: { ...state.errors, selectedProduct: null }
      };

    case PRODUCT_ACTIONS.LOAD_PRODUCT_SUCCESS:
      return {
        ...state,
        selectedProduct: action.payload,
        loading: { ...state.loading, selectedProduct: false },
        errors: { ...state.errors, selectedProduct: null }
      };

    case PRODUCT_ACTIONS.LOAD_PRODUCT_FAILURE:
      return {
        ...state,
        selectedProduct: null,
        loading: { ...state.loading, selectedProduct: false },
        errors: { ...state.errors, selectedProduct: action.payload }
      };

    case PRODUCT_ACTIONS.SEARCH_START:
      return {
        ...state,
        loading: { ...state.loading, search: true },
        errors: { ...state.errors, search: null }
      };

    case PRODUCT_ACTIONS.SEARCH_SUCCESS:
      return {
        ...state,
        searchResults: ensureArray(action.payload.products || action.payload),
        pagination: action.payload.pagination || state.pagination,
        loading: { ...state.loading, search: false },
        errors: { ...state.errors, search: null }
      };

    case PRODUCT_ACTIONS.SEARCH_FAILURE:
      return {
        ...state,
        searchResults: [],
        loading: { ...state.loading, search: false },
        errors: { ...state.errors, search: action.payload }
      };

    case PRODUCT_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };

    case PRODUCT_ACTIONS.CLEAR_FILTERS:
      return {
        ...state,
        filters: { ...initialState.filters },
        searchResults: []
      };

    case PRODUCT_ACTIONS.SET_CATEGORY:
      return {
        ...state,
        selectedCategory: action.payload,
        filters: { ...state.filters, category: action.payload?.slug || action.payload || '' }
      };

    case PRODUCT_ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        errors: { ...initialState.errors }
      };

    case PRODUCT_ACTIONS.RESET_STATE:
      return { ...initialState };

    default:
      return state;
  }
};

// Create context
const ProductContext = createContext();

// Provider component
export const ProductProvider = ({ children }) => {
  const [state, dispatch] = useReducer(productReducer, initialState);

  // Enhanced load products with better error handling
  const loadProducts = useCallback(async (params = {}) => {
    try {
      dispatch({ type: PRODUCT_ACTIONS.LOAD_PRODUCTS_START });
      
      const defaultParams = {
        page: 1,
        limit: 20,
        sortBy: 'name'
      };
      
      const finalParams = { ...defaultParams, ...params };
      
      
      const response = await productsAPI.getAll(finalParams);
      
      const normalized = normalizeProductResponse(response.data);
      
      dispatch({
        type: PRODUCT_ACTIONS.LOAD_PRODUCTS_SUCCESS,
        payload: normalized
      });
      
      return normalized;
    } catch (error) {
      console.error('❌ Failed to load products:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load products';
      
      dispatch({
        type: PRODUCT_ACTIONS.LOAD_PRODUCTS_FAILURE,
        payload: {
          error: errorMessage,
          keepProducts: true
        }
      });
      
      return { products: ensureArray(state.products), pagination: state.pagination };
    }
  }, [state.products, state.pagination]);

  // Enhanced featured products loading
  const loadFeaturedProducts = useCallback(async (limit = 4, forceRefresh = false) => {
    try {
      dispatch({ type: PRODUCT_ACTIONS.LOAD_FEATURED_START });
      
      const cacheKey = `featured_products_${limit}`;
      const cached = getCachedData(cacheKey);
      
      if (cached && !forceRefresh) {
        dispatch({
          type: PRODUCT_ACTIONS.LOAD_FEATURED_SUCCESS,
          payload: ensureArray(cached)
        });
        return ensureArray(cached);
      }

      
      // Use the new backend endpoint for featured products
      const response = await productsAPI.getFeatured(limit);
      
      let products = [];
      
      // Handle the new backend response structure
      if (response.data?.success && response.data?.data) {
        products = ensureArray(response.data.data);
      } else if (Array.isArray(response.data?.data)) {
        products = ensureArray(response.data.data);
      } else if (Array.isArray(response.data)) {
        products = ensureArray(response.data);
      } else {
        
        // Fallback: get latest products instead
        try {
          const fallbackResponse = await productsAPI.getAll({
            limit: limit,
            sortBy: '-createdAt'
          });
          
          const fallbackNormalized = normalizeProductResponse(fallbackResponse.data);
          products = fallbackNormalized.products;
          
          if (products.length > 0) {
          }
        } catch (fallbackError) {
          console.error('❌ Fallback products loading also failed:', fallbackError);
        }
      }
      
      if (products.length > 0) {
        setCachedData(cacheKey, products);
        
        dispatch({
          type: PRODUCT_ACTIONS.LOAD_FEATURED_SUCCESS,
          payload: products
        });
        
        return products;
      } else {
        const errorMessage = 'No featured products available. Please mark some products as featured in the admin panel.';
        
        dispatch({
          type: PRODUCT_ACTIONS.LOAD_FEATURED_FAILURE,
          payload: errorMessage
        });
        
        return [];
      }
      
    } catch (error) {
      console.error('❌ Featured products loading failed with error:', error);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load featured products';
      
      dispatch({
        type: PRODUCT_ACTIONS.LOAD_FEATURED_FAILURE,
        payload: errorMessage
      });
      
      return [];
    }
  }, []);

  // Enhanced categories loading
  const loadCategories = useCallback(async (forceRefresh = false) => {
    try {
      dispatch({ type: PRODUCT_ACTIONS.LOAD_CATEGORIES_START });
      
      const cacheKey = 'categories';
      const cached = getCachedData(cacheKey);
      
      if (cached && !forceRefresh) {
        dispatch({
          type: PRODUCT_ACTIONS.LOAD_CATEGORIES_SUCCESS,
          payload: cached
        });
        return cached;
      }

      
      const response = await productsAPI.getCategories();
      
      let categories = [];
      
      // Handle new backend response structure
      if (response.data?.success && response.data?.data) {
        categories = ensureArray(response.data.data);
      } else if (response.data?.categories) {
        categories = ensureArray(response.data.categories);
      } else if (Array.isArray(response.data)) {
        categories = ensureArray(response.data);
      }
      
      // Build tree structure
      const tree = categories
        .filter(cat => !cat.parent_category && cat.isActive !== false)
        .map(parent => ({
          ...parent,
          children: categories.filter(child => 
            child.parent_category === parent._id && child.isActive !== false
          )
        }));
      
      const result = { categories, tree };
      setCachedData(cacheKey, result);
      
      dispatch({
        type: PRODUCT_ACTIONS.LOAD_CATEGORIES_SUCCESS,
        payload: result
      });
      
      return result;
    } catch (error) {
      console.error('❌ Failed to load categories:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load categories';
      
      dispatch({
        type: PRODUCT_ACTIONS.LOAD_CATEGORIES_FAILURE,
        payload: errorMessage
      });
      
      // Return fallback categories for better UX
      const fallbackCategories = [
        { _id: 'mining-equipment', name: 'Mining Equipment', slug: 'mining-equipment', isActive: true },
        { _id: 'safety-equipment', name: 'Safety Equipment', slug: 'safety-equipment', isActive: true },
        { _id: 'processing-equipment', name: 'Processing Equipment', slug: 'processing-equipment', isActive: true },
        { _id: 'tools-accessories', name: 'Tools & Accessories', slug: 'tools-accessories', isActive: true }
      ];
      
      dispatch({
        type: PRODUCT_ACTIONS.LOAD_CATEGORIES_SUCCESS,
        payload: { categories: fallbackCategories, tree: fallbackCategories }
      });
      
      return { categories: fallbackCategories, tree: fallbackCategories };
    }
  }, []);

  // Load single product by ID
  const loadProduct = useCallback(async (productId, forceRefresh = false) => {
    try {
      dispatch({ type: PRODUCT_ACTIONS.LOAD_PRODUCT_START });
      
      const cacheKey = `product_${productId}`;
      const cached = getCachedData(cacheKey);
      
      if (cached && !forceRefresh) {
        dispatch({
          type: PRODUCT_ACTIONS.LOAD_PRODUCT_SUCCESS,
          payload: cached
        });
        return cached;
      }

      const response = await productsAPI.getById(productId);
      
      let product = null;
      
      // Handle new backend response structure
      if (response.data?.success && response.data?.data) {
        product = response.data.data;
      } else if (response.data?.product) {
        product = response.data.product;
      } else {
        product = response.data;
      }
      
      setCachedData(cacheKey, product);
      
      dispatch({
        type: PRODUCT_ACTIONS.LOAD_PRODUCT_SUCCESS,
        payload: product
      });
      
      return product;
    } catch (error) {
      console.error('❌ Failed to load product:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Product not found';
      
      dispatch({
        type: PRODUCT_ACTIONS.LOAD_PRODUCT_FAILURE,
        payload: errorMessage
      });
      
      throw error;
    }
  }, []);

  // Search products with debouncing
  const searchProducts = useCallback(async (query, additionalParams = {}) => {
    try {
      dispatch({ type: PRODUCT_ACTIONS.SEARCH_START });
      
      if (!query || query.trim().length < 2) {
        dispatch({
          type: PRODUCT_ACTIONS.SEARCH_SUCCESS,
          payload: { products: [], pagination: null }
        });
        return { products: [], pagination: null };
      }

      const response = await productsAPI.search(query.trim(), additionalParams);
      
      const normalized = normalizeProductResponse(response.data);
      
      dispatch({
        type: PRODUCT_ACTIONS.SEARCH_SUCCESS,
        payload: normalized
      });
      
      return normalized;
    } catch (error) {
      console.error('❌ Search failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Search failed';
      
      dispatch({
        type: PRODUCT_ACTIONS.SEARCH_FAILURE,
        payload: errorMessage
      });
      
      return { products: [], pagination: null };
    }
  }, []);

  // Get products by category with enhanced error handling
  const getProductsByCategory = useCallback(async (categorySlugOrId, params = {}) => {
    try {
      
      if (state.categories.length === 0 && !state.loading.categories) {
        await loadCategories();
      }
      
      return await loadProducts({ 
        ...params, 
        category: categorySlugOrId 
      });
      
    } catch (error) {
      console.error('❌ Failed to load category products:', error);
      return { products: [], pagination: null };
    }
  }, [state.categories.length, state.loading.categories, loadCategories, loadProducts]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    dispatch({
      type: PRODUCT_ACTIONS.SET_FILTERS,
      payload: newFilters
    });
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    dispatch({ type: PRODUCT_ACTIONS.CLEAR_FILTERS });
  }, []);

  // Set selected category
  const setSelectedCategory = useCallback((category) => {
    dispatch({
      type: PRODUCT_ACTIONS.SET_CATEGORY,
      payload: category
    });
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    dispatch({ type: PRODUCT_ACTIONS.CLEAR_ERRORS });
  }, []);

  // Get category by slug
  const getCategoryBySlug = useCallback((slug) => {
    return ensureArray(state.categories).find(cat => 
      cat.slug === slug || 
      cat.name.toLowerCase().replace(/\s+/g, '-') === slug
    );
  }, [state.categories]);

  // Get root categories for navigation
  const getRootCategories = useCallback(() => {
    return ensureArray(state.categories).filter(cat => !cat.parent_category && cat.isActive !== false);
  }, [state.categories]);

  // Get category children
  const getCategoryChildren = useCallback((categoryId) => {
    return ensureArray(state.categories).filter(cat => 
      cat.parent_category === categoryId && cat.isActive !== false
    );
  }, [state.categories]);

  // Auto-load essential data on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        
        // Load categories first (essential for navigation)
        await loadCategories();
        
        // Load featured products for homepage
        await loadFeaturedProducts(4);
        
      } catch (error) {
        console.error('❌ ProductContext initialization failed:', error);
        // Don't prevent the app from loading
      }
    };

    initializeData();
  }, []); // Empty dependency array - only run once

  // Computed values
  const isLoading = Object.values(state.loading).some(loading => loading);
  const hasErrors = Object.values(state.errors).some(error => error !== null);

  // Utility to refresh all data
  const refreshData = useCallback(async () => {
    try {
      await loadCategories(true);
      await loadFeaturedProducts(4, true);
      
      // Reload current products if we have filters
      if (state.filters.category || state.filters.search) {
        await loadProducts({ ...state.filters, forceRefresh: true });
      }
      
    } catch (error) {
      console.error('❌ Data refresh failed:', error);
    }
  }, [loadCategories, loadFeaturedProducts, loadProducts, state.filters]);

  // Context value
  const value = {
    // State - ensure arrays are always arrays
    ...state,
    products: ensureArray(state.products),
    featuredProducts: ensureArray(state.featuredProducts),
    categories: ensureArray(state.categories),
    rootCategories: ensureArray(state.rootCategories),
    searchResults: ensureArray(state.searchResults),
    
    // Computed values
    isLoading,
    hasErrors,
    
    // Actions
    loadProducts,
    loadFeaturedProducts,
    loadCategories,
    loadProduct,
    searchProducts,
    getProductsByCategory,
    
    // Filters and categories
    updateFilters,
    clearFilters,
    setSelectedCategory,
    getCategoryBySlug,
    getRootCategories,
    getCategoryChildren,
    
    // Utilities
    clearErrors,
    refreshData
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

// Custom hook to use product context
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

// Custom hooks for specific use cases
export const useProductSearch = () => {
  const { searchProducts, searchResults, loading, errors } = useProducts();
  
  return {
    searchProducts,
    results: ensureArray(searchResults),
    loading: loading.search,
    error: errors.search
  };
};

export const useProductCategories = () => {
  const { 
    categories, 
    rootCategories, 
    categoryTree, 
    selectedCategory,
    loadCategories,
    setSelectedCategory,
    getCategoryBySlug,
    getRootCategories,
    getCategoryChildren,
    loading,
    errors
  } = useProducts();
  
  return {
    categories: ensureArray(categories),
    rootCategories: ensureArray(rootCategories),
    categoryTree: ensureArray(categoryTree),
    selectedCategory,
    loadCategories,
    setSelectedCategory,
    getCategoryBySlug,
    getRootCategories,
    getCategoryChildren,
    loading: loading.categories,
    error: errors.categories
  };
};

export const useFeaturedProducts = () => {
  const { featuredProducts, loadFeaturedProducts, loading, errors } = useProducts();
  
  return {
    products: ensureArray(featuredProducts),
    loadProducts: loadFeaturedProducts,
    loading: loading.featuredProducts,
    error: errors.featuredProducts
  };
};

export default ProductContext;