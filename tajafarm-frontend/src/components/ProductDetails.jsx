import { useEffect, useState } from "react";

import Topbar from "./Topbar.jsx";
import ProductCard from "./ProductCard.jsx";

import {
  HeartIcon,
  CheckIcon,
  LeafIcon,
  UserIcon,
  CartIcon,
  MessageIcon
} from "./Icons.jsx";

import { api } from "../api.js";

import {
  t,
  categoryLabel,
  productLabel
} from "../i18n.js";


const GALLERY = [

  "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=700&q=80",

  "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=150&q=80",

  "https://images.unsplash.com/photo-1561136594-7f68413baa99?auto=format&fit=crop&w=150&q=80",

  "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=150&q=80"

];


const FALLBACK_IMG = GALLERY[0];


const PRODUCT_IMAGES = {

  "Organic Tomato":
    "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80",

  "Cucumber":
    "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=300&q=80",

  "Potato":
    "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=300&q=80",

  "Carrot":
    "https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=300&q=80"

};


export default function ProductDetails({

  user,
  productId,
  cartCount,
  onAddToCart,
  onBuyNow,
  onNavigate

}) {

  const [product, setProduct] = useState(null);

  const [related, setRelated] = useState([]);

  const [mainImg, setMainImg] =
    useState(FALLBACK_IMG);

  const [qty, setQty] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [added, setAdded] =
    useState(false);

  const [showContact, setShowContact] =
    useState(false);

  const [messageText, setMessageText] =
    useState("");

  const [sendingMessage, setSendingMessage] =
    useState(false);

  const [messageSent, setMessageSent] =
    useState(false);


  // ============================
  // LOAD PRODUCT
  // ============================

  useEffect(() => {

    let cancelled = false;

    if (!productId) {

      setError("Product ID is missing");

      setLoading(false);

      return;

    }

    setLoading(true);

    setError("");


    Promise.all([

      api.getProduct(productId),

      api.getProducts()

    ])

      .then(([p, all]) => {

        if (cancelled) return;


        setProduct(p);


        setMainImg(

          p.imageUrl ||

          PRODUCT_IMAGES[p.name] ||

          FALLBACK_IMG

        );


        setRelated(

          (all || [])

            .filter(x =>
              x.id !== p.id
            )

            .map(x => ({

              ...x,

              img:

                x.imageUrl ||

                PRODUCT_IMAGES[x.name] ||

                FALLBACK_IMG

            }))

        );

      })

      .catch(err => {

        if (!cancelled) {

          setError(

            err.message ||

            "उत्पादन लोड गर्न सकिएन"

          );

        }

      })

      .finally(() => {

        if (!cancelled) {

          setLoading(false);

        }

      });


    return () => {

      cancelled = true;

    };

  }, [productId]);


  // ============================
  // ADD TO CART
  // ============================

  async function handleAddToCart() {

    try {

      await onAddToCart(
        product,
        qty
      );

      setAdded(true);

      setTimeout(() => {

        setAdded(false);

      }, 1200);

    }

    catch (err) {

      setError(
        err.message
      );

    }

  }


  // ============================
  // SEND MESSAGE
  // ============================

  async function handleSendMessage() {

    if (!messageText.trim()) {

      return;

    }

    setSendingMessage(true);


    try {

      await api.sendMessage(

        product.id,

        messageText

      );


      setMessageSent(true);

      setMessageText("");


      setTimeout(() => {

        setMessageSent(false);

        setShowContact(false);

      }, 1800);

    }

    catch (err) {

      setError(
        err.message
      );

    }

    finally {

      setSendingMessage(false);

    }

  }


  // ============================
  // LOADING
  // ============================

  if (loading) {

    return (

      <div>

        <Topbar
          user={user}
          cartCount={cartCount}
          onNavigate={onNavigate}
        />

        <main
          className="main"
          style={{
            maxWidth: 1100,
            margin: "0 auto"
          }}
        >

          <p
            style={{
              color: "var(--muted)",
              fontSize: 13
            }}
          >

            {t.loadingProduct}

          </p>

        </main>

      </div>

    );

  }


  // ============================
  // ERROR
  // ============================

  if (error || !product) {

    return (

      <div>

        <Topbar
          user={user}
          cartCount={cartCount}
          onNavigate={onNavigate}
        />

        <main
          className="main"
          style={{
            maxWidth: 1100,
            margin: "0 auto"
          }}
        >

          <p
            style={{
              color: "#B3261E",
              fontSize: 13
            }}
          >

            {error ||
              "उत्पादन फेला परेन"}

          </p>

        </main>

      </div>

    );

  }


  // ============================
  // GET FARMER ID
  // ============================

  const farmerId =

    product?.farmer?.id ??

    product?.farmerId;


  return (

    <div>

      <Topbar
        user={user}
        cartCount={cartCount}
        onNavigate={onNavigate}
      />


      <main
        className="main"
        style={{
          maxWidth: 1100,
          margin: "0 auto"
        }}
      >


        {/* BREADCRUMB */}

        <p className="breadcrumb">

          <a
            href="#!"
            onClick={(e) => {

              e.preventDefault();

              onNavigate("dashboard");

            }}
          >

            {t.home}

          </a>

          {" > "}

          <a href="#!">

            {categoryLabel(
              product.category
            )}

          </a>

          {" > "}

          <span className="current">

            {productLabel(
              product.name
            )}

          </span>

        </p>


        {/* PRODUCT DETAILS */}

        <div className="product-detail">


          {/* GALLERY */}

          <div className="gallery">

            <div className="main-img">

              <span className="tag">

                {categoryLabel(
                  product.category
                )}

              </span>


              <span className="fav">

                <HeartIcon />

              </span>


              <img
                src={mainImg}
                alt={productLabel(
                  product.name
                )}
              />

            </div>


            <div className="thumb-row">

              {GALLERY.map(src => (

                <img
                  key={src}
                  src={src}

                  className={
                    mainImg === src
                      ? "active"
                      : ""
                  }

                  onClick={() =>
                    setMainImg(src)
                  }

                  alt="थम्बनेल"
                />

              ))}

            </div>

          </div>


          {/* PRODUCT INFO */}

          <div className="pd-info">


            <h2>

              {productLabel(
                product.name
              )}

            </h2>


            <p className="by">

              {product.farmer?.name ||
                t.localFarmer}

              {" ✓"}

            </p>


            <p className="rating-row">

              <b>

                ★ {
                  product.rating ||
                  "नयाँ"
                }

              </b>

            </p>


            <p className="price">

              रु. {product.price} / kg

            </p>


            <p
              style={{
                fontSize: 13,
                color: "var(--muted)"
              }}
            >

              स्टक: {product.stock} kg ·
              Expiry: {

                product.expiryDate

                  ? new Date(
                    product.expiryDate
                  ).toLocaleDateString()

                  : "-"

              }

            </p>


            <p className="desc">

              {product.description}

            </p>


            {/* BADGES */}

            <div className="badge-row">

              <div>

                <span>

                  <CheckIcon />

                </span>

                {t.badgeOrganic}

              </div>


              <div>

                <span>

                  <LeafIcon />

                </span>

                {t.badgePesticideFree}

              </div>


              <div>

                <span>

                  <UserIcon />

                </span>

                {t.badgeHandPicked}

              </div>


              <div>

                <span>

                  <CheckIcon />

                </span>

                {t.badgeFreshNatural}

              </div>

            </div>


            {/* QUANTITY */}

            <div className="qty-row">

              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600
                }}
              >

                {t.quantity}

              </span>


              <div className="stepper">

                <button
                  onClick={() =>
                    setQty(
                      Math.max(
                        1,
                        qty - 1
                      )
                    )
                  }
                >

                  −

                </button>


                <span>

                  {qty} {product.unit}

                </span>


                <button
                  onClick={() =>
                    setQty(
                      qty + 1
                    )
                  }
                >

                  +

                </button>

              </div>

            </div>


            {/* ACTION BUTTONS */}

            <div className="action-row">

              <button
                className="btn btn-primary"
                onClick={handleAddToCart}
              >

                <CartIcon
                  size={16}
                  color="#fff"
                />

                {" "}

                {
                  added
                    ? t.added
                    : t.addToCart
                }

              </button>


              <button
                className="btn btn-outline"

                onClick={() =>
                  onBuyNow &&
                  onBuyNow(
                    product,
                    qty
                  )
                }
              >

                {t.buyNow}

              </button>

            </div>


            {/* DELIVERY */}

            <div className="delivery-strip">

              <div>

                <p>
                  {t.deliveredBy}
                </p>

                <p>

                  {
                    product.farmer?.name ||
                    "—"
                  }

                </p>

              </div>


              <div>

                <p>
                  {t.deliveryTime}
                </p>

                <p>
                  १–२ दिन
                </p>

              </div>


              <div>

                <p>
                  {t.shipping}
                </p>

                <p>
                  {t.freeShippingNote}
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* LOWER DETAILS */}

        <div className="details-columns">


          {/* PRODUCT DETAILS */}

          <div className="card">

            <h4>

              {t.productDetails}

            </h4>


            <p>

              {product.description}

            </p>


            <div className="specs">

              <div>

                <span>
                  {t.category}
                </span>

                <b>

                  {
                    categoryLabel(
                      product.category
                    )
                  }

                </b>

              </div>


              <div>

                <span>
                  {t.price}
                </span>

                <b>

                  रु. {product.price} /
                  {product.unit}

                </b>

              </div>


              <div>

                <span>
                  {t.stock}
                </span>

                <b>

                  {product.stock}

                  {" "}

                  {product.unit}

                  {" "}

                  {t.stockAvailable}

                </b>

              </div>

            </div>

          </div>


          {/* FARMER DETAILS */}

          <div className="card">

            <h4>

              {t.aboutFarmer}

            </h4>


            <div className="farmer-card">

              <div>

                <p className="n">

                  {
                    product.farmer?.name ||
                    t.localFarmer
                  }

                  <CheckIcon />

                </p>


                <p className="loc">

                  {
                    product.farmer?.location ||
                    "नेपाल"
                  }

                </p>

              </div>

            </div>


            {/* VIEW FARMER PROFILE */}

            <button
              className="btn btn-outline btn-full"

              onClick={() => {

                if (farmerId) {

                  onNavigate(
                    `farmer:${farmerId}`
                  );

                }

                else {

                  console.error(
                    "Farmer ID not found:",
                    product
                  );

                }

              }}
            >

              {t.viewFarmProfile}

            </button>


            {/* CONTACT FARMER */}

            <div className="contact-box">

              <button
                className="btn btn-outline btn-full"

                style={{
                  marginTop: 8
                }}

                onClick={() =>
                  setShowContact(
                    !showContact
                  )
                }
              >

                <MessageIcon />

                {" "}

                {t.contactFarmer}

              </button>


              {showContact && (

                <div
                  style={{
                    marginTop: 10
                  }}
                >


                  {product.farmer?.whatsAppNumber && (

                    <a

                      className="
                        btn
                        btn-primary
                        btn-full
                      "

                      style={{

                        marginBottom: 8,

                        textAlign: "center",

                        display: "block",

                        textDecoration: "none"

                      }}

                      href={`https://wa.me/${String(
                        product.farmer.whatsAppNumber
                      ).replace(
                        /\D/g,
                        ""
                      )}?text=${encodeURIComponent(
                        `Hello ${product.farmer?.name ||
                        "Farmer"
                        }, I am interested in ${product.name
                        }.`
                      )}`}

                      target="_blank"

                      rel="noopener noreferrer"
                    >

                      WhatsApp Farmer

                    </a>

                  )}


                  <textarea

                    placeholder={
                      t.messagePlaceholder
                    }

                    value={messageText}

                    onChange={e =>
                      setMessageText(
                        e.target.value
                      )
                    }

                  />


                  <button

                    className="
                      btn
                      btn-primary
                      btn-full
                    "

                    onClick={
                      handleSendMessage
                    }

                    disabled={
                      sendingMessage ||
                      !messageText.trim()
                    }
                  >

                    {
                      sendingMessage
                        ? t.sending
                        : t.sendMessage
                    }

                  </button>


                  {messageSent && (

                    <p className="sent-note">

                      {t.messageSent}

                    </p>

                  )}

                </div>

              )}

            </div>

          </div>

        </div>


        {/* RELATED PRODUCTS */}

        <div className="section-head">

          <h3>

            {t.alsoLike}

          </h3>

          <a href="#!">

            {t.viewAll} →

          </a>

        </div>


        <section className="product-grid">

          {related.map(p => (

            <ProductCard

              key={p.id}

              product={{
                ...p,

                rating:
                  p.rating ||
                  "नयाँ"
              }}

              onAddToCart={
                onAddToCart
              }

              onOpen={() => {
                onNavigate(
                  `product:${p.id}`
                );
              }}

            />

          ))}

        </section>

      </main>

    </div>

  );

}