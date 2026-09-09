// src/components/Dashboard/BulkImageImport.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const BASE_URL = 'https://mining-equipment-backend.onrender.com/api';
const ACCEPTED_MIME = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif']);
const MIN_CONFIDENCE = 60;
const DEFAULT_BATCH_SIZE = 5;

// ─── Fuzzy matching ──────────────────────────────────────────────────────────

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function fuzzyMatch(a, b) {
  const s1 = a.toLowerCase();
  const s2 = b.toLowerCase();
  if (s1 === s2) return 100;
  if (s1.includes(s2) || s2.includes(s1)) return 80;
  const dist = levenshtein(s1, s2);
  const longer = Math.max(s1.length, s2.length);
  return Math.round(((longer - dist) / longer) * 100);
}

function productToFilename(name) {
  return name.replace(/ /g, '-').replace(/\*/g, 'x').toUpperCase();
}

function matchFileToProducts(file, products) {
  const basename = file.name.replace(/\.[^.]+$/, '');
  const baseLower = basename.toLowerCase();

  // Tier 1: exact path match
  for (const p of products) {
    for (const img of (p.images || [])) {
      const imgBase = img.split('/').pop().replace(/\.[^.]+$/, '').toLowerCase();
      if (imgBase === baseLower) {
        return { products: [{ id: p._id, name: p.name, sku: p.sku }], confidence: 100, matchMethod: 'exact-path', isManual: false };
      }
    }
  }

  // Tier 2: exact name match (product name → filename convention)
  for (const p of products) {
    if (productToFilename(p.name).toLowerCase() === baseLower) {
      return { products: [{ id: p._id, name: p.name, sku: p.sku }], confidence: 95, matchMethod: 'exact-name', isManual: false };
    }
  }

  // Tier 3: fuzzy match — best score wins
  let best = null;
  let bestScore = 0;
  for (const p of products) {
    const score = Math.max(
      fuzzyMatch(basename, p.name),
      fuzzyMatch(basename, productToFilename(p.name))
    );
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }

  if (best && bestScore >= MIN_CONFIDENCE) {
    return { products: [{ id: best._id, name: best.name, sku: best.sku }], confidence: bestScore, matchMethod: 'fuzzy', isManual: false };
  }

  return null;
}

// ─── Confidence badge ────────────────────────────────────────────────────────

function ConfidenceBadge({ score, method }) {
  const color = score >= 90 ? 'bg-green-100 text-green-700' : score >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-700';
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      {score}% · {method}
    </span>
  );
}

// ─── Product search dropdown ─────────────────────────────────────────────────

function ProductSearchDropdown({ products, selected, onChange }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);

  const filtered = products
    .filter(p => {
      const q = query.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q);
    })
    .slice(0, 10);

  const addProduct = (p) => {
    if (!selected.find(s => s.id === p._id)) {
      onChange([...selected, { id: p._id, name: p.name, sku: p.sku }]);
    }
    setQuery('');
    setOpen(false);
  };

  const removeProduct = (id) => onChange(selected.filter(s => s.id !== id));

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
    if (e.key === 'Enter' && filtered[cursor]) { e.preventDefault(); addProduct(filtered[cursor]); }
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-2">
        {selected.map(p => (
          <span key={p.id} className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {p.name}
            <button onClick={() => removeProduct(p.id)} className="hover:text-blue-600"><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <div className="relative">
        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 gap-2">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); setCursor(0); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={handleKey}
            placeholder="Search by name or SKU..."
            className="flex-1 text-sm outline-none"
          />
        </div>
        {open && filtered.length > 0 && (
          <ul className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filtered.map((p, i) => (
              <li
                key={p._id}
                onMouseDown={() => addProduct(p)}
                className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between ${i === cursor ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <span className="font-medium truncate">{p.name}</span>
                {p.sku && <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{p.sku}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

const BulkImageImport = ({ onSuccess }) => {
  useAuth(); // ensures we're inside AuthProvider
  const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [files, setFiles] = useState([]); // { file, preview }
  const [matches, setMatches] = useState({}); // filename → match record
  const [dragging, setDragging] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [batchSize, setBatchSize] = useState(DEFAULT_BATCH_SIZE);

  const dropRef = useRef(null);

  // Load categories
  useEffect(() => {
    fetch(`${BASE_URL}/categories`, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(r => r.json())
      .then(d => setCategories(d.categories || d.data || d || []))
      .catch(() => {});
  }, [authToken]);

  useEffect(() => {
    fetch(`${BASE_URL}/products/storage-status`, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(r => r.json())
      .then(d => {
        const maxBulk = Number(d?.maxBulkFilesPerRequest);
        if (Number.isFinite(maxBulk) && maxBulk > 0) {
          setBatchSize(maxBulk);
        }
      })
      .catch(() => {});
  }, [authToken]);

  // Load products when category changes
  useEffect(() => {
    if (!selectedCategory) { setProducts([]); return; }
    setLoadingProducts(true);
    fetch(`${BASE_URL}/products?category=${selectedCategory}&limit=1000`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
      .then(r => r.json())
      .then(d => setProducts(d.products || d.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
  }, [selectedCategory, authToken]);

  // Re-run matching when products or files change
  useEffect(() => {
    if (products.length === 0 || files.length === 0) return;
    const newMatches = {};
    for (const { file } of files) {
      const match = matchFileToProducts(file, products);
      if (match) newMatches[file.name] = match;
    }
    setMatches(prev => {
      // Preserve manual overrides
      const merged = { ...newMatches };
      for (const [name, m] of Object.entries(prev)) {
        if (m.isManual) merged[name] = m;
      }
      return merged;
    });
  }, [products, files]);

  const addFiles = useCallback((incoming) => {
    const valid = Array.from(incoming).filter(f => ACCEPTED_MIME.has(f.type));
    setFiles(prev => {
      const names = new Set(prev.map(f => f.file.name));
      const fresh = valid.filter(f => !names.has(f.name)).map(f => ({
        file: f,
        preview: URL.createObjectURL(f)
      }));
      return [...prev, ...fresh];
    });
  }, []);

  const removeFile = (name) => {
    setFiles(prev => {
      const entry = prev.find(f => f.file.name === name);
      if (entry) URL.revokeObjectURL(entry.preview);
      return prev.filter(f => f.file.name !== name);
    });
    setMatches(prev => { const m = { ...prev }; delete m[name]; return m; });
  };

  const updateManualMatch = (filename, selected) => {
    setMatches(prev => ({
      ...prev,
      [filename]: { products: selected, confidence: 100, matchMethod: 'manual', isManual: true }
    }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const matched = files.filter(({ file }) => matches[file.name]);
  const unmatched = files.filter(({ file }) => !matches[file.name]);

  const handleUpload = async () => {
    if (matched.length === 0) { setError('No matched images to upload.'); return; }
    setError('');
    setUploading(true);
    setResult(null);
    setUploadProgress({ done: 0, total: matched.length });

    // Split into batches so very large imports remain safe on the Render instance.
    const batches = [];
    for (let i = 0; i < matched.length; i += batchSize) {
      batches.push(matched.slice(i, i + batchSize));
    }

    const combined = { uploaded: 0, failed: 0, fileMappings: [], productsUpdated: [], errors: [] };
    const updatedProducts = new Map();

    try {
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex += 1) {
        const batch = batches[batchIndex];
        const formData = new FormData();
        const mapping = {};
        for (const { file } of batch) {
          formData.append('images', file);
          mapping[file.name] = matches[file.name].products.map(p => p.id);
        }
        formData.append('mapping', JSON.stringify(mapping));

        const res = await fetch(`${BASE_URL}/products/bulk-images`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` },
          body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Upload failed');

        combined.uploaded += data.uploaded || 0;
        combined.failed += data.failed || 0;
        combined.fileMappings.push(...(data.fileMappings || []));
        combined.errors.push(...(data.errors || []));

        for (const product of data.productsUpdated || []) {
          const existing = updatedProducts.get(product.id) || {
            id: product.id,
            name: product.name,
            imagesAdded: 0,
            imageUrls: []
          };

          existing.imagesAdded += product.imagesAdded || 0;
          existing.imageUrls.push(...(product.imageUrls || []));
          updatedProducts.set(product.id, existing);
        }

        setUploadProgress({ done: Math.min((batchIndex + 1) * batchSize, matched.length), total: matched.length });
      }

      combined.productsUpdated = Array.from(updatedProducts.values());
      setResult(combined);
      if (combined.uploaded > 0 && onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Bulk Image Import</h2>
        <p className="text-sm text-gray-500 mt-1">Upload multiple product images and auto-match them by filename.</p>
      </div>

      {/* Step 1 — Category selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="w-6 h-6 bg-secondary text-white text-xs rounded-full flex items-center justify-center font-bold">1</span>
          Select Category
        </h3>
        <div className="relative max-w-xs">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <option value="">— choose a category —</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        {loadingProducts && <p className="text-xs text-gray-400 mt-2">Loading products…</p>}
        {selectedCategory && !loadingProducts && (
          <p className="text-xs text-gray-500 mt-2">{products.length} products loaded</p>
        )}
      </div>

      {/* Step 2 — Drop zone */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="w-6 h-6 bg-secondary text-white text-xs rounded-full flex items-center justify-center font-bold">2</span>
          Upload Images
        </h3>
        <div
          ref={dropRef}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragging ? 'border-secondary bg-secondary/5' : 'border-gray-300 hover:border-gray-400'}`}
        >
          <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-1">Drag & drop images here, or</p>
          <label className="cursor-pointer text-secondary text-sm font-medium hover:underline">
            browse files
            <input
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/avif"
              className="hidden"
              onChange={e => addFiles(e.target.files)}
            />
          </label>
          <p className="text-xs text-gray-400 mt-2">JPEG, PNG, GIF, WebP, AVIF</p>
        </div>
      </div>

      {/* Step 3 — Review matches */}
      {files.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-secondary text-white text-xs rounded-full flex items-center justify-center font-bold">3</span>
            Review Matches
            <span className="ml-auto text-xs text-gray-400">{files.length} file{files.length !== 1 ? 's' : ''}</span>
          </h3>

          {/* Matched */}
          {matched.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-600 mb-2">Matched ({matched.length})</p>
              <div className="space-y-2">
                {matched.map(({ file, preview }) => {
                  const m = matches[file.name];
                  return (
                    <div key={file.name} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <img src={preview} alt="" className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500 truncate">{m.products.map(p => p.name).join(', ')}</p>
                        <div className="mt-1"><ConfidenceBadge score={m.confidence} method={m.matchMethod} /></div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <button onClick={() => removeFile(file.name)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Unmatched */}
          {unmatched.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 mb-2">Unmatched ({unmatched.length}) — assign manually</p>
              <div className="space-y-3">
                {unmatched.map(({ file, preview }) => (
                  <div key={file.name} className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <div className="flex items-center gap-3 mb-3">
                      <img src={preview} alt="" className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                        <p className="text-xs text-gray-400">No auto-match found</p>
                      </div>
                      <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                      <button onClick={() => removeFile(file.name)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                    </div>
                    {products.length > 0 ? (
                      <ProductSearchDropdown
                        products={products}
                        selected={matches[file.name]?.products || []}
                        onChange={sel => updateManualMatch(file.name, sel)}
                      />
                    ) : (
                      <p className="text-xs text-gray-400 italic">Select a category first to assign products.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Upload button */}
      {matched.length > 0 && !result && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-secondary text-white py-3 rounded-xl font-semibold hover:bg-secondary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uploading {uploadProgress.done} / {uploadProgress.total} in batches of {batchSize}...
            </>
          ) : (
            <><Upload className="w-4 h-4" />Upload {matched.length} image{matched.length !== 1 ? 's' : ''}</>
          )}
        </button>
      )}

      {/* Result panel */}
      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-gray-900">Upload Complete</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{result.uploaded}</p>
              <p className="text-xs text-green-700 mt-0.5">Uploaded</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-500">{result.failed}</p>
              <p className="text-xs text-red-600 mt-0.5">Failed</p>
            </div>
          </div>
          {result.productsUpdated?.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Products Updated</p>
              <ul className="space-y-1">
                {result.productsUpdated.map(p => (
                  <li key={p.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 truncate">{p.name}</span>
                    <span className="text-xs text-gray-400 ml-2 flex-shrink-0">+{p.imagesAdded} image{p.imagesAdded !== 1 ? 's' : ''}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.errors?.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-red-500 mb-2">Errors</p>
              <ul className="space-y-1">
                {result.errors.map((e, i) => (
                  <li key={i} className="text-xs text-red-600">{e.file}: {e.error}</li>
                ))}
              </ul>
            </div>
          )}
          <button
            onClick={() => { setResult(null); setFiles([]); setMatches({}); }}
            className="w-full border border-gray-300 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Start new import
          </button>
        </div>
      )}
    </div>
  );
};

export default BulkImageImport;
