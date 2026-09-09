import React, { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, Search } from 'lucide-react';
import { productsAPI } from '../../services/api';
import { useClickOutside } from '../../hooks';

const ProductFilters = ({ filters, onFiltersChange, onClearFilters }) => {
  const [categories, setCategories] = useState([]);
  const [priceRanges] = useState([
    { label: 'Under $1,000', min: 0, max: 1000 },
    { label: '$1,000 - $10,000', min: 1000, max: 10000 },
    { label: '$10,000 - $50,000', min: 10000, max: 50000 },
    { label: '$50,000 - $100,000', min: 50000, max: 100000 },
    { label: 'Over $100,000', min: 100000, max: null },
  ]);
  
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    features: false,
    brands: false,
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await productsAPI.getCategories();
        setCategories(response.data.data || []);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCategoryChange = (categorySlug) => {
    const newCategory = filters.category === categorySlug ? '' : categorySlug;
    onFiltersChange({ category: newCategory, subcategory: '' });
  };

  const handleSubcategoryChange = (subcategorySlug) => {
    const newSubcategory = filters.subcategory === subcategorySlug ? '' : subcategorySlug;
    onFiltersChange({ subcategory: newSubcategory });
  };

  const handlePriceRangeChange = (range) => {
    onFiltersChange({
      minPrice: range.min || '',
      maxPrice: range.max || ''
    });
  };

  const handleCustomPriceChange = (field, value) => {
    onFiltersChange({ [field]: value });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.subcategory) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.search) count++;
    return count;
  };

  const selectedCategory = categories.find(cat => 
    cat.slug === filters.category || 
    cat.name.toLowerCase().replace(/\s+/g, '-') === filters.category
  );

  return (
    <div className="bg-white rounded-xl shadow-md">
      {/* Filter Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-primary text-secondary text-xs px-2 py-1 rounded-full font-semibold">
                {getActiveFiltersCount()}
              </span>
            )}
          </div>
          <button
            onClick={onClearFilters}
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Search Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Search Products
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, SKU, or description..."
              value={filters.search || ''}
              onChange={(e) => onFiltersChange({ search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
            />
          </div>
        </div>

        {/* Categories */}
        <div>
          <button
            onClick={() => toggleSection('categories')}
            className="flex items-center justify-between w-full mb-3"
          >
            <h4 className="font-medium text-gray-900">Categories</h4>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${
              expandedSections.categories ? 'rotate-180' : ''
            }`} />
          </button>
          
          {expandedSections.categories && (
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
              {categories.map(category => (
                <div key={category._id}>
                  <label className="flex items-center group cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={filters.category === category.slug || 
                               filters.category === category.name.toLowerCase().replace(/\s+/g, '-')}
                      onChange={() => handleCategoryChange(category.slug || category.name.toLowerCase().replace(/\s+/g, '-'))}
                      className="w-4 h-4 text-primary border-gray-300 focus:ring-primary/50"
                    />
                    <span className="ml-2 text-sm text-gray-700 group-hover:text-primary transition-colors">
                      {category.name}
                    </span>
                    <span className="ml-auto text-xs text-gray-500">
                      ({category.productCount || 0})
                    </span>
                  </label>

                  {/* Subcategories */}
                  {selectedCategory?._id === category._id && category.subcategories && (
                    <div className="ml-6 mt-2 space-y-1">
                      {category.subcategories.map(subcategory => (
                        <label key={subcategory._id} className="flex items-center group cursor-pointer">
                          <input
                            type="radio"
                            name="subcategory"
                            checked={filters.subcategory === subcategory.slug}
                            onChange={() => handleSubcategoryChange(subcategory.slug)}
                            className="w-3 h-3 text-primary border-gray-300 focus:ring-primary/50"
                          />
                          <span className="ml-2 text-xs text-gray-600 group-hover:text-primary transition-colors">
                            {subcategory.name}
                          </span>
                          <span className="ml-auto text-xs text-gray-400">
                            ({subcategory.productCount || 0})
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price Range */}
        <div>
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full mb-3"
          >
            <h4 className="font-medium text-gray-900">Price Range</h4>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${
              expandedSections.price ? 'rotate-180' : ''
            }`} />
          </button>
          
          {expandedSections.price && (
            <div className="space-y-3">
              {/* Predefined Price Ranges */}
              <div className="space-y-2">
                {priceRanges.map((range, index) => (
                  <label key={index} className="flex items-center group cursor-pointer">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={
                        filters.minPrice == range.min && 
                        (filters.maxPrice == range.max || (!range.max && !filters.maxPrice))
                      }
                      onChange={() => handlePriceRangeChange(range)}
                      className="w-4 h-4 text-primary border-gray-300 focus:ring-primary/50"
                    />
                    <span className="ml-2 text-sm text-gray-700 group-hover:text-primary transition-colors">
                      {range.label}
                    </span>
                  </label>
                ))}
              </div>

              {/* Custom Price Range */}
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Custom Range (USD)</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice || ''}
                    onChange={(e) => handleCustomPriceChange('minPrice', e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handleCustomPriceChange('maxPrice', e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stock Status */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Availability</h4>
          <div className="space-y-2">
            <label className="flex items-center group cursor-pointer">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => onFiltersChange({ inStock: e.target.checked })}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/50"
              />
              <span className="ml-2 text-sm text-gray-700 group-hover:text-primary transition-colors">
                In Stock Only
              </span>
            </label>
            
            <label className="flex items-center group cursor-pointer">
              <input
                type="checkbox"
                checked={filters.isFeatured}
                onChange={(e) => onFiltersChange({ isFeatured: e.target.checked })}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/50"
              />
              <span className="ml-2 text-sm text-gray-700 group-hover:text-primary transition-colors">
                Featured Products
              </span>
            </label>
          </div>
        </div>

        {/* Active Filters Summary */}
        {getActiveFiltersCount() > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Active Filters</h4>
            <div className="flex flex-wrap gap-2">
              {filters.category && (
                <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  Category: {filters.category}
                  <button
                    onClick={() => onFiltersChange({ category: '', subcategory: '' })}
                    className="ml-1 hover:text-primary/80"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              
              {filters.subcategory && (
                <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  Subcategory: {filters.subcategory}
                  <button
                    onClick={() => onFiltersChange({ subcategory: '' })}
                    className="ml-1 hover:text-primary/80"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              
              {(filters.minPrice || filters.maxPrice) && (
                <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  Price: ${filters.minPrice || '0'} - ${filters.maxPrice || '∞'}
                  <button
                    onClick={() => onFiltersChange({ minPrice: '', maxPrice: '' })}
                    className="ml-1 hover:text-primary/80"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              
              {filters.search && (
                <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  Search: "{filters.search}"
                  <button
                    onClick={() => onFiltersChange({ search: '' })}
                    className="ml-1 hover:text-primary/80"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductFilters;