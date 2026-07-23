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
import OrderHistoryPage from './pages/OrderHistoryPage';
import { apiClient, extractErrorMessage } from './api/client';
import './styles.css';

const App = () => {
  const [cartItems, setCartItems] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
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
    if (!authUser) {
      localStorage.removeItem('authUser');
      delete apiClient.defaults.headers.common['x-user-id'];
      setCartItems([]);
      setOrderHistory([]);
      setWishlistItems([]);
      return;
    }

    localStorage.setItem('authUser', JSON.stringify(authUser));
    apiClient.defaults.headers.common['x-user-id'] = authUser.id;

    const fetchUserData = async () => {
      try {
        const [cartResponse, ordersResponse, wishlistResponse] = await Promise.all([
          apiClient.get('/cart'),
          apiClient.get('/orders'),
          apiClient.get('/wishlist')
        ]);
        setCartItems(cartResponse.data.items || []);
        setOrderHistory(ordersResponse.data.data || []);
        setWishlistItems(wishlistResponse.data.items || []);
      } catch (err) {
        setNotification(extractErrorMessage(err, 'Unable to sync user data'));
      }
    };

    fetchUserData();
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
    if (!authUser) {
      setNotification('Please login to add items to cart');
      return;
    }

    apiClient
      .post('/cart/items', { productId: product._id, quantity: 1 })
      .then((response) => {
        setCartItems(response.data.items || []);
        setNotification(`${product.name} added to cart`);
      })
      .catch((err) => {
        setNotification(extractErrorMessage(err, 'Unable to add item to cart'));
      });
  };

  const isWishlisted = (productId) => wishlistItems.some((item) => item._id === productId);

  const toggleWishlist = (product) => {
    if (!authUser) {
      setNotification('Please login to manage wishlist');
      return;
    }

    const exists = wishlistItems.some((item) => item._id === product._id);
    const request = exists
      ? apiClient.delete(`/wishlist/items/${product._id}`)
      : apiClient.post('/wishlist/items', { productId: product._id });

    request
      .then((response) => {
        setWishlistItems(response.data.items || []);
        setNotification(exists ? `${product.name} removed from wishlist` : `${product.name} saved to wishlist`);
      })
      .catch((err) => {
        setNotification(extractErrorMessage(err, 'Unable to update wishlist'));
      });
  };

  const updateCartQuantity = async (productId, delta) => {
    const target = cartItems.find((item) => item._id === productId);
    if (!target) {
      return;
    }

    const nextQty = Math.max(1, Number(target.quantity) + delta);
    try {
      const response = await apiClient.put(`/cart/items/${productId}`, { quantity: nextQty });
      setCartItems(response.data.items || []);
    } catch (err) {
      setNotification(extractErrorMessage(err, 'Unable to update cart item'));
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await apiClient.delete(`/cart/items/${productId}`);
      setCartItems(response.data.items || []);
    } catch (err) {
      setNotification(extractErrorMessage(err, 'Unable to remove cart item'));
    }
  };

  const clearCart = async () => {
    try {
      const response = await apiClient.delete('/cart');
      setCartItems(response.data.items || []);
    } catch (err) {
      setNotification(extractErrorMessage(err, 'Unable to clear cart'));
    }
  };

  const placeOrder = async (couponCode) => {
    const response = await apiClient.post('/orders/checkout', { couponCode: couponCode || '' });
    setCartItems(response.data.cart?.items || []);
    if (response.data.order) {
      setOrderHistory((prev) => [response.data.order, ...prev]);
    }
    return response.data;
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
          <Link className="nav-link-item" to="/orders">
            Orders
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
                  onPlaceOrder={placeOrder}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrderHistoryPage orders={orderHistory} />
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