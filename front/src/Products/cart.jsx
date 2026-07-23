import React, { useMemo, useState } from 'react';

const Cart = ({ cartItems = [], onIncrease, onDecrease, onRemove, onClear }) => {
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');

  const total = useMemo(() => {
    return cartItems.reduce((acc, product) => acc + Number(product.price) * Number(product.quantity), 0);
  }, [cartItems]);

  const totalItems = useMemo(() => {
    return cartItems.reduce((acc, product) => acc + Number(product.quantity), 0);
  }, [cartItems]);

  const discount = useMemo(() => {
    if (!couponApplied) {
      return 0;
    }
    return total * 0.1;
  }, [couponApplied, total]);

  const taxableAmount = Math.max(0, total - discount);
  const tax = taxableAmount * 0.05;
  const shipping = taxableAmount > 1000 || taxableAmount === 0 ? 0 : 75;
  const grandTotal = taxableAmount + tax + shipping;

  const applyCoupon = () => {
    const normalized = coupon.trim().toUpperCase();
    if (normalized === 'TERRAZZO10') {
      setCouponApplied(true);
      setCouponMessage('Coupon applied: 10% off');
      return;
    }
    setCouponApplied(false);
    setCouponMessage('Invalid coupon code');
  };

  const placeOrder = () => {
    if (!cartItems.length) {
      return;
    }
    setOrderPlaced(true);
    setCoupon('');
    setCouponApplied(false);
    setCouponMessage('');
    onClear();
  };

  return (
    <section>
      <div className="page-header">
        <h1 className="page-title">Cart</h1>
        <p className="page-subtitle">Review, adjust quantities, and confirm your order.</p>
      </div>

      {orderPlaced && (
        <div className="status-card status-success">
          Order placed successfully. Your cart is now empty.
        </div>
      )}

      {!cartItems.length && <div className="status-card">No items in cart yet.</div>}

      {!!cartItems.length && (
        <div className="table-card">
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((product) => {
                  const itemTotal = Number(product.price) * Number(product.quantity);
                  return (
                    <tr key={product._id}>
                      <td>{product.name}</td>
                      <td>INR {product.price}</td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => onDecrease(product._id)}>
                          -
                        </button>
                        <span className="mx-2 fw-bold">{product.quantity}</span>
                        <button className="btn btn-secondary btn-sm" onClick={() => onIncrease(product._id)}>
                          +
                        </button>
                      </td>
                      <td>INR {itemTotal.toFixed(2)}</td>
                      <td>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => onRemove(product._id)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="checkout-bar">
            <div className="checkout-summary">
              <h5 className="mb-1">Items: {totalItems}</h5>
              <p className="summary-line">Subtotal: INR {total.toFixed(2)}</p>
              <p className="summary-line">Discount: - INR {discount.toFixed(2)}</p>
              <p className="summary-line">Tax (5%): INR {tax.toFixed(2)}</p>
              <p className="summary-line">Shipping: INR {shipping.toFixed(2)}</p>
              <h4>Grand Total: INR {grandTotal.toFixed(2)}</h4>
              <small className="text-muted">Use code TERRAZZO10 for 10% discount.</small>
              <div className="coupon-row">
                <input
                  className="form-control"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Coupon code"
                />
                <button className="btn btn-outline-dark" onClick={applyCoupon}>
                  Apply
                </button>
              </div>
              {couponMessage && (
                <p className={couponApplied ? 'coupon-message ok' : 'coupon-message bad'}>{couponMessage}</p>
              )}
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary" onClick={onClear}>
                Clear Cart
              </button>
              <button className="btn btn-info text-white" onClick={placeOrder}>
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Cart;
