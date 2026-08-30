import { useState } from "react";
import { api } from "../api.js";
import { t } from "../i18n.js";
import LanguageToggle from "./LanguageToggle.jsx";

export default function ForgotPassword({ onBack }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestCode(e) {
    e.preventDefault(); setError(""); setMessage(""); setLoading(true);
    try {
      const x = await api.forgotPassword(email.trim());
      setMessage(`${x.message}${x.devCode ? ` Your reset code is: ${x.devCode}` : ""}`);
      setStep(2);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function reset(e) {
    e.preventDefault(); setError(""); setMessage(""); setLoading(true);
    try {
      const x = await api.resetPassword(email.trim(), code.trim(), newPassword);
      setMessage(x.message);
      setStep(3);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="login-page">
      <div className="login-panel" style={{ maxWidth: 520, margin: "0 auto" }}>
        <div className="login-form">
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}><LanguageToggle /></div>
          <div className="login-brand"><div className="mark"><img src="/logo.png" alt={t.brandName} /></div><div><h2>{t.brandName}</h2><small>{t.forgotPassword}</small></div></div>
          <h3>{t.forgotPassword}</h3>
          <p className="sub">{t.resetPasswordSubtitle}</p>
          {error && <p className="auth-error">{error}</p>}
          {message && <p style={{background:"#EAF7EA",color:"#176b2c",padding:"10px 12px",borderRadius:8,fontSize:13,marginBottom:14}}>{message}</p>}

          {step === 1 && <form onSubmit={requestCode}>
            <div className="field"><label>{t.email}</label><div className="input-wrap"><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={t.emailPlaceholder} required /></div></div>
            <button className="btn btn-primary btn-full" disabled={loading}>{loading ? t.sending : t.getResetCode}</button>
          </form>}

          {step === 2 && <form onSubmit={reset}>
            <div className="field"><label>{t.resetCode}</label><div className="input-wrap"><input value={code} onChange={e=>setCode(e.target.value)} placeholder={t.resetCodePlaceholder} inputMode="numeric" required /></div></div>
            <div className="field"><label>{t.newPassword}</label><div className="input-wrap"><input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} minLength={6} required /></div></div>
            <button className="btn btn-primary btn-full" disabled={loading}>{loading ? t.saving : t.changePassword}</button>
          </form>}

          {step === 3 && <button className="btn btn-primary btn-full" onClick={onBack}>{t.backToLogin}</button>}
          {step !== 3 && <p className="signup-row"><a href="#!" onClick={e=>{e.preventDefault();onBack();}}>{t.backToLogin}</a></p>}
        </div>
      </div>
    </div>
  );
}
