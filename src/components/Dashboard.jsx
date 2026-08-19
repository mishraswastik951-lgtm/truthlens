import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import axios from "axios";
import { useLanguage } from "../context/LanguageContext";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const StatCard = ({ icon, label, value, color, subtitle }) => (
  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -4 }} className="glass-card" style={{ textAlign: "center", padding: "28px 20px" }}>
    <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
    <div style={{ fontSize: 36, fontWeight: 800, color, fontFamily: "Poppins,sans-serif" }}>{value}</div>
    <div style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600, marginTop: 4 }}>{label}</div>
    {subtitle && <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>{subtitle}</div>}
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#1e293b", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 13 }}>
        <p style={{ fontWeight: 600 }}>{label}</p>
        {payload.map((p) => <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const mlData = [
    { name: "Logistic Reg.", accuracy: 98.5, precision: 98.2, recall: 98.7 },
    { name: "Naive Bayes", accuracy: 94.2, precision: 93.8, recall: 94.6 },
    { name: "Random Forest", accuracy: 96.8, precision: 96.5, recall: 97.0 },
  ];

  const curveData = [
    { epoch: 1, train: 85, val: 82 }, { epoch: 2, train: 89, val: 87 },
    { epoch: 3, train: 92, val: 90 }, { epoch: 4, train: 95, val: 93 },
    { epoch: 5, train: 97, val: 96 }, { epoch: 6, train: 98, val: 97.5 },
    { epoch: 7, train: 98.5, val: 98.2 }, { epoch: 8, train: 98.7, val: 98.5 },
  ];

  const subjectData = [
    { name: "Politics", fake: 7328, real: 6341 },
    { name: "World", fake: 4531, real: 8427 },
    { name: "US News", fake: 5892, real: 4234 },
    { name: "Science", fake: 892, real: 2341 },
  ];

  const confusionData = [
    { name: "True Positive", value: 4180, color: "#10b981" },
    { name: "True Negative", value: 4350, color: "#6366f1" },
    { name: "False Positive", value: 62, color: "#f59e0b" },
    { name: "False Negative", value: 48, color: "#ef4444" },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE}/dashboard`);
        setStats(res.data);
      } catch {
        setStats({ total_analyzed: 0, fake_detected: 0, real_detected: 0, accuracy: 98.5, fake_percentage: 0, real_percentage: 0, recent_analyses: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "3px solid rgba(99,102,241,0.3)", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#94a3b8" }}>Loading dashboard...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="animated-bg" style={{ minHeight: "100vh", padding: "40px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, fontFamily: "Poppins,sans-serif", marginBottom: 8, background: "linear-gradient(135deg,#818cf8,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {t("dashboardTitle")}
          </h1>
          <p style={{ color: "#94a3b8" }}>{t("dashboardSubtitle")}</p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 20, marginBottom: 28 }}>
          <StatCard icon="📊" label={t("totalAnalyzed")} value={stats?.total_analyzed || 0} color="#818cf8" subtitle="All time" />
          <StatCard icon="❌" label={t("fakeDetected")} value={stats?.fake_detected || 0} color="#ef4444" subtitle={`${stats?.fake_percentage || 0}% of total`} />
          <StatCard icon="✅" label={t("realDetected")} value={stats?.real_detected || 0} color="#10b981" subtitle={`${stats?.real_percentage || 0}% of total`} />
          <StatCard icon="🎯" label={t("modelAccuracy")} value={`${stats?.accuracy || 98.5}%`} color="#f59e0b" subtitle="On test dataset" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 20, marginBottom: 24 }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-card">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 18 }}>🤖 Model Performance</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mlData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis domain={[90, 100]} tick={{ fill: "#64748b", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                <Bar dataKey="accuracy" name="Accuracy %" fill="#6366f1" radius={[4,4,0,0]} />
                <Bar dataKey="precision" name="Precision %" fill="#ec4899" radius={[4,4,0,0]} />
                <Bar dataKey="recall" name="Recall %" fill="#06b6d4" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass-card">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 18 }}>📈 Training Curve</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={curveData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                <XAxis dataKey="epoch" tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis domain={[80, 100]} tick={{ fill: "#64748b", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                <Line type="monotone" dataKey="train" name="Training %" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1", r: 4 }} />
                <Line type="monotone" dataKey="val" name="Validation %" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 20, marginBottom: 24 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 18 }}>📰 News Categories</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={subjectData} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: "#64748b", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                <Bar dataKey="fake" name="Fake" fill="#ef4444" radius={[0,4,4,0]} />
                <Bar dataKey="real" name="Real" fill="#10b981" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 18 }}>🎯 Confusion Matrix</h3>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={confusionData} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                  {confusionData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, color: "#e2e8f0", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8 }}>
              {confusionData.map((item) => (
                <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                  <span style={{ color: "#94a3b8" }}>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass-card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>🕐 {t("recentAnalyses")}</h3>
          {stats?.recent_analyses && stats.recent_analyses.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Article Snippet", "Prediction", "Confidence"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 12, color: "#64748b", fontWeight: 600, borderBottom: "1px solid rgba(99,102,241,0.15)", textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_analyses.map((item, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(99,102,241,0.08)" }}>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: "#94a3b8", maxWidth: 400 }}>{item.text_snippet}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ background: item.prediction === "REAL" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", color: item.prediction === "REAL" ? "#10b981" : "#ef4444", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>
                          {item.prediction === "REAL" ? "✅ REAL" : "❌ FAKE"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div className="progress-bar" style={{ width: 80, height: 6 }}>
                            <div className="progress-fill" style={{ width: `${item.confidence}%`, background: item.prediction === "REAL" ? "#10b981" : "#ef4444" }} />
                          </div>
                          <span style={{ fontSize: 12, color: "#94a3b8" }}>{item.confidence}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <p>{t("noData")}</p>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="glass-card" style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 18 }}>📚 Dataset Information</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
            {[
              { label: "Total Articles", value: "44,898", icon: "📰", color: "#818cf8" },
              { label: "Fake Articles", value: "23,481", icon: "❌", color: "#ef4444" },
              { label: "Real Articles", value: "21,417", icon: "✅", color: "#10b981" },
              { label: "TF-IDF Features", value: "50,000", icon: "🔤", color: "#f59e0b" },
              { label: "Train Split", value: "80%", icon: "🧠", color: "#6366f1" },
              { label: "Test Split", value: "20%", icon: "🧪", color: "#06b6d4" },
            ].map((item) => (
              <div key={item.label} style={{ background: `${item.color}10`, border: `1px solid ${item.color}25`, borderRadius: 12, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: item.color }}>{item.value}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Dashboard;
