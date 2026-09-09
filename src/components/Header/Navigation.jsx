import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useClickOutside } from '../../hooks';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  const dropdownRef = useClickOutside(() => setActiveDropdown(null));

  const navigationItems = [
    {
      label: 'Home',
      path: '/',
    },
    {
      label: 'Shop',
      path: '/shop',
      dropdown: [
        { label: 'All Products', path: '/shop' },
        { label: 'Mining Equipment', path: '/shop?category=mining-equipment' },
        { label: 'Safety Equipment', path: '/shop?category=safety-equipment' },
        { label: 'Processing Equipment', path: '/shop?category=processing-equipment' },
        { label: 'Tools & Accessories', path: '/shop?category=tools-accessories' },
        { label: 'Spare Parts', path: '/shop?category=spare-parts' },
      ],
    },
    {
      label: 'About',
      path: '/about',
    },
    {
      label: 'Branches',
      path: '/#branch-locator',
    },
    {
      label: 'Blog',
      path: '/blog',
    },
    {
      label: 'Contact',
      path: '/contact',
    },
  ];

  const isActiveLink = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleDropdownToggle = (label) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  const handleBranchesClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('branch-locator');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      closeMobileMenu();
    }
  };

  return (
    <nav className="relative">
      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center space-x-8" ref={dropdownRef}>
        {navigationItems.map((item) => (
          <div key={item.label} className="relative">
            {item.dropdown ? (
              <div>
                <button
                  onClick={() => handleDropdownToggle(item.label)}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                    isActiveLink(item.path)
                      ? 'text-primary bg-secondary shadow-md transform scale-105'
                      : 'text-gray-700 hover:text-primary hover:bg-secondary/10'
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                    activeDropdown === item.label ? 'rotate-180' : ''
                  }`} />
                </button>

                {activeDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-elegant border border-gray-200 z-50 overflow-hidden">
                    {item.dropdown.map((dropdownItem) => (
                      <Link
                        key={dropdownItem.path}
                        to={dropdownItem.path}
                        onClick={() => setActiveDropdown(null)}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-secondary hover:text-primary transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                      >
                        {dropdownItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                to={item.path}
                onClick={item.label === 'Branches' ? handleBranchesClick : undefined}
                className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                  isActiveLink(item.path)
                    ? 'text-primary bg-secondary shadow-md transform scale-105'
                    : 'text-gray-700 hover:text-primary hover:bg-secondary/10'
                }`}
              >
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        aria-label="Toggle mobile menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-elegant border border-gray-200 z-50 lg:hidden">
          <div className="p-4 space-y-2">
            {navigationItems.map((item) => (
              <div key={item.label}>
                {item.dropdown ? (
                  <div>
                    <button
                      onClick={() => handleDropdownToggle(item.label)}
                      className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 font-medium ${
                        isActiveLink(item.path)
                          ? 'text-primary bg-secondary shadow-md'
                          : 'text-gray-700 hover:bg-secondary/10'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                        activeDropdown === item.label ? 'rotate-180' : ''
                      }`} />
                    </button>

                    {activeDropdown === item.label && (
                      <div className="mt-2 pl-4 space-y-1">
                        {item.dropdown.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.path}
                            to={dropdownItem.path}
                            onClick={closeMobileMenu}
                            className="block px-3 py-2 text-sm text-gray-600 hover:text-primary hover:bg-secondary/10 rounded-lg transition-colors duration-200"
                          >
                            {dropdownItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    onClick={item.label === 'Branches' ? handleBranchesClick : closeMobileMenu}
                    className={`block px-3 py-3 rounded-lg transition-all duration-200 font-medium ${
                      isActiveLink(item.path)
                        ? 'text-primary bg-secondary shadow-md'
                        : 'text-gray-700 hover:bg-secondary/10'
                    }`}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;