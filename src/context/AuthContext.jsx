import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase/config";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be inside AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    let unsubscribe;
    try {
      unsubscribe = onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(currentUser);
          setLoading(false);
          if (currentUser) {
            console.log("User logged in:", currentUser.displayName);
          }
        },
        (error) => {
          console.error("Auth state error:", error);
          setLoading(false);
          setAuthError(error.message);
        }
      );
    } catch (error) {
      console.error("Auth init error:", error);
      setLoading(false);
      setAuthError(error.message);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Google Sign In
  const signInWithGoogle = async () => {
    try {
      setAuthError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const name = result.user.displayName?.split(" ")[0] || "User";
      toast.success(`Welcome, ${name}! 🎉`);
      return result.user;
    } catch (error) {
      console.error("Sign in error code:", error.code);
      console.error("Sign in error message:", error.message);

      // Handle specific error codes
      const errorMessages = {
        "auth/popup-closed-by-user":
          "Sign in cancelled. Please try again.",
        "auth/popup-blocked":
          "Popup blocked! Please allow popups for this site and try again.",
        "auth/invalid-api-key":
          "Firebase API key is invalid. Check your config.js file.",
        "auth/unauthorized-domain":
          "This domain is not authorized. Add localhost to Firebase authorized domains.",
        "auth/network-request-failed":
          "Network error. Check your internet connection.",
        "auth/too-many-requests":
          "Too many attempts. Please wait a moment and try again.",
        "auth/user-disabled":
          "This account has been disabled.",
        "auth/operation-not-allowed":
          "Google sign-in is not enabled. Enable it in Firebase Console.",
        "auth/cancelled-popup-request":
          "Another popup is open. Please close it first.",
        "auth/internal-error":
          "Internal error. Check Firebase Console for details.",
      };

      const message =
        errorMessages[error.code] ||
        `Sign in failed: ${error.message}`;

      setAuthError(message);
      toast.error(message, { duration: 5000 });
      return null;
    }
  };

  // Sign Out
  const logout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully! 👋");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const value = {
    user,
    loading,
    authError,
    signInWithGoogle,
    logout,
    isAuthenticated: !!user,
  };

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            border: "3px solid rgba(99,102,241,0.3)",
            borderTop: "3px solid #6366f1",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <p style={{ color: "#94a3b8", fontSize: 14 }}>
          Connecting to TruthLens...
        </p>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // Show error screen if Firebase config is wrong
  if (authError && authError.includes("api-key")) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 500,
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 16,
            padding: 32,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔥</div>
          <h2
            style={{
              color: "#f87171",
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Firebase Configuration Error
          </h2>
          <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
            Your Firebase API key is invalid or missing.
          </p>
          <div
            style={{
              background: "rgba(15,23,42,0.8)",
              borderRadius: 10,
              padding: 16,
              textAlign: "left",
              fontSize: 13,
              color: "#e2e8f0",
            }}
          >
            <p style={{ marginBottom: 8, fontWeight: 600 }}>Fix Steps:</p>
            <p>1. Go to console.firebase.google.com</p>
            <p>2. Open your project settings</p>
            <p>3. Copy the firebaseConfig object</p>
            <p>4. Paste it in src/firebase/config.js</p>
            <p>5. Save and restart npm start</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};