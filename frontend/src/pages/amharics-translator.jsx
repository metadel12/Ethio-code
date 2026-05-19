// src/pages/AmharicTranslatorPage.jsx
import React, { useState, useEffect } from "react";
import {
  FaExchangeAlt,
  FaVolumeUp,
  FaCopy,
  FaHistory,
  FaStar,
  FaTrash,
} from "react-icons/fa";
import "./amharics.css";
const AmharicTranslatorPage = () => {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [translationHistory, setTranslationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [direction, setDirection] = useState("en-am"); // 'en-am' or 'am-en'
  const [favorites, setFavorites] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState("translate");
  const [voice, setVoice] = useState(null);

  // Sample dictionary (in real app, use API)
  const dictionary = {
    hello: "ሰላም",
    world: "ዓለም",
    "good morning": "እንደምን አደርክ",
    "thank you": "አመሰግናለሁ",
    "how are you": "እንዴት ነህ",
    welcome: "እንኳን ደህና መጣህ",
    love: "ፍቅር",
    ethiopia: "ኢትዮጵያ",
    coffee: "ቡና",
    food: "ምግብ",
    water: "ውሃ",
    friend: "ጓደኛ",
    family: "ቤተሰብ",
    work: "ስራ",
    beautiful: "ውብ",
    computer: "ኮምፒውተር",
    programming: "ፕሮግራሚንግ",
    developer: "ደቨሎፐር",
    internet: "ኢንተርኔት",
    technology: "ቴክኖሎጂ",
    "እንደምን አደርክ": "good morning",
    አመሰግናለሁ: "thank you",
    "እንዴት ነህ": "how are you",
    "እንኳን ደህና መጣህ": "welcome",
    ፍቅር: "love",
    ኢትዮጵያ: "ethiopia",
    ቡና: "coffee",
    ምግብ: "food",
    ውሃ: "water",
    ጓደኛ: "friend",
    ቤተሰብ: "family",
    ስራ: "work",
    ውብ: "beautiful",
    ኮምፒውተር: "computer",
    ፕሮግራሚንግ: "programming",
    ደቨሎፐር: "developer",
    ኢንተርኔት: "internet",
    ቴክኖሎጂ: "technology",
  };

  // Load history and favorites from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("translationHistory");
    if (savedHistory) {
      setTranslationHistory(JSON.parse(savedHistory));
    }

    const savedFavorites = localStorage.getItem("favoriteTranslations");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    // Load voices
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      const amharicVoice = voices.find((v) => v.lang === "am-ET");
      if (amharicVoice) {
        setVoice(amharicVoice);
      }
    };

    // Chrome loads voices asynchronously
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    loadVoices();
  }, []);

  // Save history and favorites to localStorage
  useEffect(() => {
    localStorage.setItem(
      "translationHistory",
      JSON.stringify(translationHistory)
    );
  }, [translationHistory]);

  useEffect(() => {
    localStorage.setItem("favoriteTranslations", JSON.stringify(favorites));
  }, [favorites]);

  const translateText = async () => {
    if (!inputText.trim()) {
      setError("Please enter text to translate");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulate API call with delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const words = inputText.toLowerCase().split(" ");
      let translated = "";

      if (direction === "en-am") {
        translated = words.map((word) => dictionary[word] || word).join(" ");
      } else {
        // For Amharic to English, we need to handle phrases
        let remainingText = inputText;
        let result = [];

        // Try to match phrases first
        const phrases = Object.keys(dictionary).filter((key) => key.length > 1);
        phrases.sort((a, b) => b.length - a.length); // Longest first

        for (const phrase of phrases) {
          if (remainingText.includes(phrase)) {
            result.push(dictionary[phrase]);
            remainingText = remainingText.replace(phrase, "");
          }
        }

        // Handle remaining words
        const remainingWords = remainingText.split(" ").filter((w) => w.trim());
        result = [
          ...result,
          ...remainingWords.map((word) => dictionary[word] || word),
        ];

        translated = result.join(" ");
      }

      setTranslatedText(translated);

      // Add to history
      const newEntry = {
        id: Date.now(),
        input: inputText,
        output: translated,
        direction,
        timestamp: new Date().toLocaleString(),
        favorite: false,
      };

      setTranslationHistory((prev) => [newEntry, ...prev.slice(0, 49)]); // Keep last 50
    } catch (err) {
      setError("Translation failed. Please try again.");
      console.error("Translation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
  };

  const handleSpeak = () => {
    if (!translatedText) return;

    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = direction === "en-am" ? "am-ET" : "en-US";

    if (voice && direction === "en-am") {
      utterance.voice = voice;
    }

    speechSynthesis.speak(utterance);
  };

  const toggleFavorite = (id) => {
    const updatedHistory = translationHistory.map((item) =>
      item.id === id ? { ...item, favorite: !item.favorite } : item
    );

    setTranslationHistory(updatedHistory);

    const item = translationHistory.find((item) => item.id === id);
    if (item.favorite) {
      setFavorites(favorites.filter((fav) => fav.id !== id));
    } else {
      setFavorites([...favorites, { ...item, favorite: true }]);
    }
  };

  const clearHistory = () => {
    setTranslationHistory([]);
    setFavorites([]);
  };

  const swapLanguages = () => {
    setDirection(direction === "en-am" ? "am-en" : "en-am");
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const deleteHistoryItem = (id) => {
    setTranslationHistory(translationHistory.filter((item) => item.id !== id));
    setFavorites(favorites.filter((fav) => fav.id !== id));
  };

  return (
    <div className="translator-container">
      <div className="translator-header">
        <h1>አማርኛ ተርጓሚ</h1>
        <p>Advanced Amharic-English Translation Tool</p>
        <div className="language-display">
          <span>{direction === "en-am" ? "English" : "አማርኛ"}</span>
          <button className="swap-btn" onClick={swapLanguages}>
            <FaExchangeAlt />
          </button>
          <span>{direction === "en-am" ? "አማርኛ" : "English"}</span>
        </div>
      </div>

      <div className="tabs">
        <button
          className={activeTab === "translate" ? "active" : ""}
          onClick={() => setActiveTab("translate")}
        >
          Translate
        </button>
        <button
          className={activeTab === "history" ? "active" : ""}
          onClick={() => setActiveTab("history")}
        >
          <FaHistory /> History
        </button>
        <button
          className={activeTab === "favorites" ? "active" : ""}
          onClick={() => setActiveTab("favorites")}
        >
          <FaStar /> Favorites
        </button>
      </div>

      {activeTab === "translate" && (
        <div className="translation-box">
          <div className="input-section">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                direction === "en-am"
                  ? "Enter English text to translate to Amharic..."
                  : "ወደ እንግሊዝኛ ለመተርጎም አማርኛ ግልጽ..."
              }
              rows={5}
              disabled={isLoading}
            />
            <div className="controls">
              <button onClick={() => setInputText("")} disabled={!inputText}>
                Clear
              </button>
              <button
                onClick={translateText}
                disabled={isLoading || !inputText.trim()}
                className="translate-btn"
              >
                {isLoading ? (
                  <div className="spinner"></div>
                ) : (
                  `Translate to ${
                    direction === "en-am" ? "Amharic" : "English"
                  }`
                )}
              </button>
            </div>
          </div>

          <div className="output-section">
            <div className="result-container">
              {translatedText ? (
                <p className="translated-text">{translatedText}</p>
              ) : (
                <p className="placeholder">
                  {direction === "en-am"
                    ? "Translation will appear here..."
                    : "ትርጉም እዚህ ይታያል..."}
                </p>
              )}
            </div>

            <div className="action-buttons">
              <button onClick={handleCopy} disabled={!translatedText}>
                <FaCopy /> Copy
              </button>
              <button onClick={handleSpeak} disabled={!translatedText}>
                <FaVolumeUp /> Speak
              </button>
              {translatedText && (
                <button
                  onClick={() => toggleFavorite(translationHistory[0]?.id)}
                  className={translationHistory[0]?.favorite ? "favorited" : ""}
                >
                  <FaStar />{" "}
                  {translationHistory[0]?.favorite ? "Favorited" : "Favorite"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {(activeTab === "history" || activeTab === "favorites") && (
        <div className="history-section">
          <div className="history-header">
            <h2>
              {activeTab === "history"
                ? "Translation History"
                : "Favorite Translations"}
            </h2>
            {activeTab === "history" && (
              <button
                onClick={clearHistory}
                disabled={translationHistory.length === 0}
              >
                <FaTrash /> Clear All
              </button>
            )}
          </div>

          {(activeTab === "history" && translationHistory.length === 0) ||
          (activeTab === "favorites" && favorites.length === 0) ? (
            <div className="empty-state">
              <p>
                No{" "}
                {activeTab === "history" ? "translation history" : "favorites"}{" "}
                yet
              </p>
            </div>
          ) : (
            <ul className="history-list">
              {(activeTab === "history" ? translationHistory : favorites).map(
                (item) => (
                  <li key={item.id} className="history-item">
                    <div className="history-content">
                      <div className="history-input">
                        <strong>
                          {item.direction === "en-am" ? "English" : "አማርኛ"}:
                        </strong>{" "}
                        {item.input}
                      </div>
                      <div className="history-output">
                        <strong>
                          {item.direction === "en-am" ? "አማርኛ" : "English"}:
                        </strong>{" "}
                        {item.output}
                      </div>
                      <div className="history-meta">
                        <span>{item.timestamp}</span>
                      </div>
                    </div>
                    <div className="history-actions">
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className={item.favorite ? "favorited" : ""}
                      >
                        <FaStar />
                      </button>
                      <button onClick={() => deleteHistoryItem(item.id)}>
                        <FaTrash />
                      </button>
                    </div>
                  </li>
                )
              )}
            </ul>
          )}
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="quick-phrases">
        <h3>Common Phrases</h3>
        <div className="phrase-grid">
          {Object.entries(dictionary)
            .slice(0, 12)
            .map(([key, value]) => (
              <button
                key={key}
                onClick={() => {
                  setInputText(direction === "en-am" ? key : value);
                  setTimeout(translateText, 100);
                }}
              >
                <div>{direction === "en-am" ? key : value}</div>
                <div>{direction === "en-am" ? value : key}</div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AmharicTranslatorPage;
