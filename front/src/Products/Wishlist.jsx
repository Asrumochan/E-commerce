import React from 'react';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80';

const Wishlist = ({ items = [], onAddToCart, onToggleWishlist }) => {
  const imgHandler = (evt) => {
    evt.target.src = FALLBACK_IMAGE;
  };

  return (
    <section>
      <div className="page-header">
        <h1 className="page-title">Wishlist</h1>
        <p className="page-subtitle">Save products you want to track or purchase later.</p>
      </div>

      {!items.length && <div className="status-card">Your wishlist is currently empty.</div>}

      {!!items.length && (
        <div className="row g-4">
          {items.map((product) => {
            return (
              <div className="col-sm-6 col-lg-3" key={product._id}>
                <article className="product-card">
                  <img src={product.image} onError={imgHandler} alt={product.name} className="product-image" />
                  <div className="product-content">
                    <h3 className="product-title">{product.name}</h3>
                    <p className="product-info">{product.info}</p>
                    <div className="product-row">
                      <span className="price-tag">INR {product.price}</span>
                      <span className={product.qty > 0 ? 'stock-tag' : 'stock-tag out'}>
                        {product.qty > 0 ? `${product.qty} in stock` : 'Out of stock'}
                      </span>
                    </div>
                    <button className="btn btn-success w-100" onClick={() => onAddToCart(product)} disabled={product.qty <= 0}>
                      Add to Cart
                    </button>
                    <button className="btn btn-outline-danger w-100 mt-2" onClick={() => onToggleWishlist(product)}>
                      Remove
                    </button>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Wishlist;
