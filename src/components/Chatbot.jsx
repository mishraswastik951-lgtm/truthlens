import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useLanguage } from "../context/LanguageContext";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const suggested = ["How does it work?", "What is fake news?", "How accurate?", "What dataset?", "How to use?"];

const Chatbot = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "👋 Hi! I'm TruthBot! Ask me anything about fake news detection or TruthLens!", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 100); }, [isOpen]);

  const sendMessage = async (msg) => {
    const text = msg || input.trim();
    if (!text || loading) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages(prev => [...prev, { role: "user", text, time }]);
    setInput("");
    setLoading(true);
    setIsTyping(true);
    try {
      await new Promise(res => setTimeout(res, 600));
      const res = await axios.post(`${API_BASE}/chat`, { message: text });
      setIsTyping(false);
      setMessages(prev => [...prev, { role: "bot", text: res.data.reply, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    } catch {
      setIsTyping(false);
      setMessages(prev => [...prev, { role: "bot", text: "Sorry, connection error! Make sure Flask server is running.", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsOpen(!isOpen)}
        style={{ position: "fixed", bottom: 28, right: 28, width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#ec4899)", border: "none", cursor: "pointer", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 4px 20px rgba(99,102,241,0.5)" }}>
        {isOpen ? "✕" : "💬"}
        {!isOpen && <span style={{ position: "absolute", top: 4, right: 4, width: 12, height: 12, background: "#10b981", borderRadius: "50%", border: "2px solid #0f172a" }} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 20 }} transition={{ type: "spring", duration: 0.4 }}
            style={{ position: "fixed", bottom: 96, right: 28, width: 340, height: 500, background: "rgba(15,23,42,0.98)", backdropFilter: "blur(20px)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 20, zIndex: 999, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>

            <div style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.3),rgba(236,72,153,0.2))", borderBottom: "1px solid rgba(99,102,241,0.2)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{t("chatbotTitle")}</div>
                <div style={{ fontSize: 11, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, background: "#10b981", borderRadius: "50%", display: "inline-block" }} /> Online
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", alignItems: "flex-end", gap: 7 }}>
                  {msg.role === "bot" && <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🤖</div>}
                  <div style={{ maxWidth: "75%" }}>
                    <div style={{ background: msg.role === "user" ? "linear-gradient(135deg,#6366f1,#4f46e5)" : "rgba(30,41,59,0.9)", border: msg.role === "bot" ? "1px solid rgba(99,102,241,0.2)" : "none", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding: "9px 13px", fontSize: 13, lineHeight: 1.6, color: "#e2e8f0", whiteSpace: "pre-line" }}>
                      {msg.text}
                    </div>
                    <div style={{ fontSize: 10, color: "#475569", marginTop: 3, textAlign: msg.role === "user" ? "right" : "left" }}>{msg.time}</div>
                  </div>
                </motion.div>
              ))}

              <AnimatePresence>
                {isTyping && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: "flex", gap: 7, alignItems: "flex-end" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>
                    <div style={{ background: "rgba(30,41,59,0.9)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "16px 16px 16px 4px", padding: "12px 16px", display: "flex", gap: 4, alignItems: "center" }}>
                      {[0, 1, 2].map((dot) => (
                        <motion.span key={dot} animate={{ y: [-3, 3, -3] }} transition={{ duration: 0.6, repeat: Infinity, delay: dot * 0.15 }} style={{ width: 7, height: 7, background: "#6366f1", borderRadius: "50%", display: "inline-block" }} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={endRef} />
            </div>

            {messages.length < 3 && (
              <div style={{ padding: "0 10px 8px", display: "flex", flexWrap: "wrap", gap: 5 }}>
                {suggested.map((q) => (
                  <motion.button key={q} whileTap={{ scale: 0.95 }} onClick={() => sendMessage(q)} style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 20, padding: "4px 9px", color: "#818cf8", cursor: "pointer", fontSize: 11, fontFamily: "Inter,sans-serif" }}>
                    {q}
                  </motion.button>
                ))}
              </div>
            )}

            <div style={{ borderTop: "1px solid rgba(99,102,241,0.2)", padding: "10px 14px", display: "flex", gap: 8 }}>
              <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && sendMessage()} placeholder={t("chatPlaceholder")} disabled={loading}
                style={{ flex: 1, background: "rgba(30,41,59,0.8)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 10, padding: "9px 13px", color: "#e2e8f0", fontSize: 13, outline: "none", fontFamily: "Inter,sans-serif" }} />
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => sendMessage()} disabled={loading || !input.trim()}
                style={{ width: 38, height: 38, borderRadius: 10, background: input.trim() ? "linear-gradient(135deg,#6366f1,#4f46e5)" : "rgba(30,41,59,0.8)", border: "none", cursor: input.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                {loading ? <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 1s linear infinite" }} /> : "➤"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
};

export default Chatbot;
