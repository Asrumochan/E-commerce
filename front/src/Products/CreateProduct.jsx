import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, extractErrorMessage } from '../api/client';

const PRODUCT_DRAFT_KEY = 'createProductDraft';

const INITIAL_PRODUCT = {
  name: '',
  image: '',
  price: '',
  qty: '',
  info: ''
};

const CreateProduct = () => {
  const [product, setProduct] = useState(() => {
    const saved = localStorage.getItem(PRODUCT_DRAFT_KEY);
    if (!saved) {
      return INITIAL_PRODUCT;
    }

    try {
      return { ...INITIAL_PRODUCT, ...JSON.parse(saved) };
    } catch {
      return INITIAL_PRODUCT;
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem(PRODUCT_DRAFT_KEY, JSON.stringify(product));
  }, [product]);

  const validateProduct = (input) => {
    const nextErrors = {};

    if (!input.name.trim() || input.name.trim().length < 2) {
      nextErrors.name = 'Name must be at least 2 characters.';
    }

    const imageValue = input.image.trim();
    const isBase64 = imageValue.startsWith('data:image/');
    const isUrl = /^https?:\/\//i.test(imageValue);
    if (!imageValue || (!isBase64 && !isUrl)) {
      nextErrors.image = 'Provide a valid image URL or upload an image file.';
    }

    if (Number.isNaN(Number(input.price)) || Number(input.price) < 0) {
      nextErrors.price = 'Price must be a number greater than or equal to 0.';
    }

    if (!Number.isInteger(Number(input.qty)) || Number(input.qty) < 0) {
      nextErrors.qty = 'Quantity must be a whole number greater than or equal to 0.';
    }

    if (!input.info.trim() || input.info.trim().length < 10) {
      nextErrors.info = 'Description must be at least 10 characters.';
    }

    return nextErrors;
  };

  const isFormValid = useMemo(() => {
    return Object.keys(validateProduct(product)).length === 0;
  }, [product]);

  const updateHandler = (evt) => {
    const { name, value } = evt.target;
    const next = { ...product, [name]: value };
    setProduct(next);
    setFieldErrors(validateProduct(next));
  };

  const handleImageFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (loadEvent) => {
      const next = { ...product, image: loadEvent.target?.result || '' };
      setProduct(next);
      setFieldErrors(validateProduct(next));
    };
  };

  const resetForm = () => {
    setProduct(INITIAL_PRODUCT);
    setFieldErrors({});
    setError('');
    setSuccess('Draft cleared.');
    localStorage.removeItem(PRODUCT_DRAFT_KEY);
  };

  const addProduct = async (evt) => {
    evt.preventDefault();
    const validationErrors = validateProduct(product);
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length) {
      setError('Please fix form errors before submitting.');
      return;
    }

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
      setFieldErrors({});
      localStorage.removeItem(PRODUCT_DRAFT_KEY);
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
              {fieldErrors.name && <small className="field-error">{fieldErrors.name}</small>}
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
              {fieldErrors.image && <small className="field-error">{fieldErrors.image}</small>}
            </div>
            <div>
              <label className="form-label">Or Upload Image</label>
              <input className="form-control" type="file" accept="image/*" onChange={handleImageFileChange} />
            </div>
            {!!product.image && (
              <div className="image-preview-wrap">
                <label className="form-label">Preview</label>
                <img className="image-preview" src={product.image} alt="Product preview" />
              </div>
            )}
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
              {fieldErrors.price && <small className="field-error">{fieldErrors.price}</small>}
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
              {fieldErrors.qty && <small className="field-error">{fieldErrors.qty}</small>}
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
              <small className="text-muted">{product.info.length}/1000 characters</small>
              {fieldErrors.info && <small className="field-error d-block">{fieldErrors.info}</small>}
            </div>
            <div className="form-actions-inline">
              <button className="btn btn-primary" type="submit" disabled={submitting || !isFormValid}>
                {submitting ? 'Creating...' : 'Create Product'}
              </button>
              <button className="btn btn-outline-secondary" type="button" onClick={resetForm} disabled={submitting}>
                Clear Draft
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;
