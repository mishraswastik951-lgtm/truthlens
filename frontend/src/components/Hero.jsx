import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";

const Hero = () => {
  const { t } = useLanguage();

  const stats = [
    { value: "98.5%", label: "Model Accuracy",     icon: "🎯", color: "#7c3aed" },
    { value: "44K+",  label: "Articles Trained",   icon: "📰", color: "#06b6d4" },
    { value: "3",     label: "ML Models",           icon: "🤖", color: "#f59e0b" },
    { value: "<1s",   label: "Analysis Speed",      icon: "⚡", color: "#10b981" },
  ];

  const steps = [
    { n: "01", title: "Paste Article",       desc: "Copy any news article text",          icon: "📋", color: "#7c3aed" },
    { n: "02", title: "NLP Processing",      desc: "NLTK cleans & tokenizes text",        icon: "🧠", color: "#06b6d4" },
    { n: "03", title: "TF-IDF Vectorize",   desc: "Text converted to 50K features",      icon: "📊", color: "#f59e0b" },
    { n: "04", title: "ML Classify",         desc: "Logistic Regression predicts",        icon: "🤖", color: "#10b981" },
    { n: "05", title: "Get Results",         desc: "Fake/Real + confidence score",        icon: "✅", color: "#ec4899" },
  ];

  const features = [
    { icon: "🧠", title: "Advanced NLP",        desc: "NLTK tokenization, lemmatization & stopword removal",  color: "#7c3aed" },
    { icon: "⚡", title: "Real-time Analysis",   desc: "Get predictions in under 1 second",                    color: "#06b6d4" },
    { icon: "📊", title: "Visual Dashboard",     desc: "Charts, word cloud & detailed statistics",             color: "#f59e0b" },
    { icon: "🔒", title: "Secure Auth",          desc: "Firebase Google authentication",                       color: "#10b981" },
    { icon: "🌐", title: "Bilingual",            desc: "Full Hindi & English language support",                color: "#ec4899" },
    { icon: "🎯", title: "98.5% Accurate",       desc: "Trained on 44,898 real news articles",                 color: "#f97316" },
  ];

  return (
    <div className="bg-main" style={{ minHeight: "100vh" }}>

      {/* ── Hero Section ──────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "90px 24px 60px" }}>

        {/* Floating badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ textAlign: "center", marginBottom: 32 }}
        >
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(124,58,237,0.1)",
            border: "1px solid rgba(124,58,237,0.35)",
            borderRadius: 99, padding: "7px 20px",
            fontSize: 13, color: "#a78bfa", fontWeight: 600,
          }}>
            <span style={{ animation: "pulse 2s infinite", fontSize: 14 }}>✨</span>
            Powered by NLP + Machine Learning
            <span style={{ animation: "pulse 2s infinite 1s", fontSize: 14 }}>✨</span>
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            textAlign: "center",
            fontSize: "clamp(38px,6.5vw,78px)",
            fontWeight: 900, lineHeight: 1.08,
            fontFamily: "Poppins,sans-serif",
            marginBottom: 24, letterSpacing: "-2px",
          }}
        >
          <span style={{ color: "#f1f5f9" }}>Detect</span>{" "}
          <span style={{
            background: "linear-gradient(135deg,#a78bfa 0%,#7c3aed 40%,#06b6d4 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundSize: "200%", animation: "gradient-shift 4s ease infinite",
          }}>
            Fake News
          </span>
          <br />
          <span style={{ color: "#f1f5f9" }}>with </span>
          <span style={{
            background: "linear-gradient(135deg,#f59e0b,#ec4899)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            AI Power
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            textAlign: "center", fontSize: "clamp(16px,2vw,20px)",
            color: "#94a3b8", maxWidth: 600, margin: "0 auto 48px",
            lineHeight: 1.7,
          }}
        >
          {t("heroSubtitle")}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            display: "flex", gap: 16, justifyContent: "center",
            flexWrap: "wrap", marginBottom: 80,
          }}
        >
          <Link to="/analyzer" style={{ textDecoration: "none" }}>
            <motion.button
              whileHover={{ scale: 1.06, boxShadow: "0 16px 40px rgba(124,58,237,0.5)" }}
              whileTap={{ scale: 0.97 }}
              className="btn"
              style={{ fontSize: 16, padding: "16px 38px", borderRadius: 16 }}
            >
              🔍 {t("analyzeNow")}
            </motion.button>
          </Link>
          <Link to="/dashboard" style={{ textDecoration: "none" }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="btn-outline"
              style={{ fontSize: 16, padding: "16px 38px", borderRadius: 16 }}
            >
              📊 {t("viewDashboard")}
            </motion.button>
          </Link>
        </motion.div>

        {/* Stats Row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
          gap: 16, marginBottom: 80,
        }}>
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              whileHover={{ y: -6, boxShadow: `0 20px 40px ${s.color}25` }}
              className="glass"
              style={{
                textAlign: "center", padding: "32px 20px",
                borderColor: `${s.color}25`,
                cursor: "default",
              }}
            >
              <div style={{
                fontSize: 36, marginBottom: 12,
                filter: "drop-shadow(0 0 12px rgba(255,255,255,0.2))",
              }}>
                {s.icon}
              </div>
              <div style={{
                fontSize: 42, fontWeight: 900,
                fontFamily: "Poppins,sans-serif",
                color: s.color,
                marginBottom: 6,
                letterSpacing: "-1px",
              }}>
                {s.value}
              </div>
              <div style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500 }}>
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{ marginBottom: 80 }}
        >
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{
              fontSize: "clamp(24px,4vw,38px)", fontWeight: 800,
              fontFamily: "Poppins,sans-serif", marginBottom: 12,
            }}>
              Everything You{" "}
              <span style={{
                background: "linear-gradient(135deg,#a78bfa,#06b6d4)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                Need
              </span>
            </h2>
            <p style={{ color: "#64748b", fontSize: 15 }}>
              Built with real Data Science tools used in industry
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: 16,
          }}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.08 }}
                whileHover={{ y: -4, borderColor: `${f.color}50` }}
                className="glass"
                style={{ cursor: "default", transition: "all 0.3s ease" }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `${f.color}18`,
                  border: `1px solid ${f.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, marginBottom: 14,
                }}>
                  {f.icon}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: "#f1f5f9" }}>
                  {f.title}
                </div>
                <div style={{ color: "#64748b", fontSize: 13, lineHeight: 1.6 }}>
                  {f.desc}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{
              fontSize: "clamp(24px,4vw,38px)", fontWeight: 800,
              fontFamily: "Poppins,sans-serif", marginBottom: 12,
            }}>
              How It{" "}
              <span style={{
                background: "linear-gradient(135deg,#f59e0b,#ec4899)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                Works
              </span>
            </h2>
            <p style={{ color: "#64748b", fontSize: 15 }}>
              5-step ML pipeline from raw text to prediction
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 + i * 0.1 }}
                style={{
                  display: "flex", gap: 20, alignItems: "flex-start",
                  padding: "22px 0",
                  borderBottom: i < steps.length - 1 ? "1px solid rgba(124,58,237,0.1)" : "none",
                }}
              >
                <div style={{
                  minWidth: 56, height: 56, borderRadius: 16,
                  background: `${s.color}15`, border: `2px solid ${s.color}35`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexDirection: "column",
                }}>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                  <span style={{ fontSize: 9, color: s.color, fontWeight: 800, marginTop: 1 }}>
                    {s.n}
                  </span>
                </div>
                <div style={{ paddingTop: 4 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: s.color, marginBottom: 4 }}>
                    {s.title}
                  </div>
                  <div style={{ color: "#64748b", fontSize: 14 }}>{s.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;