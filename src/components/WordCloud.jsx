import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { user, logout, signInWithGoogle } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: "/",          label: t("home"),      emoji: "🏠" },
    { to: "/analyzer",  label: t("analyzer"),  emoji: "🔍" },
    { to: "/dashboard", label: t("dashboard"), emoji: "📊" },
    { to: "/about",     label: t("about"),     emoji: "ℹ️"  },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(15,23,42,0.96)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(99,102,241,0.2)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
          }}
        >
          {/* ── Logo ───────────────────────────────────── */}
          <Link
            to="/"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "linear-gradient(135deg,#6366f1,#ec4899)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                flexShrink: 0,
              }}
            >
              🔍
            </div>
            <div>
              <div
                style={{
                  fontSize: 19,
                  fontWeight: 800,
                  fontFamily: "Poppins,sans-serif",
                  background: "linear-gradient(135deg,#818cf8,#ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1.2,
                }}
              >
                {t("appName")}
              </div>
              <div style={{ fontSize: 10, color: "#64748b" }}>
                {t("tagline")}
              </div>
            </div>
          </Link>

          {/* ── Desktop Nav Links ───────────────────────── */}
          <div
            style={{
              display: "flex",
              gap: 4,
              alignItems: "center",
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  textDecoration: "none",
                  padding: "7px 14px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 500,
                  color: isActive(link.to) ? "#818cf8" : "#94a3b8",
                  background: isActive(link.to)
                    ? "rgba(99,102,241,0.15)"
                    : "transparent",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span style={{ fontSize: 13 }}>{link.emoji}</span>
                <span className="desktop-only">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* ── Right Controls ──────────────────────────── */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

            {/* Language Toggle */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleLanguage}
              style={{
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.3)",
                borderRadius: 10,
                padding: "6px 12px",
                color: "#818cf8",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "Inter,sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              {language === "en" ? "🇮🇳 हिंदी" : "🇺🇸 English"}
            </motion.button>

            {/* Auth Area */}
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <img
                  src={user.photoURL || "https://ui-avatars.com/api/?name=" + user.displayName}
                  alt={user.displayName}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    border: "2px solid #6366f1",
                    objectFit: "cover",
                  }}
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  style={{
                    background: "rgba(239,68,68,0.12)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    borderRadius: 10,
                    padding: "6px 12px",
                    color: "#f87171",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {t("logout")}
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={signInWithGoogle}
                style={{
                  background: "linear-gradient(135deg,#6366f1,#4f46e5)",
                  border: "none",
                  borderRadius: 10,
                  padding: "8px 16px",
                  color: "white",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "Inter,sans-serif",
                }}
              >
                {t("login")}
              </motion.button>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: "transparent",
                border: "1px solid rgba(99,102,241,0.3)",
                borderRadius: 8,
                color: "#94a3b8",
                cursor: "pointer",
                fontSize: 18,
                width: 36,
                height: 36,
                display: "none",   // shown via media query override
                alignItems: "center",
                justifyContent: "center",
              }}
              className="mobile-menu-btn"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* ── Mobile Dropdown ─────────────────────────── */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{
                overflow: "hidden",
                background: "rgba(15,23,42,0.98)",
                borderTop: "1px solid rgba(99,102,241,0.15)",
              }}
            >
              <div style={{ padding: "12px 20px 20px" }}>
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      textDecoration: "none",
                      padding: "12px 0",
                      color: isActive(link.to) ? "#818cf8" : "#94a3b8",
                      fontSize: 15,
                      fontWeight: 500,
                      borderBottom: "1px solid rgba(99,102,241,0.08)",
                    }}
                  >
                    <span>{link.emoji}</span>
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Responsive style for mobile menu button */}
      <style>{`
        @media (max-width: 640px) {
          .mobile-menu-btn { display: flex !important; }
          .desktop-only    { display: none  !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;