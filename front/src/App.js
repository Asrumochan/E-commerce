import React, { useEffect, useMemo, useState } from 'react';
import { Link, BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import Products from './Products/Products';
import Admin from './Products/Admin';
import CreateProduct from './Products/CreateProduct';
import UpdateProduct from './Products/UpdateProduct';
import Cart from './Products/cart';
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

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

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
          <Link className="nav-link-item" to="/products">
            Products
          </Link>
          <Link className="nav-link-item" to="/create">
            New Product
          </Link>
          <Link className="nav-link-item" to="/admin">
            Admin
          </Link>
        </div>
        <Link to="/cart" className="cart-pill" aria-label="Open cart">
          <FontAwesomeIcon icon={faShoppingCart} />
          <span>{cartCount}</span>
        </Link>
      </nav>

      <main className="app-main container-fluid">
        <Routes>
          <Route path="/" element={<Products onAddToCart={addToCart} />} />
          <Route path="/products" element={<Products onAddToCart={addToCart} />} />
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
        </Routes>
      </main>
    </Router>
  );
};

export default App;