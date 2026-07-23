import React, { useEffect, useState } from 'react';
import { apiClient, extractErrorMessage } from '../api/client';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80';

const Products = ({ onAddToCart, onToggleWishlist, isWishlisted }) => {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 8, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [inStock, setInStock] = useState(false);
  const [page, setPage] = useState(1);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/products', {
        params: {
          page,
          limit: 8,
          search: search || undefined,
          sortBy,
          order,
          inStock,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined
        }
      });
      setProducts(response.data.data || []);
      setMeta(response.data.meta || { total: 0, page: 1, limit: 8, totalPages: 1 });
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to fetch products'));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, sortBy, order, inStock, page, minPrice, maxPrice]);

  const imgHandler = (evt) => {
    evt.target.src = FALLBACK_IMAGE;
  };

  const submitSearch = (evt) => {
    evt.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const resetFilters = () => {
    setSearch('');
    setSearchInput('');
    setSortBy('createdAt');
    setOrder('desc');
    setInStock(false);
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
  };

  return (
    <section>
      <div className="page-header">
        <h1 className="page-title">Product Catalog</h1>
        <p className="page-subtitle">Curated inventory with live controls and performance-ready paging.</p>
      </div>

      <div className="toolbar-card">
        <form className="row g-3 align-items-end" onSubmit={submitSearch}>
          <div className="col-lg-4">
            <label className="form-label">Search</label>
            <input
              className="form-control"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by product name"
            />
          </div>
          <div className="col-lg-2">
            <label className="form-label">Sort By</label>
            <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="createdAt">Newest</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="qty">Quantity</option>
            </select>
          </div>
          <div className="col-lg-2">
            <label className="form-label">Order</label>
            <select className="form-select" value={order} onChange={(e) => setOrder(e.target.value)}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
          <div className="col-lg-2 form-check mt-4">
            <input
              id="inStockFilter"
              className="form-check-input"
              type="checkbox"
              checked={inStock}
              onChange={(e) => {
                setPage(1);
                setInStock(e.target.checked);
              }}
            />
            <label className="form-check-label" htmlFor="inStockFilter">
              In stock only
            </label>
          </div>
          <div className="col-lg-1">
            <label className="form-label">Min</label>
            <input
              className="form-control"
              type="number"
              min="0"
              value={minPrice}
              onChange={(e) => {
                setPage(1);
                setMinPrice(e.target.value);
              }}
            />
          </div>
          <div className="col-lg-1">
            <label className="form-label">Max</label>
            <input
              className="form-control"
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => {
                setPage(1);
                setMaxPrice(e.target.value);
              }}
            />
          </div>
          <div className="col-lg-2">
            <button className="btn btn-primary w-100" type="submit">
              Apply
            </button>
          </div>
          <div className="col-lg-2">
            <button className="btn btn-outline-dark w-100" type="button" onClick={resetFilters}>
              Reset
            </button>
          </div>
        </form>
      </div>

      {!loading && !error && <div className="result-chip">{meta.total} products found</div>}

      {loading && <div className="status-card">Loading products...</div>}
      {!loading && error && <div className="status-card status-error">{error}</div>}

      {!loading && !error && (
        <>
          <div className="row g-4">
            {products.map((product) => {
              return (
                <div className="col-sm-6 col-lg-3" key={product._id}>
                  <article className="product-card">
                    <img
                      src={product.image}
                      onError={imgHandler}
                      alt={product.name}
                      className="product-image"
                    />
                    <div className="product-content">
                      <h3 className="product-title">{product.name}</h3>
                      <p className="product-info">{product.info}</p>
                      <div className="product-row">
                        <span className="price-tag">INR {product.price}</span>
                        <span className={product.qty > 0 ? 'stock-tag' : 'stock-tag out'}>
                          {product.qty > 0 ? `${product.qty} in stock` : 'Out of stock'}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-success w-100"
                        disabled={product.qty <= 0}
                        onClick={() => onAddToCart(product)}
                      >
                        Add to Cart
                      </button>
                      <button
                        type="button"
                        className={`btn w-100 mt-2 ${isWishlisted(product._id) ? 'btn-warning' : 'btn-outline-warning'}`}
                        onClick={() => onToggleWishlist(product)}
                      >
                        {isWishlisted(product._id) ? 'Wishlisted' : 'Save to Wishlist'}
                      </button>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>

          <div className="pagination-wrap">
            <button
              className="btn btn-outline-secondary"
              type="button"
              disabled={meta.page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </button>
            <span className="page-indicator">
              Page {meta.page} of {Math.max(meta.totalPages || 1, 1)}
            </span>
            <button
              className="btn btn-outline-secondary"
              type="button"
              disabled={meta.page >= Math.max(meta.totalPages || 1, 1)}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default Products;
