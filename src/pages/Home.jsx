// src/pages/Home.jsx - Enhanced with Trusted Partners section
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Truck, Award, Users, CheckCircle, Star, Sparkles, TrendingUp, RefreshCw } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/Products/ProductCard';
import { ProductSkeleton } from '../components/Common/Loading';
import TrustedPartners from '../components/Home/TrustedPartners';
import BranchLocator from '../components/Home/BranchLocator';
import Seo, { OrganizationJsonLd, LocalBusinessJsonLd } from '../components/Common/Seo';
import homeBanner from '../assets/home-banner.webp';
import miningOperations from '../assets/mining-operations-mineazy.webp';

const Home = () => {
  // Use the main products context for better state management
  const { 
    featuredProducts, 
    loading, 
    errors, 
    loadFeaturedProducts
  } = useProducts();

  useEffect(() => {
    const scrollToHash = () => {
      if (window.location.hash === '#branch-locator') {
        const el = document.getElementById('branch-locator');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    };
    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, []);

  // Load featured products on mount with better error handling
  useEffect(() => {
    const initializeFeaturedProducts = async () => {

      // Only load if we don't have products and aren't currently loading
      if (featuredProducts.length === 0 && !loading.featuredProducts && !errors.featuredProducts) {
        try {
          await loadFeaturedProducts(4);
        } catch (error) {
          console.error('❌ Home: Failed to load featured products:', error);
        }
      }
    };

    initializeFeaturedProducts();
  }, []); // Only run on mount

  // Retry loading featured products
  const handleRetryFeaturedProducts = async () => {
    try {
      await loadFeaturedProducts(4, true); // Force refresh
    } catch (error) {
      console.error('❌ Home: Retry failed:', error);
    }
  };

  const heroFeatures = [
    {
      icon: Shield,
      title: "Premium Quality",
      description: "Industry-leading equipment from trusted manufacturers"
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Quick delivery across Zimbabwe with tracking"
    },
    {
      icon: Award,
      title: "Expert Support",
      description: "Professional technical support and consultation"
    },
    {
      icon: Users,
      title: "Trusted Partner",
      description: "Serving many customers with excellence"
    }
  ];

  const stats = [
    { number: "5,000+", label: "Products Available" },
    { number: "15+", label: "Years Experience" },
    { number: "13", label: "Branch Locations" },
    { number: "24/7", label: "E-Store Availability" }
  ];

  const testimonials = [
    {
      name: "John Mbeki",
      company: "Miner",
      rating: 5,
      comment: "Outstanding equipment quality and exceptional service. Mineazy has been our trusted partner for over 5 years."
    },
    {
      name: "Sarah Moyo",
      company: "Manager",
      rating: 5,
      comment: "Fast delivery and professional support. Their team really understands our mining equipment needs."
    },
    {
      name: "David Chikwamba",
      company: "Excavator Tecnician",
      rating: 5,
      comment: "Reliable equipment and competitive pricing. Highly recommend for any mining operation."
    }
  ];

  // Featured Products Section Component
  const FeaturedProductsSection = () => {

    if (loading.featuredProducts) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, index) => (
            <ProductSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      );
    }

    if (errors.featuredProducts) {
      return (
        <div className="text-center py-16">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-medium text-red-900 mb-2">Unable to Load Featured Products</h3>
            <p className="text-red-700 mb-6">{errors.featuredProducts}</p>
            <div className="space-y-3">
              <button 
                onClick={handleRetryFeaturedProducts}
                disabled={loading.featuredProducts}
                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                {loading.featuredProducts ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Try Again</span>
                  </>
                )}
              </button>
              <Link 
                to="/shop"
                className="block w-full bg-white border border-red-300 text-red-700 px-6 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors"
              >
                Browse All Products
              </Link>
            </div>
          </div>
        </div>
      );
    }

    if (featuredProducts.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-medium text-gray-900 mb-4">No Featured Products Available</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            We're currently updating our featured collection. Check out our full catalog instead.
          </p>
          <div className="space-y-3">
            <button 
              onClick={handleRetryFeaturedProducts}
              disabled={loading.featuredProducts}
              className="bg-secondary hover:bg-secondary/90 disabled:bg-secondary/50 text-white px-8 py-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 inline-flex items-center gap-2"
            >
              {loading.featuredProducts ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>Refresh Featured Products</span>
                </>
              )}
            </button>
            <div className="mt-4">
              <Link 
                to="/shop" 
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 inline-flex items-center gap-2"
              >
                <span>Browse All Products</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {featuredProducts.map((product, index) => (
            <ProductCard 
              key={`${product._id}-${index}`} 
              product={product} 
              viewMode="grid"
              className="transform hover:scale-105 transition-all duration-300"
            />
          ))}
        </div>

        <div className="text-center">
          <div className="bg-gray-50 rounded-lg p-8 border">
            <h3 className="text-2xl font-medium text-gray-900 mb-4">
              5,000+ Premium Products Available
            </h3>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Discover our complete collection of mining equipment and industrial solutions.
            </p>
            <Link 
              to="/shop" 
              className="group bg-secondary hover:bg-secondary/90 text-white text-lg px-8 py-4 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center gap-3"
            >
              <span>View All Products</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen">
      <Seo
        title="Mining Equipment & Solutions Zimbabwe"
        description="Mineazy is Zimbabwe's trusted supplier of mining equipment, safety solutions, and industrial machinery. Premium quality products with fast delivery across Zimbabwe."
        keywords="mining equipment Zimbabwe, mining supplies, industrial machinery, Mineazy, Zimbabwe mining"
        ogType="website"
      />
      <OrganizationJsonLd />
      <LocalBusinessJsonLd />

      {/* Hero Section - No gap with header */}
      <section className="relative bg-gradient-to-br from-secondary via-secondary/80 to-secondary text-white overflow-hidden pt-32 lg:pt-40">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src={homeBanner}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="relative container mx-auto px-4 md:px-6 py-10 md:py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Zimbabwe's #1 Mining Equipment Supplier</span>
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-6xl font-semibold leading-tight">
                  Powering
                  <span className="block text-primary font-medium">
                    Your  Mining 
                  </span>
                 Success
                </h1>
                <p className="text-base md:text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-2xl">
                  Your trusted partner for all mining equipment, inverters, batteries, safety gear, generators, and industrial supplies across Zimbabwe. We deliver reliable, durable, and affordable solutions for mining operations, construction projects, and commercial enterprises.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/shop" 
                  className="group bg-primary hover:bg-primary/90 text-secondary text-lg px-8 py-4 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center justify-center space-x-2"
                >
                  <span>Explore Products</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/contact" 
                  className="group bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white hover:text-secondary text-white text-lg px-8 py-4 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                >
                  Get Quote
                </Link>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center group">
                    <div className="text-3xl lg:text-4xl font-medium text-primary group-hover:scale-110 transition-transform duration-300">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-300 mt-1 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-xl">
                <h3 className="text-2xl font-medium mb-6 flex items-center gap-2">
                  <Award className="w-6 h-6 text-primary" />
                  Why Choose Mineazy?
                </h3>
                <div className="space-y-6">
                  {heroFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-4 group">
                      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white text-lg">{feature.title}</h4>
                        <p className="text-gray-300 mt-1 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section with Enhanced Error Handling */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-secondary px-4 py-2 rounded-full font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Featured Collection
            </div>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-medium text-gray-900 mb-6">
              Featured Products
            </h2>
            <p className="text-sm md:text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our hand-picked selection of premium mining equipment, power solutions, safety gear, and industrial supplies. Each product is sourced from trusted global manufacturers and backed by our quality guarantee and nationwide delivery service.
            </p>
          </div>

          <FeaturedProductsSection />
        </div>
      </section>

      {/* ✨ NEW: Trusted Partners Section */}
      <TrustedPartners />

      {/* Branch Locator Section */}
      <BranchLocator />

      {/* About Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium mb-6">
                <CheckCircle className="w-4 h-4" />
                About Mineazy
              </div>
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-medium text-gray-900 mb-6 leading-tight">
                About Us  
              </h2>
              <p className="text-sm md:text-xl text-gray-600 mb-8 leading-relaxed">
                With over 15 years of experience in Zimbabwe's mining industry, Mineazy has become the country's most trusted partner for premium equipment and innovative solutions. We serve mining operations, construction sites, and industrial facilities across all major cities including Harare, Bulawayo, Mutare, and Gweru, providing everything from heavy machinery to essential safety gear and reliable power solutions.
              </p>
              <div className="space-y-4 mb-10">
                {[
                  "Commitment to operational excellence",
                  "Complete transparency and collaboration",
                  "Innovation-driven solutions",
                  "Sustainable growth for our community"
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 group">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle className="w-5 h-5 text-secondary" />
                    </div>
                    <span className="text-gray-700 font-medium text-lg">{item}</span>
                  </div>
                ))}
              </div>
              <Link 
                to="/about" 
                className="group bg-secondary hover:bg-secondary/90 text-white text-lg px-8 py-4 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center gap-3"
              >
                <span>Learn More About Us</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="relative mt-4 lg:mt-0">
              <div className="relative overflow-hidden rounded-lg shadow-xl">
                <img
                  src={miningOperations}
                  alt="Mining operations in Zimbabwe by Mineazy - professional equipment and industrial solutions"
                  className="w-full h-64 md:h-96 object-cover"
                  width="600"
                  height="400"
                  loading="lazy"
                  fetchPriority="low"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/600/400';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              {/* Stat cards — hidden on mobile to prevent overflow, visible on md+ */}
              <div className="hidden md:block absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-6 border">
                <div className="text-3xl font-medium text-gray-900">15+</div>
                <div className="text-sm text-gray-600 font-medium">Years of Excellence</div>
              </div>
              <div className="hidden md:block absolute -top-6 -right-6 bg-white rounded-lg shadow-lg p-6 border">
                <div className="text-3xl font-medium text-gray-900">1000+</div>
                <div className="text-sm text-gray-600 font-medium">Happy Customers</div>
              </div>
              {/* Mobile stat cards — inline, no overflow */}
              <div className="flex gap-4 mt-4 md:hidden">
                <div className="flex-1 bg-white rounded-lg shadow-md p-4 border text-center">
                  <div className="text-2xl font-medium text-gray-900">15+</div>
                  <div className="text-xs text-gray-600 font-medium">Years of Excellence</div>
                </div>
                <div className="flex-1 bg-white rounded-lg shadow-md p-4 border text-center">
                  <div className="text-2xl font-medium text-gray-900">1000+</div>
                  <div className="text-xs text-gray-600 font-medium">Happy Customers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-medium mb-4">
              <Star className="w-4 h-4" />
              Customer Reviews
            </div>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-medium text-gray-900 mb-6">
              What Our Customers
              <span className="block text-secondary">
                Are Saying
              </span>
            </h2>
            <p className="text-sm md:text-xl text-gray-600 max-w-2xl mx-auto">
              Trusted by mining companies, contractors, and industrial businesses across Zimbabwe. Here is what our valued customers have to say about our products, service, and commitment to quality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="group bg-gray-50 rounded-lg p-8 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 border">
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-8 italic text-lg leading-relaxed">
                  "{testimonial.comment}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-white font-medium text-lg mr-4">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-lg">{testimonial.name}</h4>
                    <p className="text-gray-600 font-medium">{testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="relative py-20 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-secondary"></div>
          <img 
            src={miningOperations}
            alt=""
            aria-hidden="true"
            fetchPriority="low"
            className="absolute inset-0 w-full h-full object-cover opacity-10"
          />
        </div>
        
        <div className="relative container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-4xl lg:text-6xl font-medium mb-6 leading-tight">
              Ready to Optimize 
              <span className="block text-primary">
                Your Operations?
              </span>
            </h2>
            <p className="text-sm md:text-xl lg:text-2xl text-gray-300 mb-8 md:mb-12 leading-relaxed max-w-2xl mx-auto">
              Connect with our experienced team for personalized product recommendations, competitive bulk pricing, and reliable delivery to any location in Zimbabwe. We are here to help you find the right equipment for your mining, construction, or industrial project.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                to="/contact" 
                className="group bg-primary hover:bg-primary/90 text-secondary text-xl px-10 py-5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center gap-3"
              >
                <span>Request Quote</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/shop" 
                className="group bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white hover:text-secondary text-white text-xl px-10 py-5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-6">Zimbabwe's Leading Mining Equipment Supplier</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Mineazy is a premier mining equipment and industrial supply company based in Zimbabwe, serving the mining, construction, and industrial sectors with high-quality products and reliable service. With over 15 years of experience, we have established ourselves as a trusted partner for businesses across Zimbabwe, providing everything from heavy mining machinery to essential safety equipment and power solutions.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            Our comprehensive product range includes professional-grade mining tools, inverters and batteries for reliable power, safety equipment such as hard hats and protective gear, generators for backup power, water pumps for mining and agriculture, and a wide selection of industrial supplies including welding equipment and electrical components. We partner with leading global manufacturers to bring you products that meet international quality standards.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Whether you are operating a large-scale mining project or need equipment for a small business, Mineazy offers competitive pricing, flexible payment options including mobile money, and fast delivery to all major cities in Zimbabwe including Harare, Bulawayo, Chitungwiza, Mutare, Masvingo, and Gweru. Contact our expert team today for personalized product recommendations and quotes tailored to your specific needs.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;