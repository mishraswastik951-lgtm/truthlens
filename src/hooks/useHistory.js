// frontend/src/hooks/useHistory.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const useHistory = (userId) => {
  const [history,    setHistory]    = useState([]);
  const [total,      setTotal]      = useState(0);
  const [pages,      setPages]      = useState(1);
  const [userStats,  setUserStats]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [predFilter, setPredFilter] = useState("");
  const [sentFilter, setSentFilter] = useState("");

  const fetchHistory = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        user_id:    userId,
        page:       page,
        per_page:   10,
        ...(predFilter && { prediction: predFilter }),
        ...(sentFilter && { sentiment:  sentFilter }),
      });
      const res = await axios.get(`${API}/history?${params}`);
      setHistory(res.data.history    || []);
      setTotal(res.data.total        || 0);
      setPages(res.data.pages        || 1);
      setUserStats(res.data.user_stats || null);
    } catch (err) {
      console.error("History error:", err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [userId, page, predFilter, sentFilter]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const deleteItem = async (id) => {
    try {
      await axios.delete(`${API}/history/${id}?user_id=${userId}`);
      fetchHistory();
      return true;
    } catch { return false; }
  };

  const clearAll = async () => {
    try {
      await axios.delete(`${API}/history/clear?user_id=${userId}`);
      fetchHistory();
      return true;
    } catch { return false; }
  };

  return {
    history, total, pages, userStats, loading,
    page, setPage,
    predFilter, setPredFilter,
    sentFilter, setSentFilter,
    deleteItem, clearAll,
    refresh: fetchHistory,
  };
};