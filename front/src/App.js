import React, { useEffect, useMemo, useState } from 'react';
import { Link, BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faRightFromBracket, faShoppingCart, faUser } from '@fortawesome/free-solid-svg-icons';
import Products from './Products/Products';
import Admin from './Products/Admin';
import CreateProduct from './Products/CreateProduct';
import UpdateProduct from './Products/UpdateProduct';
import Cart from './Products/cart';
import Wishlist from './Products/Wishlist';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { apiClient } from './api/client';
import './styles.css';

const App = () => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cartItems');
    if (!saved) {
      return [];
    }

    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });
  const [wishlistItems, setWishlistItems] = useState(() => {
    const saved = localStorage.getItem('wishlistItems');
    if (!saved) {
      return [];
    }

    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });
  const [notification, setNotification] = useState('');
  const [authUser, setAuthUser] = useState(() => {
    const saved = localStorage.getItem('authUser');
    if (!saved) {
      return null;
    }

    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  useEffect(() => {
    if (!authUser) {
      localStorage.removeItem('authUser');
      delete apiClient.defaults.headers.common['x-user-id'];
      return;
    }

    localStorage.setItem('authUser', JSON.stringify(authUser));
    apiClient.defaults.headers.common['x-user-id'] = authUser.id;
  }, [authUser]);

  useEffect(() => {
    if (!notification) {
      return;
    }
    const timer = setTimeout(() => setNotification(''), 1800);
    return () => clearTimeout(timer);
  }, [notification]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );
  const wishlistCount = useMemo(() => wishlistItems.length, [wishlistItems]);
  const isAdmin = authUser?.role === 'admin';

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });
    setNotification(`${product.name} added to cart`);
  };

  const isWishlisted = (productId) => wishlistItems.some((item) => item._id === productId);

  const toggleWishlist = (product) => {
    setWishlistItems((prev) => {
      if (prev.some((item) => item._id === product._id)) {
        setNotification(`${product.name} removed from wishlist`);
        return prev.filter((item) => item._id !== product._id);
      }
      setNotification(`${product.name} saved to wishlist`);
      return [...prev, product];
    });
  };

  const updateCartQuantity = (productId, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item._id === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const loginUser = (userProfile) => {
    setAuthUser(userProfile);
    setNotification(`Welcome ${userProfile.name}`);
  };

  const logoutUser = () => {
    setAuthUser(null);
    setNotification('Logged out successfully');
  };

  const ProtectedRoute = ({ children }) => {
    if (!authUser) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  const ProtectedAdminRoute = ({ children }) => {
    if (!authUser) {
      return <Navigate to="/login" replace />;
    }

    if (authUser.role !== 'admin') {
      return <Navigate to="/products" replace />;
    }

    return children;
  };

  return (
    <Router>
      <nav className="app-nav">
        <div className="brand-area">
          <Link to="/" className="brand-link">
            TerraShop
          </Link>
          <span className="brand-subtitle">Professional Commerce Suite</span>
        </div>
        <div className="nav-links-wrap">
          <Link className="nav-link-item" to="/">
            Home
          </Link>
          <Link className="nav-link-item" to="/products">
            Products
          </Link>
          <Link className="nav-link-item" to="/wishlist">
            Wishlist
          </Link>
          {isAdmin && (
            <>
              <Link className="nav-link-item" to="/create">
                New Product
              </Link>
              <Link className="nav-link-item" to="/admin">
                Admin
              </Link>
            </>
          )}
        </div>
        {!authUser ? (
          <div className="auth-links-wrap">
            <Link className="auth-pill secondary" to="/signup" aria-label="Open signup page">
              <span>Sign Up</span>
            </Link>
            <Link className="auth-pill" to="/login" aria-label="Open login page">
              <FontAwesomeIcon icon={faUser} />
              <span>Login</span>
            </Link>
          </div>
        ) : (
          <button className="auth-pill logout" type="button" onClick={logoutUser}>
            <FontAwesomeIcon icon={faRightFromBracket} />
            <span>{authUser.name} ({authUser.role})</span>
          </button>
        )}
        <Link to="/cart" className="cart-pill" aria-label="Open cart">
          <FontAwesomeIcon icon={faShoppingCart} />
          <span>{cartCount}</span>
        </Link>
        <Link to="/wishlist" className="wishlist-pill" aria-label="Open wishlist">
          <FontAwesomeIcon icon={faHeart} />
          <span>{wishlistCount}</span>
        </Link>
      </nav>

      {notification && <div className="toast-note">{notification}</div>}

      <main className="app-main container-fluid">
        <Routes>
          <Route path="/" element={<HomePage isLoggedIn={!!authUser} />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<LoginPage onLogin={loginUser} isLoggedIn={!!authUser} />} />
          <Route path="/signup" element={<SignupPage onSignup={loginUser} isLoggedIn={!!authUser} />} />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Products onAddToCart={addToCart} onToggleWishlist={toggleWishlist} isWishlisted={isWishlisted} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist items={wishlistItems} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <Admin />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedAdminRoute>
                <CreateProduct />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/update/:id"
            element={
              <ProtectedAdminRoute>
                <UpdateProduct />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart
                  cartItems={cartItems}
                  onIncrease={(id) => updateCartQuantity(id, 1)}
                  onDecrease={(id) => updateCartQuantity(id, -1)}
                  onRemove={removeFromCart}
                  onClear={clearCart}
                />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<div className="status-card status-error">Page not found</div>} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>TerraShop Commerce Suite</p>
        <p>Inventory, Wishlist, Cart and Admin controls in one workflow.</p>
      </footer>
    </Router>
  );
};

export default App;