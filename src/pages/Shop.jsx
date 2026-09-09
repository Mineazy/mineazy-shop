// src/pages/Shop.jsx - Fixed pagination version
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, Grid, List, Search, Sparkles, Loader2, AlertTriangle, X } from 'lucide-react';
import { productsAPI } from '../services/api';
import { ProductSkeleton } from '../components/Common/Loading';
import ProductCard from '../components/Products/ProductCard';
import Seo from '../components/Common/Seo';
import aboutBanner from '../assets/about-us-banner-mineazy.webp';

const Shop = () => {
  // Hooks and State
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Main state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNext: false,
    hasPrev: false
  });
  const [errors, setErrors] = useState({
    products: null,
    categories: null
  });
  const [loading, setLoading] = useState({
    products: false,
    categories: false
  });
  
  // Filters state - Initialize from URL params
  const [filters, setFilters] = useState(() => {
    const initialFilters = {
      category: searchParams.get('category') || '',
      search: searchParams.get('search') || searchParams.get('q') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      sortBy: searchParams.get('sortBy') || 'name',
      sortOrder: searchParams.get('sortOrder') || 'asc',
      page: parseInt(searchParams.get('page')) || 1,
      limit: 20,
      inStock: true
    };
    
    return initialFilters;
  });
  
  // Refs
  const initialLoadDone = useRef(false);
  const lastLoadedFilters = useRef({});
  const loadingRef = useRef(false);
  
  const findCategoryByIdentifier = useCallback((identifier) => {
    if (!identifier || !categories.length) return null;
    
    const searchTerm = identifier.toLowerCase();
    
    let category = categories.find(cat => 
      cat.slug && cat.slug.toLowerCase() === searchTerm
    );
    
    if (!category) {
      category = categories.find(cat => 
        cat.name && cat.name.toLowerCase() === searchTerm
      );
    }
    
    if (!category) {
      category = categories.find(cat => 
        cat.name && cat.name.toLowerCase().replace(/\s+/g, '-') === searchTerm
      );
    }
    
    if (!category) {
      category = categories.find(cat => 
        cat.slug && cat.slug.replace(/-/g, ' ').toLowerCase() === searchTerm
      );
    }
    
    if (!category) {
      category = categories.find(cat => 
        cat.name && cat.name.toLowerCase().includes(searchTerm)
      );
    }
    
    return category;
  }, [categories]);

  const getCategoryDisplayName = useCallback(() => {
    if (!filters.category) return 'All Products';
    
    const matchedCategory = findCategoryByIdentifier(filters.category);
    if (matchedCategory) {
      return matchedCategory.name;
    }
    
    return filters.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }, [filters.category, findCategoryByIdentifier]);

  const getRootCategories = useCallback(() => {
    return categories.filter(cat => !cat.parent && cat.isActive !== false);
  }, [categories]);
  
  const categoryDisplayName = getCategoryDisplayName();
  const rootCategories = getRootCategories();
  const isLoading = loading.products || loading.categories;
  const hasError = errors.products || errors.categories;
  
  // Constants
  const sortOptions = useMemo(() => [
    { value: 'name', label: 'Name A-Z' },
    { value: '-name', label: 'Name Z-A' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: '-createdAt', label: 'Newest First' },
    { value: 'createdAt', label: 'Oldest First' }
  ], []);

  const priceRanges = useMemo(() => [
    { label: 'Under $1,000', min: 0, max: 1000 },
    { label: '$1,000 - $10,000', min: 1000, max: 10000 },
    { label: '$10,000 - $50,000', min: 10000, max: 50000 },
    { label: '$50,000 - $100,000', min: 50000, max: 100000 },
    { label: 'Over $100,000', min: 100000, max: null },
  ], []);

  // ============================================
  // DATA LOADING FUNCTIONS
  // ============================================
  
  const loadCategories = async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      setErrors(prev => ({ ...prev, categories: null }));
      
      const response = await productsAPI.getCategories();
      
      let categoriesData = [];
      
      if (response.data?.success && response.data?.data) {
        categoriesData = response.data.data;
      } else if (response.data?.categories) {
        categoriesData = response.data.categories;
      } else if (Array.isArray(response.data)) {
        categoriesData = response.data;
      }
      
      const validCategories = Array.isArray(categoriesData) 
        ? categoriesData.filter(cat => cat && cat.isActive !== false)
        : [];
      
      setCategories(validCategories);
      
    } catch (error) {
      console.error('❌ Failed to load categories:', error);
      setErrors(prev => ({ 
        ...prev, 
        categories: error.response?.data?.message || error.message || 'Failed to load categories' 
      }));
      
      const fallbackCategories = [
        { _id: '1', name: 'Mining Equipment', slug: 'mining-equipment', isActive: true },
        { _id: '2', name: 'Safety Equipment', slug: 'safety-equipment', isActive: true },
        { _id: '3', name: 'Processing Equipment', slug: 'processing-equipment', isActive: true },
        { _id: '4', name: 'Tools & Accessories', slug: 'tools-accessories', isActive: true },
        { _id: '5', name: 'Spare Parts', slug: 'spare-parts', isActive: true }
      ];
      setCategories(fallbackCategories);
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const loadProducts = useCallback(async (productFilters = filters) => {
    // Prevent duplicate simultaneous loads
    if (loadingRef.current) {
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(prev => ({ ...prev, products: true }));
      setErrors(prev => ({ ...prev, products: null }));
      
      
      const apiParams = {
        page: productFilters.page || 1,
        limit: productFilters.limit || 20
      };

      if (productFilters.sortBy) {
        apiParams.sortBy = productFilters.sortBy;
        if (productFilters.sortOrder) {
          apiParams.sortOrder = productFilters.sortOrder;
        }
      }

      if (productFilters.category && productFilters.category.trim()) {
        const categoryIdentifier = productFilters.category.trim();
        
        const matchedCategory = findCategoryByIdentifier(categoryIdentifier);
        
        if (matchedCategory) {
          apiParams.category = matchedCategory._id;
          if (matchedCategory.slug) {
            apiParams.categorySlug = matchedCategory.slug;
          }
        } else {
          apiParams.category = categoryIdentifier;
        }
      }

      if (productFilters.search && productFilters.search.trim()) {
        apiParams.search = productFilters.search.trim();
      }

      if (productFilters.minPrice) {
        apiParams.minPrice = parseFloat(productFilters.minPrice);
      }
      if (productFilters.maxPrice) {
        apiParams.maxPrice = parseFloat(productFilters.maxPrice);
      }

      if (productFilters.inStock !== undefined) {
        apiParams.inStock = productFilters.inStock;
      }

      const response = await productsAPI.getAll(apiParams);
      
      let productsData = [];
      let paginationData = null;
      
      if (response.data?.success && response.data?.data) {
        if (Array.isArray(response.data.data)) {
          productsData = response.data.data;
        } else if (response.data.data.products) {
          productsData = response.data.data.products;
          paginationData = response.data.data.pagination;
        }
      } else if (response.data?.products) {
        productsData = response.data.products;
        paginationData = response.data.pagination;
      } else if (Array.isArray(response.data)) {
        productsData = response.data;
      }
      
      const validProducts = Array.isArray(productsData) ? productsData : [];
      
      
      setProducts(validProducts);
      
      if (paginationData) {
        setPagination({
          currentPage: paginationData.page || paginationData.currentPage || apiParams.page,
          totalPages: paginationData.pages || paginationData.totalPages || 1,
          totalProducts: paginationData.total || paginationData.totalProducts || validProducts.length,
          hasNext: paginationData.hasNext || (paginationData.page < paginationData.pages),
          hasPrev: paginationData.hasPrev || (paginationData.page > 1)
        });
      } else {
        setPagination({
          currentPage: apiParams.page,
          totalPages: Math.ceil(validProducts.length / apiParams.limit),
          totalProducts: validProducts.length,
          hasNext: validProducts.length === apiParams.limit,
          hasPrev: apiParams.page > 1
        });
      }
      
      lastLoadedFilters.current = { ...productFilters };
      
    } catch (error) {
      console.error('❌ Failed to load products:', error);
      setErrors(prev => ({ 
        ...prev, 
        products: error.response?.data?.message || error.message || 'Failed to load products' 
      }));
      setProducts([]);
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
      loadingRef.current = false;
    }
  }, [findCategoryByIdentifier]);

  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  const handleFilterChange = useCallback((newFilters) => {
    
    // Reset to page 1 when filters change (except when page itself is changing)
    const updatedFilters = { 
      ...filters, 
      ...newFilters,
      page: newFilters.page || 1 
    };
    
    setFilters(updatedFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.keys(updatedFilters).forEach(key => {
      if (updatedFilters[key] && updatedFilters[key] !== '' && key !== 'limit' && key !== 'inStock') {
        params.set(key, updatedFilters[key]);
      }
    });
    
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const handleCategoryChange = useCallback((categoryValue) => {
    handleFilterChange({ category: categoryValue, page: 1 });
  }, [handleFilterChange]);

  const handlePageChange = useCallback((page) => {
    
    // Validate page number
    if (page < 1 || page > pagination.totalPages) {
      console.warn('⚠️ Invalid page number:', page);
      return;
    }
    
    // SIMPLE: Directly update URL params with new page
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    
    setSearchParams(newParams, { replace: true });
    
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pagination.totalPages, searchParams, setSearchParams]);

  const handleClearFilters = useCallback(() => {
    const defaultFilters = {
      category: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'name',
      sortOrder: 'asc',
      page: 1,
      limit: 20,
      inStock: true
    };
    setFilters(defaultFilters);
    setSearchParams({}, { replace: true });
    lastLoadedFilters.current = {};
  }, [setSearchParams]);

  const handlePriceRangeChange = useCallback((range) => {
    handleFilterChange({
      minPrice: range.min || '',
      maxPrice: range.max || '',
      page: 1
    });
  }, [handleFilterChange]);

  // ============================================
  // EFFECTS
  // ============================================
  
  useEffect(() => {
    loadCategories();
  }, []);

  // Sync filters from URL params - SIMPLIFIED
  useEffect(() => {
    const urlCategory = searchParams.get('category') || '';
    const urlSearch = searchParams.get('search') || searchParams.get('q') || '';
    const urlMinPrice = searchParams.get('minPrice') || '';
    const urlMaxPrice = searchParams.get('maxPrice') || '';
    const urlSortBy = searchParams.get('sortBy') || 'name';
    const urlSortOrder = searchParams.get('sortOrder') || 'asc';
    const urlPage = parseInt(searchParams.get('page')) || 1;
    
    
    const newFilters = {
      category: urlCategory,
      search: urlSearch,
      minPrice: urlMinPrice,
      maxPrice: urlMaxPrice,
      sortBy: urlSortBy,
      sortOrder: urlSortOrder,
      page: urlPage,
      limit: 20,
      inStock: true
    };
    
    // Check if any filter actually changed
    const hasChanged = Object.keys(newFilters).some(key => 
      String(newFilters[key]) !== String(filters[key])
    );
    
    if (hasChanged) {
      setFilters(newFilters);
    }
  }, [searchParams]); // Remove filters from dependencies

  // Load products when filters change
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      return;
    }

    // Check if filters actually changed
    const hasChanged = Object.keys(filters).some(key => 
      filters[key] !== lastLoadedFilters.current[key]
    );
    
    if (hasChanged && categories.length > 0 && !loadingRef.current) {
      
      // Small delay to debounce rapid filter changes
      const timeoutId = setTimeout(() => {
        loadProducts(filters);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [filters, categories, loadProducts]);

  // Initial load after categories are loaded
  useEffect(() => {
    if (!initialLoadDone.current && categories.length > 0) {
      loadProducts(filters);
      initialLoadDone.current = true;
    }
  }, [categories, filters, loadProducts]);
  
  const seoTitle = categoryDisplayName !== 'All Products' ? `${categoryDisplayName} | Mining Equipment` : 'Shop Mining Equipment Zimbabwe';
  const seoDescription = `Browse ${pagination.totalProducts || products.length} premium mining equipment products${filters.category ? ` in ${categoryDisplayName}` : ''}. Quality mining supplies with nationwide delivery in Zimbabwe.`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Seo
        title={seoTitle}
        description={seoDescription}
        keywords={`mining equipment, ${categoryDisplayName.toLowerCase()}, mining supplies Zimbabwe, industrial machinery`}
        canonicalUrl={window.location.href}
        ogType="website"
      />

      {/* Enhanced Hero Section */}
      <section className="relative pt-32 lg:pt-40 pb-20 bg-secondary text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${aboutBanner})` }}></div>
          <div className="absolute inset-0 bg-secondary/80"></div>
        </div>
        
        <div className="relative container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Premium Mining Equipment</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-medium mb-6 leading-tight">
            {categoryDisplayName}
            <span className="block text-primary">Collection</span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Discover premium mining equipment, safety solutions, and industrial machinery from the world's most trusted manufacturers.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Shop Header */}
        <div className="bg-white rounded-xl shadow-md border p-4 md:p-8 mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6">
            <div>
              <h2 className="text-xl md:text-3xl font-medium text-gray-900 mb-1 md:mb-2">{categoryDisplayName}</h2>
              <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm text-gray-600">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading products...</span>
                  </div>
                ) : (
                  <>
                    <span className="font-medium">{pagination.totalProducts || products.length} products</span>
                    <span className="text-gray-400 hidden sm:inline">•</span>
                    <span className="hidden sm:inline">Page {pagination.currentPage} of {pagination.totalPages}</span>
                    {filters.category && (
                      <span className="hidden sm:inline">in {categoryDisplayName}</span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Controls row — fits on one line on mobile */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1 border">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 md:p-3 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid' ? 'bg-white text-secondary shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 md:p-3 rounded-lg transition-all duration-200 ${
                    viewMode === 'list' ? 'bg-white text-secondary shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value, page: 1 })}
                disabled={isLoading}
                className="border border-gray-200 rounded-lg px-2 py-2 md:px-4 md:py-3 bg-white focus:ring-2 focus:ring-secondary/50 focus:border-secondary shadow-sm font-medium text-gray-700 disabled:opacity-50 text-sm md:text-base flex-1 min-w-0"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden bg-secondary hover:bg-secondary/90 text-white px-3 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-all flex items-center gap-1 md:gap-2 text-sm md:text-base whitespace-nowrap"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {Object.entries(filters).filter(([key, value]) =>
                  value && value !== '' && key !== 'page' && key !== 'limit' && key !== 'sortBy' && key !== 'sortOrder' && key !== 'inStock'
                ).length > 0 && (
                  <span className="bg-primary text-secondary text-xs px-1.5 py-0.5 rounded-full font-bold">
                    {Object.entries(filters).filter(([key, value]) =>
                      value && value !== '' && key !== 'page' && key !== 'limit' && key !== 'sortBy' && key !== 'sortOrder' && key !== 'inStock'
                    ).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Enhanced Search Bar */}
          <div className="mt-8">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search for mining equipment, parts, and solutions..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange({ search: e.target.value, page: 1 })}
                className="w-full pl-12 pr-6 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary bg-white shadow-sm text-lg font-medium"
              />
              {filters.search && (
                <button
                  onClick={() => handleFilterChange({ search: '', page: 1 })}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:w-80 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-md border p-4 md:p-8 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-medium text-gray-900">Filters</h3>
                <button
                  onClick={handleClearFilters}
                  disabled={isLoading}
                  className="text-sm font-medium text-secondary hover:text-secondary/80 bg-secondary/10 hover:bg-secondary/20 px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
                >
                  Clear All
                </button>
              </div>

              {/* Categories Filter */}
              <div className="mb-8">
                <h4 className="font-medium text-gray-900 mb-4 text-lg">Categories</h4>
                {loading.categories ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-6 bg-gray-200 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : errors.categories ? (
                  <div className="text-center py-4">
                    <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-red-600 mb-2">Failed to load categories</p>
                    <button 
                      onClick={loadCategories} 
                      className="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="flex items-center group cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value=""
                        checked={filters.category === ''}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-5 h-5 text-secondary border-gray-300 focus:ring-secondary/50"
                      />
                      <span className="ml-3 text-gray-700 font-medium group-hover:text-secondary transition-colors">All Categories</span>
                      <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {products.length}
                      </span>
                    </label>
                    {rootCategories.map(category => {
                      const categorySlug = category.slug || category.name?.toLowerCase().replace(/\s+/g, '-');
                      const isSelected = filters.category === categorySlug || 
                                       filters.category === category._id || 
                                       filters.category === category.name?.toLowerCase();
                      
                      return (
                        <label key={category._id} className="flex items-center justify-between group cursor-pointer">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="category"
                              value={categorySlug}
                              checked={isSelected}
                              onChange={(e) => handleCategoryChange(e.target.value)}
                              className="w-5 h-5 text-secondary border-gray-300 focus:ring-secondary/50"
                            />
                            <span className={`ml-3 font-medium group-hover:text-secondary transition-colors ${
                              isSelected ? 'text-secondary' : 'text-gray-700'
                            }`}>
                              {category.name}
                            </span>
                          </div>
                          {category.productCount > 0 && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {category.productCount}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Active Filters Display */}
              {filters.category && (
                <div className="mb-6 p-3 bg-secondary/5 border border-secondary/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-secondary">
                      Filtering by: {categoryDisplayName}
                    </span>
                    <button
                      onClick={() => handleCategoryChange('')}
                      className="text-secondary hover:text-secondary/80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Price Range Filter */}
              <div className="mb-8">
                <h4 className="font-medium text-gray-900 mb-4 text-lg">Price Range (USD)</h4>
                <div className="space-y-3 mb-4">
                  {priceRanges.map((range, index) => (
                    <label key={index} className="flex items-center group cursor-pointer">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={filters.minPrice == range.min && (filters.maxPrice == range.max || (!range.max && !filters.maxPrice))}
                        onChange={() => handlePriceRangeChange(range)}
                        className="w-4 h-4 text-secondary border-gray-300 focus:ring-secondary/50"
                      />
                      <span className="ml-3 text-sm text-gray-700 group-hover:text-secondary transition-colors">{range.label}</span>
                    </label>
                  ))}
                </div>

                {/* Custom Price Range */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">Custom Range</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Min Price</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={filters.minPrice || ''}
                        onChange={(e) => handleFilterChange({ minPrice: e.target.value, page: 1 })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Max Price</label>
                      <input
                        type="number"
                        placeholder="∞"
                        value={filters.maxPrice || ''}
                        onChange={(e) => handleFilterChange({ maxPrice: e.target.value, page: 1 })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {hasError ? (
              <div className="text-center py-20">
                <div className="bg-red-50 border border-red-200 rounded-xl p-12 max-w-md mx-auto">
                  <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-red-900 mb-3">Failed to Load Products</h3>
                  <p className="text-red-700 mb-6">{hasError}</p>
                  <div className="space-y-3">
                    <button 
                      onClick={() => loadProducts()} 
                      className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                    >
                      Try Again
                    </button>
                    <button 
                      onClick={handleClearFilters} 
                      className="w-full bg-white border border-red-300 text-red-700 px-6 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors"
                    >
                      Clear Filters & Retry
                    </button>
                  </div>
                </div>
              </div>
            ) : loading.products && products.length === 0 ? (
              <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {[...Array(6)].map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 max-w-md mx-auto">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-3">No Products Found</h3>
                  <p className="text-gray-600 mb-6">
                    {filters.search 
                      ? `No products match your search "${filters.search}"`
                      : filters.category 
                      ? `No products found in "${categoryDisplayName}" category`
                      : 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                    }
                  </p>
                  <div className="space-y-3">
                    <button 
                      onClick={handleClearFilters} 
                      className="w-full bg-secondary hover:bg-secondary/90 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                    >
                      Clear All Filters
                    </button>
                    <Link 
                      to="/shop" 
                      className="block w-full bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      View All Products
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Products Grid/List */}
                <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8' : 'space-y-8'}`}>
                  {products.map((product, index) => (
                    <ProductCard 
                      key={`${product._id}-${index}`}
                      product={product} 
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-12 flex justify-center px-2">
                    <div className="bg-white rounded-xl shadow-md border p-3 md:p-6 w-full max-w-full">
                      <div className="flex items-center justify-center gap-1 md:gap-3 flex-wrap">
                        <button
                          onClick={() => handlePageChange(pagination.currentPage - 1)}
                          disabled={pagination.currentPage <= 1 || isLoading}
                          className="px-3 md:px-6 py-2 md:py-3 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200 font-medium text-sm md:text-base"
                        >
                          Prev
                        </button>

                        {/* Page numbers — show fewer on mobile */}
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          let pageNum;
                          if (pagination.totalPages <= 5) {
                            pageNum = i + 1;
                          } else {
                            if (pagination.currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (pagination.currentPage >= pagination.totalPages - 2) {
                              pageNum = pagination.totalPages - 4 + i;
                            } else {
                              pageNum = pagination.currentPage - 2 + i;
                            }
                          }

                          if (pageNum < 1 || pageNum > pagination.totalPages) return null;

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              disabled={isLoading}
                              className={`w-9 h-9 md:w-11 md:h-11 rounded-lg font-medium transition-all duration-200 text-sm md:text-base ${
                                pagination.currentPage === pageNum
                                  ? 'bg-secondary text-white shadow-md'
                                  : 'border border-gray-200 hover:bg-gray-50 disabled:opacity-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}

                        <button
                          onClick={() => handlePageChange(pagination.currentPage + 1)}
                          disabled={pagination.currentPage >= pagination.totalPages || isLoading}
                          className="px-3 md:px-6 py-2 md:py-3 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200 font-medium text-sm md:text-base"
                        >
                          Next
                        </button>
                      </div>

                      <div className="mt-3 text-center text-xs md:text-sm text-gray-600">
                        Showing {((pagination.currentPage - 1) * filters.limit) + 1}–{Math.min(pagination.currentPage * filters.limit, pagination.totalProducts)} of {pagination.totalProducts} products
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;