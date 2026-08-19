import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { user, logout, signInWithGoogle } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Theme colors
  const colors = {
    dark: {
      bg: "rgba(3,7,18,0.7)",
      bgScrolled: "rgba(3,7,18,0.95)",
      text: "#e2e8f0",
      textMuted: "#94a3b8",
      border: "rgba(124,58,237,0.3)",
      borderLight: "rgba(124,58,237,0.1)",
      activeBg: "rgba(124,58,237,0.15)",
      accent: "#a78bfa",
      menuBg: "rgba(3,7,18,0.98)",
      statusBorder: "#030712",
    },
    light: {
      bg: "rgba(255,255,255,0.7)",
      bgScrolled: "rgba(255,255,255,0.95)",
      text: "#1e293b",
      textMuted: "#64748b",
      border: "rgba(124,58,237,0.2)",
      borderLight: "rgba(124,58,237,0.08)",
      activeBg: "rgba(124,58,237,0.1)",
      accent: "#7c3aed",
      menuBg: "rgba(255,255,255,0.98)",
      statusBorder: "#ffffff",
    },
  };

  const c = colors[theme];

  const links = [
    { to: "/",          label: t("home"),      icon: "⚡" },
    { to: "/analyzer",  label: t("analyzer"),  icon: "🔍" },
    { to: "/dashboard", label: t("dashboard"), icon: "📊" },
    { to: "/history",   label: "History",      icon: "📚" },
    { to: "/about",     label: t("about"),     icon: "💡" },
  ];

  const active = (p) => location.pathname === p;

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          position: "sticky", top: 0, zIndex: 200,
          background: scrolled ? c.bgScrolled : c.bg,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: scrolled
            ? `1px solid ${c.border}`
            : `1px solid ${c.borderLight}`,
          transition: "all 0.3s ease",
        }}
      >
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "0 24px",
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          height: 68,
        }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
            <motion.div
              whileHover={{ rotate: 10, scale: 1.05 }}
              style={{
                width: 42, height: 42, borderRadius: 14,
                background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, boxShadow: "0 4px 20px rgba(124,58,237,0.5)",
              }}
            >
              🔍
            </motion.div>
            <div>
              <div style={{
                fontSize: 20, fontWeight: 900,
                fontFamily: "Poppins,sans-serif",
                background: "linear-gradient(135deg,#a78bfa,#06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px",
              }}>
                TruthLens
              </div>
              <div style={{ fontSize: 10, color: c.textMuted, marginTop: -2 }}>
                AI Fake News Detector
              </div>
            </div>
          </Link>

          {/* Desktop Links */}
          <div style={{ display: "flex", gap: 2, alignItems: "center" }}
            className="desktop-only">
            {links.map((link) => (
              <Link key={link.to} to={link.to} style={{ textDecoration: "none" }}>
                <motion.div
                  whileHover={{ y: -1 }}
                  style={{
                    padding: "8px 16px", borderRadius: 12,
                    fontSize: 14, fontWeight: 500,
                    color: active(link.to) ? c.accent : c.textMuted,
                    background: active(link.to) ? c.activeBg : "transparent",
                    border: active(link.to) ? `1px solid ${c.border}` : "1px solid transparent",
                    display: "flex", alignItems: "center", gap: 6,
                    transition: "all 0.2s",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: 14 }}>{link.icon}</span>
                  {link.label}
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05, rotate: 15 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              style={{
                background: c.activeBg,
                border: `1px solid ${c.border}`,
                borderRadius: 10,
                padding: "8px 10px",
                color: c.accent,
                cursor: "pointer",
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 38,
                height: 38,
              }}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </motion.button>

            {/* Language Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleLanguage}
              style={{
                background: c.activeBg,
                border: `1px solid ${c.border}`,
                borderRadius: 10, padding: "7px 13px",
                color: c.accent, cursor: "pointer",
                fontSize: 12, fontWeight: 700,
                fontFamily: "Inter,sans-serif",
              }}
            >
              {language === "en" ? "🇮🇳 हिंदी" : "🇺🇸 EN"}
            </motion.button>

            {/* Auth */}
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ position: "relative" }}>
                  <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=7c3aed&color=fff`}
                    alt={user.displayName}
                    style={{
                      width: 36, height: 36, borderRadius: "50%",
                      border: "2px solid #7c3aed",
                      objectFit: "cover",
                    }}
                  />
                  <span style={{
                    position: "absolute", bottom: 0, right: 0,
                    width: 10, height: 10, background: "#10b981",
                    borderRadius: "50%",
                    border: `2px solid ${c.statusBorder}`,
                  }} />
                </div>
                <span style={{ fontSize: 13, color: c.text, fontWeight: 500 }}
                  className="desktop-only">
                  {user.displayName?.split(" ")[0]}
                </span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    borderRadius: 10, padding: "7px 14px",
                    color: "#f87171", cursor: "pointer",
                    fontSize: 13, fontWeight: 600,
                    fontFamily: "Inter,sans-serif",
                  }}
                >
                  {t("logout")}
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={signInWithGoogle}
                className="btn"
                style={{ padding: "8px 18px", fontSize: 13 }}
              >
                🚀 {t("login")}
              </motion.button>
            )}

            {/* Mobile Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                display: "none",
                background: c.activeBg,
                border: `1px solid ${c.border}`,
                borderRadius: 10,
                color: c.accent,
                cursor: "pointer", fontSize: 18,
                width: 38, height: 38,
                alignItems: "center", justifyContent: "center",
              }}
              className="mobile-menu-btn"
            >
              {menuOpen ? "✕" : "☰"}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{
                overflow: "hidden",
                background: c.menuBg,
                borderTop: `1px solid ${c.borderLight}`,
              }}
            >
              <div style={{ padding: "12px 24px 20px" }}>
                {links.map((link) => (
                  <Link key={link.to} to={link.to}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      textDecoration: "none", padding: "13px 0",
                      color: active(link.to) ? c.accent : c.textMuted,
                      fontSize: 15, fontWeight: 500,
                      borderBottom: `1px solid ${c.borderLight}`,
                    }}
                  >
                    <span>{link.icon}</span>{link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          .desktop-only { display: none !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;