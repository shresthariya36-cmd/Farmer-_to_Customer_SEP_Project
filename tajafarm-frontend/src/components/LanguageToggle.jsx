import { currentLanguage, setLanguage, t } from "../i18n.js";

export default function LanguageToggle({ compact=false }) {
  return (
    <div className={`language-toggle ${compact ? "compact" : ""}`} aria-label={t.switchLanguage}>
      <button type="button" className={currentLanguage === "ne" ? "active" : ""} onClick={()=>setLanguage("ne")}>नेपाली</button>
      <button type="button" className={currentLanguage === "en" ? "active" : ""} onClick={()=>setLanguage("en")}>English</button>
    </div>
  );
}
