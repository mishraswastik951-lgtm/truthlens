// frontend/src/hooks/useNewsAnalyzer.js
import { useState, useCallback } from "react";
import { analyzeNews } from "../api/newsApi";
import toast from "react-hot-toast";

/**
 * Custom hook for news analysis.
 * Keeps all analysis state & logic out of components.
 */
export const useNewsAnalyzer = (user) => {
  const [text,      setText]      = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState(null);

  const analyze = useCallback(async () => {
    if (!user) {
      toast.error("Please login to analyze articles!");
      return;
    }
    if (!text.trim() || text.length < 20) {
      toast.error("Please enter at least 20 characters!");
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await analyzeNews(text, sourceUrl, user?.uid || "anonymous");
      setResult(res.data);
      toast.success("Analysis complete! 🎉");
    } catch (err) {
      const msg = err.response?.data?.error || "Analysis failed. Is Flask running?";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [text, sourceUrl, user]);

  const clear = useCallback(() => {
    setText("");
    setSourceUrl("");
    setResult(null);
    setError(null);
  }, []);

  return {
    text, setText,
    sourceUrl, setSourceUrl,
    loading, result, error,
    analyze, clear,
  };
};