import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth }    from "../context/AuthContext";
import { useHistory } from "../hooks/useHistory";
import {
  formatDate,
  timeAgo,
  truncate,
  predictionColor,
  scoreColor,
  sentimentEmoji,
  biasLabel,
} from "../utils/formatters";

import "./HistoryPage.css";

/* ═══════════════════════════════════════════════════════════════════════
   TINY HELPERS
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Score Ring SVG ─────────────────────────────────────────────────── */
const ScoreRing = ({ score, size = 54 }) => {
  const r    = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const col  = scoreColor(score);

  return (
    <div className="hp-ring" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="5"
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={col}
          strokeWidth="5"
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dasharray .6s ease" }}
        />
      </svg>
      <span className="hp-ring-text" style={{ color: col }}>
        {Math.round(score)}%
      </span>
    </div>
  );
};

/* ── Prediction Badge ───────────────────────────────────────────────── */
const PredictionBadge = ({ prediction }) => {
  const isReal = (prediction || "").toUpperCase() === "REAL";
  return (
    <div
      className="hp-badge"
      style={{
        background: isReal
          ? "rgba(16,185,129,.13)"
          : "rgba(239,68,68,.13)",
        border: `1px solid ${predictionColor(prediction)}40`,
      }}
    >
      <span className="hp-badge-icon">{isReal ? "✅" : "❌"}</span>
      <span
        className="hp-badge-label"
        style={{ color: predictionColor(prediction) }}
      >
        {isReal ? "REAL" : "FAKE"}
      </span>
    </div>
  );
};

/* ── Inline Tag ─────────────────────────────────────────────────────── */
const Tag = ({ children }) => (
  <span className="hp-tag">{children}</span>
);

/* ── Stat Card ──────────────────────────────────────────────────────── */
const StatCard = ({ value, label, icon, color }) => (
  <div className="hp-stat" style={{ "--sc": color }}>
    <span className="hp-stat-icon">{icon}</span>
    <span className="hp-stat-value">{value}</span>
    <span className="hp-stat-label">{label}</span>
  </div>
);

/* ── Score Bar Row ──────────────────────────────────────────────────── */
const ScoreBarRow = ({ label, value, color }) => (
  <div className="hp-bar-row">
    <span className="hp-bar-label">{label}</span>
    <div className="hp-bar-track">
      <motion.div
        className="hp-bar-fill"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        style={{ background: color }}
      />
    </div>
    <span className="hp-bar-val">{Math.round(value)}%</span>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════
   HISTORY ROW (single expandable card)
   ═══════════════════════════════════════════════════════════════════════ */
const HistoryRow = ({ item, index }) => {
  const [open, setOpen] = useState(false);

  const score      = item.confidence ?? item.fake_probability ?? 50;
  const prediction = item.prediction ?? (score >= 55 ? "REAL" : "FAKE");
  const bias       = biasLabel(item.bias);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.045, duration: 0.35 }}
      className={`hp-row ${open ? "hp-row--open" : ""}`}
      style={{ borderLeftColor: predictionColor(prediction) }}
    >
      {/* ── Collapsed Header ── */}
      <div
        className="hp-row-head"
        onClick={() => setOpen(prev => !prev)}
        role="button"
        aria-expanded={open}
        tabIndex={0}
        onKeyDown={e => (e.key === "Enter" || e.key === " ") && setOpen(p => !p)}
      >
        {/* Verdict badge */}
        <PredictionBadge prediction={prediction} />

        {/* Text snippet + tags */}
        <div className="hp-row-text">
          <p className="hp-snippet">
            {truncate(
              item.text_snippet || item.text || item.headline,
              130
            )}
          </p>
          <div className="hp-tags">
            {item.sentiment && (
              <Tag>
                {sentimentEmoji(item.sentiment)} {item.sentiment}
              </Tag>
            )}
            {item.bias && (
              <Tag>
                <span style={{ color: bias.color }}>⚖️ {bias.label}</span>
              </Tag>
            )}
            {item.source_credibility?.source && (
              <Tag>🌐 {item.source_credibility.source}</Tag>
            )}
          </div>
        </div>

        {/* Score ring + date + chevron */}
        <div className="hp-row-right">
          <ScoreRing score={score} />
          <span
            className="hp-date"
            title={formatDate(item.analyzed_at || item.timestamp)}
          >
            {timeAgo(item.analyzed_at || item.timestamp)}
          </span>
          <span className={`hp-chevron ${open ? "hp-chevron--up" : ""}`}>
            ›
          </span>
        </div>
      </div>

      {/* ── Expanded Body ── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="hp-row-body"
          >
            {/* Full text */}
            {(item.text || item.text_snippet) && (
              <div className="hp-detail-block">
                <h4 className="hp-detail-title">📄 Full Text</h4>
                <p className="hp-detail-text">
                  {item.text || item.text_snippet}
                </p>
              </div>
            )}

            {/* Score breakdown */}
            <div className="hp-detail-block">
              <h4 className="hp-detail-title">📊 Score Breakdown</h4>
              <div className="hp-bars">
                <ScoreBarRow
                  label="Credibility Score"
                  value={score}
                  color={scoreColor(score)}
                />
                {item.sentiment_score != null && (
                  <ScoreBarRow
                    label="Sentiment Confidence"
                    value={Math.abs(item.sentiment_score) * 100}
                    color="#3b82f6"
                  />
                )}
                {item.source_credibility?.score != null && (
                  <ScoreBarRow
                    label="Source Reliability"
                    value={item.source_credibility.score}
                    color="#8b5cf6"
                  />
                )}
              </div>
            </div>

            {/* Keywords */}
            {item.keywords?.length > 0 && (
              <div className="hp-detail-block">
                <h4 className="hp-detail-title">🔑 Keywords</h4>
                <div className="hp-keywords">
                  {item.keywords.slice(0, 8).map((kw, i) => (
                    <span key={i} className="hp-keyword">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {item.summary && (
              <div className="hp-detail-block">
                <h4 className="hp-detail-title">💡 Summary</h4>
                <p className="hp-detail-text">{item.summary}</p>
              </div>
            )}

            {/* Footer */}
            <div className="hp-detail-footer">
              <span>
                📅 {formatDate(item.analyzed_at || item.timestamp)}
              </span>
              {item.source_credibility?.source && (
                <span>🌐 {item.source_credibility.source}</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════ */
const VERDICTS   = ["All", "REAL", "FAKE"];
const SENTIMENTS = ["All", "Positive", "Neutral", "Negative"];
const SORTS = [
  { value: "newest",  label: "Newest"       },
  { value: "oldest",  label: "Oldest"       },
  { value: "highest", label: "Highest Score"},
  { value: "lowest",  label: "Lowest Score" },
];

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
const HistoryPage = () => {
  const { user } = useAuth();
  const {
    history,
    total,
    loading,
    error,
    refresh,
  } = useHistory(user?.uid);

  /* ── local state ── */
  const [search,          setSearch]          = useState("");
  const [filterVerdict,   setFilterVerdict]   = useState("All");
  const [filterSentiment, setFilterSentiment] = useState("All");
  const [sortBy,          setSortBy]          = useState("newest");
  const [filtersOpen,     setFiltersOpen]     = useState(false);

  /* ── computed stats ── */
  const stats = useMemo(() => {
    if (!history.length) return null;
    const real = history.filter(h =>
      (h.prediction || "").toUpperCase() === "REAL" ||
      (h.confidence ?? 0) >= 55
    ).length;
    const avgScore = Math.round(
      history.reduce(
        (acc, h) => acc + (h.confidence ?? h.fake_probability ?? 50),
        0
      ) / history.length
    );
    return {
      total:    history.length,
      real,
      fake:     history.length - real,
      avgScore,
    };
  }, [history]);

  /* ── filtered + sorted list ── */
  const displayed = useMemo(() => {
    let list = [...history];

    /* search */
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(h =>
        (h.text_snippet || h.text || h.headline || "")
          .toLowerCase()
          .includes(q) ||
        (h.sentiment || "").toLowerCase().includes(q) ||
        (h.bias      || "").toLowerCase().includes(q)
      );
    }

    /* verdict */
    if (filterVerdict !== "All") {
      list = list.filter(h => {
        const pred = (
          h.prediction ||
          (h.confidence >= 55 ? "REAL" : "FAKE")
        ).toUpperCase();
        return pred === filterVerdict;
      });
    }

    /* sentiment */
    if (filterSentiment !== "All") {
      list = list.filter(h =>
        (h.sentiment || "").toLowerCase() ===
        filterSentiment.toLowerCase()
      );
    }

    /* sort */
    list.sort((a, b) => {
      const dA = new Date(a.analyzed_at || a.timestamp || 0);
      const dB = new Date(b.analyzed_at || b.timestamp || 0);
      const sA = a.confidence ?? a.fake_probability ?? 50;
      const sB = b.confidence ?? b.fake_probability ?? 50;
      if (sortBy === "newest")  return dB - dA;
      if (sortBy === "oldest")  return dA - dB;
      if (sortBy === "highest") return sB - sA;
      if (sortBy === "lowest")  return sA - sB;
      return 0;
    });

    return list;
  }, [history, search, filterVerdict, filterSentiment, sortBy]);

  const isFiltered =
    search || filterVerdict !== "All" || filterSentiment !== "All";

  const resetFilters = () => {
    setSearch("");
    setFilterVerdict("All");
    setFilterSentiment("All");
  };

  /* ══════════════════════════════════════════════════════════════════
     LOGIN GATE
     ══════════════════════════════════════════════════════════════════ */
  if (!user) {
    return (
      <div className="hp-center-wrap">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="glass hp-gate"
        >
          <span className="hp-gate-icon">🔒</span>
          <h2>Login Required</h2>
          <p>Sign in to view your personal analysis history.</p>
          <Link to="/login" className="btn">
            Sign In
          </Link>
        </motion.div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════
     LOADING STATE
     ══════════════════════════════════════════════════════════════════ */
  if (loading) {
    return (
      <div className="hp-center-wrap">
        <div className="hp-spinner" />
        <p style={{ color: "var(--text-muted)", marginTop: 16 }}>
          Loading history…
        </p>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════
     MAIN RENDER
     ══════════════════════════════════════════════════════════════════ */
  return (
    <div className="hp-page">
      <div className="hp-inner">

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="hp-header"
        >
          <div className="hp-header-left">
            <h1 className="hp-title">Analysis History</h1>
            <p className="hp-subtitle">
              {total} article{total !== 1 ? "s" : ""} analyzed
            </p>
          </div>
          <div className="hp-header-right">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName || "User"}
                className="hp-avatar"
              />
            )}
            <button
              className="hp-refresh-btn"
              onClick={refresh}
              title="Refresh"
              aria-label="Refresh history"
            >
              🔄
            </button>
          </div>
        </motion.div>

        {/* ── Stat Cards ── */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="hp-stats"
          >
            <StatCard
              icon="📊" label="Total"
              value={stats.total}    color="#6366f1"
            />
            <StatCard
              icon="✅" label="Real"
              value={stats.real}     color="#10b981"
            />
            <StatCard
              icon="❌" label="Fake"
              value={stats.fake}     color="#ef4444"
            />
            <StatCard
              icon="⚡" label="Avg Score"
              value={`${stats.avgScore}%`} color="#f59e0b"
            />
          </motion.div>
        )}

        {/* ── Toolbar ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="hp-toolbar"
        >
          {/* Search */}
          <div className="hp-search">
            <span className="hp-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search headlines, sentiment, bias…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search history"
            />
            {search && (
              <button
                className="hp-search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            className={`hp-filter-btn ${filtersOpen ? "active" : ""} ${
              isFiltered ? "has-filter" : ""
            }`}
            onClick={() => setFiltersOpen(prev => !prev)}
            aria-expanded={filtersOpen}
          >
            ⚙️ Filters
            {isFiltered && <span className="hp-filter-dot" />}
          </button>

          {/* Sort */}
          <select
            className="hp-sort"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            aria-label="Sort results"
          >
            {SORTS.map(s => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </motion.div>

        {/* ── Filter Panel ── */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              key="filter-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="hp-filter-panel glass"
            >
              {/* Verdict chips */}
              <div className="hp-filter-group">
                <label>Verdict</label>
                <div className="hp-chips">
                  {VERDICTS.map(v => (
                    <button
                      key={v}
                      className={`hp-chip ${
                        filterVerdict === v ? "active" : ""
                      }`}
                      style={
                        filterVerdict === v && v !== "All"
                          ? {
                              background:  predictionColor(v),
                              borderColor: predictionColor(v),
                            }
                          : {}
                      }
                      onClick={() => setFilterVerdict(v)}
                    >
                      {v === "REAL"
                        ? "✅ Real"
                        : v === "FAKE"
                        ? "❌ Fake"
                        : "All"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sentiment chips */}
              <div className="hp-filter-group">
                <label>Sentiment</label>
                <div className="hp-chips">
                  {SENTIMENTS.map(s => (
                    <button
                      key={s}
                      className={`hp-chip ${
                        filterSentiment === s ? "active" : ""
                      }`}
                      onClick={() => setFilterSentiment(s)}
                    >
                      {s !== "All" ? sentimentEmoji(s) : ""} {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset */}
              {isFiltered && (
                <button className="hp-reset" onClick={resetFilters}>
                  ✕ Reset Filters
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Result Count ── */}
        {history.length > 0 && (
          <div className="hp-count">
            Showing{" "}
            <strong>{displayed.length}</strong> of{" "}
            <strong>{history.length}</strong> results
            {isFiltered && (
              <button
                className="hp-count-reset"
                onClick={resetFilters}
              >
                clear filters
              </button>
            )}
          </div>
        )}

        {/* ── Error Banner ── */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hp-error"
          >
            ⚠️ {error}
            <button onClick={refresh}>Retry</button>
          </motion.div>
        )}

        {/* ── Empty State ── */}
        {!error && displayed.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="glass hp-empty"
          >
            <span className="hp-empty-icon">
              {isFiltered ? "🔎" : "📭"}
            </span>
            <h3>
              {isFiltered ? "No results found" : "No History Yet"}
            </h3>
            <p>
              {isFiltered
                ? "Try adjusting your search or filters."
                : "Start analyzing articles to build your history."}
            </p>
            {!isFiltered && (
              <Link to="/" className="btn">
                🔍 Analyze Now
              </Link>
            )}
          </motion.div>
        )}

        {/* ── History Rows ── */}
        {!error && displayed.length > 0 && (
          <div className="hp-list">
            {displayed.map((item, i) => (
              <HistoryRow
                key={item.id || item.timestamp || i}
                item={item}
                index={i}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default HistoryPage;