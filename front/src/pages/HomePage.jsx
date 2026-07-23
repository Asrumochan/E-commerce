import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = ({ isLoggedIn }) => {
  return (
    <section className="hero-wrap">
      <div className="hero-panel">
        <p className="hero-eyebrow">Terrazzo KS Experience</p>
        <h1 className="hero-title">Build your store operations with confidence.</h1>
        <p className="hero-text">
          TerraShop combines a product catalog, wishlist, admin controls, and checkout flow into one reliable workspace.
          Designed for speed, clarity, and growth.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-dark" to="/products">
            Browse Products
          </Link>
          <Link className="btn btn-outline-dark" to={isLoggedIn ? '/cart' : '/login'}>
            {isLoggedIn ? 'Go to Cart' : 'Login to Continue'}
          </Link>
        </div>
      </div>

      <div className="hero-grid">
        <article className="hero-card">
          <h3>Operational Dashboard</h3>
          <p>Monitor inventory value, low stock products, and catalog health at a glance.</p>
        </article>
        <article className="hero-card">
          <h3>Smart Discovery</h3>
          <p>Use search, sort, and price filtering to help customers find products faster.</p>
        </article>
        <article className="hero-card">
          <h3>Conversion Ready Cart</h3>
          <p>Coupon, tax, and shipping breakdowns create a professional checkout experience.</p>
        </article>
      </div>
    </section>
  );
};

export default HomePage;
