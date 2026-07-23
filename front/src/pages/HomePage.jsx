import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = ({ isLoggedIn }) => {
  return (
    <section className="home-shell page-shell">
      <div className="hero-panel home-hero-panel">
        <p className="hero-eyebrow">TerraShop Home</p>
        <h1 className="hero-title">Find products fast and checkout without friction.</h1>
        <p className="hero-text">
          Everything is organized in one place so you can discover products, save favorites, and place orders with fewer clicks.
        </p>

        <div className="hero-pill-row">
          <span className="hero-pill">Simple Navigation</span>
          <span className="hero-pill">Saved Cart & Wishlist</span>
          <span className="hero-pill">Secure Account Access</span>
        </div>

        <div className="hero-actions">
          <Link className="btn btn-dark" to={isLoggedIn ? '/products' : '/login'}>
            {isLoggedIn ? 'Start Shopping' : 'Login to Start Shopping'}
          </Link>
          <Link className="btn btn-outline-dark" to={isLoggedIn ? '/orders' : '/signup'}>
            {isLoggedIn ? 'View My Orders' : 'Create Free Account'}
          </Link>
        </div>
      </div>

      <div className="home-quick-grid">
        <Link className="home-quick-card card-tilt" to={isLoggedIn ? '/products' : '/login'}>
          <h3>Browse Products</h3>
          <p>Search, filter, and sort products in seconds.</p>
        </Link>
        <Link className="home-quick-card card-tilt" to={isLoggedIn ? '/wishlist' : '/login'}>
          <h3>Open Wishlist</h3>
          <p>Keep track of items you want to buy later.</p>
        </Link>
        <Link className="home-quick-card card-tilt" to={isLoggedIn ? '/cart' : '/login'}>
          <h3>Go to Cart</h3>
          <p>Review totals, apply coupons, and checkout quickly.</p>
        </Link>
      </div>

      <div className="home-info-grid">
        <article className="home-info-card">
          <h4>How it works</h4>
          <ol className="home-steps">
            <li>Create your account or log in.</li>
            <li>Browse products and add to cart or wishlist.</li>
            <li>Checkout and track your order history.</li>
          </ol>
        </article>

        <article className="home-info-card">
          <h4>Why users like TerraShop</h4>
          <ul className="home-bullets">
            <li>Fast product discovery with filters and sorting</li>
            <li>Persistent cart, wishlist, and order history</li>
            <li>Clean layout that works on mobile and desktop</li>
          </ul>
        </article>
      </div>
    </section>
  );
};

export default HomePage;
