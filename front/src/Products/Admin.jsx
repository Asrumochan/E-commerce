import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, extractErrorMessage } from '../api/client';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80';

const Admin = () => {
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalInventoryUnits: 0,
    totalInventoryValue: 0,
    lowStockCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate=useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [productResponse, summaryResponse] = await Promise.all([
        apiClient.get('/products', { params: { page: 1, limit: 50, sortBy: 'updatedAt', order: 'desc' } }),
        apiClient.get('/products/analytics/summary')
      ]);
      setProducts(productResponse.data.data || []);
      setSummary(summaryResponse.data || summary);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load admin dashboard'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deleteProd = async (id) => {
    try {
      await apiClient.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((product) => product._id !== id));
      fetchData();
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to delete product'));
    }
  };

  const updateProd = (id) => {
    navigate(`/update/${id}`);
  };

  if (loading) {
    return <div className="status-card">Loading admin dashboard...</div>;
  }

  return (
    <div className='pt-2'>
      <div className="page-header">
        <h1 className="page-title">Admin Console</h1>
        <p className="page-subtitle">Operational visibility, inventory controls, and reliable edit workflows.</p>
      </div>

      {error && <div className="status-card status-error">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3"><div className="metric-card"><h6>Total Products</h6><p>{summary.totalProducts}</p></div></div>
        <div className="col-sm-6 col-lg-3"><div className="metric-card"><h6>Inventory Units</h6><p>{summary.totalInventoryUnits}</p></div></div>
        <div className="col-sm-6 col-lg-3"><div className="metric-card"><h6>Inventory Value</h6><p>INR {summary.totalInventoryValue}</p></div></div>
        <div className="col-sm-6 col-lg-3"><div className="metric-card"><h6>Low Stock Items</h6><p>{summary.lowStockCount}</p></div></div>
      </div>

      <div className="table-card">
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
                    products.map((product)=>{
                      return <tr key={product._id}>
                        <td>{product.name}</td>
                        <td><img src={product.image} height={"70"} width={"70"} style={{objectFit: 'cover', borderRadius: '8px'}} onError={(e)=>{e.target.src=FALLBACK_IMAGE}} alt={product.name} /></td>
                        <td>{product.price}</td>
                        <td>{product.qty}</td>
                        <td><button className='btn btn-warning me-2' onClick={()=>updateProd(product._id)} >Update</button> <button className='btn btn-danger' onClick={()=>deleteProd(product._id)}>Delete</button></td>
                      </tr>
                    })
                  }
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
};

export default Admin;
