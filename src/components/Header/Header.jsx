// src/components/Header/Header.jsx - ENHANCED VERSION
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  User, 
  Menu, 
  X, 
  ChevronDown,
  ShoppingCart,
  LogOut,
  Package,
  Settings,
  Phone,
  Mail,
  Truck,
  Zap,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { productsAPI } from '../../services/api';
import logo from '../../assets/mineazy-logo.png';

const Header = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { getItemCount, summary } = useCart();
  
  // Categories state
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  
  const itemCount = getItemCount();

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
      if (response.data?.success && response.data?.data) {
        categoriesData = response.data.data;
      } else if (response.data?.categories) {
        categoriesData = response.data.categories;
      } else if (Array.isArray(response.data)) {
        categoriesData = response.data;
      }
      
      const validCategories = Array.isArray(categoriesData) 
        ? categoriesData.filter(cat => cat && cat.isActive !== false && !cat.parent)
        : [];
      
      setCategories(validCategories);
      
    } catch (error) {
      console.error('❌ Header: Failed to load categories:', error);
      setCategoriesError(error.response?.data?.message || error.message);
      
      const fallbackCategories = [
        { _id: '1', name: 'Mining Equipment', slug: 'mining-equipment', isActive: true },
        { _id: '2', name: 'Safety Equipment', slug: 'safety-equipment', isActive: true },
        { _id: '3', name: 'Processing Equipment', slug: 'processing-equipment', isActive: true },
        { _id: '4', name: 'Tools & Accessories', slug: 'tools-accessories', isActive: true }
      ];
      setCategories(fallbackCategories);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setIsProfileOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Handle search submission
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  }, [searchQuery]);
  
  // Handle user logout
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setIsProfileOpen(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout]);

  // Handle Branches link click (smooth scroll on home page)
  const handleBranchesClick = useCallback((e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('branch-locator');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  }, [location.pathname]);
  
  // Navigation items
  const navigation = useMemo(() => [
    { name: 'Home', href: '/', active: location.pathname === '/' },
    { name: 'Shop', href: '/shop', active: location.pathname === '/shop' },
    { name: 'About', href: '/about', active: location.pathname === '/about' },
    { name: 'Branches', href: '/#branch-locator', active: false },
    { name: 'Blog', href: '/blog', active: location.pathname === '/blog' },
    { name: 'Contact', href: '/contact', active: location.pathname === '/contact' },
  ], [location.pathname]);

  // Generate category link
  const getCategoryLink = useCallback((category) => {
    const categorySlug = category.slug || category.name?.toLowerCase().replace(/\s+/g, '-');
    return `/shop?category=${categorySlug}`;
  }, []);

  // Display categories (limit to 8)
  const displayCategories = useMemo(() => {
    try {
      let categoriesToDisplay = categories.filter(cat => {
        return cat && 
               cat._id && 
               cat.name && 
               typeof cat.name === 'string' && 
               cat.name.trim().length > 0 &&
               !cat.parent && 
               cat.isActive !== false;
      });
      return categoriesToDisplay.slice(0, 5);
    } catch (error) {
      console.error('Error processing categories:', error);
      return [];
    }
  }, [categories]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'header-scrolled' : ''
    }`}>
      {/* Top Bar with animated gradient */}
      <div className="header-top-gradient text-white text-sm overflow-hidden relative">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10 shimmer-effect"></div>
        
        <div className="container mx-auto px-4 md:px-6 py-2 md:py-3 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 hover:text-[#fcf250] transition-colors duration-200">
                <Phone className="w-4 h-4 icon-hover-scale" />
                <span className="font-medium">+263 712290 046</span>
              </div>
              <div className="hidden md:flex items-center space-x-2 hover:text-[#fcf250] transition-colors duration-200">
                <Mail className="w-4 h-4 icon-hover-scale" />
                <span className="font-medium">info@mineazy.co.zw</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20 transition-all">
                <Truck className="w-4 h-4 text-[#fcf250]" />
                <span className="font-medium">Free Shipping</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20 transition-all">
                <Zap className="w-4 h-4 text-[#fcf250]" />
                <span className="font-medium">Fast Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white border-b border-gray-200 relative">
        {/* Animated top border */}
        <div className="absolute top-0 left-0 right-0 h-1 animated-border"></div>
        
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-24">
            {/* Logo */}
            <Link to="/" className="logo-enhanced group relative flex-shrink-0">
              <img
                src={logo}
                alt="Mineazy Mining Solutions"
                className="h-10 md:h-16 w-auto"
              />
            </Link>

            {/* Enhanced Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-lg lg:max-w-2xl mx-4 lg:mx-8">
              <div className="search-bar-enhanced relative group">
                <input
                  type="text"
                  id="header-search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#fcf250] focus:border-[#0000fe] transition-all duration-200 bg-white text-gray-800 placeholder-gray-400 font-medium"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#0000fe] transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Enhanced Cart Icon */}
              <Link
                to="/cart"
                className="relative p-3 text-[#0000fe] hover:text-[#0000ce] transition-colors group"
                aria-label={`Cart ${itemCount > 0 ? `with ${itemCount} items` : 'is empty'}`}
              >
                <ShoppingCart className="w-6 h-6 icon-hover-scale" />
                
                {itemCount > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-[#fcf250] rounded-full animate-ping opacity-75"></span>
                    <span className="cart-badge-enhanced absolute -top-1 -right-1 w-6 h-6 text-[#0000fe] text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  </>
                )}
                
                <div className="dropdown-animated absolute top-full right-0 mt-2 px-4 py-3 bg-gradient-to-br from-[#0000fe] to-[#0000ce] text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-2xl">
                  {itemCount > 0 ? (
                    <div className="space-y-1">
                      <div className="font-bold text-[#fcf250]">
                        {itemCount} item{itemCount > 1 ? 's' : ''}
                      </div>
                      <div>${summary?.total?.USD?.toLocaleString() || '0'}</div>
                    </div>
                  ) : (
                    'Cart is empty'
                  )}
                  <div className="absolute -top-1 right-4 w-2 h-2 bg-[#0000fe] rotate-45"></div>
                </div>
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative dropdown-container">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-[#0000fe] to-[#0000ce] rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                      <span className="text-[#fcf250] font-bold text-sm">
                        {user?.firstName?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-[#0000fe] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isProfileOpen && (
                    <div className="dropdown-animated absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border-2 border-[#fcf250] py-2 z-50 overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1 animated-border"></div>
                      
                      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-br from-[#0000fe]/5 to-transparent">
                        <p className="font-bold text-[#0000fe]">{user?.firstName || user?.name || 'User'}</p>
                        <p className="text-sm text-gray-600">{user?.email}</p>
                      </div>
                      
                      <Link
                        to="/account"
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-[#fcf250]/10 transition-colors group"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="w-4 h-4 text-[#0000fe] icon-hover-scale" />
                        <span className="text-gray-700 group-hover:text-[#0000fe] font-medium">My Account</span>
                      </Link>
                      
                      <Link
                        to="/orders"
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-[#fcf250]/10 transition-colors group"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Package className="w-4 h-4 text-[#0000fe] icon-hover-scale" />
                        <span className="text-gray-700 group-hover:text-[#0000fe] font-medium">My Orders</span>
                      </Link>
                      
                      <Link
                        to="/account?tab=security"
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-[#fcf250]/10 transition-colors group"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="w-4 h-4 text-[#0000fe] icon-hover-scale" />
                        <span className="text-gray-700 group-hover:text-[#0000fe] font-medium">Settings</span>
                      </Link>
                      
                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors w-full text-left group"
                        >
                          <LogOut className="w-4 h-4 text-red-600 icon-hover-scale" />
                          <span className="text-red-600 font-medium">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2 md:space-x-3">
                  <Link
                    to="/login"
                    className="btn-primary-enhanced text-[#0000fe] px-3 py-1.5 md:px-6 md:py-2 rounded-lg font-bold text-sm md:text-base whitespace-nowrap"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="hidden lg:block text-[#0000fe] hover:text-[#0000ce] font-bold transition-colors text-sm md:text-base"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-[#0000fe] hover:bg-[#fcf250]/10 rounded-lg transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#0000fe]" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#fcf250] focus:border-[#0000fe] w-full text-[#0000ce] placeholder:text-gray-500"
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Navigation & Categories Bar */}
      <div className="bg-gradient-to-r from-[#0000fe] via-[#0000ce] to-[#0000fe]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="hidden lg:flex items-center justify-between py-4">
            <nav className="flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={item.name === 'Branches' ? handleBranchesClick : undefined}
                  className={`nav-item-enhanced px-6 py-2 rounded-lg font-bold transition-all duration-200 ${
                    item.active 
                      ? 'nav-active' 
                      : 'text-white hover:bg-white/10 hover:text-[#fcf250]'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Categories Quick Links */}
            <div className="flex items-center gap-1 min-w-0">
              <div className="flex items-center gap-1 overflow-hidden">
                {categoriesLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#fcf250]" />
                    <span className="text-sm text-white">Loading...</span>
                  </div>
                ) : categoriesError ? (
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <button
                      onClick={loadCategories}
                      className="text-sm text-red-300 hover:text-red-100 font-medium"
                    >
                      Retry
                    </button>
                  </div>
                ) : displayCategories.length > 0 ? (
                  displayCategories.map((category) => {
                    const categoryLink = getCategoryLink(category);
                    return (
                      <Link
                        key={category._id}
                        to={categoryLink}
                        className="category-badge px-4 py-2 text-sm text-white hover:text-[#fcf250] hover:bg-white/10 rounded-lg transition-all duration-200 font-bold whitespace-nowrap"
                      >
                        {category.name}
                      </Link>
                    );
                  })
                ) : null}
              </div>

              {displayCategories.length > 0 && (
                <Link
                  to="/shop"
                  className="btn-primary-enhanced flex-shrink-0 px-4 py-2 text-sm text-[#0000fe] rounded-lg font-bold whitespace-nowrap"
                >
                  View All →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu-animated lg:hidden bg-white border-t-4 border-[#fcf250] shadow-2xl">
          <div className="container mx-auto px-6 py-4">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block py-3 px-4 rounded-lg font-bold transition-all ${
                    item.active 
                      ? 'bg-gradient-to-r from-[#0000fe] to-[#0000ce] text-[#fcf250] shadow-lg' 
                      : 'text-[#0000fe] hover:bg-[#fcf250]/10'
                  }`}
                  onClick={item.name === 'Branches' ? handleBranchesClick : () => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="border-t-2 border-[#fcf250] pt-4 mt-4">
                <h3 className="font-bold text-[#0000fe] mb-3 px-4">Categories</h3>
                {displayCategories.map((category) => {
                  const categoryLink = getCategoryLink(category);
                  return (
                    <Link
                      key={category._id}
                      to={categoryLink}
                      className="block py-2 px-4 text-gray-700 hover:text-[#0000fe] hover:bg-[#fcf250]/10 rounded-lg transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  );
                })}
              </div>
              
              {!isAuthenticated && (
                <div className="border-t-2 border-[#fcf250] pt-4 mt-4 space-y-3">
                  <Link
                    to="/login"
                    className="block w-full text-center py-3 border-2 border-[#0000fe] text-[#0000fe] rounded-lg font-bold hover:bg-[#0000fe] hover:text-white transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full text-center py-3 btn-primary-enhanced text-[#0000fe] rounded-lg font-bold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
