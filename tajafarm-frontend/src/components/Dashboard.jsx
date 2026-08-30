import { useEffect, useState } from "react";
import Topbar from "./Topbar.jsx";
import Sidebar from "./Sidebar.jsx";
import ProductCard from "./ProductCard.jsx";
import { api } from "../api.js";
import { t, categoryLabel } from "../i18n.js";

const fallback =
  "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80";

const categoryImages = {
  Vegetables:
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=160&q=80",

  Fruits:
    "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=160&q=80",

  Dairy:
    "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=160&q=80",

  Grains:
    "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=160&q=80",

  Pulses:
    "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=160&q=80",

  Organic:
    "https://images.unsplash.com/photo-1472141521881-95d0e87e2e39?auto=format&fit=crop&w=160&q=80",

  "Leafy Greens":
    "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=160&q=80"
};

export default function Dashboard({
  user,
  cartCount,
  onAddToCart,
  onNavigate,
  onOpenProduct
}) {
  const [products, setProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  const [query, setQuery] = useState("");
  const [locQuery, setLocQuery] = useState("");

  const [category, setCategory] = useState("");

  const [favorites, setFavorites] =
    useState(new Set());

  const [categoryError, setCategoryError] =
    useState("");

  /*
   * Load categories
   */
  useEffect(() => {
    api
      .getCategories()
      .then((data) => {
        setCategories(data || []);
      })
      .catch(() => {
        setCategories([
          "Vegetables",
          "Fruits",
          "Dairy",
          "Grains",
          "Pulses",
          "Organic",
          "Leafy Greens"
        ]);

        setCategoryError(
          "Using default categories because the category service is unavailable."
        );
      });
  }, []);

  /*
   * Load products, farmers and wishlist
   */
  useEffect(() => {
    let dead = false;

    setLoading(true);

    Promise.all([
      api.getProducts({
        search: query,
        location: locQuery,
        category: category
      }),

      api.searchFarmers({
        search: query,
        location: locQuery
      }),

      user?.role === "customer"
        ? api
          .getWishlist()
          .catch(() => [])
        : Promise.resolve([])
    ])
      .then(([ps, fs, ws]) => {
        if (dead) return;

        setProducts(ps || []);
        setFarmers(fs || []);

        setFavorites(
          new Set(
            (ws || []).map(
              (x) => x.id
            )
          )
        );
      })
      .catch(() => {
        if (dead) return;

        setProducts([]);
        setFarmers([]);
      })
      .finally(() => {
        if (!dead) {
          setLoading(false);
        }
      });

    return () => {
      dead = true;
    };
  }, [
    query,
    locQuery,
    category,
    user?.role
  ]);

  /*
   * Wishlist
   */
  async function fav(p) {
    if (!user) {
      onNavigate("login");
      return;
    }

    try {
      const x =
        await api.toggleWishlist(p.id);

      setFavorites((s) => {
        const n = new Set(s);

        if (x.favorite) {
          n.add(p.id);
        } else {
          n.delete(p.id);
        }

        return n;
      });
    } catch {
      // Keep existing behavior
    }
  }

  /*
   * Category
   */
  function selectCategory(name) {
    setCategory(
      name === category
        ? ""
        : name
    );
  }

  /*
   * IMPORTANT:
   * Open product using the PRODUCT ID.
   *
   * This is the part that fixes:
   * "Product ID is missing or invalid."
   */
  function openProduct(product) {
    if (!product) {
      return;
    }

    const id = product.id;

    if (
      id === undefined ||
      id === null ||
      id === ""
    ) {
      console.error(
        "Product ID is missing:",
        product
      );

      return;
    }

    /*
     * Always pass the ID as a number.
     */
    const numericId = Number(id);

    if (
      Number.isNaN(numericId) ||
      numericId <= 0
    ) {
      console.error(
        "Invalid product ID:",
        id
      );

      return;
    }

    /*
     * Send ONLY the product ID.
     */
    if (
      typeof onOpenProduct ===
      "function"
    ) {
      onOpenProduct(numericId);
    }
  }

  return (
    <div>
      <Topbar
        user={user}
        cartCount={cartCount}
        onNavigate={onNavigate}
        searchValue={search}
        onSearchChange={setSearch}
        onSearchSubmit={() =>
          setQuery(
            search.trim()
          )
        }
      />

      <div className="app-body">

        <Sidebar
          user={user}
          active="dashboard"
          onNavigate={onNavigate}
        />

        <main className="main">

          {/* HERO */}

          <section className="hero-section">

            <div className="hero-content">

              <h1>
                {t.heroTitle}
                <br />

                <span>
                  {t.heroSubtitle}
                </span>
              </h1>

              <p>
                {t.heroDescription}
              </p>

            </div>

            <div className="hero-image">

              <img
                src="https://mitraweb.in/blogs/wp-content/uploads/2022/05/Farming.jpg"
                alt={t.heroImageAlt}
              />

            </div>

          </section>

          <br />

          {/* CATEGORIES */}

          <div className="section-head">

            <h3>
              {t.shopByCategories}
            </h3>

            {category && (
              <button
                className="btn btn-outline"
                onClick={() =>
                  setCategory("")
                }
                style={{
                  padding:
                    "6px 10px",
                  fontSize: 11
                }}
              >
                {t.clearFilter}
              </button>
            )}

          </div>

          {categoryError && (
            <p
              style={{
                fontSize: 11,
                color:
                  "var(--muted)",
                marginBottom: 10
              }}
            >
              {categoryError}
            </p>
          )}

          <section className="categories">

            {categories.map(
              (name) => (
                <div
                  key={name}
                  className={`category-item ${category === name
                      ? "active"
                      : ""
                    }`}
                  onClick={() =>
                    selectCategory(
                      name
                    )
                  }
                >

                  <div className="circle">

                    <img
                      src={
                        categoryImages[
                        name
                        ] || fallback
                      }
                      alt={categoryLabel(
                        name
                      )}
                    />

                  </div>

                  <span>
                    {categoryLabel(
                      name
                    )}
                  </span>

                </div>
              )
            )}

          </section>

          {/* SEARCH */}

          <div className="search-location-bar">

            <input
              placeholder={`${t.location} (e.g. Kathmandu, Kavre)`}
              value={location}
              onChange={(e) =>
                setLocation(
                  e.target.value
                )
              }
            />

            <button
              className="btn btn-outline"
              onClick={() =>
                setLocQuery(
                  location.trim()
                )
              }
            >
              {t.search}
            </button>

            {(locQuery ||
              category ||
              query) && (
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setLocQuery("");
                    setLocation("");
                    setCategory("");
                    setQuery("");
                    setSearch("");
                  }}
                >
                  {t.clearFilters}
                </button>
              )}

          </div>

          {/* TITLE */}

          <div className="section-head">

            <h3>

              {category
                ? `${t.showingCategory} ${categoryLabel(
                  category
                )}`
                : query
                  ? `${t.search}: ${query}`
                  : t.topPicks}

            </h3>

          </div>

          {/* FARMERS */}

          {farmers.length > 0 && (
            <>
              <div className="section-head">

                <h3>
                  {t.farmers}
                </h3>

              </div>

              <div className="farmer-search-grid">

                {farmers.map(
                  (f) => (
                    <div
                      className="farmer-search-card"
                      key={f.id}
                    >

                      <div className="profile-avatar">

                        {f.profileImage ? (
                          <img
                            src={
                              f.profileImage
                            }
                            alt=""
                          />
                        ) : (
                          f.name?.[0]
                        )}

                      </div>

                      <b>
                        {f.name}
                      </b>

                      <span>
                        {f.location ||
                          t.noLocation}
                      </span>

                    </div>
                  )
                )}

              </div>
            </>
          )}

          {/* PRODUCTS */}

          <div
            id="products"
            className="section-head"
          >

            <h3>
              {t.foods}
            </h3>

          </div>

          {loading ? (
            <p>
              {t.loadingProducts}
            </p>
          ) : products.length === 0 ? (
            <p>
              {category
                ? t.noProductsInCategory
                : t.noSearchResults}
            </p>
          ) : (
            <section className="product-grid">

              {products.map(
                (p) => (

                  <ProductCard
                    key={p.id}

                    product={{
                      ...p,
                      img:
                        p.imageUrl ||
                        fallback,
                      rating:
                        p.rating ||
                        t.newItem
                    }}

                    isFavorite={favorites.has(
                      p.id
                    )}

                    onToggleFavorite={
                      fav
                    }

                    onAddToCart={
                      onAddToCart
                    }

                    /*
                     * IMPORTANT:
                     * ProductCard receives a function
                     * that sends p.id to the parent.
                     */
                    onOpen={() =>
                      openProduct(p)
                    }
                  />

                )
              )}

            </section>
          )}

        </main>

      </div>
    </div>
  );
}
