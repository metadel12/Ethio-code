import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowRight, FiVolume2, FiMic, FiCopy, FiBookmark, FiTrash2,
    FiClock, FiStar, FiBarChart2, FiRefreshCw, FiGlobe,
    FiMessageSquare, FiCheck, FiChevronRight, FiAward, FiTrendingUp
} from 'react-icons/fi';
import './amharics-translator.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API = API_BASE.endsWith('/api/v1') ? API_BASE : `${API_BASE}/api/v1`;

const AmharicTranslatorPage = () => {
    const [sourceText, setSourceText] = useState('');
    const [targetText, setTargetText] = useState('');
    const [sourceLang, setSourceLang] = useState('am');
    const [targetLang, setTargetLang] = useState('en');
    const [isTranslating, setIsTranslating] = useState(false);
    const [history, setHistory] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [vocabulary, setVocabulary] = useState([]);
    const [progress, setProgress] = useState(null);
    const [activeTab, setActiveTab] = useState('translate');
    const [commonPhrases, setCommonPhrases] = useState({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const [historyRes, favoritesRes, vocabRes, progressRes, phrasesRes] = await Promise.all([
                axios.get(`${API}/translator/history`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API}/translator/favorites`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API}/translator/vocabulary`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API}/translator/learning/progress`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API}/translator/common-phrases`)
            ]);

            setHistory(historyRes.data.history || []);
            setFavorites(favoritesRes.data.favorites || []);
            setVocabulary(vocabRes.data.vocabulary || []);
            setProgress(progressRes.data);
            setCommonPhrases(phrasesRes.data.phrases || {});
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const translateText = async () => {
        if (!sourceText.trim()) return;

        setIsTranslating(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API}/translator/translate`,
                {
                    text: sourceText,
                    source_lang: sourceLang,
                    target_lang: targetLang
                },
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );

            setTargetText(response.data.translated_text);
            await loadData();
        } catch (error) {
            console.error('Translation error:', error);
            setTargetText('Translation failed. Please try again.');
        } finally {
            setIsTranslating(false);
        }
    };

    const swapLanguages = () => {
        setSourceLang(targetLang);
        setTargetLang(sourceLang);
        setSourceText(targetText);
        setTargetText(sourceText);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(targetText);
        alert('📋 Copied!');
    };

    const saveToFavorites = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${API}/translator/favorite-phrase`,
                {
                    phrase_amharic: sourceLang === 'am' ? sourceText : targetText,
                    phrase_english: sourceLang === 'en' ? sourceText : targetText
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('⭐ Added to favorites!');
            loadData();
        } catch (error) {
            console.error('Error saving favorite:', error);
        }
    };

    const addToVocabulary = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${API}/translator/save-vocabulary`,
                {
                    word_amharic: sourceLang === 'am' ? sourceText : targetText,
                    word_english: sourceLang === 'en' ? sourceText : targetText,
                    example_sentence: sourceText
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('📚 Added to vocabulary!');
            loadData();
        } catch (error) {
            console.error('Error adding to vocabulary:', error);
        }
    };

    const deleteHistoryItem = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API}/translator/history/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            loadData();
        } catch (error) {
            console.error('Error deleting history:', error);
        }
    };

    const loadPhrase = (amharic, english) => {
        setSourceText(amharic);
        setTargetText(english);
        setSourceLang('am');
        setTargetLang('en');
    };

    return (
        <div className="translator-page">
            <div className="translator-container">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="translator-header"
                >
                    <div className="header-content">
                        <h1 className="header-title">
                            <FiGlobe className="header-icon" />
                            አማርኛ ተርጓሚ
                        </h1>
                        <p className="header-subtitle">Amharic-English Translator | Learn & Master Amharic</p>
                    </div>
                </motion.div>

                {/* Progress Bar */}
                {progress && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="progress-card"
                    >
                        <div className="progress-header">
                            <div className="progress-info">
                                <FiBarChart2 className="progress-icon" />
                                <span>Learning Progress</span>
                            </div>
                            <div className="progress-stats">
                                <span className="stat-badge">
                                    <FiAward /> {progress.progress?.total_words_learned || 0} words
                                </span>
                                <span className="stat-badge">
                                    <FiTrendingUp /> {progress.progress?.current_streak_days || 0} day streak
                                </span>
                            </div>
                        </div>
                        <div className="progress-bar">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${Math.min(100, ((progress.progress?.total_words_learned || 0) / 100) * 100)}%`
                                }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="progress-fill"
                            />
                        </div>
                        <div className="progress-achievements">
                            {progress.progress?.achievements?.map((achievement, i) => (
                                <span key={i} className="achievement-badge">
                                    🏆 {achievement}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Tabs */}
                <div className="tabs">
                    {[
                        { id: 'translate', icon: FiGlobe, label: 'Translate' },
                        { id: 'history', icon: FiClock, label: `History (${history.length})` },
                        { id: 'favorites', icon: FiStar, label: `Favorites (${favorites.length})` },
                        { id: 'vocabulary', icon: FiMessageSquare, label: `Vocabulary (${vocabulary.length})` }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                        >
                            <tab.icon />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Translation Panel */}
                <AnimatePresence mode="wait">
                    {activeTab === 'translate' && (
                        <motion.div
                            key="translate"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="translation-panel"
                        >
                            <div className="translation-grid">
                                {/* Source */}
                                <div className="translation-box">
                                    <div className="box-header">
                                        <select
                                            value={sourceLang}
                                            onChange={(e) => setSourceLang(e.target.value)}
                                            className="lang-select"
                                        >
                                            <option value="am">አማርኛ (Amharic)</option>
                                            <option value="en">English</option>
                                        </select>
                                        <button onClick={() => setSourceText('')} className="clear-btn">
                                            <FiRefreshCw /> Clear
                                        </button>
                                    </div>
                                    <textarea
                                        value={sourceText}
                                        onChange={(e) => setSourceText(e.target.value)}
                                        placeholder={sourceLang === 'am' ? 'አማርኛ ጽሑፍ ያስገቡ...' : 'Enter English text...'}
                                        className="translation-textarea"
                                    />
                                    <div className="box-footer">
                                        <span className="char-count">{sourceText.length} characters</span>
                                    </div>
                                </div>

                                {/* Swap Button */}
                                <button onClick={swapLanguages} className="swap-btn">
                                    <FiArrowRight />
                                </button>

                                {/* Target */}
                                <div className="translation-box">
                                    <div className="box-header">
                                        <select
                                            value={targetLang}
                                            onChange={(e) => setTargetLang(e.target.value)}
                                            className="lang-select"
                                        >
                                            <option value="en">English</option>
                                            <option value="am">አማርኛ (Amharic)</option>
                                        </select>
                                        <div className="action-btns">
                                            <button onClick={copyToClipboard} disabled={!targetText} className="icon-btn">
                                                <FiCopy />
                                            </button>
                                            <button onClick={saveToFavorites} disabled={!targetText} className="icon-btn">
                                                <FiBookmark />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="translation-output">
                                        {targetText ? (
                                            <p>{targetText}</p>
                                        ) : (
                                            <p className="placeholder">Translation will appear here...</p>
                                        )}
                                    </div>
                                    <div className="box-footer">
                                        <button onClick={addToVocabulary} disabled={!targetText} className="vocab-btn">
                                            + Add to Vocabulary
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={translateText}
                                disabled={isTranslating || !sourceText.trim()}
                                className="translate-btn"
                            >
                                {isTranslating ? (
                                    <>
                                        <div className="spinner-small" />
                                        Translating...
                                    </>
                                ) : (
                                    <>
                                        <FiGlobe />
                                        Translate
                                    </>
                                )}
                            </button>

                            {/* Common Phrases */}
                            <div className="common-phrases">
                                <h3>Common Phrases</h3>
                                <div className="phrases-grid">
                                    {Object.entries(commonPhrases).slice(0, 1).map(([category, phrases]) =>
                                        phrases.slice(0, 6).map((phrase, i) => (
                                            <button
                                                key={i}
                                                onClick={() => loadPhrase(phrase.amharic, phrase.english)}
                                                className="phrase-card"
                                            >
                                                <span className="phrase-am">{phrase.amharic}</span>
                                                <FiChevronRight className="phrase-arrow" />
                                                <span className="phrase-en">{phrase.english}</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* History Panel */}
                    {activeTab === 'history' && (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="content-panel"
                        >
                            <h2>Translation History</h2>
                            {history.length === 0 ? (
                                <div className="empty-state">
                                    <FiClock className="empty-icon" />
                                    <p>No translation history yet</p>
                                </div>
                            ) : (
                                <div className="history-list">
                                    {history.map((item) => (
                                        <div key={item._id} className="history-item">
                                            <div className="history-content">
                                                <div className="history-text">
                                                    <span className="lang-label">{item.source_language === 'am' ? 'አማርኛ' : 'English'}:</span>
                                                    <p>{item.source_text}</p>
                                                </div>
                                                <FiArrowRight className="history-arrow" />
                                                <div className="history-text">
                                                    <span className="lang-label">{item.target_language === 'am' ? 'አማርኛ' : 'English'}:</span>
                                                    <p>{item.target_text}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => deleteHistoryItem(item._id)} className="delete-btn">
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Favorites Panel */}
                    {activeTab === 'favorites' && (
                        <motion.div
                            key="favorites"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="content-panel"
                        >
                            <h2>Favorite Phrases</h2>
                            {favorites.length === 0 ? (
                                <div className="empty-state">
                                    <FiStar className="empty-icon" />
                                    <p>No favorite phrases yet</p>
                                </div>
                            ) : (
                                <div className="favorites-grid">
                                    {favorites.map((item) => (
                                        <div key={item._id} className="favorite-card">
                                            <div className="favorite-content">
                                                <p className="favorite-am">{item.phrase_amharic}</p>
                                                <p className="favorite-en">{item.phrase_english}</p>
                                            </div>
                                            <span className="favorite-category">{item.category}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Vocabulary Panel */}
                    {activeTab === 'vocabulary' && (
                        <motion.div
                            key="vocabulary"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="content-panel"
                        >
                            <h2>My Vocabulary</h2>
                            {vocabulary.length === 0 ? (
                                <div className="empty-state">
                                    <FiMessageSquare className="empty-icon" />
                                    <p>No words in vocabulary yet</p>
                                </div>
                            ) : (
                                <div className="vocabulary-grid">
                                    {vocabulary.map((word) => (
                                        <div key={word._id} className="vocab-card">
                                            <div className="vocab-words">
                                                <p className="vocab-am">{word.word_amharic}</p>
                                                <p className="vocab-en">{word.word_english}</p>
                                            </div>
                                            {word.example_sentence && (
                                                <p className="vocab-example">"{word.example_sentence}"</p>
                                            )}
                                            <div className="vocab-progress">
                                                <div className="vocab-progress-bar">
                                                    <div
                                                        className="vocab-progress-fill"
                                                        style={{ width: `${word.mastery_level || 0}%` }}
                                                    />
                                                </div>
                                                <span className="vocab-mastery">{word.mastery_level || 0}% mastered</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AmharicTranslatorPage;
