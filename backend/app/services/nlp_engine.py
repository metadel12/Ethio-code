"""
Natural Language Processing Engine
Features: summarize, sentiment, translate (Amharic/English), tag-generator, grammar-check
Pure Python — no external ML dependencies required.
"""
import re
import string
from collections import Counter
from typing import Optional


# ─────────────────────────────────────────────────────────────
# SHARED UTILITIES
# ─────────────────────────────────────────────────────────────

def _sentences(text: str) -> list[str]:
    return [s.strip() for s in re.split(r'(?<=[.!?])\s+', text.strip()) if s.strip()]

def _words(text: str) -> list[str]:
    return re.findall(r'\b[a-zA-Z]+\b', text.lower())

def _clean(text: str) -> str:
    return re.sub(r'\s+', ' ', text.strip())

STOPWORDS = {
    "a","an","the","and","or","but","in","on","at","to","for","of","with",
    "is","are","was","were","be","been","being","have","has","had","do","does",
    "did","will","would","could","should","may","might","shall","can","need",
    "this","that","these","those","i","you","he","she","it","we","they","me",
    "him","her","us","them","my","your","his","its","our","their","what","which",
    "who","how","when","where","why","not","no","so","if","as","by","from","up",
    "about","into","through","during","before","after","above","below","between",
    "each","more","also","just","than","then","there","here","very","too","only",
}


# ─────────────────────────────────────────────────────────────
# 1. SUMMARIZE  (Extractive — TF-IDF sentence scoring)
# ─────────────────────────────────────────────────────────────

def summarize(text: str, max_sentences: int = 3) -> dict:
    text = _clean(text)
    sentences = _sentences(text)
    if len(sentences) <= max_sentences:
        return {
            "summary": text,
            "original_length": len(text),
            "summary_length": len(text),
            "compression_ratio": 1.0,
            "sentences_extracted": len(sentences),
        }

    # TF: word frequency in document
    all_words = _words(text)
    tf = Counter(w for w in all_words if w not in STOPWORDS)
    total = sum(tf.values()) or 1

    # Score each sentence by sum of normalised TF of its words
    scores: dict[int, float] = {}
    for i, sent in enumerate(sentences):
        words = [w for w in _words(sent) if w not in STOPWORDS]
        if not words:
            scores[i] = 0.0
            continue
        # Position bonus: first and last sentences get a boost
        pos_bonus = 1.3 if i == 0 else 1.1 if i == len(sentences) - 1 else 1.0
        scores[i] = (sum(tf[w] / total for w in words) / len(words)) * pos_bonus

    top_indices = sorted(sorted(scores, key=scores.get, reverse=True)[:max_sentences])
    summary = " ".join(sentences[i] for i in top_indices)

    return {
        "summary": summary,
        "original_length": len(text),
        "summary_length": len(summary),
        "compression_ratio": round(len(summary) / len(text), 2),
        "sentences_extracted": len(top_indices),
        "total_sentences": len(sentences),
    }


# ─────────────────────────────────────────────────────────────
# 2. SENTIMENT ANALYSIS  (Lexicon-based with negation handling)
# ─────────────────────────────────────────────────────────────

POSITIVE_WORDS = {
    "good","great","excellent","amazing","awesome","fantastic","wonderful","love",
    "best","perfect","outstanding","brilliant","superb","helpful","easy","clear",
    "fast","efficient","beautiful","clean","smooth","recommend","happy","enjoy",
    "useful","impressive","intuitive","powerful","reliable","solid","nice","fun",
    "simple","elegant","innovative","creative","professional","quality","top",
}
NEGATIVE_WORDS = {
    "bad","terrible","awful","horrible","worst","hate","poor","slow","broken",
    "confusing","difficult","hard","ugly","messy","buggy","crash","error","fail",
    "useless","waste","disappointing","frustrating","annoying","complicated","weak",
    "boring","outdated","expensive","overpriced","missing","incomplete","wrong",
}
NEGATIONS = {"not","no","never","neither","nor","without","hardly","barely","scarcely"}
INTENSIFIERS = {"very","extremely","really","absolutely","totally","completely","highly"}

def analyze_sentiment(text: str) -> dict:
    text = _clean(text)
    words = _words(text)
    raw = text.lower().split()

    pos_score = 0.0
    neg_score = 0.0
    matched_pos = []
    matched_neg = []

    for i, word in enumerate(words):
        # Check for negation in window of 3 words before
        negated = any(raw[max(0, i-3):i].count(n) > 0 for n in NEGATIONS)
        intensifier = any(raw[max(0, i-2):i].count(iv) > 0 for iv in INTENSIFIERS)
        weight = 1.5 if intensifier else 1.0

        if word in POSITIVE_WORDS:
            if negated:
                neg_score += weight
                matched_neg.append(f"not {word}")
            else:
                pos_score += weight
                matched_pos.append(word)
        elif word in NEGATIVE_WORDS:
            if negated:
                pos_score += weight * 0.5
                matched_pos.append(f"not {word}")
            else:
                neg_score += weight
                matched_neg.append(word)

    total = pos_score + neg_score or 1
    compound = (pos_score - neg_score) / total

    if compound >= 0.3:
        label, emoji = "positive", "😊"
    elif compound <= -0.3:
        label, emoji = "negative", "😞"
    else:
        label, emoji = "neutral", "😐"

    return {
        "sentiment": label,
        "emoji": emoji,
        "compound_score": round(compound, 3),
        "positive_score": round(pos_score / total, 3),
        "negative_score": round(neg_score / total, 3),
        "confidence": round(min(abs(compound) * 100 + 40, 99), 1),
        "matched_positive": matched_pos[:5],
        "matched_negative": matched_neg[:5],
        "word_count": len(words),
    }


# ─────────────────────────────────────────────────────────────
# 3. AMHARIC ↔ ENGLISH TRANSLATION  (Dictionary-based)
# ─────────────────────────────────────────────────────────────

EN_TO_AM: dict[str, str] = {
    "hello": "ሰላም", "hi": "ሰላም", "welcome": "እንኳን ደህና መጡ",
    "thank you": "አመሰግናለሁ", "thanks": "አመሰግናለሁ", "please": "እባክዎ",
    "yes": "አዎ", "no": "አይ", "good": "ጥሩ", "bad": "መጥፎ",
    "learn": "ተማር", "learning": "መማር", "code": "ኮድ", "coding": "ኮዲንግ",
    "program": "ፕሮግራም", "programming": "ፕሮግራሚንግ", "developer": "ዴቨሎፐር",
    "software": "ሶፍትዌር", "computer": "ኮምፒዩተር", "internet": "ኢንተርኔት",
    "website": "ድህረ ገጽ", "application": "አፕሊኬሽን", "data": "ዳታ",
    "technology": "ቴክኖሎጂ", "course": "ኮርስ", "lesson": "ትምህርት",
    "student": "ተማሪ", "teacher": "አስተማሪ", "work": "ሥራ", "job": "ሥራ",
    "company": "ኩባንያ", "project": "ፕሮጀክት", "team": "ቡድን",
    "success": "ስኬት", "challenge": "ፈተና", "skill": "ክህሎት",
    "practice": "ልምምድ", "test": "ፈተና", "result": "ውጤት",
    "start": "ጀምር", "finish": "ጨርስ", "help": "እርዳታ",
    "question": "ጥያቄ", "answer": "መልስ", "problem": "ችግር",
    "solution": "መፍትሄ", "example": "ምሳሌ", "free": "ነጻ",
    "ethiopia": "ኢትዮጵያ", "ethiopian": "ኢትዮጵያዊ", "amharic": "አማርኛ",
    "english": "እንግሊዝኛ", "language": "ቋንቋ", "name": "ስም",
    "email": "ኢሜይል", "password": "የይለፍ ቃል", "login": "ግባ",
    "register": "ተመዝገብ", "profile": "መገለጫ", "dashboard": "ዳሽቦርድ",
}

AM_TO_EN: dict[str, str] = {v: k for k, v in EN_TO_AM.items()}

def _detect_language(text: str) -> str:
    amharic_chars = sum(1 for c in text if '\u1200' <= c <= '\u137f')
    return "amharic" if amharic_chars > len(text) * 0.1 else "english"

def translate(text: str, target_lang: Optional[str] = None) -> dict:
    text = _clean(text)
    detected = _detect_language(text)

    if target_lang is None:
        target_lang = "amharic" if detected == "english" else "english"

    translated_words = []
    untranslated = []

    if detected == "english" and target_lang == "amharic":
        # Try phrase-level first, then word-level
        lower = text.lower()
        result = lower
        for phrase, am in sorted(EN_TO_AM.items(), key=lambda x: -len(x[0])):
            result = result.replace(phrase, am)
        translated_words = result.split()
        untranslated = [w for w in _words(text) if w not in EN_TO_AM]

    elif detected == "amharic" and target_lang == "english":
        result = text
        for am, en in sorted(AM_TO_EN.items(), key=lambda x: -len(x[0])):
            result = result.replace(am, en)
        translated_words = result.split()
        untranslated = []
    else:
        result = text
        translated_words = text.split()

    translated = " ".join(translated_words) if translated_words else result
    coverage = round((1 - len(untranslated) / max(len(_words(text)), 1)) * 100, 1)

    return {
        "original": text,
        "translated": translated,
        "source_language": detected,
        "target_language": target_lang,
        "translation_coverage": coverage,
        "untranslated_words": untranslated[:10],
        "note": "Dictionary-based translation. For full accuracy use a dedicated translation API." if coverage < 80 else None,
    }


# ─────────────────────────────────────────────────────────────
# 4. TAG GENERATOR  (TF-IDF + domain keyword extraction)
# ─────────────────────────────────────────────────────────────

TECH_KEYWORDS = {
    "python","javascript","typescript","react","vue","angular","node","fastapi",
    "django","flask","express","mongodb","postgresql","mysql","redis","docker",
    "kubernetes","aws","azure","gcp","git","linux","html","css","tailwind",
    "graphql","rest","api","machine learning","deep learning","ai","data science",
    "devops","ci/cd","terraform","microservices","blockchain","web3","mobile",
    "android","ios","flutter","react native","sql","nosql","firebase","supabase",
    "nextjs","nuxt","svelte","rust","go","java","kotlin","swift","php","ruby",
    "algorithm","data structure","design pattern","testing","security","authentication",
}

def generate_tags(text: str, max_tags: int = 10) -> dict:
    text = _clean(text)
    lower = text.lower()
    words = _words(lower)

    # 1. Direct tech keyword matches (highest priority)
    tech_tags = []
    for kw in TECH_KEYWORDS:
        if kw in lower:
            tech_tags.append(kw)

    # 2. TF-IDF significant words
    filtered = [w for w in words if w not in STOPWORDS and len(w) > 3]
    freq = Counter(filtered)
    tfidf_tags = [w for w, _ in freq.most_common(20) if w not in tech_tags]

    # 3. Bigrams for compound terms
    bigrams = []
    for i in range(len(words) - 1):
        bg = f"{words[i]} {words[i+1]}"
        if words[i] not in STOPWORDS and words[i+1] not in STOPWORDS:
            if bg in TECH_KEYWORDS:
                bigrams.append(bg)

    # Merge: tech first, then bigrams, then tfidf
    all_tags = list(dict.fromkeys(tech_tags + bigrams + tfidf_tags))[:max_tags]

    # Categorize
    categories = {
        "language": [t for t in all_tags if t in {"python","javascript","typescript","java","go","rust","php","ruby","kotlin","swift"}],
        "framework": [t for t in all_tags if t in {"react","vue","angular","django","flask","fastapi","express","nextjs","flutter"}],
        "database": [t for t in all_tags if t in {"mongodb","postgresql","mysql","redis","firebase","supabase","sql","nosql"}],
        "devops": [t for t in all_tags if t in {"docker","kubernetes","aws","azure","gcp","terraform","ci/cd","linux"}],
        "topic": [t for t in all_tags if t not in {*categories.get("language",[]),*categories.get("framework",[]),*categories.get("database",[]),*categories.get("devops",[])}] if False else [],
    }
    categories["topic"] = [t for t in all_tags if not any(t in v for v in list(categories.values())[:4])]

    return {
        "tags": all_tags,
        "tag_count": len(all_tags),
        "categories": {k: v for k, v in categories.items() if v},
        "confidence": round(min(len(tech_tags) / max(max_tags, 1) * 100 + 50, 99), 1),
    }


# ─────────────────────────────────────────────────────────────
# 5. GRAMMAR CHECK  (Rule-based)
# ─────────────────────────────────────────────────────────────

GRAMMAR_RULES = [
    (r'\bi\b',                          "Capitalize 'I'",                    "I"),
    (r'\b(a)\s+([aeiouAEIOU]\w+)',      "Use 'an' before vowel sounds",      "an \\2"),
    (r'\b(an)\s+([^aeiouAEIOU\s]\w+)', "Use 'a' before consonant sounds",   "a \\2"),
    (r'([.!?])\s*([a-z])',              "Capitalize after sentence end",      "\\1 \\2"),
    (r'\s{2,}',                         "Extra whitespace",                   " "),
    (r'\b(\w+)\s+\1\b',                 "Repeated word",                     "\\1"),
    (r',([^\s])',                        "Space after comma",                 ", \\1"),
    (r'([.!?]){2,}',                    "Multiple punctuation marks",        "\\1"),
    (r'\b(dont|cant|wont|isnt|arent|wasnt|werent|hasnt|havent|hadnt|didnt|doesnt|wouldnt|couldnt|shouldnt)\b',
                                        "Missing apostrophe in contraction", None),
]

COMMON_MISTAKES = {
    "their": ["there", "they're"],
    "your": ["you're"],
    "its": ["it's"],
    "then": ["than"],
    "affect": ["effect"],
    "loose": ["lose"],
    "alot": "a lot",
    "recieve": "receive",
    "occured": "occurred",
    "seperate": "separate",
    "definately": "definitely",
    "accomodate": "accommodate",
    "begining": "beginning",
    "beleive": "believe",
    "calender": "calendar",
    "concious": "conscious",
    "existance": "existence",
    "grammer": "grammar",
    "independant": "independent",
    "neccessary": "necessary",
    "occassion": "occasion",
    "priviledge": "privilege",
    "reccomend": "recommend",
    "succesful": "successful",
    "tommorow": "tomorrow",
    "untill": "until",
    "wierd": "weird",
}

def check_grammar(text: str) -> dict:
    text = _clean(text)
    issues = []
    corrected = text

    # Rule-based checks
    for pattern, message, replacement in GRAMMAR_RULES:
        matches = list(re.finditer(pattern, corrected, re.IGNORECASE if "Capitalize" not in message else 0))
        for m in matches:
            issues.append({
                "type": "grammar",
                "message": message,
                "position": m.start(),
                "original": m.group(),
                "suggestion": re.sub(pattern, replacement, m.group(), flags=re.IGNORECASE) if replacement else None,
            })
        if replacement:
            corrected = re.sub(pattern, replacement, corrected)

    # Spelling / common mistakes
    words_in_text = re.findall(r'\b\w+\b', text.lower())
    for word in words_in_text:
        if word in COMMON_MISTAKES:
            fix = COMMON_MISTAKES[word]
            if isinstance(fix, str):
                issues.append({
                    "type": "spelling",
                    "message": f"Possible misspelling: '{word}'",
                    "original": word,
                    "suggestion": fix,
                    "position": text.lower().find(word),
                })
                corrected = re.sub(rf'\b{word}\b', fix, corrected, flags=re.IGNORECASE)
            elif isinstance(fix, list):
                issues.append({
                    "type": "word_choice",
                    "message": f"'{word}' is often confused with {fix}",
                    "original": word,
                    "suggestion": f"Verify: did you mean '{word}' or '{fix[0]}'?",
                    "position": text.lower().find(word),
                })

    score = max(0, 100 - len(issues) * 8)
    grade = "A" if score >= 90 else "B" if score >= 75 else "C" if score >= 60 else "D"

    return {
        "original": text,
        "corrected": _clean(corrected),
        "issues": issues[:20],
        "issue_count": len(issues),
        "grammar_score": score,
        "grade": grade,
        "is_clean": len(issues) == 0,
    }
