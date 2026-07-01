import React, { createContext, useContext, useState, useEffect } from "react";

const AccessibilityContext = createContext(undefined);

export const AccessibilityProvider = ({ children }) => {
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1);
  const [contrastMode, setContrastMode] = useState("normal");
  const [dyslexiaMode, setDyslexiaMode] = useState(false);
  const [highlightLinks, setHighlightLinks] = useState(false);
  const [readingGuide, setReadingGuide] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const savedSize = localStorage.getItem("accessibility-font-size");
    const savedContrast = localStorage.getItem("accessibility-contrast");
    const savedDyslexia = localStorage.getItem("accessibility-dyslexia");
    const savedLinks = localStorage.getItem("accessibility-links");
    const savedGuide = localStorage.getItem("accessibility-guide");
    const savedTts = localStorage.getItem("accessibility-tts");

    if (savedSize) setFontSizeMultiplier(parseFloat(savedSize));
    if (savedContrast) setContrastMode(savedContrast);
    if (savedDyslexia) setDyslexiaMode(savedDyslexia === "true");
    if (savedLinks) setHighlightLinks(savedLinks === "true");
    if (savedGuide) setReadingGuide(savedGuide === "true");
    if (savedTts) setTtsEnabled(savedTts === "true");

    // Inject custom fonts & rules for accessibility features
    const styleId = "accessibility-custom-rules";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        @import url('https://cdn.jsdelivr.net/npm/opendyslexic@1.0.3/opendyslexic.css');
        .dyslexia-mode * {
          font-family: 'OpenDyslexic', 'Comic Sans MS', cursive, sans-serif !important;
        }
        .highlight-links-mode a {
          text-decoration: underline !important;
          text-decoration-thickness: 3px !important;
          text-decoration-color: #10b981 !important; /* emerald-500 */
          font-weight: 800 !important;
          background-color: rgba(16, 185, 129, 0.08) !important;
        }
        .high-contrast {
          background-color: #000000 !important;
          color: #ffff00 !important;
        }
        .high-contrast * {
          border-color: #ffff00 !important;
        }
        .high-contrast a {
          color: #00ffff !important;
          text-decoration: underline !important;
        }
        .high-contrast button {
          background-color: #000000 !important;
          color: #ffff00 !important;
          border: 2px solid #ffff00 !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Sync state to DOM and local storage
  useEffect(() => {
    localStorage.setItem("accessibility-font-size", fontSizeMultiplier.toString());
    document.documentElement.style.fontSize = `${fontSizeMultiplier * 100}%`;
  }, [fontSizeMultiplier]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "high-contrast");
    
    if (contrastMode === "dark") {
      root.classList.add("dark");
    } else if (contrastMode === "high-contrast") {
      root.classList.add("high-contrast");
    }
    
    localStorage.setItem("accessibility-contrast", contrastMode);
  }, [contrastMode]);

  useEffect(() => {
    const body = document.body;
    if (dyslexiaMode) {
      body.classList.add("dyslexia-mode");
    } else {
      body.classList.remove("dyslexia-mode");
    }
    localStorage.setItem("accessibility-dyslexia", dyslexiaMode.toString());
  }, [dyslexiaMode]);

  useEffect(() => {
    const body = document.body;
    if (highlightLinks) {
      body.classList.add("highlight-links-mode");
    } else {
      body.classList.remove("highlight-links-mode");
    }
    localStorage.setItem("accessibility-links", highlightLinks.toString());
  }, [highlightLinks]);

  useEffect(() => {
    localStorage.setItem("accessibility-guide", readingGuide.toString());
  }, [readingGuide]);

  useEffect(() => {
    localStorage.setItem("accessibility-tts", ttsEnabled.toString());

    // Click to speak behavior when TTS is enabled
    const handleTtsClick = (e) => {
      if (!ttsEnabled) return;
      
      // Stop current speech
      window.speechSynthesis.cancel();

      // Get target text content
      const text = e.target.innerText || e.target.textContent;
      if (!text || text.trim().length === 0) return;

      const utterance = new SpeechSynthesisUtterance(text.trim());
      utterance.lang = "id-ID"; // Set standard lang property
      
      // Find Indonesian voice natively
      const voices = window.speechSynthesis.getVoices();
      const indonesianVoice = voices.find(voice => 
        voice.lang.includes("id-ID") || 
        voice.lang.includes("id_ID") || 
        voice.lang.startsWith("id")
      );
      if (indonesianVoice) {
        utterance.voice = indonesianVoice;
      }

      window.speechSynthesis.speak(utterance);

      // Brief feedback outline
      const originalOutline = e.target.style.outline;
      e.target.style.outline = "2px dashed #10b981";
      setTimeout(() => {
        e.target.style.outline = originalOutline;
      }, 1000);
    };

    if (ttsEnabled) {
      document.addEventListener("click", handleTtsClick, true);
    }

    return () => {
      document.removeEventListener("click", handleTtsClick, true);
    };
  }, [ttsEnabled]);

  const increaseFontSize = () => {
    setFontSizeMultiplier((prev) => Math.min(prev + 0.1, 1.4));
  };

  const decreaseFontSize = () => {
    setFontSizeMultiplier((prev) => Math.max(prev - 0.1, 0.8));
  };

  const resetFontSize = () => {
    setFontSizeMultiplier(1.0);
  };

  const resetAll = () => {
    setFontSizeMultiplier(1.0);
    setContrastMode("normal");
    setDyslexiaMode(false);
    setHighlightLinks(false);
    setReadingGuide(false);
    setTtsEnabled(false);
    window.speechSynthesis.cancel();
  };

  return (
    <AccessibilityContext.Provider
      value={{
        fontSizeMultiplier,
        contrastMode,
        dyslexiaMode,
        highlightLinks,
        readingGuide,
        ttsEnabled,
        setFontSizeMultiplier,
        setContrastMode,
        setDyslexiaMode,
        setHighlightLinks,
        setReadingGuide,
        setTtsEnabled,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
        resetAll,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
};
