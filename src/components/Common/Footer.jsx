// src/components/Common/Footer.jsx - Updated with dynamic categories
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube, ArrowUp, Loader2, AlertTriangle } from 'lucide-react';
import { productsAPI } from '../../services/api';

const Footer = () => {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);
      
      const response = await productsAPI.getCategories();
      
      let categoriesData = [];
      
      // Handle different response structures
      if (response.data?.success && response.data?.data) {
        categoriesData = response.data.data;
      } else if (response.data?.categories) {
        categoriesData = response.data.categories;
      } else if (Array.isArray(response.data)) {
        categoriesData = response.data;
      }
      
      // Filter active categories without parent (root categories only)
      const validCategories = Array.isArray(categoriesData) 
        ? categoriesData.filter(cat => cat && cat.isActive !== false && !cat.parent)
        : [];
      
      setCategories(validCategories);
      
    } catch (error) {
      console.error('❌ Footer: Failed to load categories:', error);
      setCategoriesError(error.response?.data?.message || error.message || 'Failed to load categories');
      
      // Fallback categories for better UX
      const fallbackCategories = [
        { _id: '1', name: 'Mining Equipment', slug: 'mining-equipment', isActive: true },
        { _id: '2', name: 'Safety Equipment', slug: 'safety-equipment', isActive: true },
        { _id: '3', name: 'Processing Equipment', slug: 'processing-equipment', isActive: true },
        { _id: '4', name: 'Tools & Accessories', slug: 'tools-accessories', isActive: true },
        { _id: '5', name: 'Spare Parts', slug: 'spare-parts', isActive: true }
      ];
      setCategories(fallbackCategories);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Generate category link with proper slug handling
  const getCategoryLink = (category) => {
    const categorySlug = category.slug || category.name?.toLowerCase().replace(/\s+/g, '-');
    return `/shop?category=${categorySlug}`;
  };

  // Display categories (limit to 6 for footer)
  const displayCategories = categories.slice(0, 6);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-secondary text-white relative">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-secondary font-bold text-lg">MMS</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Mineazy</h3>
                <p className="text-sm text-gray-300">Mining Solutions</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Delivering innovative solutions and sustainable growth in mining equipment, 
              agricultural, and industrial solutions across Zimbabwe and beyond.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-primary transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-gray-300 hover:text-primary transition-colors text-sm">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-primary transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/#branch-locator" className="text-gray-300 hover:text-primary transition-colors text-sm">
                  Branches
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-primary transition-colors text-sm">
                  News & Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-primary transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Dynamic Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Categories</h3>
            
            {categoriesLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-gray-300">Loading...</span>
              </div>
            ) : categoriesError ? (
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-red-300">Failed to load categories</span>
                </div>
                <button 
                  onClick={loadCategories}
                  className="text-xs text-primary hover:text-primary/80 font-medium underline"
                >
                  Retry
                </button>
              </div>
            ) : displayCategories.length > 0 ? (
              <ul className="space-y-2">
                {displayCategories.map(category => {
                  const categoryLink = getCategoryLink(category);
                  return (
                    <li key={category._id}>
                      <Link
                        to={categoryLink}
                        className="text-gray-300 hover:text-primary transition-colors text-sm flex items-center justify-between group"
                        onClick={() => {
                        }}
                      >
                        <span>{category.name}</span>
                        {category.productCount > 0 && (
                          <span className="text-xs text-gray-500 group-hover:text-primary">
                            ({category.productCount})
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
                {categories.length > 6 && (
                  <li>
                    <Link
                      to="/shop"
                      className="text-primary hover:text-primary/80 transition-colors text-sm font-semibold"
                    >
                      View All Categories →
                    </Link>
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No categories available</p>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-gray-300">+263 712 290 046</p>
                  <p className="text-gray-300">+263 29 226 5103</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <a
                  href="mailto:enquiries@mineazy.co.zw"
                  className="text-gray-300 hover:text-primary transition-colors text-sm"
                >
                  enquiries@mineazy.co.zw
                </a>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-300">
                  <p>15 Plumtree Road, Belmont</p>
                  <p>Bulawayo, Zimbabwe</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-600">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-300">
              © 2025 Mineazy Mining Solutions. All rights reserved.
            </p>
            <div className="flex items-center space-x-1 mt-2 md:mt-0">
              <Link 
                to="/privacy" 
                className="px-3 py-1.5 text-sm text-gray-300 hover:text-primary hover:bg-white/10 rounded-lg transition-all duration-200 font-medium"
              >
                Privacy Policy
              </Link>
              <span className="text-gray-500">•</span>
              <Link 
                to="/terms" 
                className="px-3 py-1.5 text-sm text-gray-300 hover:text-primary hover:bg-white/10 rounded-lg transition-all duration-200 font-medium"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="absolute -top-6 right-6 w-12 h-12 bg-primary text-secondary rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 flex items-center justify-center hover:scale-110"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </footer>
  );
};

export default Footer;
