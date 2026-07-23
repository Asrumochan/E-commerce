import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, extractErrorMessage } from '../api/client';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80';

const DEFAULT_SUMMARY = {
  totalProducts: 0,
  totalInventoryUnits: 0,
  totalInventoryValue: 0,
  lowStockCount: 0
};

const Admin = () => {
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [actionProductId, setActionProductId] = useState('');
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [productResponse, summaryResponse] = await Promise.all([
        apiClient.get('/products', { params: { page: 1, limit: 100, sortBy: 'updatedAt', order: 'desc' } }),
        apiClient.get('/products/analytics/summary')
      ]);
      setProducts(productResponse.data.data || []);
      setSummary(summaryResponse.data || DEFAULT_SUMMARY);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load admin dashboard'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const deleteProd = async (id) => {
    const shouldDelete = window.confirm('Delete this product permanently?');
    if (!shouldDelete) {
      return;
    }

    setActionProductId(id);
    setError('');
    try {
      await apiClient.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((product) => product._id !== id));
      await fetchData();
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to delete product'));
    } finally {
      setActionProductId('');
    }
  };

  const quickRestock = async (product) => {
    setActionProductId(product._id);
    setError('');
    try {
      await apiClient.put(`/products/${product._id}`, {
        ...product,
        qty: Number(product.qty) + 10
      });
      await fetchData();
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to restock product'));
    } finally {
      setActionProductId('');
    }
  };

  const updateProd = (id) => {
    navigate(`/update/${id}`);
  };

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    let filtered = products.filter((product) => {
      const matchesSearch = query
        ? product.name.toLowerCase().includes(query) || product.info.toLowerCase().includes(query)
        : true;

      if (!matchesSearch) {
        return false;
      }

      if (stockFilter === 'low') {
        return Number(product.qty) > 0 && Number(product.qty) <= 5;
      }

      if (stockFilter === 'out') {
        return Number(product.qty) === 0;
      }

      if (stockFilter === 'in') {
        return Number(product.qty) > 0;
      }

      return true;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'priceDesc') {
        return Number(b.price) - Number(a.price);
      }
      if (sortBy === 'priceAsc') {
        return Number(a.price) - Number(b.price);
      }
      if (sortBy === 'nameAsc') {
        return a.name.localeCompare(b.name);
      }
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    });

    return filtered;
  }, [products, search, stockFilter, sortBy]);

  if (loading) {
    return <div className="status-card">Loading admin dashboard...</div>;
  }

  return (
    <div className='pt-2 page-shell'>
      <div className="page-header">
        <h1 className="page-title">Admin Console</h1>
        <p className="page-subtitle">Operational visibility, inventory controls, and reliable edit workflows.</p>
      </div>

      {error && <div className="status-card status-error">{error}</div>}

      <div className="toolbar-card elevated-card admin-toolbar">
        <div>
          <label className="form-label">Search</label>
          <input
            className="form-control"
            placeholder="Search by name or description"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div>
          <label className="form-label">Stock</label>
          <select className="form-select" value={stockFilter} onChange={(event) => setStockFilter(event.target.value)}>
            <option value="all">All</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock (1-5)</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
        <div>
          <label className="form-label">Sort</label>
          <select className="form-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="updatedAt">Recently Updated</option>
            <option value="nameAsc">Name A-Z</option>
            <option value="priceDesc">Price High-Low</option>
            <option value="priceAsc">Price Low-High</option>
          </select>
        </div>
        <div className="admin-toolbar-actions">
          <button className="btn btn-outline-dark" type="button" onClick={() => fetchData()}>
            Refresh Data
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3"><div className="metric-card"><h6>Total Products</h6><p>{summary.totalProducts}</p></div></div>
        <div className="col-sm-6 col-lg-3"><div className="metric-card"><h6>Inventory Units</h6><p>{summary.totalInventoryUnits}</p></div></div>
        <div className="col-sm-6 col-lg-3"><div className="metric-card"><h6>Inventory Value</h6><p>INR {summary.totalInventoryValue}</p></div></div>
        <div className="col-sm-6 col-lg-3"><div className="metric-card"><h6>Low Stock Items</h6><p>{summary.lowStockCount}</p></div></div>
      </div>

      <div className="result-chip">Showing {visibleProducts.length} products</div>

      <div className="table-card elevated-card">
        <div className="table-responsive">
            <table className='table table-striped align-middle'>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Image</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                  {
                    visibleProducts.map((product)=>{
                      const isBusy = actionProductId === product._id;
                      return <tr key={product._id}>
                        <td>{product.name}</td>
                        <td><img src={product.image} height={"70"} width={"70"} style={{objectFit: 'cover', borderRadius: '8px'}} onError={(e)=>{e.target.src=FALLBACK_IMAGE}} alt={product.name} /></td>
                        <td>INR {product.price}</td>
                        <td>
                          <span className={Number(product.qty) === 0 ? 'qty-badge out' : Number(product.qty) <= 5 ? 'qty-badge low' : 'qty-badge good'}>
                            {product.qty}
                          </span>
                        </td>
                        <td>
                          <div className="admin-action-group">
                            <button className='btn btn-warning btn-sm' disabled={isBusy} onClick={()=>updateProd(product._id)} >Update</button>
                            <button className='btn btn-secondary btn-sm' disabled={isBusy} onClick={()=>quickRestock(product)}>
                              +10 Stock
                            </button>
                            <button className='btn btn-danger btn-sm' disabled={isBusy} onClick={()=>deleteProd(product._id)}>
                              {isBusy ? 'Working...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    })
                  }
                  {!visibleProducts.length && (
                    <tr>
                      <td colSpan="5">
                        <div className="status-card mb-0">No products match your filters.</div>
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
};

export default Admin;
