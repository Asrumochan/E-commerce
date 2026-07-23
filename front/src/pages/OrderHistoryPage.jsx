import React from 'react';

const OrderHistoryPage = ({ orders = [] }) => {
  return (
    <section>
      <div className="page-header">
        <h1 className="page-title">Order History</h1>
        <p className="page-subtitle">All orders placed from your account are stored and shown here.</p>
      </div>

      {!orders.length && <div className="status-card">No orders placed yet.</div>}

      {!!orders.length && (
        <div className="order-grid">
          {orders.map((order) => (
            <article className="order-card" key={order._id}>
              <div className="order-card-head">
                <h4>Order #{String(order._id).slice(-6).toUpperCase()}</h4>
                <span className="order-status">{order.status}</span>
              </div>
              <p className="order-meta">Placed: {new Date(order.createdAt).toLocaleString()}</p>

              <div className="table-responsive">
                <table className="table table-sm align-middle mb-2">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={`${order._id}-${index}`}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>INR {Number(item.lineTotal).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="order-total-lines">
                <p>Subtotal: INR {Number(order.totals.subtotal).toFixed(2)}</p>
                <p>Discount: INR {Number(order.totals.discount).toFixed(2)}</p>
                <p>Tax: INR {Number(order.totals.tax).toFixed(2)}</p>
                <p>Shipping: INR {Number(order.totals.shipping).toFixed(2)}</p>
                <h5>Grand Total: INR {Number(order.totals.grandTotal).toFixed(2)}</h5>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default OrderHistoryPage;
