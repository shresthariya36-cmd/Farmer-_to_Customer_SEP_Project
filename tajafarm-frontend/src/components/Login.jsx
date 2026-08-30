import { useState } from "react";
import {
  UserIcon,
  LockIcon,
  EyeIcon,
  CheckIcon,
  HandshakeIcon,
  LeafIcon
} from "./Icons.jsx";

import { api, saveSession } from "../api.js";
import { t } from "../i18n.js";
import LanguageToggle from "./LanguageToggle.jsx";

export default function Login({
  onLogin,
  onGoToRegister,
  onGoToForgotPassword
}) {
  // Show / hide password
  const [showPw, setShowPw] = useState(false);

  // Customer or Farmer
  const [role, setRole] = useState("customer");

  // Login form
  const [form, setForm] = useState({
    identifier: "",
    password: ""
  });

  // Error and loading states
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  // =========================
  // LOGIN
  // =========================

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Send email and password to backend
      const response = await api.login({
        email: form.identifier.trim(),
        password: form.password
      });

      const token = response.token;
      const user = response.user;


      // Make sure backend returned a user
      if (!user) {
        throw new Error(
          "Login successful, but user information was not returned."
        );
      }


      // =========================
      // CHECK SELECTED ROLE
      // =========================

      // Admin is handled automatically.
      // Admin does NOT appear in the dropdown.
      if (user.role !== "admin") {
        if (user.role !== role) {
          setError(
            t.wrongRoleSelected ||
            "The selected role does not match this account."
          );

          setLoading(false);
          return;
        }
      }


      // =========================
      // SAVE LOGIN
      // =========================

      saveSession(token, user);

      onLogin(user);

    } catch (err) {
      setError(
        err?.message ||
        t.loginFailed ||
        "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="login-page">


      {/* =====================================================
          LEFT SIDE
      ====================================================== */}

      <div className="login-hero">

        <div>

          <h1>
            {t.heroTitle1}{" "}
            <span>
              {t.heroTitle2}
            </span>
          </h1>

          <p>
            {t.heroSubtitle}
          </p>

        </div>


        {/* HERO STATISTICS */}

        <div className="hero-stats">

          <div>
            <span>
              {t.stat1Top}
            </span>

            {t.stat1Bottom}
          </div>


          <div>
            <span>
              {t.stat2Top}
            </span>

            {t.stat2Bottom}
          </div>


          <div>
            <span>
              {t.stat3Top}
            </span>

            {t.stat3Bottom}
          </div>

        </div>

      </div>


      {/* =====================================================
          RIGHT SIDE
      ====================================================== */}

      <div className="login-panel">

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >


          {/* =========================
              LANGUAGE
          ========================== */}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 8
            }}
          >
            <LanguageToggle />
          </div>


          {/* =========================
              BRAND
          ========================== */}

          <div className="login-brand">

            <div className="mark">

              <img
                src="/logo.png"
                alt={t.brandName}
              />

            </div>


            <div>

              <h2>
                {t.brandName}
              </h2>

              <small>
                {t.brandTagline}
              </small>

            </div>

          </div>


          {/* =========================
              WELCOME
          ========================== */}

          <h3>
            {t.welcomeBack}
          </h3>

          <p className="sub">
            {t.loginSubtitle}
          </p>


          {/* =================================================
              ROLE SELECTION
          ================================================== */}

          <div className="field">

            <label htmlFor="role">
              {t.iAmA || "I am a"}
            </label>


            <div className="input-wrap">

              <select
                id="role"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setError("");
                }}
                required
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >

                <option value="customer">
                  {t.customer || "Customer"}
                </option>

                <option value="farmer">
                  {t.farmer || "Farmer"}
                </option>

              </select>

            </div>

          </div>


          {/* =========================
              ERROR
          ========================== */}

          {error && (

            <p
              style={{
                background: "#FDECEC",
                color: "#B3261E",
                fontSize: 12,
                padding: "8px 12px",
                borderRadius: 8,
                marginBottom: 14
              }}
            >
              {error}
            </p>

          )}


          {/* =================================================
              EMAIL
          ================================================== */}

          <div className="field">

            <label htmlFor="identifier">
              {t.emailOrPhone || "Email"}
            </label>


            <div className="input-wrap">

              <UserIcon />

              <input
                id="identifier"
                type="email"
                placeholder={
                  t.emailPlaceholder ||
                  "Enter your email"
                }
                value={form.identifier}
                onChange={(e) => {

                  setForm({
                    ...form,
                    identifier: e.target.value
                  });

                  setError("");

                }}
                required
              />

            </div>

          </div>


          {/* =================================================
              PASSWORD
          ================================================== */}

          <div className="field">

            <label htmlFor="password">
              {t.password || "Password"}
            </label>


            <div className="input-wrap">

              <LockIcon />


              <input
                id="password"
                type={
                  showPw
                    ? "text"
                    : "password"
                }
                placeholder={
                  t.passwordPlaceholder ||
                  "Enter your password"
                }
                value={form.password}
                onChange={(e) => {

                  setForm({
                    ...form,
                    password: e.target.value
                  });

                  setError("");

                }}
                required
              />


              {/* PASSWORD SHOW / HIDE */}

              <button
                type="button"
                onClick={() =>
                  setShowPw(!showPw)
                }
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  margin: 0,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                aria-label={
                  showPw
                    ? "Hide password"
                    : "Show password"
                }
              >

                <EyeIcon />

              </button>

            </div>

          </div>


          {/* =================================================
              FORGOT PASSWORD
          ================================================== */}

          <div className="form-footer-row">

            <a
              href="#!"
              onClick={(e) => {

                e.preventDefault();

                setError("");

                onGoToForgotPassword();

              }}
            >
              {t.forgotPassword ||
                "Forgot password?"}
            </a>

          </div>


          {/* =================================================
              LOGIN BUTTON
          ================================================== */}
          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading
              ? t.loggingIn || "Logging in..."
              : t.login || "Login"}
          </button>

          {/* Demo Accounts */}

          <div style={{ fontSize: "12px", lineHeight: "1.6", marginTop: "15px" }}>
            <strong>Demo Accounts</strong>

            <p>
              <strong>Customer</strong><br />
              Email: customer@tajafarm.com<br />
              Password: customer123
            </p>

            <p>
              <strong>Farmer</strong><br />
              Email: farmer@tajafarm.com<br />
              Password: farmer123
            </p>

            <p>
              <strong>Admin</strong><br />
              Email: admin@tajafarm.com<br />
              Password: admin123
            </p>
          </div>
          {/* =================================================
              SIGN UP
          ================================================== */}

          <p className="signup-row">

            {t.noAccount ||
              "Don't have an account?"}{" "}


            <a
              href="#!"
              onClick={(e) => {

                e.preventDefault();

                onGoToRegister();

              }}
            >
              {t.signUp || "Sign up"}
            </a>

          </p>


          {/* =================================================
              FARMER REGISTRATION
          ================================================== */}

          <p className="signup-row">

            {t.areYouFarmer ||
              "Are you a farmer?"}{" "}


            <a
              href="#!"
              onClick={(e) => {

                e.preventDefault();

                onGoToRegister();

              }}
            >
              {t.registerHere ||
                "Register here"}
            </a>

          </p>


          {/* =================================================
              FEATURES
          ================================================== */}

          <div className="login-features">

            <div>

              <span>
                <CheckIcon />
              </span>

              {t.feat1}

            </div>


            <div>

              <span>
                <HandshakeIcon />
              </span>

              {t.feat2}

            </div>


            <div>

              <span>
                <LeafIcon />
              </span>

              {t.feat3}

            </div>

          </div>

        </form>

      </div>

    </div >
  );
}