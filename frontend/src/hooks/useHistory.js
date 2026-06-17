import { useState, useEffect, useCallback } from "react";
import { getHistory } from "../api/newsApi";

/**
 * Custom hook for user analysis history.
 * Matches your existing pattern: useHistory(userId)
 */
export const useHistory = (userId) => {
  const [history,  setHistory]  = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const fetchHistory = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await getHistory(userId);
      const data = res?.data ?? res;                      // handle both axios & unwrapped
      setHistory(Array.isArray(data?.history) ? data.history : []);
      setTotal(data?.total ?? 0);
    } catch (err) {
      console.error("History fetch error:", err);
      setError(err?.response?.data?.message || err.message || "Failed to load history");
      setHistory([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setTotal(0);
  }, []);

  return {
    history,
    total,
    loading,
    error,
    refresh:      fetchHistory,
    clearHistory,
  };
};