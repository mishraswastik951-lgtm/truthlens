import React from "react";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const Login = () => {
  const { user, signInWithGoogle } = useAuth();
  const { t } = useLanguage();

  if (user) return <Navigate to="/analyzer" replace />;

  const perks = [
    { icon: "🔍", text: "Analyze unlimited news articles instantly" },
    { icon: "📊", text: "Access full analytics & model performance" },
    { icon: "☁️", text: "Interactive word cloud visualizations" },
    { icon: "🤖", text: "Chat with TruthBot AI assistant" },
    { icon: "📈", text: "Track your personal analysis history" },
    { icon: "🌐", text: "Switch between Hindi & English anytime" },
  ];

  return (
    <div className="bg-main" style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
        gap: 60, maxWidth: 900, width: "100%", alignItems: "center",
      }}>

        {/* Left Info */}
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, boxShadow: "0 8px 24px rgba(124,58,237,0.5)",
            }}>🔍</div>
            <div>
              <div style={{
                fontSize: 28, fontWeight: 900, fontFamily: "Poppins,sans-serif",
                background: "linear-gradient(135deg,#a78bfa,#06b6d4)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>TruthLens</div>
              <div style={{ fontSize: 12, color: "#475569" }}>AI Fake News Detector</div>
            </div>
          </div>

          <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 12, lineHeight: 1.25, fontFamily: "Poppins,sans-serif" }}>
            Fight Misinformation{" "}
            <span style={{
              background: "linear-gradient(135deg,#a78bfa,#06b6d4)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              with AI
            </span>
          </h2>
          <p style={{ color: "#64748b", fontSize: 15, marginBottom: 36, lineHeight: 1.7 }}>
            Join thousands of users verifying news with advanced Machine Learning & NLP.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {perks.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 12,
                  background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 17, flexShrink: 0,
                }}>
                  {p.icon}
                </div>
                <span style={{ color: "#e2e8f0", fontSize: 14 }}>{p.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Tech badges */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 32 }}>
            {["Python", "NLTK", "Scikit-learn", "TF-IDF", "React", "Firebase"].map((tech) => (
              <span key={tech} style={{
                background: "rgba(124,58,237,0.1)",
                border: "1px solid rgba(124,58,237,0.25)",
                borderRadius: 99, padding: "4px 12px",
                fontSize: 12, color: "#a78bfa", fontWeight: 500,
              }}>
                {tech}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Right Login Card */}
        <motion.div initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass"
          style={{ padding: "52px 44px", textAlign: "center", position: "relative", overflow: "hidden" }}
        >
          {/* Background glow */}
          <div style={{
            position: "absolute", top: -60, right: -60,
            width: 180, height: 180, borderRadius: "50%",
            background: "rgba(124,58,237,0.12)", filter: "blur(40px)",
            pointerEvents: "none",
          }} />

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ fontSize: 64, marginBottom: 24 }}
          >
            🛡️
          </motion.div>

          <h2 style={{
            fontSize: 24, fontWeight: 800, marginBottom: 10,
            fontFamily: "Poppins,sans-serif",
          }}>
            {t("loginTitle")}
          </h2>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 36, lineHeight: 1.6 }}>
            {t("loginSubtitle")}
          </p>

          {/* Google Button */}
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 12px 40px rgba(124,58,237,0.3)" }}
            whileTap={{ scale: 0.97 }}
            onClick={signInWithGoogle}
            style={{
              width: "100%", background: "white",
              border: "2px solid rgba(124,58,237,0.2)", borderRadius: 16,
              padding: "15px 24px", display: "flex",
              alignItems: "center", justifyContent: "center", gap: 14,
              cursor: "pointer", fontSize: 15, fontWeight: 700,
              color: "#1e293b", marginBottom: 24,
              fontFamily: "Inter,sans-serif", transition: "all 0.3s",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t("signInGoogle")}
          </motion.button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(124,58,237,0.15)" }} />
            <span style={{ color: "#475569", fontSize: 12 }}>Secure • Private • Free</span>
            <div style={{ flex: 1, height: 1, background: "rgba(124,58,237,0.15)" }} />
          </div>

          <p style={{ fontSize: 11, color: "#334155", lineHeight: 1.7 }}>
            By signing in you agree to our Terms of Service.
            <br />We <strong style={{ color: "#a78bfa" }}>never</strong> store your article content.
          </p>

          {/* Stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10, marginTop: 28,
          }}>
            {[
              { v: "98.5%", l: "Accuracy" },
              { v: "44K", l: "Trained On" },
              { v: "Free", l: "Forever" },
            ].map((s) => (
              <div key={s.l} style={{
                background: "rgba(124,58,237,0.08)",
                border: "1px solid rgba(124,58,237,0.2)",
                borderRadius: 12, padding: "12px 8px", textAlign: "center",
              }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#a78bfa" }}>{s.v}</div>
                <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;