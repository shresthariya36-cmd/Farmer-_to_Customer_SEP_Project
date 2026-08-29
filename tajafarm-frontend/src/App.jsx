import { useEffect, useState } from "react";

import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import Dashboard from "./components/Dashboard.jsx";
import ProductDetails from "./components/ProductDetails.jsx";
import CartPage from "./components/CartPage.jsx";
import OrdersPage from "./components/OrdersPage.jsx";
import FarmerDashboard from "./components/FarmerDashboard.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import WishlistPage from "./components/WishlistPage.jsx";
import MessagesPage from "./components/MessagesPage.jsx";
import ProfilePage from "./components/ProfilePage.jsx";
import AuthModal from "./components/AuthModal.jsx";
import NotificationsPage from "./components/NotificationsPage.jsx";
import ForgotPassword from "./components/ForgotPassword.jsx";
import FarmerProfile from "./components/FarmerProfile.jsx";

import {
  api,
  loadSession,
  clearSession
} from "./api.js";

import { t } from "./i18n.js";

export default function App() {

  const [page, setPage] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedFarmerId, setSelectedFarmerId] = useState(null);

  const [authOpen, setAuthOpen] = useState(false);

  const [, rerenderLanguage] = useState(0);

  useEffect(() => {

    const onLanguageChange = () => {
      rerenderLanguage(x => x + 1);
    };

    window.addEventListener(
      "taja-language-changed",
      onLanguageChange
    );

    const session = loadSession();

    if (session) {

      setUser(session.user);

      setPage(home(session.user.role));

      if (session.user.role === "customer") {
        refreshCart();
      }

    }

    return () => {

      window.removeEventListener(
        "taja-language-changed",
        onLanguageChange
      );

    };

  }, []);

  function home(role) {

    if (role === "farmer") {
      return "farmer-dashboard";
    }

    if (role === "admin") {
      return "admin-dashboard";
    }

    return "dashboard";

  }

  function refreshCart() {

    api.getCart()
      .then(items => {

        setCartCount(
          (items || []).reduce(
            (total, item) =>
              total + (item.qty || 0),
            0
          )
        );

      })
      .catch(() => {

        setCartCount(0);

      });

  }

  async function addToCart(product, qty = 1) {

    if (!user) {

      setAuthOpen(true);

      return;

    }

    await api.addToCart(product.id, qty);

    refreshCart();

  }

  async function buyNow(product, qty = 1) {

    if (!user) {

      setAuthOpen(true);

      return;

    }

    await api.buyNow(product.id, qty);

    setPage("orders");

  }

  function login(loggedInUser) {

    setUser(loggedInUser);

    setAuthOpen(false);

    setPage(home(loggedInUser.role));

    if (loggedInUser.role === "customer") {
      refreshCart();
    }

  }

  function registered(newUser) {

    login(newUser);

  }

  /*
  NAVIGATION
  */

  function navigate(target, id) {

    // =========================
    // PRODUCT DETAILS
    // =========================

    if (
      typeof target === "string" &&
      target.startsWith("product:")
    ) {

      const productId = Number(
        target.split(":")[1]
      );

      if (!productId) {

        console.error(
          "Product ID is missing or invalid:",
          target
        );

        return;

      }

      setSelectedProductId(productId);

      setPage("product");

      return;

    }


    // =========================
    // FARMER PROFILE
    // Supports:
    // onNavigate("farmer", farmerId)
    // onNavigate("farmer:5")
    // =========================

    if (target === "farmer") {

      const farmerId = Number(id);

      console.log(
        "Opening farmer profile:",
        farmerId
      );

      if (!farmerId) {

        console.error(
          "Farmer ID is missing or invalid:",
          id
        );

        return;

      }

      setSelectedFarmerId(farmerId);

      setPage("farmer-profile");

      return;

    }


    if (
      typeof target === "string" &&
      target.startsWith("farmer:")
    ) {

      const farmerId = Number(
        target.split(":")[1]
      );

      console.log(
        "Opening farmer profile:",
        farmerId
      );

      if (!farmerId) {

        console.error(
          "Farmer ID is missing or invalid:",
          target
        );

        return;

      }

      setSelectedFarmerId(farmerId);

      setPage("farmer-profile");

      return;

    }


    // =========================
    // DASHBOARD
    // =========================

    if (target === "dashboard") {

      if (user) {

        setPage(
          home(user.role)
        );

      } else {

        setPage("dashboard");

      }

      return;

    }


    // =========================
    // LOGOUT
    // =========================

    if (target === "logout") {

      clearSession();

      setUser(null);

      setCartCount(0);

      setAuthOpen(false);

      setSelectedProductId(null);

      setSelectedFarmerId(null);

      setPage("dashboard");

      return;

    }


    // =========================
    // LOGIN
    // =========================

    if (target === "login") {

      setAuthOpen(false);

      setPage("login");

      return;

    }


    // =========================
    // OTHER PAGES
    // =========================

    setPage(target);

  }

  function profileUpdated(updatedUser) {

    setUser(updatedUser);

    localStorage.setItem(
      "taja_user",
      JSON.stringify(updatedUser)
    );


  }

  // =========================
  // LOGIN
  // =========================

  if (page === "login") {


    return (

      <Login
        onLogin={login}
        onGoToRegister={() =>
          setPage("register")
        }
        onGoToForgotPassword={() =>
          setPage("forgot-password")
        }
      />

    );

  }

  // =========================
  // FORGOT PASSWORD
  // =========================

  if (page === "forgot-password") {

    return (

      <ForgotPassword
        onBack={() =>
          setPage("login")
        }
      />

    );

  }

  // =========================
  // REGISTER
  // =========================

  if (page === "register") {

    return (

      <Register
        onRegistered={registered}
        onBackToLogin={() =>
          setPage("login")
        }
      />

    );

  }

  // =========================
  // FARMER DASHBOARD
  // =========================

  if (page === "farmer-dashboard") {

    return (

      <FarmerDashboard
        user={user}
        cartCount={cartCount}
        onNavigate={navigate}
      />

    );

  }

  // =========================
  // ADMIN DASHBOARD
  // =========================

  if (page === "admin-dashboard") {

    return (

      <AdminDashboard
        user={user}
        cartCount={cartCount}
        onNavigate={navigate}
      />

    );

  }

  // =========================
  // CART
  // =========================

  if (page === "cart") {

    return (

      <CartPage
        user={user}
        cartCount={cartCount}
        onNavigate={navigate}
        onCartChanged={setCartCount}
      />

    );

  }

  // =========================
  // ORDERS
  // =========================

  if (page === "orders") {

    return (

      <OrdersPage
        user={user}
        cartCount={cartCount}
        onNavigate={navigate}
      />

    );

  }

  // =========================
  // WISHLIST
  // =========================

  if (page === "wishlist") {

    return (

      <WishlistPage
        user={user}
        cartCount={cartCount}
        onNavigate={navigate}
        onAddToCart={addToCart}

        onOpenProduct={id => {

          setSelectedProductId(id);

          setPage("product");

        }}
      />

    );

  }

  // =========================
  // MESSAGES
  // =========================

  if (page === "messages") {

    return (

      <MessagesPage
        user={user}
        cartCount={cartCount}
        onNavigate={navigate}
      />

    );

  }

  // =========================
  // NOTIFICATIONS
  // =========================

  if (page === "notifications") {

    return (

      <NotificationsPage
        user={user}
        cartCount={cartCount}
        onNavigate={navigate}

        onOpenProduct={id => {

          setSelectedProductId(id);

          setPage("product");

        }}
      />

    );

  }

  // =========================
  // FARMER PROFILE
  // =========================

  if (page === "farmer-profile") {

    return (

      <FarmerProfile
        user={user}
        farmerId={selectedFarmerId}
        cartCount={cartCount}
        onNavigate={navigate}
        onAddToCart={addToCart}
      />

    );

  }

  // =========================
  // USER PROFILE
  // =========================

  if (page === "profile") {

    return (

      <ProfilePage
        user={user}
        cartCount={cartCount}
        onNavigate={navigate}
        onProfileUpdated={profileUpdated}
      />

    );

  }

  // =========================
  // PRODUCT DETAILS
  // =========================

  if (page === "product") {

    return (

      <>
        <ProductDetails
          user={user}
          productId={selectedProductId}
          cartCount={cartCount}
          onAddToCart={addToCart}
          onBuyNow={buyNow}
          onNavigate={navigate}
        />

        {authOpen && (

          <AuthModal
            onClose={() =>
              setAuthOpen(false)
            }
            onLogin={login}
          />

        )}

      </>

    );

  }

  // =========================
  // CUSTOMER DASHBOARD
  // =========================

  return (

    <>
      <Dashboard
        user={user}
        cartCount={cartCount}
        onAddToCart={addToCart}
        onNavigate={navigate}

        onOpenProduct={id => {

          setSelectedProductId(id);

          setPage("product");

        }}
      />

      {authOpen && (

        <AuthModal
          onClose={() =>
            setAuthOpen(false)
          }
          onLogin={login}
        />

      )}

    </>


  );

}
