import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";

const About = () => {
  const { t } = useLanguage();

  const techStack = [
    { name: "Python 3.10", category: "Backend", color: "#f59e0b", emoji: "🐍" },
    { name: "Pandas", category: "Data Cleaning", color: "#6366f1", emoji: "🐼" },
    { name: "NumPy", category: "Numerical", color: "#818cf8", emoji: "🔢" },
    { name: "Scikit-learn", category: "ML", color: "#ec4899", emoji: "🤖" },
    { name: "NLTK", category: "NLP", color: "#10b981", emoji: "📝" },
    { name: "Flask", category: "API", color: "#06b6d4", emoji: "⚗️" },
    { name: "React.js", category: "Frontend", color: "#61DAFB", emoji: "⚛️" },
    { name: "Firebase", category: "Auth", color: "#FFA000", emoji: "🔥" },
    { name: "Recharts", category: "Visualization", color: "#8b5cf6", emoji: "📊" },
    { name: "Framer Motion", category: "Animation", color: "#f472b6", emoji: "✨" },
  ];

  const pipeline = [
    {
      step: "Data Collection",
      desc: "Kaggle dataset: 23,481 fake + 21,417 real news articles",
      detail: "Source: Clément Bisaillon's Fake and Real News Dataset",
      color: "#6366f1",
    },
    {
      step: "Data Cleaning",
      desc: "Remove duplicates, handle missing values, combine title+text",
      detail: "Pandas operations: dropna(), drop_duplicates(), fillna()",
      color: "#ec4899",
    },
    {
      step: "Text Preprocessing",
      desc: "Lowercase, remove URLs/HTML/punctuation/numbers",
      detail: "Regex cleaning + NLTK tokenization",
      color: "#06b6d4",
    },
    {
      step: "NLP Feature Engineering",
      desc: "Tokenization → Stopword Removal → Lemmatization",
      detail: "WordNetLemmatizer + NLTK stopwords corpus",
      color: "#10b981",
    },
    {
      step: "TF-IDF Vectorization",
      desc: "50,000 features, bigrams, sublinear TF scaling",
      detail: "TfidfVectorizer(max_features=50000, ngram_range=(1,2))",
      color: "#f59e0b",
    },
    {
      step: "Model Training",
      desc: "3 models trained: Logistic Regression, Naive Bayes, Random Forest",
      detail: "80/20 train-test split with stratification",
      color: "#8b5cf6",
    },
    {
      step: "Model Evaluation",
      desc: "Accuracy, Precision, Recall, F1-Score, ROC-AUC",
      detail: "Best: Logistic Regression at 98.5% accuracy",
      color: "#ef4444",
    },
  ];

  return (
    <div
      className="animated-bg"
      style={{ minHeight: "100vh", padding: "40px 24px 80px" }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: 60 }}
        >
          <div style={{ fontSize: 60, marginBottom: 16 }}>🔍</div>
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 900,
              fontFamily: "Poppins, sans-serif",
              marginBottom: 12,
            }}
          >
            <span
              style={{
                background: "linear-gradient(135deg, #818cf8, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              TruthLens
            </span>
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 18, maxWidth: 500, margin: "0 auto" }}>
            AI-powered fake news detection using advanced NLP and Machine Learning
          </p>
        </motion.div>

        {/* ML Pipeline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card"
          style={{ marginBottom: 32 }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 28 }}>
            🔬 {t("howItWorks")} - ML Pipeline
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {pipeline.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                style={{
                  display: "flex",
                  gap: 20,
                  padding: "20px 0",
                  borderBottom:
                    i < pipeline.length - 1
                      ? "1px solid rgba(99,102,241,0.1)"
                      : "none",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    minWidth: 40,
                    height: 40,
                    borderRadius: 12,
                    background: `${step.color}15`,
                    border: `2px solid ${step.color}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: step.color,
                    fontWeight: 800,
                    fontSize: 15,
                  }}
                >
                  {i + 1}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: step.color,
                      marginBottom: 4,
                    }}
                  >
                    {step.step}
                  </div>
                  <div style={{ fontSize: 14, color: "#e2e8f0", marginBottom: 4 }}>
                    {step.desc}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      background: "rgba(15,23,42,0.6)",
                      borderRadius: 6,
                      padding: "4px 10px",
                      display: "inline-block",
                      fontFamily: "monospace",
                    }}
                  >
                    {step.detail}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card"
          style={{ marginBottom: 32 }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
            🛠️ {t("techStack")}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 14,
            }}
          >
            {techStack.map((tech, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                whileHover={{ y: -3, boxShadow: `0 8px 20px ${tech.color}30` }}
                style={{
                  background: `${tech.color}10`,
                  border: `1px solid ${tech.color}30`,
                  borderRadius: 12,
                  padding: "14px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "default",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: 22 }}>{tech.emoji}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: tech.color }}>
                    {tech.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{tech.category}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Dataset Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="glass-card"
          style={{ marginBottom: 32 }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
            📚 {t("dataset")}
          </h2>
          <div
            style={{
              background: "rgba(99,102,241,0.05)",
              border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: 12,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
              Fake and Real News Dataset
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 12 }}>
              By Clément Bisaillon • Kaggle
            </div>
            <a
              href="https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(99,102,241,0.2)",
                border: "1px solid rgba(99,102,241,0.4)",
                borderRadius: 8,
                padding: "6px 14px",
                color: "#818cf8",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              🔗 View on Kaggle
            </a>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            {[
              { label: "Total Articles", value: "44,898", color: "#818cf8" },
              { label: "Fake News (Fake.csv)", value: "23,481", color: "#ef4444" },
              { label: "Real News (True.csv)", value: "21,417", color: "#10b981" },
              { label: "Columns", value: "title, text, subject, date", color: "#f59e0b" },
              { label: "Time Period", value: "2016 - 2017", color: "#06b6d4" },
              { label: "Source", value: "Reuters + PolitiFact", color: "#8b5cf6" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: `${item.color}10`,
                  border: `1px solid ${item.color}25`,
                  borderRadius: 10,
                  padding: "12px 14px",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 600, color: item.color }}>
                  {item.value}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Skills Demonstrated */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="glass-card"
        >
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
            💼 Skills Demonstrated (Resume-Ready)
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            {[
              { skill: "Data Cleaning", icon: "🧹", desc: "Pandas, Missing Values" },
              { skill: "Feature Engineering", icon: "⚙️", desc: "TF-IDF, N-grams" },
              { skill: "Machine Learning", icon: "🤖", desc: "Scikit-learn Pipelines" },
              { skill: "NLP", icon: "📝", desc: "NLTK, Lemmatization" },
              { skill: "Model Evaluation", icon: "📊", desc: "AUC, F1, Confusion Matrix" },
              { skill: "REST API", icon: "🔌", desc: "Flask, CORS" },
              { skill: "React.js", icon: "⚛️", desc: "Hooks, Context API" },
              { skill: "Data Visualization", icon: "📈", desc: "Recharts, Word Cloud" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + i * 0.05 }}
                style={{
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  borderRadius: 12,
                  padding: "14px",
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#818cf8", marginBottom: 3 }}>
                  {item.skill}
                </div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;