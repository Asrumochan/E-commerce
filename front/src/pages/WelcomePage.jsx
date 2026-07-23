import React from 'react';
import { Link } from 'react-router-dom';

const WelcomePage = ({ user, cartCount, wishlistCount }) => {
  return (
    <section className="welcome-wrap">
      <div className="welcome-banner">
        <p className="hero-eyebrow">Welcome Back</p>
        <h1 className="hero-title">Hello {user?.name}</h1>
        <p className="hero-text">
          You are signed in with {user?.email}. Continue exploring products or jump into your cart and wishlist.
        </p>
      </div>

      <div className="welcome-metrics">
        <article className="welcome-metric-card">
          <h4>Cart Items</h4>
          <p>{cartCount}</p>
        </article>
        <article className="welcome-metric-card">
          <h4>Wishlist Items</h4>
          <p>{wishlistCount}</p>
        </article>
        <article className="welcome-metric-card">
          <h4>Session Started</h4>
          <p>{new Date(user?.loggedInAt || Date.now()).toLocaleString()}</p>
        </article>
      </div>

      <div className="hero-actions">
        <Link className="btn btn-dark" to="/products">
          Continue Shopping
        </Link>
        <Link className="btn btn-outline-dark" to="/cart">
          View Cart
        </Link>
      </div>
    </section>
  );
};

export default WelcomePage;
