// src/App.js - FINAL COMPLETE VERSION
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { BranchProvider } from './context/BranchContext';
import { ProductProvider } from './context/ProductContext';
import Header from './components/Header/Header';
import Footer from './components/Common/Footer';
import ErrorBoundary from './components/Common/ErrorBoundary';
import { PageLoader } from './components/Common/Loading';
import ProtectedRoute from './components/Common/ProtectedRoute';
import AuthGuard from './components/Auth/AuthGuard';
import { useCartSync } from './hooks/useCartSync';

// Regular imports (non-lazy) for critical pages
import Seo from './components/Common/Seo';
import Home from './pages/Home';
import Shop from './pages/Shop';

// Lazy load non-critical pages
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const PaymentProcessing = React.lazy(() => import('./pages/PaymentProcessing'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const About = React.lazy(() => import('./pages/About'));
const Blog = React.lazy(() => import('./pages/Blog'));
const BlogPost = React.lazy(() => import('./pages/BlogPost'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const Account = React.lazy(() => import('./pages/Account'));
const Orders = React.lazy(() => import('./pages/Orders'));
const Contact = React.lazy(() => import('./pages/Contact'));
const OrderDetails = React.lazy(() => import('./pages/OrderDetails'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const EmailVerification = React.lazy(() => import('./pages/EmailVerification'));
const OrderSuccess = React.lazy(() => import('./pages/OrderSuccess'));
const VideoGenerator = React.lazy(() =>
  import('./pages/VideoGenerator').catch(() => ({ default: () => null }))
);
const ProductsPage = React.lazy(() => import('./pages/ProductsPage'));

// Not Found Component
const NotFound = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <Seo title="Page Not Found (404)" description="The page you're looking for doesn't exist. Browse our mining equipment catalog or visit our homepage." noIndex />
    <div className="text-center">
      <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
      <a href="/" className="bg-primary text-secondary px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
        Go to Homepage
      </a>
    </div>
  </div>
);

// Layout wrapper component
const Layout = ({ children }) => {
  useCartSync(); // Sync cart when user logs in/out
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-32 lg:pt-40">
        {children}
      </main>
      <Footer />
    </div>
  );
};

// Loading fallback component
const LoadingFallback = ({ children }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <BranchProvider>
          <AuthProvider>
            <ProductProvider>
              <CartProvider>
                <div className="App">
                  <Routes>
                    {/* ============================================ */}
                    {/* PUBLIC ROUTES - Home and Shop */}
                    {/* ============================================ */}
                    <Route path="/" element={
                      <Layout>
                        <Home />
                      </Layout>
                    } />
                    
                    <Route path="/shop" element={
                      <Layout>
                        <Shop />
                      </Layout>
                    } />

                    {/* ============================================ */}
                    {/* AUTHENTICATION ROUTES - With Layout */}
                    {/* ============================================ */}
                    <Route path="/login" element={
                      <Layout>
                        <AuthGuard requireAuth={false}>
                          <LoadingFallback>
                            <Login />
                          </LoadingFallback>
                        </AuthGuard>
                      </Layout>
                    } />
                    
                    <Route path="/register" element={
                      <Layout>
                        <AuthGuard requireAuth={false}>
                          <LoadingFallback>
                            <Register />
                          </LoadingFallback>
                        </AuthGuard>
                      </Layout>
                    } />
                    
                    <Route path="/forgot-password" element={
                      <Layout>
                        <AuthGuard requireAuth={false}>
                          <LoadingFallback>
                            <ForgotPassword />
                          </LoadingFallback>
                        </AuthGuard>
                      </Layout>
                    } />
                    
                    <Route path="/reset-password" element={
                      <Layout>
                        <AuthGuard requireAuth={false}>
                          <LoadingFallback>
                            <ResetPassword />
                          </LoadingFallback>
                        </AuthGuard>
                      </Layout>
                    } />

                    <Route path="/reset-password/:token" element={
                      <Layout>
                        <AuthGuard requireAuth={false}>
                          <LoadingFallback>
                            <ResetPassword />
                          </LoadingFallback>
                        </AuthGuard>
                      </Layout>
                    } />
                    
                    <Route path="/verify-email" element={
                      <Layout>
                        <LoadingFallback>
                          <EmailVerification />
                        </LoadingFallback>
                      </Layout>
                    } />

                    <Route path="/verify-email/:token" element={
                      <Layout>
                        <LoadingFallback>
                          <EmailVerification />
                        </LoadingFallback>
                      </Layout>
                    } />

                    {/* ============================================ */}
                    {/* PUBLIC ROUTES WITH LAYOUT - Lazy Loaded */}
                    {/* ============================================ */}
                    <Route path="/product/:id" element={
                      <Layout>
                        <LoadingFallback>
                          <ProductDetail />
                        </LoadingFallback>
                      </Layout>
                    } />
                    
                    <Route path="/about" element={
                      <Layout>
                        <LoadingFallback>
                          <About />
                        </LoadingFallback>
                      </Layout>
                    } />
                    
                    <Route path="/blog" element={
                      <Layout>
                        <LoadingFallback>
                          <Blog />
                        </LoadingFallback>
                      </Layout>
                    } />
                    
                    <Route path="/blog/:slug" element={
                      <Layout>
                        <LoadingFallback>
                          <BlogPost />
                        </LoadingFallback>
                      </Layout>
                    } />
                    
                    <Route path="/contact" element={
                      <Layout>
                        <LoadingFallback>
                          <Contact />
                        </LoadingFallback>
                      </Layout>
                    } />
                    
                    <Route path="/cart" element={
                      <Layout>
                        <LoadingFallback>
                          <Cart />
                        </LoadingFallback>
                      </Layout>
                    } />

                    {/* ============================================ */}
                    {/* CHECKOUT & PAYMENT ROUTES - Allow guest */}
                    {/* ============================================ */}
                    <Route path="/checkout" element={
                      <Layout>
                        <LoadingFallback>
                          <Checkout />
                        </LoadingFallback>
                      </Layout>
                    } />
                    
                    {/* ✅ PAYMENT PROCESSING - Direct route without nested Layout */}
                    <Route path="/payment-processing" element={
                      <LoadingFallback>
                        <PaymentProcessing />
                      </LoadingFallback>
                    } />
                    
                    {/* ✅ ORDER SUCCESS - MUST BE PUBLIC (guests can view) */}
                    <Route path="/order-success/:orderId" element={
                      <Layout>
                        <LoadingFallback>
                          <OrderSuccess />
                        </LoadingFallback>
                      </Layout>
                    } />

                    {/* ============================================ */}
                    {/* PROTECTED ROUTES - Require authentication */}
                    {/* ============================================ */}
                    <Route path="/account" element={
                      <Layout>
                        <ProtectedRoute>
                          <LoadingFallback>
                            <Account />
                          </LoadingFallback>
                        </ProtectedRoute>
                      </Layout>
                    } />
                    
                    <Route path="/orders" element={
                      <Layout>
                        <ProtectedRoute>
                          <LoadingFallback>
                            <Orders />
                          </LoadingFallback>
                        </ProtectedRoute>
                      </Layout>
                    } />

                    <Route path="/order/:orderId" element={
                      <Layout>
                        <ProtectedRoute>
                          <LoadingFallback>
                            <OrderDetails />
                          </LoadingFallback>
                        </ProtectedRoute>
                      </Layout>
                    } />

                    {/* ============================================ */}
                    {/* SEARCH AND CATEGORY ROUTES */}
                    {/* ============================================ */}
                    <Route path="/search" element={
                      <Layout>
                        <Shop />
                      </Layout>
                    } />

                    <Route path="/shop/category/:category" element={
                      <Layout>
                        <Shop />
                      </Layout>
                    } />

                    {/* ============================================ */}
                    {/* STATIC PAGES */}
                    {/* ============================================ */}
                    <Route path="/privacy" element={
                      <Layout>
                        <Seo
                          title="Privacy Policy"
                          description="Mineazy Mining Solutions privacy policy. Learn how we collect, use, and protect your personal information."
                          canonicalUrl="https://mineazy.co.zw/privacy"
                        />
                        <div className="container mx-auto px-6 py-12">
                          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
                          <div className="prose max-w-none">
                            <p className="text-gray-600 mb-4">
                              At Mineazy Mining Solutions, we are committed to protecting your privacy and ensuring the security of your personal information...
                            </p>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Information We Collect</h2>
                            <p className="text-gray-600 mb-4">
                              We collect information that you provide directly to us, including when you create an account, make a purchase, or contact us.
                            </p>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">How We Use Your Information</h2>
                            <p className="text-gray-600 mb-4">
                              We use the information we collect to process your orders, communicate with you, and improve our services.
                            </p>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Us</h2>
                            <p className="text-gray-600 mb-4">
                              If you have any questions about this Privacy Policy, please contact us at privacy@mineazy.co.zw
                            </p>
                          </div>
                        </div>
                      </Layout>
                    } />

                    <Route path="/terms" element={
                      <Layout>
                        <Seo
                          title="Terms of Service"
                          description="Mineazy Mining Solutions terms and conditions. Read about our policies on orders, payments, returns, and website usage."
                          canonicalUrl="https://mineazy.co.zw/terms"
                        />
                        <div className="container mx-auto px-6 py-12">
                          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
                          <div className="prose max-w-none">
                            <p className="text-gray-600 mb-4">
                              Welcome to Mineazy Mining Solutions. By accessing and using our website, you agree to be bound by these Terms of Service...
                            </p>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Use of Service</h2>
                            <p className="text-gray-600 mb-4">
                              You agree to use our services only for lawful purposes and in accordance with these Terms.
                            </p>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Orders and Payments</h2>
                            <p className="text-gray-600 mb-4">
                              All orders are subject to acceptance and availability. Prices are subject to change without notice.
                            </p>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Returns and Refunds</h2>
                            <p className="text-gray-600 mb-4">
                              Please refer to our Returns Policy for information about returns and refunds.
                            </p>
                          </div>
                        </div>
                      </Layout>
                    } />

                    <Route path="/help" element={
                      <Layout>
                        <Seo
                          title="Help & Support"
                          description="Mineazy customer support. Get help with orders, deliveries, payments, and find answers to frequently asked questions."
                          canonicalUrl="https://mineazy.co.zw/help"
                        />
                        <div className="container mx-auto px-6 py-12">
                          <h1 className="text-3xl font-bold text-gray-900 mb-6">Help & Support</h1>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Support</h2>
                              <ul className="space-y-3">
                                <li className="flex items-center space-x-3">
                                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                                  <span className="text-gray-600">Email: support@mineazy.co.zw</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                                  <span className="text-gray-600">Phone: +263 712290 046</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                                  <span className="text-gray-600">Hours: Mon-Fri 8:00 AM - 5:00 PM</span>
                                </li>
                              </ul>
                            </div>
                            <div>
                              <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
                              <ul className="space-y-3">
                                <li className="flex items-start space-x-3">
                                  <span className="w-2 h-2 bg-primary rounded-full mt-2"></span>
                                  <div>
                                    <p className="font-medium text-gray-900">How do I track my order?</p>
                                    <p className="text-sm text-gray-600">Visit the Orders page in your account to track your orders.</p>
                                  </div>
                                </li>
                                <li className="flex items-start space-x-3">
                                  <span className="w-2 h-2 bg-primary rounded-full mt-2"></span>
                                  <div>
                                    <p className="font-medium text-gray-900">What payment methods do you accept?</p>
                                    <p className="text-sm text-gray-600">We accept Paynow, Cash on Delivery, and Bank Transfer.</p>
                                  </div>
                                </li>
                                <li className="flex items-start space-x-3">
                                  <span className="w-2 h-2 bg-primary rounded-full mt-2"></span>
                                  <div>
                                    <p className="font-medium text-gray-900">Do you offer delivery?</p>
                                    <p className="text-sm text-gray-600">Yes, we offer free delivery on all orders across Zimbabwe.</p>
                                  </div>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </Layout>
                    } />

                    <Route path="/settings" element={
                      <Layout>
                        <ProtectedRoute>
                          <div className="container mx-auto px-6 py-12">
                            <h1 className="text-3xl font-bold text-gray-900 mb-6">Account Settings</h1>
                            <div className="bg-white rounded-xl shadow-md p-8">
                              <p className="text-gray-600 mb-4">
                                Account settings are managed through your Account page.
                              </p>
                              <a href="/account" className="bg-primary text-secondary px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors inline-block">
                                Go to Account
                              </a>
                            </div>
                          </div>
                        </ProtectedRoute>
                      </Layout>
                    } />

                    {/* ============================================ */}
                    {/* ADMIN - Products & Bulk Image Import */}
                    {/* ============================================ */}
                    <Route path="/dashboard/products" element={
                      <Layout>
                        <ProtectedRoute>
                          <LoadingFallback>
                            <ProductsPage />
                          </LoadingFallback>
                        </ProtectedRoute>
                      </Layout>
                    } />

                    {/* ============================================ */}
                    {/* VIDEO GENERATOR (Optional) */}
                    {/* ============================================ */}
                    <Route path="/video-generator" element={
                      <Layout>
                        <ProtectedRoute>
                          <LoadingFallback>
                            <VideoGenerator />
                          </LoadingFallback>
                        </ProtectedRoute>
                      </Layout>
                    } />

                    {/* ============================================ */}
                    {/* 404 NOT FOUND - Must be LAST */}
                    {/* ============================================ */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </CartProvider>
            </ProductProvider>
          </AuthProvider>
        </BranchProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
