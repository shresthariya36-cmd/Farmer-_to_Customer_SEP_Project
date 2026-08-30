import { useEffect, useState } from "react";
import Topbar from "./Topbar.jsx";
import Sidebar from "./Sidebar.jsx";
import { CartIcon } from "./Icons.jsx";
import { api } from "../api.js";
import { t, productLabel } from "../i18n.js";

const PRODUCT_IMAGES = {
  "Organic Tomato": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=100&q=80",
  "Cucumber": "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=100&q=80",
  "Potato": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=100&q=80",
  "Carrot": "https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=100&q=80",
};
const FALLBACK_IMG = "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=100&q=80";

const PAYMENT_METHODS = [
  { key: "cod", label: t.payCod },
  { key: "esewa", label: t.payEsewa },
  { key: "khalti", label: t.payKhalti },
  { key: "card", label: t.payCard },
];

export default function CartPage({ user, cartCount, onNavigate, onCartChanged }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState("cod");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  useEffect(() => {
    api.getCart()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const total = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.qty, 0);

  async function handlePlaceOrder() {
    setPlacing(true);
    setError("");
    try {
      const order = await api.checkout(payment);
      setConfirmedOrder(order);
      onCartChanged(0); // cart is now empty
    } catch (err) {
      setError(err.message || "अर्डर गर्न सकिएन");
    } finally {
      setPlacing(false);
    }
  }

  // ---- Order confirmation screen ----
  if (confirmedOrder) {
    return (
      <div>
        <Topbar user={user} cartCount={0} onNavigate={onNavigate} />
        <div className="app-body">
          <Sidebar user={user} active="dashboard" onNavigate={onNavigate} />
          <main className="main">
            <div className="card" style={{ maxWidth: 480, margin: "40px auto", textAlign: "center", padding: 32 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--green-100)", color: "var(--green-700)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28 }}>✓</div>
              <h3 style={{ marginBottom: 8 }}>{t.orderSuccess}</h3>
              <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 6 }}>{t.orderNumber}: #{confirmedOrder.id}</p>
              <p style={{ color: "var(--green-700)", fontWeight: 700, fontSize: 18, marginBottom: 20 }}>रु. {confirmedOrder.total}</p>
              <button className="btn btn-primary" style={{ marginBottom: 10, width: "100%" }} onClick={() => onNavigate("orders")}>{t.viewMyOrders}</button>
              <button className="btn btn-outline" style={{ width: "100%" }} onClick={() => onNavigate("dashboard")}>{t.continueShopping}</button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Topbar user={user} cartCount={cartCount} onNavigate={onNavigate} />
      <div className="app-body">
        <Sidebar user={user} active="dashboard" onNavigate={onNavigate} />
        <main className="main">
          <h2 style={{ marginBottom: 18, color: "var(--green-900)" }}>{t.cartTitle}</h2>

          {error && <p style={{ color: "#B3261E", fontSize: 13, marginBottom: 14 }}>{error}</p>}

          {loading ? (
            <p style={{ color: "var(--muted)", fontSize: 13 }}>{t.cartLoading}</p>
          ) : items.length === 0 ? (
            <div>
              <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 14 }}>{t.cartEmpty}</p>
              <button className="btn btn-primary" onClick={() => onNavigate("dashboard")}>{t.continueShopping}</button>
            </div>
          ) : (
            <div className="cart-layout">
              <div>
                {items.map((i) => (
                  <div className="cart-row" key={i.productId}>
                    <img src={PRODUCT_IMAGES[i.product?.name] || FALLBACK_IMG} alt={productLabel(i.product?.name || "")} />
                    <div>
                      <p className="cr-name">{productLabel(i.product?.name || "")}</p>
                      <p className="cr-meta">{i.qty} × रु. {i.product?.price}/{i.product?.unit}</p>
                    </div>
                    <span className="cr-price">रु. {(i.product?.price || 0) * i.qty}</span>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="row"><span>{t.subtotal}</span><span>रु. {total}</span></div>
                <div className="row total"><span>{t.total}</span><span>रु. {total}</span></div>

                <p style={{ fontSize: 13, fontWeight: 600, margin: "16px 0 8px" }}>{t.choosePayment}</p>
                <div className="payment-options">
                  {PAYMENT_METHODS.map((m) => (
                    <div
                      key={m.key}
                      className={`payment-option ${payment === m.key ? "selected" : ""}`}
                      onClick={() => setPayment(m.key)}
                    >
                      <input type="radio" checked={payment === m.key} onChange={() => setPayment(m.key)} />
                      {m.label}
                    </div>
                  ))}
                </div>

                <button className="btn btn-primary btn-full" onClick={handlePlaceOrder} disabled={placing}>
                  <CartIcon size={16} color="#fff" /> {placing ? t.placingOrder : t.placeOrder}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
