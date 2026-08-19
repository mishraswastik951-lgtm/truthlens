import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import axios from "axios";
import toast from "react-hot-toast";
import WordCloudChart from "./WordCloud";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const Spinner = () => (
  <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
);

const StatBox = ({ label, value, color }) => (
  <div style={{ background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
    <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{label}</div>
  </div>
);

const ProgressRow = ({ label, value, color, delay }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
      <span style={{ color }}>{label}</span>
      <strong style={{ color }}>{value}%</strong>
    </div>
    <div className="progress-bar">
      <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, delay }} style={{ background: color }} />
    </div>
  </div>
);

const NewsAnalyzer = () => {
  const { user, signInWithGoogle } = useAuth();
  const { t } = useLanguage();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!user) { toast.error("Please login to analyze articles!"); return; }
    if (!text.trim() || text.trim().length < 20) { toast.error("Please enter at least 20 characters!"); return; }
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post(`${API_BASE}/predict`, { text });
      setResult(response.data);
      toast.success("Analysis complete!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Analysis failed. Is Flask server running?");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => { setText(""); setResult(null); };

  const pieData = result ? [
    { name: "Fake", value: result.fake_probability, color: "#ef4444" },
    { name: "Real", value: result.real_probability, color: "#10b981" },
  ] : [];

  return (
    <div className="animated-bg" style={{ minHeight: "100vh", padding: "40px 24px 80px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: 36 }}>
          <h1 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, fontFamily: "Poppins,sans-serif", marginBottom: 10, background: "linear-gradient(135deg,#818cf8,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {t("analyzerTitle")}
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 15 }}>{t("analyzerSubtitle")}</p>
        </motion.div>

        {!user && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 12, padding: "14px 20px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <span style={{ color: "#818cf8", fontSize: 14 }}>🔒 {t("loginRequired")}</span>
            <button onClick={signInWithGoogle} className="btn-primary" style={{ padding: "8px 18px", fontSize: 13 }}>Sign in with Google</button>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>📰 News Article Text</label>
            <span style={{ fontSize: 12, color: "#475569" }}>{text.length} characters</span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("pasteArticle")}
            disabled={loading}
            rows={9}
            style={{ width: "100%", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "14px 16px", color: "#e2e8f0", fontSize: 14, lineHeight: 1.7, resize: "vertical", outline: "none", fontFamily: "Inter,sans-serif", boxSizing: "border-box" }}
          />
          <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleAnalyze} disabled={loading || !text.trim()} className="btn-primary" style={{ flex: 1, minWidth: 140, justifyContent: "center", gap: 8 }}>
              {loading ? <><Spinner /> {t("analyzing")}</> : <>🔍 {t("analyzeButton")}</>}
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleClear} disabled={loading} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "12px 22px", color: "#f87171", cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "Inter,sans-serif" }}>
              🗑️ {t("clearButton")}
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>

              <div className="glass-card" style={{ marginBottom: 20, textAlign: "center", border: `2px solid ${result.prediction === "REAL" ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"}`, background: result.prediction === "REAL" ? "rgba(16,185,129,0.04)" : "rgba(239,68,68,0.04)" }}>
                <div style={{ fontSize: 54, marginBottom: 10 }}>{result.prediction === "REAL" ? "✅" : "❌"}</div>
                <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: 2, fontFamily: "Poppins,sans-serif", color: result.prediction === "REAL" ? "#10b981" : "#ef4444", marginBottom: 8 }}>
                  {result.prediction === "REAL" ? t("realNews") : t("fakeNews")}
                </div>
                <div style={{ color: "#94a3b8", fontSize: 15 }}>
                  {t("confidence")}: <strong style={{ color: "#e2e8f0" }}>{result.confidence}%</strong>
                </div>
                {result.demo_mode && (
                  <div style={{ marginTop: 14, display: "inline-block", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.35)", borderRadius: 8, padding: "7px 16px", fontSize: 12, color: "#fbbf24" }}>
                    ⚠️ {result.note}
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20, marginBottom: 20 }}>
                <div className="glass-card">
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 18 }}>📊 Probability Breakdown</h3>
                  <ProgressRow label={`❌ ${t("fakeProbability")}`} value={result.fake_probability} color="#ef4444" delay={0.3} />
                  <ProgressRow label={`✅ ${t("realProbability")}`} value={result.real_probability} color="#10b981" delay={0.5} />
                  {result.text_stats && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 20 }}>
                      <StatBox label={t("wordCount")} value={result.text_stats.word_count} color="#818cf8" />
                      <StatBox label={t("charCount")} value={result.text_stats.char_count} color="#06b6d4" />
                      <StatBox label={t("sentences")} value={result.text_stats.sentence_count} color="#10b981" />
                    </div>
                  )}
                </div>

                <div className="glass-card">
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>🥧 Distribution Chart</h3>
                  <ResponsiveContainer width="100%" height={190}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={72} dataKey="value" label={({ name, value }) => `${name}: ${value}%`} labelLine>
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, color: "#e2e8f0", fontSize: 13 }} formatter={(value) => [`${value}%`]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {result.word_frequencies && result.word_frequencies.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card" style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>☁️ Word Cloud</h3>
                  <WordCloudChart words={result.word_frequencies} />
                </motion.div>
              )}

              {result.word_frequencies && result.word_frequencies.length > 0 && (
                <div className="glass-card">
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>🔑 {t("topWords")}</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 8 }}>
                    {result.word_frequencies.slice(0, 18).map((item, i) => {
                      const maxCount = result.word_frequencies[0].count;
                      const ratio = item.count / maxCount;
                      return (
                        <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.04 * i }}
                          style={{ background: `rgba(99,102,241,${0.05 + ratio * 0.18})`, border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
                          <span style={{ fontSize: 12, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.word}</span>
                          <span style={{ fontSize: 10, background: "rgba(99,102,241,0.3)", borderRadius: 5, padding: "1px 5px", color: "#818cf8", flexShrink: 0 }}>{item.count}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default NewsAnalyzer;
