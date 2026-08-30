import { useEffect, useState } from "react";
import Topbar from "./Topbar.jsx";
import Sidebar from "./Sidebar.jsx";
import { api } from "../api.js";
import { t, productLabel } from "../i18n.js";
import RateProduct from "./RateProduct.jsx";

const STAGES = [
  { key: "placed", label: t.stagePlaced },
  { key: "confirmed", label: t.stageConfirmed },
  { key: "processing", label: "प्रशोधनमा" },
  { key: "shipped", label: "पठाइयो" },
  { key: "out_for_delivery", label: t.stageOutForDelivery },
  { key: "delivered", label: t.stageDelivered },
];

function normalizeStage(order) {
  const raw = String(
    order?.stage ?? order?.status ?? "placed"
  )
    .toLowerCase()
    .replaceAll(" ", "_");

  if (
    [
      "pending",
      "pending_farmer_confirmation",
      "awaiting_farmer",
      "placed",
    ].includes(raw)
  ) {
    return "placed";
  }

  if (
    ["confirmed", "farmer_confirmed"].includes(raw)
  ) {
    return "confirmed";
  }

  if (
    ["processing", "packed"].includes(raw)
  ) {
    return "processing";
  }

  if (
    ["shipped", "dispatch"].includes(raw)
  ) {
    return "shipped";
  }

  if (
    ["out_for_delivery", "outfordelivery"].includes(raw)
  ) {
    return "out_for_delivery";
  }

  if (
    ["delivered", "completed"].includes(raw)
  ) {
    return "delivered";
  }

  return "placed";
}

function stageIndex(stage) {
  return STAGES.findIndex(
    (s) => s.key === stage
  );
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString("ne-NP");
  } catch {
    return iso;
  }
}

export default function OrdersPage({
  user,
  cartCount,
  onNavigate,
}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function loadOrders() {
    api
      .getMyOrders()
      .then((data) => {
        setOrders(data || []);
        setError("");
      })
      .catch((err) => {
        setError(
          err?.message ||
          "Orders could not be loaded."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    loadOrders();

    const interval = setInterval(
      loadOrders,
      5000
    );

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <Topbar
        user={user}
        cartCount={cartCount}
        onNavigate={onNavigate}
      />

      <div className="app-body">
        <Sidebar
          user={user}
          active="orders"
          onNavigate={onNavigate}
        />

        <main className="main">

          <h2
            style={{
              marginBottom: 18,
              color: "var(--green-900)",
            }}
          >
            {t.myOrdersTitle}
          </h2>

          {error && (
            <p
              style={{
                color: "#B3261E",
                fontSize: 13,
                marginBottom: 14,
              }}
            >
              {error}
            </p>
          )}

          {loading ? (
            <p
              style={{
                color: "var(--muted)",
                fontSize: 13,
              }}
            >
              {t.loadingProducts}
            </p>
          ) : orders.length === 0 ? (
            <p
              style={{
                color: "var(--muted)",
                fontSize: 13,
              }}
            >
              {t.noOrdersYet}
            </p>
          ) : (
            orders.map((order) => {

              // Get the current order stage
              const stage =
                normalizeStage(order);

              const current =
                stageIndex(stage);

              const farmerConfirmed =
                Boolean(
                  order.farmerConfirmed
                ) ||
                [
                  "confirmed",
                  "processing",
                  "shipped",
                  "out_for_delivery",
                  "delivered",
                ].includes(stage);

              return (
                <div
                  className="order-card"
                  key={order.id}
                >

                  {/* ORDER HEADER */}

                  <div className="oc-top">
                    <span className="oid">
                      {t.orderNumber} #{order.id}
                    </span>

                    <span className="odate">
                      {t.orderedOn}:{" "}
                      {formatDate(
                        order.createdAt
                      )}
                    </span>
                  </div>

                  {/* PRODUCTS */}

                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--muted)",
                      marginBottom: 4,
                    }}
                  >
                    {order.items
                      ?.map(
                        (i) =>
                          `${productLabel(
                            i.productName
                          )} ×${i.qty}`
                      )
                      .join(", ")}
                  </p>

                  {/* TOTAL */}

                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--green-700)",
                    }}
                  >
                    रु. {order.total}
                  </p>

                  {/* WAITING FARMER */}

                  {!farmerConfirmed && (
                    <p
                      style={{
                        marginTop: 10,
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#996c00",
                      }}
                    >
                      {t.waitingFarmer}
                    </p>
                  )}

                  {/* ORDER TRACKER */}

                  <div className="tracker">
                    {STAGES.map(
                      (s, idx) => (
                        <div
                          className={`step ${idx <= current
                              ? "done"
                              : ""
                            }`}
                          key={s.key}
                        >
                          <div className="dot">
                            {idx <= current
                              ? "✓"
                              : ""}
                          </div>

                          <div className="label">
                            {s.label}
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {/* RATE PRODUCT */}

                  {stage === "delivered" &&
                    order.items?.map(
                      (item) => (
                        <RateProduct
                          key={
                            item.productId ||
                            item.id
                          }
                          product={item}
                          orderId={order.id}
                        />
                      )
                    )}

                </div>
              );
            })
          )}

        </main>
      </div>
    </div>
  );
}
