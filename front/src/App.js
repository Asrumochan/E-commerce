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
      return;
    }

    localStorage.setItem('authUser', JSON.stringify(authUser));
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
          <Link className="nav-link-item" to="/create">
            New Product
          </Link>
          <Link className="nav-link-item" to="/admin">
            Admin
          </Link>
        </div>
        {!authUser ? (
          <Link className="auth-pill" to="/login" aria-label="Open login page">
            <FontAwesomeIcon icon={faUser} />
            <span>Login</span>
          </Link>
        ) : (
          <button className="auth-pill logout" type="button" onClick={logoutUser}>
            <FontAwesomeIcon icon={faRightFromBracket} />
            <span>{authUser.name}</span>
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
          <Route
            path="/products"
            element={<Products onAddToCart={addToCart} onToggleWishlist={toggleWishlist} isWishlisted={isWishlisted} />}
          />
          <Route
            path="/wishlist"
            element={<Wishlist items={wishlistItems} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} />}
          />
          <Route path="/admin" element={<Admin />} />
          <Route path="/create" element={<CreateProduct />} />
          <Route path="/update/:id" element={<UpdateProduct />} />
          <Route
            path="/cart"
            element={
              <Cart
                cartItems={cartItems}
                onIncrease={(id) => updateCartQuantity(id, 1)}
                onDecrease={(id) => updateCartQuantity(id, -1)}
                onRemove={removeFromCart}
                onClear={clearCart}
              />
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