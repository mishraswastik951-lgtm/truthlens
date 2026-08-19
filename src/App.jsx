import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Context Providers
import { AuthProvider }     from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";

// Layout Components
import Navbar  from "./components/Navbar";
import Chatbot from "./components/Chatbot";

// Page Components
import Hero         from "./components/Hero";
import NewsAnalyzer from "./components/NewsAnalyzer";
import Dashboard    from "./components/Dashboard";
import About        from "./components/About";
import Login        from "./components/Login";
import HistoryPage  from "./pages/HistoryPage";


// ─── Constants ───────────────────────────────────────────────────────────────

const ROUTES = [
  { path: "/",          element: <Hero />         },
  { path: "/analyzer",  element: <NewsAnalyzer /> },
  { path: "/dashboard", element: <Dashboard />    },
  { path: "/about",     element: <About />        },
  { path: "/login",     element: <Login />        },
  { path: "/history",   element: <HistoryPage />  },
];

const TOAST_CONFIG = {
  duration: 4000,
  style: {
    background:   "#1e293b",
    color:        "#e2e8f0",
    border:       "1px solid rgba(124,58,237,0.3)",
    borderRadius: "12px",
    fontSize:     "14px",
    fontFamily:   "'Inter', sans-serif",
  },
  success: { iconTheme: { primary: "#10b981", secondary: "#030712" } },
  error:   { iconTheme: { primary: "#ef4444", secondary: "#030712" } },
};

const APP_STYLE = { minHeight: "100vh", background: "#030712" };

// ─── Sub-components ──────────────────────────────────────────────────────────

function AppRoutes() {
  return (
    <Routes>
      {ROUTES.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}
    </Routes>
  );
}

function AppProviders({ children }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </AuthProvider>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────

function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <div style={APP_STYLE}>
          <Navbar />
          <AppRoutes />
          <Chatbot />
          <Toaster position="bottom-left" toastOptions={TOAST_CONFIG} />
        </div>
      </AppProviders>
    </BrowserRouter>
  );
}

export default App;