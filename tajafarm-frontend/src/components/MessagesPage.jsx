import { useEffect, useState } from "react";
import Topbar from "./Topbar.jsx";
import Sidebar from "./Sidebar.jsx";
import { api } from "../api.js";
import { t, productLabel } from "../i18n.js";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString("ne-NP");
  } catch {
    return iso;
  }
}

export default function MessagesPage({ user, cartCount, onNavigate }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyMessages()
      .then(setMessages)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Topbar user={user} cartCount={cartCount} onNavigate={onNavigate} />
      <div className="app-body">
        <Sidebar user={user} active="messages" onNavigate={onNavigate} />
        <main className="main">
          <h2 style={{ marginBottom: 18, color: "var(--green-900)" }}>{t.myMessagesTitle}</h2>

          {loading ? (
            <p style={{ color: "var(--muted)", fontSize: 13 }}>लोड हुँदैछ...</p>
          ) : messages.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 13 }}>कुनै सन्देश पठाइएको वा प्राप्त भएको छैन।</p>
          ) : (
            messages.map((m) => (
              <div className="message-card" key={m.id}>
                <div className="m-top">
                  <span>
                    <span className="m-from">{m.isMine ? t.you : m.fromName}</span>
                    {" — "}{productLabel(m.productName || "")}
                  </span>
                  <span>{formatDate(m.createdAt)}</span>
                </div>
                <p className="m-text">{m.text}</p>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
}
