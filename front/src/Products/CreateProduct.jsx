import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, extractErrorMessage } from '../api/client';

const INITIAL_PRODUCT = {
  name: '',
  image: '',
  price: '',
  qty: '',
  info: ''
};

const CreateProduct = () => {
  const [product, setProduct] = useState(INITIAL_PRODUCT);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

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
      setProduct((prev) => ({ ...prev, image: loadEvent.target?.result || '' }));
    };
  };

  const addProduct = async (evt) => {
    evt.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await apiClient.post('/products', {
        ...product,
        price: Number(product.price),
        qty: Number(product.qty)
      });
      setSuccess('Product created successfully. Redirecting...');
      setProduct(INITIAL_PRODUCT);
      setTimeout(() => navigate('/products'), 700);
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to create product'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="form-shell">
          <h1 className="page-title">Create Product</h1>
          <p className="page-subtitle">Add complete product details and push it to inventory.</p>

          {error && <div className="status-card status-error">{error}</div>}
          {success && <div className="status-card status-success">{success}</div>}

          <form className="form-grid" onSubmit={addProduct}>
            <div>
              <label className="form-label">Product Name</label>
              <input
                className="form-control"
                type="text"
                placeholder="Enter product name"
                value={product.name}
                onChange={updateHandler}
                name="name"
                required
              />
            </div>
            <div>
              <label className="form-label">Image URL</label>
              <input
                className="form-control"
                type="url"
                placeholder="https://..."
                onChange={updateHandler}
                name="image"
                value={product.image}
                required
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
                placeholder="Enter price"
                onChange={updateHandler}
                name="price"
                value={product.price}
                required
              />
            </div>
            <div>
              <label className="form-label">Quantity</label>
              <input
                className="form-control"
                type="number"
                min="0"
                placeholder="Enter quantity"
                onChange={updateHandler}
                name="qty"
                value={product.qty}
                required
              />
            </div>
            <div>
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Enter product info"
                onChange={updateHandler}
                name="info"
                value={product.info}
                required
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Product'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;
