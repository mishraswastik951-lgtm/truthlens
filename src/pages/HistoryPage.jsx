// frontend/src/pages/HistoryPage.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useHistory } from "../hooks/useHistory";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

// ── helpers ───────────────────────────────────────────────────
const predColor = (p) => p === "REAL" ? "#10b981" : "#ef4444";
const confColor = (c) => c >= 90 ? "#10b981" : c >= 75 ? "#f59e0b" : "#ef4444";
const truncate  = (t, n=110) => t?.length > n ? t.slice(0,n)+"..." : t;

// ── Spinner ───────────────────────────────────────────────────
const Spinner = () => (
  <>
    <div style={{
      width:48, height:48,
      border:"3px solid rgba(124,58,237,0.2)",
      borderTop:"3px solid #7c3aed",
      borderRadius:"50%", animation:"spin 1s linear infinite",
      margin:"0 auto 16px",
    }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </>
);

// ── Sentiment Tab Content ─────────────────────────────────────
const SentimentDetail = ({ sentiment }) => {
  if (!sentiment) return null;
  const { why_explanation: why, emotions, style,
          fake_language_patterns: fakeP,
          real_language_patterns: realP } = sentiment;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* Verdict */}
      <div style={{
        background: fakeP?.length > realP?.length
          ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)",
        border:`1px solid ${fakeP?.length > realP?.length
          ? "rgba(239,68,68,0.25)" : "rgba(16,185,129,0.25)"}`,
        borderRadius:12, padding:"14px 18px",
        fontSize:14, color:"#e2e8f0", lineHeight:1.7,
        fontWeight:600,
      }}>
        {why?.verdict}
      </div>

      {/* Reasons */}
      {why?.reasons?.length > 0 && (
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:"#a78bfa", marginBottom:10 }}>
            📖 Why this sentiment?
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {why.reasons.map((r,i) => (
              <div key={i} style={{
                display:"flex", gap:10, fontSize:13, color:"#94a3b8", lineHeight:1.6,
              }}>
                <span style={{ color:"#7c3aed", flexShrink:0 }}>→</span>
                {r}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Red & Green flags */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        {/* Red flags */}
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:"#ef4444", marginBottom:8 }}>
            🚩 Red Flags ({why?.red_flags?.length || 0})
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {why?.red_flags?.length > 0 ? why.red_flags.map((f,i) => (
              <div key={i} style={{
                background:"rgba(239,68,68,0.08)",
                border:"1px solid rgba(239,68,68,0.2)",
                borderRadius:8, padding:"6px 10px",
                fontSize:12, color:"#fca5a5",
              }}>
                ❌ {f}
              </div>
            )) : (
              <div style={{ fontSize:12, color:"#475569" }}>None detected</div>
            )}
          </div>
        </div>

        {/* Green flags */}
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:"#10b981", marginBottom:8 }}>
            ✅ Credibility Signals ({why?.green_flags?.length || 0})
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {why?.green_flags?.length > 0 ? why.green_flags.map((f,i) => (
              <div key={i} style={{
                background:"rgba(16,185,129,0.08)",
                border:"1px solid rgba(16,185,129,0.2)",
                borderRadius:8, padding:"6px 10px",
                fontSize:12, color:"#6ee7b7",
              }}>
                ✅ {f}
              </div>
            )) : (
              <div style={{ fontSize:12, color:"#475569" }}>None detected</div>
            )}
          </div>
        </div>
      </div>

      {/* Language Patterns */}
      {fakeP?.length > 0 && (
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:"#f87171", marginBottom:8 }}>
            ⚠️ Fake News Language Patterns Detected
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {fakeP.map((p,i) => (
              <div key={i} style={{
                background:"rgba(239,68,68,0.06)",
                border:"1px solid rgba(239,68,68,0.15)",
                borderRadius:8, padding:"8px 12px",
                display:"flex", justifyContent:"space-between", alignItems:"center",
              }}>
                <span style={{ fontSize:12, color:"#fca5a5" }}>🚩 {p.pattern}</span>
                <span style={{
                  background:"rgba(239,68,68,0.2)", borderRadius:99,
                  padding:"2px 8px", fontSize:11, color:"#f87171",
                }}>
                  {p.count}x
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {realP?.length > 0 && (
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:"#34d399", marginBottom:8 }}>
            ✅ Real News Language Patterns
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {realP.map((p,i) => (
              <div key={i} style={{
                background:"rgba(16,185,129,0.06)",
                border:"1px solid rgba(16,185,129,0.15)",
                borderRadius:8, padding:"8px 12px",
                display:"flex", justifyContent:"space-between", alignItems:"center",
              }}>
                <span style={{ fontSize:12, color:"#6ee7b7" }}>✅ {p.pattern}</span>
                <span style={{
                  background:"rgba(16,185,129,0.2)", borderRadius:99,
                  padding:"2px 8px", fontSize:11, color:"#34d399",
                }}>
                  {p.count}x
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emotions */}
      {emotions && Object.keys(emotions).length > 0 && (
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:"#a78bfa", marginBottom:10 }}>
            🎭 Emotions Detected
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {Object.entries(emotions).map(([emo, count]) => {
              const emoMap = {
                fear:"😱", anger:"😡", joy:"😊",
                surprise:"😮", trust:"🤝", disgust:"🤢",
              };
              return (
                <div key={emo} style={{
                  background:"rgba(124,58,237,0.1)",
                  border:"1px solid rgba(124,58,237,0.25)",
                  borderRadius:99, padding:"5px 14px",
                  fontSize:13, color:"#a78bfa",
                }}>
                  {emoMap[emo] || "🎭"} {emo} ({count})
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Style analysis */}
      {style && (
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:"#a78bfa", marginBottom:10 }}>
            ✍️ Writing Style
          </div>
          <div style={{
            display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:10,
          }}>
            {[
              { label:"ALL CAPS Words",    value:style.caps_word_count,    color: style.caps_word_count>3?"#ef4444":"#10b981" },
              { label:"Exclamations",      value:style.exclamation_count,  color: style.exclamation_count>3?"#ef4444":"#10b981" },
              { label:"Avg Sent. Length",  value:`${style.avg_sentence_length} words`, color:"#a78bfa" },
              { label:"Writing Style",     value:style.is_formal?"Formal 📰":"Informal ⚠️", color:style.is_formal?"#10b981":"#f59e0b" },
              { label:"Sensationalist",    value:style.is_sensationalist?"Yes ⚠️":"No ✅", color:style.is_sensationalist?"#ef4444":"#10b981" },
            ].map(s => (
              <div key={s.label} style={{
                background:"rgba(124,58,237,0.07)",
                border:"1px solid rgba(124,58,237,0.18)",
                borderRadius:10, padding:"10px 12px",
              }}>
                <div style={{ fontSize:15, fontWeight:700, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:11, color:"#475569", marginTop:3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── History Item Card ─────────────────────────────────────────
const HistoryCard = ({ item, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this analysis?")) return;
    setDeleting(true);
    const ok = await onDelete(item._id);
    if (ok) toast.success("Deleted!");
    else { toast.error("Delete failed"); setDeleting(false); }
  };

  const s = item.sentiment || {};
  const b = item.bias      || {};

  const tabs = [
    { id:"overview",  label:"Overview",   icon:"📊" },
    { id:"sentiment", label:"Sentiment",  icon:"😊" },
    { id:"bias",      label:"Bias",       icon:"⚖️" },
    { id:"summary",   label:"Summary",    icon:"📋" },
  ];

  return (
    <motion.div
      layout
      initial={{ opacity:0, y:20 }}
      animate={{ opacity:1, y:0 }}
      exit={{ opacity:0, x:-100 }}
      className="glass"
      style={{
        borderLeft:`4px solid ${predColor(item.prediction)}`,
        padding:0, overflow:"hidden",
        opacity: deleting ? 0.5 : 1,
      }}
    >
      {/* ── Card Header (always visible) ──────────── */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding:"16px 20px", cursor:"pointer",
          display:"flex", alignItems:"center",
          gap:14, flexWrap:"wrap",
          background: expanded ? "rgba(124,58,237,0.06)" : "transparent",
          transition:"background 0.2s",
        }}
      >
        {/* Prediction badge */}
        <div style={{
          minWidth:72, textAlign:"center",
          background: item.prediction==="REAL" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
          border:`1px solid ${predColor(item.prediction)}40`,
          borderRadius:10, padding:"8px 6px",
        }}>
          <div style={{ fontSize:20 }}>{item.prediction==="REAL"?"✅":"❌"}</div>
          <div style={{ fontSize:10, fontWeight:700, color:predColor(item.prediction), marginTop:2 }}>
            {item.prediction}
          </div>
        </div>

        {/* Text + meta */}
        <div style={{ flex:1, minWidth:180 }}>
          <div style={{ fontSize:13, color:"#e2e8f0", lineHeight:1.5, marginBottom:6 }}>
            {truncate(item.text_snippet)}
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            <span style={{
              fontSize:11, color:"#64748b",
              background:"rgba(255,255,255,0.04)",
              borderRadius:6, padding:"2px 7px",
            }}>
              {s.emoji} {s.sentiment}
            </span>
            <span style={{
              fontSize:11, color:"#64748b",
              background:"rgba(255,255,255,0.04)",
              borderRadius:6, padding:"2px 7px",
            }}>
              {b.emoji} {b.bias}
            </span>
            {item.suspicious_count > 0 && (
              <span style={{
                fontSize:11, color:"#f87171",
                background:"rgba(239,68,68,0.08)",
                borderRadius:6, padding:"2px 7px",
              }}>
                🚩 {item.suspicious_count} flags
              </span>
            )}
            {item.demo_mode && (
              <span style={{
                fontSize:11, color:"#fbbf24",
                background:"rgba(245,158,11,0.1)",
                borderRadius:6, padding:"2px 7px",
              }}>
                ⚠️ Demo
              </span>
            )}
          </div>
        </div>

        {/* Right side: confidence + date + actions */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ textAlign:"right" }}>
            <div style={{
              fontSize:20, fontWeight:800,
              color: confColor(item.confidence),
            }}>
              {item.confidence}%
            </div>
            <div style={{ fontSize:10, color:"#475569" }}>
              {typeof item.analyzed_at === "string"
                ? item.analyzed_at.slice(0,10)
                : new Date(item.analyzed_at).toLocaleDateString()}
            </div>
          </div>

          <button onClick={handleDelete} disabled={deleting}
            style={{
              background:"rgba(239,68,68,0.1)",
              border:"1px solid rgba(239,68,68,0.25)",
              borderRadius:8, padding:"6px 10px",
              color:"#f87171", cursor:"pointer", fontSize:14,
            }}
            title="Delete"
          >
            🗑️
          </button>

          <div style={{
            fontSize:18, color:"#475569",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition:"transform 0.3s",
          }}>
            ▼
          </div>
        </div>
      </div>

      {/* ── Expanded Detail ────────────────────────── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height:0, opacity:0 }}
            animate={{ height:"auto", opacity:1 }}
            exit={{ height:0, opacity:0 }}
            transition={{ duration:0.3 }}
            style={{
              overflow:"hidden",
              borderTop:"1px solid rgba(124,58,237,0.12)",
            }}
          >
            <div style={{ padding:"20px" }}>

              {/* Tabs */}
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:18 }}>
                {tabs.map(t => (
                  <button key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    style={{
                      background: activeTab===t.id
                        ? "rgba(124,58,237,0.25)"
                        : "rgba(124,58,237,0.06)",
                      border:`1px solid ${activeTab===t.id
                        ? "rgba(124,58,237,0.5)"
                        : "rgba(124,58,237,0.12)"}`,
                      borderRadius:9, padding:"6px 14px",
                      color: activeTab===t.id ? "#a78bfa" : "#64748b",
                      cursor:"pointer", fontSize:12, fontWeight:600,
                      fontFamily:"Inter,sans-serif",
                    }}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={activeTab}
                  initial={{ opacity:0, y:8 }}
                  animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0 }}
                  transition={{ duration:0.2 }}
                >

                  {/* OVERVIEW */}
                  {activeTab==="overview" && (
                    <div style={{
                      display:"grid",
                      gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",
                      gap:12,
                    }}>
                      {[
                        { l:"Fake Prob",    v:`${item.fake_probability}%`, c:"#ef4444" },
                        { l:"Real Prob",    v:`${item.real_probability}%`, c:"#10b981" },
                        { l:"Credibility", v:`${item.credibility_score}%`,c: item.credibility_score>70?"#10b981":"#ef4444" },
                        { l:"Words",       v:item.text_stats?.word_count,  c:"#a78bfa" },
                        { l:"Sentences",   v:item.text_stats?.sentence_count, c:"#06b6d4" },
                        { l:"Read Time",   v:`${item.text_stats?.reading_time}m`, c:"#f59e0b" },
                      ].map(s => (
                        <div key={s.l} style={{
                          background:`${s.c}0d`,
                          border:`1px solid ${s.c}25`,
                          borderRadius:10, padding:"12px",
                          textAlign:"center",
                        }}>
                          <div style={{ fontSize:18, fontWeight:800, color:s.c }}>{s.v}</div>
                          <div style={{ fontSize:11, color:"#475569", marginTop:3 }}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* SENTIMENT — with WHY explanation */}
                  {activeTab==="sentiment" && (
                    <div>
                      {/* Sentiment scores */}
                      <div style={{
                        display:"flex", gap:12, flexWrap:"wrap",
                        marginBottom:20, alignItems:"center",
                      }}>
                        <div style={{ fontSize:48 }}>{s.emoji}</div>
                        <div>
                          <div style={{ fontSize:22, fontWeight:800, color:s.color }}>
                            {s.sentiment}
                          </div>
                          <div style={{ fontSize:12, color:"#64748b", marginTop:4 }}>
                            Compound score: <strong style={{ color:"#e2e8f0" }}>{s.compound}</strong>
                          </div>
                        </div>
                        <div style={{ marginLeft:"auto", textAlign:"right" }}>
                          <div style={{
                            fontSize:12, fontWeight:700,
                            background: s.credibility_impact?.impact > 0
                              ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                            border:`1px solid ${s.credibility_impact?.impact > 0
                              ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                            borderRadius:8, padding:"6px 12px",
                            color: s.credibility_impact?.impact > 0 ? "#10b981" : "#ef4444",
                          }}>
                            Credibility Impact: {s.credibility_impact?.impact > 0 ? "+" : ""}
                            {s.credibility_impact?.impact}
                          </div>
                        </div>
                      </div>

                      {/* Score bars */}
                      <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
                        {[
                          { l:"😊 Positive", v:s.positive, c:"#10b981" },
                          { l:"😠 Negative", v:s.negative, c:"#ef4444" },
                          { l:"😐 Neutral",  v:s.neutral,  c:"#94a3b8" },
                        ].map(row => (
                          <div key={row.l}>
                            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:5 }}>
                              <span style={{ color:row.c }}>{row.l}</span>
                              <strong style={{ color:row.c }}>{row.v}%</strong>
                            </div>
                            <div className="progress-bar">
                              <motion.div className="progress-fill"
                                initial={{ width:0 }}
                                animate={{ width:`${row.v}%` }}
                                transition={{ duration:1 }}
                                style={{ background:row.c }} />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Why explanation */}
                      <div style={{
                        borderTop:"1px solid rgba(124,58,237,0.12)",
                        paddingTop:16,
                      }}>
                        <div style={{
                          fontSize:13, fontWeight:700, color:"#a78bfa",
                          marginBottom:14,
                          display:"flex", alignItems:"center", gap:6,
                        }}>
                          🔬 Why does sentiment affect authenticity?
                        </div>
                        <SentimentDetail sentiment={item.sentiment} />
                      </div>
                    </div>
                  )}

                  {/* BIAS */}
                  {activeTab==="bias" && (
                    <div>
                      <div style={{
                        textAlign:"center", padding:"16px 0 20px",
                        borderBottom:"1px solid rgba(124,58,237,0.1)",
                        marginBottom:20,
                      }}>
                        <div style={{ fontSize:44, marginBottom:8 }}>{b.emoji}</div>
                        <div style={{ fontSize:22, fontWeight:800, color:b.color }}>
                          {b.bias}
                        </div>
                        <div style={{ fontSize:12, color:"#64748b", marginTop:4 }}>
                          Left signals: <strong style={{ color:"#3b82f6" }}>{b.left_count}</strong>
                          {" • "}
                          Right signals: <strong style={{ color:"#ef4444" }}>{b.right_count}</strong>
                        </div>
                      </div>

                      {/* Bias spectrum */}
                      <div style={{ marginBottom:20 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#64748b", marginBottom:6 }}>
                          <span>🔵 Left</span><span>⚖️ Center</span><span>Right 🔴</span>
                        </div>
                        <div style={{
                          height:12, borderRadius:99, overflow:"hidden",
                          background:"linear-gradient(90deg,#3b82f6,#94a3b8,#ef4444)",
                          position:"relative",
                        }}>
                          <motion.div
                            initial={{ left:"50%" }}
                            animate={{ left: b.bias==="Left-Leaning"?"20%": b.bias==="Right-Leaning"?"80%":"50%" }}
                            transition={{ duration:1 }}
                            style={{
                              position:"absolute", top:"50%",
                              transform:"translate(-50%,-50%)",
                              width:20, height:20, borderRadius:"50%",
                              background:"white", boxShadow:"0 0 8px rgba(0,0,0,0.5)",
                            }} />
                        </div>
                      </div>

                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                        {b.found_left?.length > 0 && (
                          <div>
                            <div style={{ fontSize:12, color:"#3b82f6", fontWeight:700, marginBottom:6 }}>
                              🔵 Left keywords:
                            </div>
                            <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                              {b.found_left.map(w => (
                                <span key={w} style={{
                                  background:"rgba(59,130,246,0.1)",
                                  border:"1px solid rgba(59,130,246,0.3)",
                                  borderRadius:99, padding:"2px 8px",
                                  fontSize:11, color:"#93c5fd",
                                }}>{w}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {b.found_right?.length > 0 && (
                          <div>
                            <div style={{ fontSize:12, color:"#ef4444", fontWeight:700, marginBottom:6 }}>
                              🔴 Right keywords:
                            </div>
                            <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                              {b.found_right.map(w => (
                                <span key={w} style={{
                                  background:"rgba(239,68,68,0.1)",
                                  border:"1px solid rgba(239,68,68,0.3)",
                                  borderRadius:99, padding:"2px 8px",
                                  fontSize:11, color:"#fca5a5",
                                }}>{w}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SUMMARY */}
                  {activeTab==="summary" && (
                    <div>
                      {item.summary ? (
                        <div style={{
                          background:"rgba(124,58,237,0.06)",
                          border:"1px solid rgba(124,58,237,0.2)",
                          borderRadius:12, padding:18, marginBottom:14,
                          fontSize:13, color:"#e2e8f0", lineHeight:1.8,
                          fontStyle:"italic",
                        }}>
                          "{item.summary}"
                        </div>
                      ) : (
                        <p style={{ color:"#475569", fontSize:13 }}>
                          No summary available for this article.
                        </p>
                      )}
                      <div style={{ fontSize:11, color:"#334155" }}>
                        📌 Extractive summarization — top sentences by word frequency
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


// ── Main Page ─────────────────────────────────────────────────
const HistoryPage = () => {
  const { user } = useAuth();
  const {
    history, total, pages, userStats, loading,
    page, setPage,
    predFilter, setPredFilter,
    sentFilter, setSentFilter,
    deleteItem, clearAll,
    refresh,
  } = useHistory(user?.uid);

  // ── Not logged in ──────────────────────────────────
  if (!user) {
    return (
      <div className="bg-main" style={{
        minHeight:"100vh", display:"flex",
        alignItems:"center", justifyContent:"center", padding:24,
      }}>
        <div className="glass" style={{ maxWidth:400, textAlign:"center", padding:"52px 40px" }}>
          <div style={{ fontSize:56, marginBottom:16 }}>🔒</div>
          <h2 style={{ fontSize:22, fontWeight:700, marginBottom:10,
            fontFamily:"Poppins,sans-serif" }}>Login Required</h2>
          <p style={{ color:"#64748b", marginBottom:28, fontSize:14 }}>
            Sign in to view your personal analysis history.
          </p>
          <Link to="/login" className="btn" style={{ display:"inline-flex" }}>
            🚀 Sign In
          </Link>
        </div>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────
  if (loading && history.length === 0) {
    return (
      <div className="bg-main" style={{
        minHeight:"100vh", display:"flex",
        alignItems:"center", justifyContent:"center",
      }}>
        <div style={{ textAlign:"center" }}>
          <Spinner />
          <p style={{ color:"#64748b", fontSize:14 }}>Loading your history...</p>
        </div>
      </div>
    );
  }

  // ── Sentiment chart data ───────────────────────────
  const sentData = userStats ? [
    { name:"Positive", value: history.filter(h=>h.sentiment?.sentiment==="Positive").length, color:"#10b981" },
    { name:"Negative", value: history.filter(h=>h.sentiment?.sentiment==="Negative").length, color:"#ef4444" },
    { name:"Neutral",  value: history.filter(h=>h.sentiment?.sentiment==="Neutral").length,  color:"#94a3b8" },
  ] : [];

  const handleClearAll = async () => {
    if (!window.confirm(`Delete all ${total} analyses? This cannot be undone.`)) return;
    const ok = await clearAll();
    if (ok) toast.success("History cleared!");
    else    toast.error("Failed to clear history");
  };

  return (
    <div className="bg-main" style={{ minHeight:"100vh", padding:"40px 24px 80px" }}>
      <div style={{ maxWidth:960, margin:"0 auto" }}>

        {/* ── Page Header ──────────────────────────── */}
        <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}
          style={{ marginBottom:32, display:"flex", alignItems:"flex-start",
            justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
          <div>
            <h1 style={{
              fontSize:"clamp(24px,4vw,38px)", fontWeight:900,
              fontFamily:"Poppins,sans-serif",
              background:"linear-gradient(135deg,#a78bfa,#06b6d4)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              marginBottom:6,
            }}>
              Analysis History
            </h1>
            <p style={{ color:"#64748b", fontSize:14 }}>
              {total} article{total!==1?"s":""} analyzed • Saved to MongoDB
            </p>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <button onClick={refresh} style={{
              background:"rgba(124,58,237,0.1)", border:"1px solid rgba(124,58,237,0.3)",
              borderRadius:10, padding:"8px 16px", color:"#a78bfa",
              cursor:"pointer", fontSize:13, fontWeight:600,
            }}>
              🔄 Refresh
            </button>
            {total > 0 && (
              <button onClick={handleClearAll} style={{
                background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)",
                borderRadius:10, padding:"8px 16px", color:"#f87171",
                cursor:"pointer", fontSize:13, fontWeight:600,
              }}>
                🗑️ Clear All
              </button>
            )}
          </div>
        </motion.div>

        {/* ── User Stats Cards ─────────────────────── */}
        {userStats && total > 0 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",
              gap:14, marginBottom:24,
            }}>
            {[
              { l:"Total Analyzed", v:userStats.total        || total, c:"#a78bfa", i:"📊" },
              { l:"Fake Detected",  v:userStats.fake_count   || 0,     c:"#ef4444", i:"❌" },
              { l:"Real Detected",  v:userStats.real_count   || 0,     c:"#10b981", i:"✅" },
              { l:"Avg Confidence", v:`${Math.round(userStats.avg_confidence||0)}%`, c:"#f59e0b", i:"🎯" },
            ].map(s => (
              <div key={s.l} className="glass" style={{
                textAlign:"center", padding:"22px 16px",
                borderColor:`${s.c}25`,
              }}>
                <div style={{ fontSize:28, marginBottom:8 }}>{s.i}</div>
                <div style={{ fontSize:28, fontWeight:800, color:s.c, fontFamily:"Poppins,sans-serif" }}>
                  {s.v}
                </div>
                <div style={{ fontSize:12, color:"#64748b", marginTop:4 }}>{s.l}</div>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Sentiment Distribution Chart ─────────── */}
        {sentData.some(d => d.value > 0) && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            className="glass" style={{ marginBottom:24 }}>
            <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>
              😊 Sentiment Distribution of Your Articles
            </h3>
            <div style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",
              gap:20, alignItems:"center",
            }}>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={sentData} cx="50%" cy="50%" outerRadius={70}
                    dataKey="value" label={({name,value})=>value>0?`${name}: ${value}`:""} labelLine>
                    {sentData.map((e,i)=><Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{
                    background:"#1e293b", border:"1px solid rgba(124,58,237,0.3)",
                    borderRadius:8, color:"#e2e8f0", fontSize:12,
                  }} />
                </PieChart>
              </ResponsiveContainer>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={sentData} margin={{ top:5, right:10, left:-20, bottom:5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.1)" />
                  <XAxis dataKey="name" tick={{ fill:"#64748b", fontSize:11 }} />
                  <YAxis tick={{ fill:"#64748b", fontSize:11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{
                    background:"#1e293b", border:"1px solid rgba(124,58,237,0.3)",
                    borderRadius:8, color:"#e2e8f0", fontSize:12,
                  }} />
                  <Bar dataKey="value" name="Articles" radius={[4,4,0,0]}>
                    {sentData.map((e,i)=><Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* ── Filters ──────────────────────────────── */}
        {total > 0 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            style={{
              display:"flex", gap:10, flexWrap:"wrap",
              marginBottom:20, alignItems:"center",
            }}>
            <span style={{ fontSize:13, color:"#64748b", fontWeight:600 }}>Filter:</span>

            {/* Prediction filter */}
            {["", "REAL", "FAKE"].map(f => (
              <button key={f||"all"}
                onClick={() => { setPredFilter(f); setPage(1); }}
                style={{
                  background: predFilter===f ? "rgba(124,58,237,0.2)" : "rgba(124,58,237,0.06)",
                  border:`1px solid ${predFilter===f ? "rgba(124,58,237,0.5)" : "rgba(124,58,237,0.15)"}`,
                  borderRadius:8, padding:"6px 14px",
                  color: predFilter===f ? "#a78bfa" : "#64748b",
                  cursor:"pointer", fontSize:12, fontWeight:600,
                }}>
                {!f ? "All" : f==="REAL" ? "✅ Real" : "❌ Fake"}
              </button>
            ))}

            <span style={{ color:"#334155" }}>|</span>

            {/* Sentiment filter */}
            {["", "Positive", "Negative", "Neutral"].map(f => (
              <button key={f||"all-sent"}
                onClick={() => { setSentFilter(f); setPage(1); }}
                style={{
                  background: sentFilter===f ? "rgba(124,58,237,0.2)" : "rgba(124,58,237,0.06)",
                  border:`1px solid ${sentFilter===f ? "rgba(124,58,237,0.5)" : "rgba(124,58,237,0.15)"}`,
                  borderRadius:8, padding:"6px 14px",
                  color: sentFilter===f ? "#a78bfa" : "#64748b",
                  cursor:"pointer", fontSize:12, fontWeight:600,
                }}>
                {!f ? "All Sentiment" : f==="Positive" ? "😊" : f==="Negative" ? "😠" : "😐"} {f||""}
              </button>
            ))}
          </motion.div>
        )}

        {/* ── History List ─────────────────────────── */}
        {history.length === 0 ? (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            className="glass" style={{ textAlign:"center", padding:"64px 24px" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>📭</div>
            <h3 style={{ fontSize:18, fontWeight:600, marginBottom:8 }}>
              {predFilter || sentFilter ? "No matching articles" : "No History Yet"}
            </h3>
            <p style={{ color:"#64748b", marginBottom:28, fontSize:14 }}>
              {predFilter || sentFilter
                ? "Try changing your filters."
                : "Start analyzing articles to build your history."}
            </p>
            {!predFilter && !sentFilter && (
              <Link to="/analyzer" className="btn" style={{ display:"inline-flex" }}>
                🔍 Analyze Now
              </Link>
            )}
          </motion.div>
        ) : (
          <AnimatePresence>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {history.map((item, i) => (
                <HistoryCard
                  key={item._id || i}
                  item={item}
                  onDelete={deleteItem}
                />
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* ── Pagination ───────────────────────────── */}
        {pages > 1 && (
          <div style={{
            display:"flex", justifyContent:"center",
            gap:8, marginTop:28, flexWrap:"wrap",
          }}>
            <button
              onClick={() => setPage(p => Math.max(1, p-1))}
              disabled={page===1}
              style={{
                background:"rgba(124,58,237,0.1)",
                border:"1px solid rgba(124,58,237,0.3)",
                borderRadius:8, padding:"8px 16px",
                color: page===1 ? "#334155" : "#a78bfa",
                cursor: page===1 ? "not-allowed" : "pointer",
                fontSize:13, fontWeight:600,
              }}
            >
              ← Prev
            </button>

            {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
              const p = i + 1;
              return (
                <button key={p} onClick={() => setPage(p)}
                  style={{
                    background: page===p ? "rgba(124,58,237,0.3)" : "rgba(124,58,237,0.06)",
                    border:`1px solid ${page===p ? "rgba(124,58,237,0.6)" : "rgba(124,58,237,0.15)"}`,
                    borderRadius:8, padding:"8px 14px",
                    color: page===p ? "#a78bfa" : "#64748b",
                    cursor:"pointer", fontSize:13, fontWeight:600,
                  }}>
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => setPage(p => Math.min(pages, p+1))}
              disabled={page===pages}
              style={{
                background:"rgba(124,58,237,0.1)",
                border:"1px solid rgba(124,58,237,0.3)",
                borderRadius:8, padding:"8px 16px",
                color: page===pages ? "#334155" : "#a78bfa",
                cursor: page===pages ? "not-allowed" : "pointer",
                fontSize:13, fontWeight:600,
              }}
            >
              Next →
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default HistoryPage;