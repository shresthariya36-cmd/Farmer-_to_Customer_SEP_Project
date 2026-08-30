import { HeartIcon, CartIcon } from "./Icons.jsx";
import { t, productLabel } from "../i18n.js";

export default function ProductCard({ product, onAddToCart, onOpen, isFavorite, onToggleFavorite }) {
  return (
    <div className="product-card">
      <div className="thumb" onClick={() => onOpen && onOpen(product)} style={{ cursor: onOpen ? "pointer" : "default" }}>
        <img src={product.imageUrl || product.img} alt={productLabel(product.name)} />
        <span
          className="fav"
          onClick={(e) => {
            e.stopPropagation(); // don't also trigger the "open product" click above
            onToggleFavorite && onToggleFavorite(product);
          }}
          style={{ cursor: onToggleFavorite ? "pointer" : "default" }}
        >
          <HeartIcon filled={isFavorite} />
        </span>
      </div>
      <div className="info">
        <p className="name">{productLabel(product.name)}</p>
        <div className="row">
          <span className="price">रु. {product.price} / {product.unit || "kg"}</span>
          <span className="rating">★ {product.rating}</span>
        </div>
        <button className="btn btn-primary btn-full" onClick={() => onAddToCart(product)}>
          <CartIcon size={14} color="#fff" /> {t.addToCart}
        </button>
      </div>
    </div>
  );
}
