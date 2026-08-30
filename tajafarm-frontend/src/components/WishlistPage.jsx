import { useEffect, useState } from "react";
import Topbar from "./Topbar.jsx";
import Sidebar from "./Sidebar.jsx";
import ProductCard from "./ProductCard.jsx";
import { api } from "../api.js";
import { t } from "../i18n.js";

const PRODUCT_IMAGES = {
  "Organic Tomato": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80",
  "Cucumber": "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=300&q=80",
  "Potato": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=300&q=80",
  "Carrot": "https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=300&q=80",
};
const FALLBACK_IMG = "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=300&q=80";

export default function WishlistPage({ user, cartCount, onNavigate, onAddToCart, onOpenProduct }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    api.getWishlist()
      .then((list) => setProducts(list.map(p => ({ ...p, img: PRODUCT_IMAGES[p.name] || FALLBACK_IMG }))))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleRemove(product) {
    await api.toggleWishlist(product.id); // it's already in the list, so this removes it
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
  }

  return (
    <div>
      <Topbar user={user} cartCount={cartCount} onNavigate={onNavigate} />
      <div className="app-body">
        <Sidebar user={user} active="wishlist" onNavigate={onNavigate} />
        <main className="main">
          <h2 style={{ marginBottom: 18, color: "var(--green-900)" }}>{t.wishlistTitle}</h2>

          {loading ? (
            <p style={{ color: "var(--muted)", fontSize: 13 }}>{t.loadingProducts}</p>
          ) : products.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 13 }}>{t.wishlistEmpty}</p>
          ) : (
            <section className="product-grid">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{ ...p, rating: p.rating || "नयाँ" }}
                  onAddToCart={onAddToCart}
                  onOpen={(prod) => onOpenProduct(prod.id)}
                  isFavorite={true}
                  onToggleFavorite={handleRemove}
                />
              ))}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
