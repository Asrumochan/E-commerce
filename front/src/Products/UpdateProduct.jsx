import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient, extractErrorMessage } from '../api/client';

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: '',
    image: '',
    price: '',
    qty: '',
    info: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.get(`/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        setError(extractErrorMessage(err, 'Unable to load product'));
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const updateHandler = (evt) => {
    const { name, value } = evt.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (loadEvent) => {
      setProduct((prev) => ({ ...prev, image: loadEvent.target?.result || prev.image }));
    };
  };

  const saveProduct = async (evt) => {
    evt.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await apiClient.put(`/products/${id}`, {
        ...product,
        price: Number(product.price),
        qty: Number(product.qty)
      });
      navigate('/admin');
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to update product'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="status-card">Loading product details...</div>;
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="form-shell">
          <h1 className="page-title">Update Product</h1>
          <p className="page-subtitle">Keep your inventory information accurate and up to date.</p>

          {error && <div className="status-card status-error">{error}</div>}

          <form className="form-grid" onSubmit={saveProduct}>
            <div>
              <label className="form-label">Product Name</label>
              <input
                className="form-control"
                type="text"
                required
                name="name"
                value={product.name}
                onChange={updateHandler}
              />
            </div>
            <div>
              <label className="form-label">Image URL</label>
              <input
                className="form-control"
                type="url"
                required
                name="image"
                value={product.image}
                onChange={updateHandler}
              />
            </div>
            <div>
              <label className="form-label">Or Upload Image</label>
              <input className="form-control" type="file" accept="image/*" onChange={handleImageFileChange} />
            </div>
            <div>
              <label className="form-label">Price</label>
              <input
                className="form-control"
                type="number"
                min="0"
                step="0.01"
                required
                name="price"
                value={product.price}
                onChange={updateHandler}
              />
            </div>
            <div>
              <label className="form-label">Quantity</label>
              <input
                className="form-control"
                type="number"
                min="0"
                required
                name="qty"
                value={product.qty}
                onChange={updateHandler}
              />
            </div>
            <div>
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="4"
                required
                name="info"
                value={product.info}
                onChange={updateHandler}
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProduct;
