import React, { createContext, useContext, useState } from "react";

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};

export const translations = {
  en: {
    // Navbar
    appName: "TruthLens",
    tagline: "AI-Powered Fake News Detection",
    home: "Home",
    analyzer: "Analyzer",
    dashboard: "Dashboard",
    about: "About",
    login: "Login",
    logout: "Logout",

    // Hero
    heroTitle: "Detect Fake News with",
    heroHighlight: "Artificial Intelligence",
    heroSubtitle:
      "TruthLens uses advanced NLP and Machine Learning to analyze news articles and determine their authenticity with high confidence.",
    analyzeNow: "Analyze Now",
    viewDashboard: "View Dashboard",
    accuracy: "Accuracy",
    articlesAnalyzed: "Articles Analyzed",
    mlModels: "ML Models",

    // Analyzer
    analyzerTitle: "News Article Analyzer",
    analyzerSubtitle: "Paste any news article below to check if it's real or fake",
    pasteArticle: "Paste your news article here...",
    analyzeButton: "Analyze Article",
    analyzing: "Analyzing...",
    clearButton: "Clear",
    result: "Analysis Result",
    realNews: "REAL NEWS ✅",
    fakeNews: "FAKE NEWS ❌",
    confidence: "Confidence Score",
    fakeProbability: "Fake Probability",
    realProbability: "Real Probability",
    wordCount: "Word Count",
    charCount: "Characters",
    sentences: "Sentences",
    topWords: "Top Keywords",
    loginRequired: "Please login to analyze articles",

    // Dashboard
    dashboardTitle: "Analytics Dashboard",
    dashboardSubtitle: "Real-time statistics and insights",
    totalAnalyzed: "Total Analyzed",
    fakeDetected: "Fake Detected",
    realDetected: "Real Detected",
    modelAccuracy: "Model Accuracy",
    recentAnalyses: "Recent Analyses",
    distributionChart: "Fake vs Real Distribution",
    noData: "No analyses yet. Start analyzing articles!",

    // About
    aboutTitle: "About TruthLens",
    aboutSubtitle: "How we fight misinformation with AI",
    howItWorks: "How It Works",
    techStack: "Tech Stack",
    dataset: "Dataset",

    // Login
    loginTitle: "Welcome to TruthLens",
    loginSubtitle: "Sign in to start detecting fake news",
    signInGoogle: "Sign in with Google",

    // Chatbot
    chatbotTitle: "TruthBot Assistant",
    chatPlaceholder: "Ask me anything...",
    sendButton: "Send",

    // Common
    loading: "Loading...",
    error: "Something went wrong",
    hindi: "हिंदी",
    english: "English",
  },

  hi: {
    // Navbar
    appName: "ट्रुथलेंस",
    tagline: "AI-संचालित फेक न्यूज़ डिटेक्शन",
    home: "होम",
    analyzer: "विश्लेषक",
    dashboard: "डैशबोर्ड",
    about: "परिचय",
    login: "लॉग इन",
    logout: "लॉग आउट",

    // Hero
    heroTitle: "फेक न्यूज़ को पहचानें",
    heroHighlight: "आर्टिफिशियल इंटेलिजेंस से",
    heroSubtitle:
      "ट्रुथलेंस उन्नत NLP और मशीन लर्निंग का उपयोग करके समाचार लेखों का विश्लेषण करता है और उनकी प्रामाणिकता निर्धारित करता है।",
    analyzeNow: "अभी विश्लेषण करें",
    viewDashboard: "डैशबोर्ड देखें",
    accuracy: "सटीकता",
    articlesAnalyzed: "लेख विश्लेषित",
    mlModels: "ML मॉडल",

    // Analyzer
    analyzerTitle: "न्यूज़ आर्टिकल विश्लेषक",
    analyzerSubtitle: "जांचने के लिए कोई भी समाचार लेख नीचे पेस्ट करें",
    pasteArticle: "यहाँ अपना समाचार लेख पेस्ट करें...",
    analyzeButton: "लेख का विश्लेषण करें",
    analyzing: "विश्लेषण हो रहा है...",
    clearButton: "साफ़ करें",
    result: "विश्लेषण परिणाम",
    realNews: "असली खबर ✅",
    fakeNews: "नकली खबर ❌",
    confidence: "विश्वास स्कोर",
    fakeProbability: "नकली संभावना",
    realProbability: "असली संभावना",
    wordCount: "शब्द गणना",
    charCount: "अक्षर",
    sentences: "वाक्य",
    topWords: "शीर्ष कीवर्ड",
    loginRequired: "लेखों का विश्लेषण करने के लिए कृपया लॉग इन करें",

    // Dashboard
    dashboardTitle: "एनालिटिक्स डैशबोर्ड",
    dashboardSubtitle: "रियल-टाइम आँकड़े और अंतर्दृष्टि",
    totalAnalyzed: "कुल विश्लेषित",
    fakeDetected: "नकली पता चला",
    realDetected: "असली पता चला",
    modelAccuracy: "मॉडल सटीकता",
    recentAnalyses: "हालिया विश्लेषण",
    distributionChart: "नकली vs असली वितरण",
    noData: "अभी तक कोई विश्लेषण नहीं। लेखों का विश्लेषण शुरू करें!",

    // About
    aboutTitle: "ट्रुथलेंस के बारे में",
    aboutSubtitle: "हम AI से गलत सूचना से कैसे लड़ते हैं",
    howItWorks: "यह कैसे काम करता है",
    techStack: "तकनीकी स्टैक",
    dataset: "डेटासेट",

    // Login
    loginTitle: "ट्रुथलेंस में आपका स्वागत है",
    loginSubtitle: "फेक न्यूज़ डिटेक्ट करना शुरू करने के लिए साइन इन करें",
    signInGoogle: "Google से साइन इन करें",

    // Chatbot
    chatbotTitle: "ट्रुथबॉट असिस्टेंट",
    chatPlaceholder: "कुछ भी पूछें...",
    sendButton: "भेजें",

    // Common
    loading: "लोड हो रहा है...",
    error: "कुछ गलत हो गया",
    hindi: "हिंदी",
    english: "English",
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "hi" : "en"));
  };

  const t = (key) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};