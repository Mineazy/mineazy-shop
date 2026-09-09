// src/components/Products/ProductCard.jsx - Fixed for new backend API
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Eye, Award, Check, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import AddToCartButton from '../Cart/AddToCartButton';
import placeholderImage from '../../assets/prodduct-placeholder.webp';
import { normalizeImageList, normalizeImageUrl, createImageFallbackHandler, isLegacyUploadUrl } from '../../utils/imageUtils';

const ProductCard = ({ product, viewMode = 'grid', className = '' }) => {
  const { isInCart, getItemQuantity } = useCart();
  const [imageError, setImageError] = useState(false);

  // Helper functions to safely extract data from product object
  const getProductPrice = (product) => {
    // Handle different price structures from your API
    if (typeof product?.price === 'number') return product.price;
    if (product?.salePrice && typeof product.salePrice === 'number') return product.salePrice;
    if (product?.price?.regular_price) return product.price.regular_price;
    if (product?.price?.USD) return product.price.USD;
    if (product?.prices?.USD) return product.prices.USD;
    return 0;
  };

  const getOriginalPrice = (product) => {
    // Check if there's a sale price different from regular price
    if (product?.price?.sale_price && product.price.sale_price !== product.price?.regular_price) {
      return product.price.sale_price;
    }
    if (product?.originalPrice && product.originalPrice !== getProductPrice(product)) {
      return product.originalPrice;
    }
    return null;
  };

  const getProductStock = (product) => {
    return product?.stockQuantity || product?.stock || 0;
  };

  const getProductImages = (product) => {
    const chooseBestImages = (list) => {
      const normalized = normalizeImageList(list);
      const persistent = normalized.filter((image) => !isLegacyUploadUrl(image));
      return persistent.length > 0 ? persistent : normalized;
    };

    if (Array.isArray(product?.images) && product.images.length > 0) {
      return chooseBestImages(product.images);
    }
    if (product?.image && typeof product.image === 'string') {
      return [normalizeImageUrl(product.image)];
    }
    if (Array.isArray(product?.image)) {
      return normalizeImageList(product.image);
    }
    if (product?.featuredImage && typeof product.featuredImage === 'string') {
      return [normalizeImageUrl(product.featuredImage)];
    }
    return [placeholderImage];
  };

  const getProductRating = (product) => {
    if (product?.rating?.average) return product.rating.average;
    if (typeof product?.rating === 'number') return product.rating;
    return 4.8; // Default rating
  };

  const getProductReviewCount = (product) => {
    if (product?.rating?.count) return product.rating.count;
    if (product?.reviewCount) return product.reviewCount;
    return Math.floor(Math.random() * 50) + 5; // Random count for demo
  };

  const getCategoryName = (product) => {
    if (product?.category?.name) return product.category.name;
    if (typeof product?.category === 'string') return product.category;
    return 'Equipment';
  };

  const getProductName = (product) => {
    return product?.name || product?.title || 'Product Name';
  };

  const getProductDescription = (product) => {
    return product?.description || product?.desc || product?.shortDescription || '';
  };

  const getProductSKU = (product) => {
    return product?.sku || product?.productCode || 'N/A';
  };

  // Extract product data
  const images = getProductImages(product);
  const price = getProductPrice(product);
  const originalPrice = getOriginalPrice(product);
  const rating = getProductRating(product);
  const reviewCount = getProductReviewCount(product);
  const stock = getProductStock(product);
  const inCart = isInCart(product._id);
  const cartQuantity = getItemQuantity(product._id);
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;
  const isOnSale = originalPrice && originalPrice !== price;
  const isFeatured = product?.featured || product?.isFeatured;

  const handleImageError = createImageFallbackHandler(setImageError, null, placeholderImage);

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Implement quick view functionality
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Implement wishlist functionality
  };

  if (viewMode === 'list') {
    return (
      <div className={`group bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-500 ${className}`}>
        <div className="flex">
          {/* Image Section */}
          <div className="relative w-48 flex-shrink-0 bg-white self-stretch flex items-center justify-center p-3">
            <Link to={`/product/${product._id}`} className="flex items-center justify-center w-full h-full">
              <img
                src={imageError ? placeholderImage : images[0]}
                alt={getProductName(product)}
                className="max-w-full max-h-40 object-contain group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
                onError={handleImageError}
              />
            </Link>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {isFeatured && (
                <span className="bg-primary text-secondary text-xs px-3 py-1 rounded-full font-medium shadow-md">
                  Featured
                </span>
              )}
              {isOnSale && (
                <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-md">
                  Sale
                </span>
              )}
              {isLowStock && !isOutOfStock && (
                <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-md">
                  Low Stock
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button
                onClick={handleToggleWishlist}
                className="w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-110"
                aria-label="Add to wishlist"
              >
                <Heart className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleQuickView}
                className="w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-secondary transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-110"
                aria-label="Quick view"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              {/* Category & SKU */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-1 rounded-full">
                  {getCategoryName(product)}
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  {getProductSKU(product)}
                </span>
              </div>

              {/* Product Name */}
              <Link
                to={`/product/${product._id}`}
                className="block group-hover:text-secondary transition-colors duration-200"
              >
                <h3 className="font-semibold text-gray-900 mb-3 text-lg leading-tight line-clamp-2">
                  {getProductName(product)}
                </h3>
              </Link>

              {/* Description */}
              {getProductDescription(product) && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {getProductDescription(product)}
                </p>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 font-medium">{rating}</span>
                <span className="text-xs text-gray-400">({reviewCount} reviews)</span>
              </div>
            </div>

            {/* Price and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold text-gray-900">
                    ${price.toLocaleString()}
                  </span>
                  {originalPrice && (
                    <span className="text-lg text-gray-400 line-through">
                      ${originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {isOutOfStock ? (
                    <span className="text-red-600 font-medium">Out of stock</span>
                  ) : isLowStock ? (
                    <span className="text-orange-600 font-medium">{stock} left in stock</span>
                  ) : (
                    <span className="text-green-600 font-medium">In stock</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <AddToCartButton
                  product={product}
                  quantity={1}
                  size="medium"
                  variant={inCart ? "success" : "primary"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View (Default)
  return (
    <div className={`group bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 ${className}`}>
      {/* Image Section */}
      <div className="relative w-full h-52 bg-white flex items-center justify-center overflow-hidden p-3">
        <Link to={`/product/${product._id}`} className="flex items-center justify-center w-full h-full">
          <img
            src={imageError ? placeholderImage : images[0]}
            alt={getProductName(product)}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
            onError={handleImageError}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {isFeatured && (
            <span className="bg-primary text-secondary text-xs px-3 py-1 rounded-full font-medium shadow-md">
              Featured
            </span>
          )}
          {isOnSale && (
            <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-md">
              Sale
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-md">
              Low Stock
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={handleToggleWishlist}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-110"
            aria-label="Add to wishlist"
          >
            <Heart className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleQuickView}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-secondary transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-110"
            aria-label="Quick view"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Add to Cart - Only show on hover for grid view */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <AddToCartButton
            product={product}
            quantity={1}
            size="medium"
            variant={inCart ? "success" : "primary"}
            className="w-full"
          />
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Category & SKU */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-1 rounded-full">
            {getCategoryName(product)}
          </span>
          <span className="text-xs text-gray-500 font-mono">
            {getProductSKU(product)}
          </span>
        </div>

        {/* Product Name */}
        <Link
          to={`/product/${product._id}`}
          className="block group-hover:text-secondary transition-colors duration-200"
        >
          <h3 className="font-semibold text-gray-900 mb-3 text-lg leading-tight line-clamp-2 min-h-[3.5rem]">
            {getProductName(product)}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 font-medium ml-1">{rating}</span>
          </div>
          <span className="text-xs text-gray-400">({reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-gray-900">
                ${price.toLocaleString()}
              </span>
              {originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  ${originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Stock Status */}
          <div className="text-right">
            <div className={`text-xs font-medium ${
              isOutOfStock
                ? 'text-red-600' 
                : isLowStock 
                ? 'text-orange-600' 
                : 'text-green-600'
            }`}>
              {isOutOfStock ? 'Out of stock' : isLowStock ? `${stock} left` : 'In stock'}
            </div>
          </div>
        </div>

        {/* Premium Badge for high-value items */}
        {price > 50000 && (
          <div className="mt-3 flex items-center justify-center">
            <span className="bg-secondary/10 text-secondary text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
              <Award className="w-3 h-3" />
              Premium Equipment
            </span>
          </div>
        )}

        {/* Cart Status for Grid View */}
        {inCart && viewMode === 'grid' && (
          <div className="mt-3 flex items-center justify-center">
            <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
              <Check className="w-3 h-3" />
              {cartQuantity} in cart
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
