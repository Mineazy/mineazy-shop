// src/pages/ProductsPage.jsx — Admin: Products management + Bulk Image Import
import React, { useState, useEffect, useCallback } from 'react';
import { Package, ImagePlus, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BulkImageImport from '../components/Dashboard/BulkImageImport';

const BASE_URL = 'https://mining-equipment-backend.onrender.com/api';
const PAGE_SIZE = 20;

const ProductsPage = () => {
  const { hasAnyRole } = useAuth();
  const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');

  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const isAdmin = hasAnyRole(['inventory_manager', 'super_admin', 'order_manager']);

  const fetchProducts = useCallback(async (p = 1) => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await fetch(`${BASE_URL}/products?page=${p}&limit=${PAGE_SIZE}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      setProducts(data.products || data.data || []);
      setTotalPages(data.totalPages || 1);
      setPage(p);
    } catch {
      setFetchError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => { fetchProducts(1); }, [fetchProducts]);

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          You don't have permission to access this page.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button
          onClick={() => fetchProducts(page)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-6">
        {[
          { id: 'products', label: 'All Products', icon: Package },
          { id: 'bulk-images', label: 'Bulk Image Import', icon: ImagePlus }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-secondary shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {fetchError && (
            <div className="flex items-center gap-2 p-4 text-red-600 text-sm border-b border-gray-100">
              <AlertCircle className="w-4 h-4" /> {fetchError}
            </div>
          )}

          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading products…</div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No products found.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left">
                      <th className="px-4 py-3 font-semibold text-gray-600 w-14">Image</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Name</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">SKU</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Price</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Stock</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Images</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map(p => (
                      <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded-lg" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="w-4 h-4 text-gray-300" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{p.name}</td>
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.sku}</td>
                        <td className="px-4 py-3 text-gray-700">${p.price?.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            p.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                          }`}>
                            {p.inStock ? `${p.stockQuantity ?? ''}` : 'Out of stock'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{p.images?.length ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                  <button
                    onClick={() => fetchProducts(page - 1)}
                    disabled={page <= 1}
                    className="text-sm text-gray-500 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
                  <button
                    onClick={() => fetchProducts(page + 1)}
                    disabled={page >= totalPages}
                    className="text-sm text-gray-500 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'bulk-images' && (
        <BulkImageImport onSuccess={() => fetchProducts(page)} />
      )}
    </div>
  );
};

export default ProductsPage;
