// src/pages/ProductDetail.jsx - Fixed for new backend API
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Share2, Truck, Shield, Award, ChevronLeft, ChevronRight, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import Loading from '../components/Common/Loading';
import { ErrorMessage } from '../components/Common/ErrorBoundary';
import AddToCartButton from '../components/Cart/AddToCartButton';
import Seo, { ProductJsonLd, BreadcrumbJsonLd } from '../components/Common/Seo';
import aboutBanner from '../assets/about-us-banner-mineazy.webp';
import placeholderImage from '../assets/prodduct-placeholder.webp';
import { normalizeImageList, normalizeImageUrl, createImageFallbackHandler, isLegacyUploadUrl } from '../utils/imageUtils';

const ProductDetail = () => {
  const { id } = useParams();
  const { isInCart, getItemQuantity } = useCart();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productsAPI.getById(id);
      
      let productData = null;
      
      // Handle different response structures from your backend
      if (response.data?.success && response.data?.data) {
        productData = response.data.data;
      } else if (response.data?.product) {
        productData = response.data.product;
      } else if (response.data) {
        productData = response.data;
      }
      
      if (!productData || !productData._id) {
        throw new Error('Product not found');
      }
      
      setProduct(productData);

      // Try to fetch related products
      try {
        const relatedResponse = await productsAPI.getRelated(productData._id);
        
        let relatedData = [];
        if (relatedResponse.data?.success && relatedResponse.data?.data) {
          relatedData = relatedResponse.data.data;
        } else if (relatedResponse.data?.products) {
          relatedData = relatedResponse.data.products;
        } else if (Array.isArray(relatedResponse.data)) {
          relatedData = relatedResponse.data;
        }
        
        const validRelated = Array.isArray(relatedData) ? relatedData : [];
        setRelatedProducts(validRelated);
        
      } catch (relatedError) {
        console.warn('⚠️ Failed to load related products:', relatedError.message);
        // Don't fail the whole page for related products, try to get similar products
        try {
          const categorySlug = productData.category?.slug || productData.category?.name?.toLowerCase().replace(/\s+/g, '-');
          if (categorySlug) {
            const similarResponse = await productsAPI.getAll({ 
              category: categorySlug, 
              limit: 4 
            });
            
            let similarData = [];
            if (similarResponse.data?.success && similarResponse.data?.data) {
              similarData = Array.isArray(similarResponse.data.data) ? similarResponse.data.data : similarResponse.data.data.products || [];
            } else if (similarResponse.data?.products) {
              similarData = similarResponse.data.products;
            }
            
            // Filter out current product
            const filteredSimilar = similarData.filter(p => p._id !== productData._id);
            setRelatedProducts(filteredSimilar.slice(0, 4));
          }
        } catch (similarError) {
          console.warn('⚠️ Failed to load similar products:', similarError.message);
        }
      }
      
    } catch (err) {
      console.error('❌ Error fetching product:', err);
      let errorMessage = 'Failed to load product';
      
      if (err.response?.status === 404) {
        errorMessage = 'Product not found. It may have been removed or the link is incorrect.';
      } else if (err.response?.data?.success === false) {
        errorMessage = err.response.data.message || 'Product not found';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to safely extract data
  const getProductPrice = (product) => {
    if (typeof product?.price === 'number') return product.price;
    if (product?.salePrice && typeof product.salePrice === 'number') return product.salePrice;
    if (product?.price?.regular_price) return product.price.regular_price;
    if (product?.price?.USD) return product.price.USD;
    if (product?.prices?.USD) return product.prices.USD;
    return 0;
  };

  const getOriginalPrice = (product) => {
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

  const getProductRating = (product) => {
    if (product?.rating?.average) return product.rating.average;
    if (typeof product?.rating === 'number') return product.rating;
    return 4.8;
  };

  const getProductReviewCount = (product) => {
    if (product?.rating?.count) return product.rating.count;
    if (product?.reviewCount) return product.reviewCount;
    return Math.floor(Math.random() * 50) + 5;
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

  const getProductDescription = (product) => {
    return product?.description || product?.desc || product?.shortDescription || '';
  };

  const getProductName = (product) => {
    return product?.name || product?.title || 'Product';
  };

  const getCategoryName = (product) => {
    if (product?.category?.name) return product.category.name;
    if (typeof product?.category === 'string') return product.category;
    return 'Equipment';
  };

  const getProductSKU = (product) => {
    return product?.sku || product?.productCode || 'N/A';
  };

  const handleShare = async () => {
    const shareData = {
      title: getProductName(product),
      text: `Check out this ${getProductName(product)} from Mineazy Mining Solutions`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Product link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Product link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
        alert('Sharing not supported on this device');
      }
    }
  };

  const handleImageError = createImageFallbackHandler(setImageError, null, placeholderImage);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section Skeleton */}
        <section className="relative pt-32 lg:pt-40 pb-12 bg-secondary">
          <div className="absolute inset-0 bg-secondary/80"></div>
          <div className="relative container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="animate-pulse">
                <div className="h-6 bg-white/20 rounded-full w-32 mx-auto mb-6"></div>
                <div className="h-12 bg-white/20 rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-6 bg-white/20 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          </div>
        </section>
        <div className="container mx-auto px-6 py-8">
          <Loading size="lg" text="Loading product details..." />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <ErrorMessage
              title="Product Not Found"
              message={error || 'The requested product could not be found'}
              onRetry={fetchProduct}
              showRetry={true}
            />
            
            <div className="mt-8 text-center">
              <Link
                to="/shop"
                className="inline-flex items-center space-x-2 bg-secondary hover:bg-secondary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Shop</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Extract product data
  const images = getProductImages(product);
  const price = getProductPrice(product);
  const originalPrice = getOriginalPrice(product);
  const rating = getProductRating(product);
  const reviewCount = getProductReviewCount(product);
  const stock = getProductStock(product);
  const inCart = isInCart(product._id);
  const cartQuantity = getItemQuantity(product._id);
  const isOnSale = originalPrice && originalPrice !== price;

  const seoTitle = product?.metaTitle || product?.name || 'Product';
  const seoDescription = product?.metaDescription || product?.shortDescription || product?.description?.substring(0, 160) || '';
  const seoImage = product?.images?.[0] || '';
  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    ...(product?.category?.name ? [{ name: product.category.name, path: `/shop?category=${product.category.slug || product.category._id}` }] : []),
    { name: product?.name || 'Product', path: `/product/${product?.slug || product?._id}` }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Seo
        title={seoTitle}
        description={seoDescription}
        keywords={product?.metaKeywords || ''}
        canonicalUrl={`https://mineazy.co.zw/product/${product?.slug || product?._id}`}
        ogImage={seoImage}
        ogType="product"
      />
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-40 pb-12 bg-secondary text-white overflow-hidden">
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${aboutBanner})` }}
          ></div>
          <div className="absolute inset-0 bg-secondary/80"></div>
        </div>
        
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-medium">
                {getCategoryName(product)}
              </span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-medium mb-4 leading-tight">
              {getProductName(product)}
            </h1>
            {getProductDescription(product) && (
              <p className="text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                {getProductDescription(product).length > 150 
                  ? getProductDescription(product).substring(0, 150) + '...' 
                  : getProductDescription(product)
                }
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-secondary transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-secondary transition-colors">Shop</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link 
                to={`/shop?category=${product.category.slug || product.category._id}`} 
                className="hover:text-secondary transition-colors"
              >
                {getCategoryName(product)}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 font-medium">{getProductName(product)}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={imageError ? placeholderImage : images[selectedImageIndex]}
                alt={getProductName(product)}
                className="w-full h-96 object-cover"
                onError={handleImageError}
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-gray-600 shadow-md transition-all"
                    disabled={selectedImageIndex === 0}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(Math.min(images.length - 1, selectedImageIndex + 1))}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-gray-600 shadow-md transition-all"
                    disabled={selectedImageIndex === images.length - 1}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative overflow-hidden rounded-lg border-2 transition-colors ${
                      selectedImageIndex === index ? 'border-secondary' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                      <img
                      src={image}
                      alt={`${getProductName(product)} ${index + 1}`}
                      className="w-full h-20 object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = placeholderImage;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-600 font-medium">
                  {rating} ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                </span>
                <span className="text-sm text-gray-500">SKU: {getProductSKU(product)}</span>
              </div>
            </div>

            {/* Price */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-semibold text-secondary">
                  ${price.toLocaleString()}
                </span>
                {originalPrice && originalPrice !== price && (
                  <span className="text-lg text-gray-400 line-through">
                    ${originalPrice.toLocaleString()}
                  </span>
                )}
                {isOnSale && (
                  <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full font-medium">
                    Save ${(originalPrice - price).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                stock > 0 
                  ? stock > 10 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-orange-100 text-orange-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {stock > 0 
                  ? stock > 10 
                    ? 'In Stock' 
                    : `Only ${stock} left`
                  : 'Out of Stock'
                }
              </div>
              {stock > 0 && stock <= 5 && (
                <span className="text-sm text-orange-600 font-medium">Low stock - order soon!</span>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Product Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {getProductDescription(product) || 'No detailed description available for this product.'}
              </p>
            </div>

            {/* Specifications Preview */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Key Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(product.specifications).slice(0, 4).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center">
                  <label className="text-sm font-medium text-gray-700 mr-3">Quantity:</label>
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(stock, parseInt(e.target.value) || 1)))}
                      className="w-20 px-3 py-2 text-center border-none focus:ring-0"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                      className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
                      disabled={quantity >= stock}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Stock availability for selected quantity */}
                {quantity > 1 && (
                  <span className="text-sm text-gray-600">
                    {quantity <= stock 
                      ? `${quantity} items available` 
                      : `Only ${stock} items available`
                    }
                  </span>
                )}
              </div>

              <div className="flex space-x-4">
                <div className="flex-1">
                  <AddToCartButton
                    product={product}
                    quantity={quantity}
                    size="large"
                    className="w-full"
                    onError={(error) => console.error('❌ Failed to add product to cart:', error)}
                  />
                </div>
                
                <button 
                  onClick={handleShare}
                  className="bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 w-14 h-14 rounded-lg flex items-center justify-center transition-colors"
                  title="Share this product"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Cart status */}
              {inCart && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-800">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {cartQuantity} item{cartQuantity > 1 ? 's' : ''} in your cart
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Warranty</h4>
                    <p className="text-sm text-gray-600">24 months coverage</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Delivery</h4>
                    <p className="text-sm text-gray-600">Fast & reliable</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Quality</h4>
                    <p className="text-sm text-gray-600">Premium grade</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-12">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'description', label: 'Description' },
                { id: 'specifications', label: 'Specifications' },
                { id: 'features', label: 'Features' },
                { id: 'reviews', label: 'Reviews' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-secondary text-secondary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {getProductDescription(product) || 'No detailed description available for this product.'}
                </p>
                
                {product.features && Array.isArray(product.features) && product.features.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h3>
                    <ul className="space-y-2">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-3 border-b border-gray-100">
                      <span className="font-medium text-gray-900 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <span className="text-gray-600">{value}</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2">
                    <div className="text-center py-8">
                      <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Specifications Available</h3>
                      <p className="text-gray-600">Detailed specifications for this product are not currently available.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'features' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.tags && product.tags.length > 0 ? (
                  product.tags.map((tag, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700 capitalize">{tag}</span>
                    </div>
                  ))
                ) : product.features && Array.isArray(product.features) ? (
                  product.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2">
                    <div className="text-center py-8">
                      <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Features Listed</h3>
                      <p className="text-gray-600">Feature information for this product is not currently available.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="text-center py-12">
                <div className="flex items-center justify-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-8 h-8 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Average Rating: {rating}/5</h3>
                <p className="text-gray-600 mb-8 text-lg">
                  Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                </p>
                <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                  <p className="text-gray-600">Detailed customer reviews coming soon!</p>
                  <p className="text-sm text-gray-500 mt-2">Be the first to review this product.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">Related Products</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover other products that complement this item
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.slice(0, 4).map((relatedProduct) => {
                const relatedImages = getProductImages(relatedProduct);
                const relatedPrice = getProductPrice(relatedProduct);
                const relatedName = getProductName(relatedProduct);
                
                return (
                  <div key={relatedProduct._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <Link to={`/product/${relatedProduct._id}`}>
                      <img
                        src={relatedImages[0]}
                        alt={relatedName}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = placeholderImage;
                        }}
                      />
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{relatedName}</h3>
                        <p className="text-lg font-semibold text-secondary">
                          ${relatedPrice.toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Back to Shop */}
        <div className="text-center">
          <Link
            to="/shop"
            className="inline-flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Shop</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
