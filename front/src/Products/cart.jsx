import React, { useMemo, useState } from 'react';

const Cart = ({ cartItems = [], onIncrease, onDecrease, onRemove, onClear }) => {
  const [orderPlaced, setOrderPlaced] = useState(false);

  const total = useMemo(() => {
    return cartItems.reduce((acc, product) => acc + Number(product.price) * Number(product.quantity), 0);
  }, [cartItems]);

  const totalItems = useMemo(() => {
    return cartItems.reduce((acc, product) => acc + Number(product.quantity), 0);
  }, [cartItems]);

  const placeOrder = () => {
    if (!cartItems.length) {
      return;
    }
    setOrderPlaced(true);
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
            <div>
              <h5 className="mb-1">Items: {totalItems}</h5>
              <h4>Total: INR {total.toFixed(2)}</h4>
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
