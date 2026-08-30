import { useState } from "react";
import { UserIcon, LockIcon, EyeIcon } from "./Icons.jsx";
import { api, saveSession } from "../api.js";
import { t } from "../i18n.js";
import LanguageToggle from "./LanguageToggle.jsx";

export default function Register({ onRegistered, onBackToLogin }) {
  const [role, setRole] = useState("customer");

  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "",
    whatsappNumber: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState("");


  // =========================
  // HANDLE REGISTER
  // =========================

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setPending("");

    // Check password
    if (form.password !== form.confirmPassword) {
      setError(
        t.passwordMismatch ||
        "Passwords do not match."
      );
      return;
    }

    // Password length
    if (form.password.length < 6) {
      setError(
        t.passwordTooShort ||
        "Password must be at least 6 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const result = await api.register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,

        // Customer or farmer
        role: role,

        // Farmer location
        location:
          role === "farmer"
            ? form.location.trim() || null
            : null,

        // Farmer WhatsApp
        whatsappNumber:
          role === "farmer"
            ? form.whatsappNumber.trim() || null
            : null
      });


      // Farmer waiting for admin approval
      if (result.pending) {
        setPending(
          result.message ||
          "Your farmer account is waiting for admin approval."
        );

        return;
      }


      // Successful registration
      saveSession(
        result.token,
        result.user
      );

      onRegistered(result.user);

    } catch (err) {

      setError(
        err?.message ||
        "Unable to create account."
      );

    } finally {

      setLoading(false);

    }
  }


  // =========================
  // UPDATE FORM
  // =========================

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));

    setError("");
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


          {/* LANGUAGE */}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 8
            }}
          >
            <LanguageToggle />
          </div>


          {/* BRAND */}

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


          {/* TITLE */}

          <h3>
            {t.createAccount}
          </h3>

          <p className="sub">
            {t.createAccountSubtitle}
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

                  // Clear farmer-only fields
                  if (e.target.value === "customer") {
                    setForm((current) => ({
                      ...current,
                      location: "",
                      whatsappNumber: ""
                    }));
                  }

                  setError("");
                  setPending("");
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


          {/* =================================================
              PENDING MESSAGE
          ================================================== */}

          {pending && (

            <p
              style={{
                background: "#FFF7D6",
                color: "#705500",
                fontSize: 12,
                padding: "10px 12px",
                borderRadius: 8,
                marginBottom: 14
              }}
            >
              {pending}
            </p>

          )}


          {/* =================================================
              ERROR
          ================================================== */}

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
              FULL NAME
          ================================================== */}

          <div className="field">

            <label htmlFor="name">
              {t.fullName}
            </label>

            <div className="input-wrap">

              <UserIcon />

              <input
                id="name"
                type="text"
                placeholder={
                  t.fullNamePlaceholder
                }
                value={form.name}
                onChange={(e) =>
                  updateField(
                    "name",
                    e.target.value
                  )
                }
                required
              />

            </div>

          </div>


          {/* =================================================
              EMAIL
          ================================================== */}

          <div className="field">

            <label htmlFor="email">
              {t.emailOrPhone}
            </label>

            <div className="input-wrap">

              <UserIcon />

              <input
                id="email"
                type="email"
                placeholder={
                  t.emailPlaceholder
                }
                value={form.email}
                onChange={(e) =>
                  updateField(
                    "email",
                    e.target.value
                  )
                }
                required
              />

            </div>

          </div>


          {/* =================================================
              FARMER INFORMATION
          ================================================== */}

          {role === "farmer" && (

            <>

              {/* FARM LOCATION */}

              <div className="field">

                <label htmlFor="location">
                  {t.farmLocation}
                </label>

                <div className="input-wrap">

                  <UserIcon />

                  <input
                    id="location"
                    type="text"
                    placeholder={
                      t.farmLocationPlaceholder
                    }
                    value={form.location}
                    onChange={(e) =>
                      updateField(
                        "location",
                        e.target.value
                      )
                    }
                    required
                  />

                </div>

              </div>


              {/* WHATSAPP */}

              <div className="field">

                <label htmlFor="whatsappNumber">
                  WhatsApp Number
                </label>

                <div className="input-wrap">

                  <UserIcon />

                  <input
                    id="whatsappNumber"
                    type="tel"
                    placeholder="97798XXXXXXXX"
                    value={
                      form.whatsappNumber
                    }
                    onChange={(e) =>
                      updateField(
                        "whatsappNumber",
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

            </>

          )}


          {/* =================================================
              PASSWORD
          ================================================== */}

          <div className="field">

            <label htmlFor="password">
              {t.choosePassword}
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
                  t.passwordPlaceholder
                }
                value={form.password}
                onChange={(e) =>
                  updateField(
                    "password",
                    e.target.value
                  )
                }
                required
                minLength={6}
              />


              {/* SHOW PASSWORD */}

              <button
                type="button"
                onClick={() =>
                  setShowPw(!showPw)
                }
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
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
              CONFIRM PASSWORD
          ================================================== */}

          <div className="field">

            <label htmlFor="confirmPassword">
              {t.confirmPassword}
            </label>

            <div className="input-wrap">

              <LockIcon />

              <input
                id="confirmPassword"
                type={
                  showConfirmPw
                    ? "text"
                    : "password"
                }
                placeholder={
                  t.confirmPasswordPlaceholder
                }
                value={
                  form.confirmPassword
                }
                onChange={(e) =>
                  updateField(
                    "confirmPassword",
                    e.target.value
                  )
                }
                required
              />


              {/* SHOW CONFIRM PASSWORD */}

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPw(
                    !showConfirmPw
                  )
                }
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
                aria-label={
                  showConfirmPw
                    ? "Hide password"
                    : "Show password"
                }
              >

                <EyeIcon />

              </button>

            </div>

          </div>


          {/* =================================================
              CREATE ACCOUNT
          ================================================== */}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{
              marginTop: 6
            }}
          >

            {loading
              ? t.creatingAccount ||
              "Creating account..."
              : t.createAccountBtn ||
              "Create Account"}

          </button>


          {/* =================================================
              BACK TO LOGIN
          ================================================== */}

          <p
            className="signup-row"
            style={{
              marginTop: 16
            }}
          >

            {t.alreadyHaveAccount ||
              "Already have an account?"}{" "}

            <a
              href="#!"
              onClick={(e) => {

                e.preventDefault();

                onBackToLogin();

              }}
            >
              {t.backToLogin ||
                "Back to Login"}
            </a>

          </p>

        </form>

      </div>

    </div>
  );
}