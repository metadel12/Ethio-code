from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Header
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import hashlib
import io
import base64
from bson import ObjectId

from app.database import db

# Optional auth dependency
async def get_current_user_optional(authorization: Optional[str] = Header(None)):
    """Get current user if token provided, otherwise return None"""
    if not authorization:
        return None
    try:
        from app.core.auth import verify_token
        token = authorization.replace("Bearer ", "")
        payload = verify_token(token)
        user = await db.users.find_one({"email": payload.get("sub")})
        return user
    except:
        return None
from app.core.auth import get_current_user

router = APIRouter(prefix="/translator", tags=["Amharic Translator"])

# Amharic-English Dictionary (extended)
AMHARIC_DICTIONARY = {
    # Greetings & Basic
    "hello": "ሰላም", "ሰላም": "hello",
    "hi": "ሰላም", "hey": "ሰላም",
    "good morning": "እንደምን አደርክ", "እንደምን አደርክ": "good morning",
    "good evening": "እንደምን ዋልክ", "እንደምን ዋልክ": "good evening",
    "good night": "ደህና እደር", "ደህና እደር": "good night",
    "goodbye": "ደህና ሁን", "ደህና ሁን": "goodbye",
    "bye": "ቻው", "ቻው": "bye",
    "thank you": "አመሰግናለሁ", "አመሰግናለሁ": "thank you",
    "thanks": "አመሰግናለሁ",
    "please": "እባክህ", "እባክህ": "please",
    "yes": "አዎ", "አዎ": "yes",
    "no": "አይደለም", "አይደለም": "no",
    "sorry": "ይቅርታ", "ይቅርታ": "sorry",
    "excuse me": "ይቅርታ",
    "welcome": "እንኳን ደህና መጣህ", "እንኳን ደህና መጣህ": "welcome",
    
    # Common Verbs
    "go": "ሂድ", "ሂድ": "go",
    "come": "ና", "ና": "come",
    "eat": "በላ", "በላ": "eat",
    "drink": "ጠጣ", "ጠጣ": "drink",
    "sleep": "ተኛ", "ተኛ": "sleep",
    "work": "ስራ", "ስራ": "work",
    "study": "አጥና", "አጥና": "study",
    "learn": "ተማር", "ተማር": "learn",
    "teach": "አስተምር", "አስተምር": "teach",
    "read": "አንብብ", "አንብብ": "read",
    "write": "ጻፍ", "ጻፍ": "write",
    "speak": "ተናገር", "ተናገር": "speak",
    "listen": "ስማ", "ስማ": "listen",
    "see": "ተመልከት", "ተመልከት": "see",
    "look": "ተመልከት",
    "understand": "ተረዳ", "ተረዳ": "understand",
    "know": "አውቅ", "አውቅ": "know",
    "think": "አስብ", "አስብ": "think",
    "want": "ፈልግ", "ፈልግ": "want",
    "need": "ፈልግ",
    "like": "ወደድ", "ወደድ": "like",
    "love": "ፍቅር", "ፍቅር": "love",
    "help": "ረዳ", "ረዳ": "help",
    "give": "ስጥ", "ስጥ": "give",
    "take": "ውሰድ", "ውሰድ": "take",
    "buy": "ግዛ", "ግዛ": "buy",
    "sell": "ሽጥ", "ሽጥ": "sell",
    
    # Technology & Programming
    "computer": "ኮምፒውተር", "ኮምፒውተር": "computer",
    "program": "ፕሮግራም", "ፕሮግራም": "program",
    "code": "ኮድ", "ኮድ": "code",
    "software": "ሶፍትዌር", "ሶፍትዌር": "software",
    "application": "አፕሊኬሽን", "አፕሊኬሽን": "application",
    "app": "አፕሊኬሽን",
    "website": "ድህረ ገጽ", "ድህረ ገጽ": "website",
    "internet": "ኢንተርኔት", "ኢንተርኔት": "internet",
    "email": "ኢሜይል", "ኢሜይል": "email",
    "phone": "ስልክ", "ስልክ": "phone",
    "mobile": "ሞባይል", "ሞባይል": "mobile",
    "database": "ዳታቤዝ", "ዳታቤዝ": "database",
    "server": "ሰርቨር", "ሰርቨር": "server",
    "network": "ኔትወርክ", "ኔትወርክ": "network",
    "security": "ደህንነት", "ደህንነት": "security",
    "password": "የይለፍ ቃል", "የይለፍ ቃል": "password",
    "user": "ተጠቃሚ", "ተጠቃሚ": "user",
    "developer": "ደቨሎፐር", "ደቨሎፐር": "developer",
    "programmer": "ፕሮግራመር", "ፕሮግራመር": "programmer",
    "technology": "ቴክኖሎጂ", "ቴክኖሎጂ": "technology",
    
    # Business & Work
    "company": "ኩባንያ", "ኩባንያ": "company",
    "business": "ንግድ", "ንግድ": "business",
    "job": "ስራ",
    "work": "ስራ",
    "office": "ቢሮ", "ቢሮ": "office",
    "salary": "ደመወዝ", "ደመወዝ": "salary",
    "money": "ገንዘብ", "ገንዘብ": "money",
    "price": "ዋጋ", "ዋጋ": "price",
    "cost": "ዋጋ",
    "interview": "ቃለ መጠይቅ", "ቃለ መጠይቅ": "interview",
    "project": "ፕሮጀክት", "ፕሮጀክት": "project",
    "customer": "ደንበኛ", "ደንበኛ": "customer",
    "client": "ደንበኛ",
    "market": "ገበያ", "ገበያ": "market",
    "sales": "ሽያጭ", "ሽያጭ": "sales",
    "profit": "ትርፍ", "ትርፍ": "profit",
    "loss": "ኪሳራ", "ኪሳራ": "loss",
    
    # Time & Dates
    "today": "ዛሬ", "ዛሬ": "today",
    "tomorrow": "ነገ", "ነገ": "tomorrow",
    "yesterday": "ትላንት", "ትላንት": "yesterday",
    "now": "አሁን", "አሁን": "now",
    "later": "በኋላ", "በኋላ": "later",
    "soon": "በቅርቡ", "በቅርቡ": "soon",
    "week": "ሳምንት", "ሳምንት": "week",
    "month": "ወር", "ወር": "month",
    "year": "አመት", "አመት": "year",
    "day": "ቀን", "ቀን": "day",
    "hour": "ሰዓት", "ሰዓት": "hour",
    "minute": "ደቂቃ", "ደቂቃ": "minute",
    "monday": "ሰኞ", "ሰኞ": "monday",
    "tuesday": "ማክሰኞ", "ማክሰኞ": "tuesday",
    "wednesday": "ረቡዕ", "ረቡዕ": "wednesday",
    "thursday": "ሐሙስ", "ሐሙስ": "thursday",
    "friday": "አርብ", "አርብ": "friday",
    "saturday": "ቅዳሜ", "ቅዳሜ": "saturday",
    "sunday": "እሁድ", "እሁድ": "sunday",
    
    # Numbers
    "one": "አንድ", "አንድ": "one",
    "two": "ሁለት", "ሁለት": "two",
    "three": "ሶስት", "ሶስት": "three",
    "four": "አራት", "አራት": "four",
    "five": "አምስት", "አምስት": "five",
    "six": "ስድስት", "ስድስት": "six",
    "seven": "ሰባት", "ሰባት": "seven",
    "eight": "ስምንት", "ስምንት": "eight",
    "nine": "ዘጠኝ", "ዘጠኝ": "nine",
    "ten": "አስር", "አስር": "ten",
    
    # Question Words
    "what": "ምን", "ምን": "what",
    "who": "ማን", "ማን": "who",
    "where": "የት", "የት": "where",
    "when": "መቼ", "መቼ": "when",
    "why": "ለምን", "ለምን": "why",
    "how": "እንዴት", "እንዴት": "how",
    "which": "የትኛው", "የትኛው": "which",
    
    # Family & People
    "family": "ቤተሰብ", "ቤተሰብ": "family",
    "father": "አባት", "አባት": "father",
    "mother": "እናት", "እናት": "mother",
    "brother": "ወንድም", "ወንድም": "brother",
    "sister": "እህት", "እህት": "sister",
    "son": "ልጅ", "ልጅ": "son",
    "daughter": "ሴት ልጅ", "ሴት ልጅ": "daughter",
    "friend": "ጓደኛ", "ጓደኛ": "friend",
    "people": "ሰዎች", "ሰዎች": "people",
    "person": "ሰው", "ሰው": "person",
    "man": "ወንድ", "ወንድ": "man",
    "woman": "ሴት", "ሴት": "woman",
    "child": "ልጅ",
    "boy": "ወንድ ልጅ", "ወንድ ልጅ": "boy",
    "girl": "ሴት ልጅ",
    
    # Food & Drink
    "food": "ምግብ", "ምግብ": "food",
    "water": "ውሃ", "ውሃ": "water",
    "coffee": "ቡና", "ቡና": "coffee",
    "tea": "ሻይ", "ሻይ": "tea",
    "bread": "ዳቦ", "ዳቦ": "bread",
    "injera": "እንጀራ", "እንጀራ": "injera",
    "wat": "ወጥ", "ወጥ": "wat",
    "meat": "ስጋ", "ስጋ": "meat",
    "milk": "ወተት", "ወተት": "milk",
    "fruit": "ፍራፍሬ", "ፍራፍሬ": "fruit",
    "vegetable": "አትክልት", "አትክልት": "vegetable",
    
    # Places
    "ethiopia": "ኢትዮጵያ", "ኢትዮጵያ": "ethiopia",
    "addis ababa": "አዲስ አበባ", "አዲስ አበባ": "addis ababa",
    "house": "ቤት", "ቤት": "house",
    "home": "ቤት",
    "school": "ትምህርት ቤት", "ትምህርት ቤት": "school",
    "hospital": "ሆስፒታል", "ሆስፒታል": "hospital",
    "church": "ቤተክርስቲያን", "ቤተክርስቲያን": "church",
    "mosque": "መስጊድ", "መስጊድ": "mosque",
    "city": "ከተማ", "ከተማ": "city",
    "country": "አገር", "አገር": "country",
    "world": "ዓለም", "ዓለም": "world",
    "street": "መንገድ", "መንገድ": "street",
    "road": "መንገድ",
    
    # Adjectives
    "good": "ጥሩ", "ጥሩ": "good",
    "bad": "መጥፎ", "መጥፎ": "bad",
    "big": "ትልቅ", "ትልቅ": "big",
    "small": "ትንሽ", "ትንሽ": "small",
    "new": "አዲስ", "አዲስ": "new",
    "old": "አሮጌ", "አሮጌ": "old",
    "beautiful": "ውብ", "ውብ": "beautiful",
    "nice": "ጥሩ",
    "happy": "ደስተኛ", "ደስተኛ": "happy",
    "sad": "አዘኛ", "አዘኛ": "sad",
    "fast": "ፈጣን", "ፈጣን": "fast",
    "slow": "ዘገምተኛ", "ዘገምተኛ": "slow",
    "hot": "ሞቃት", "ሞቃት": "hot",
    "cold": "ቀዝቃዛ", "ቀዝቃዛ": "cold",
    "easy": "ቀላል", "ቀላል": "easy",
    "difficult": "ከባድ", "ከባድ": "difficult",
    "hard": "ከባድ",
    "important": "አስፈላጊ", "አስፈላጊ": "important",
    
    # Colors
    "color": "ቀለም", "ቀለም": "color",
    "red": "ቀይ", "ቀይ": "red",
    "blue": "ሰማያዊ", "ሰማያዊ": "blue",
    "green": "አረንጓዴ", "አረንጓዴ": "green",
    "yellow": "ቢጫ", "ቢጫ": "yellow",
    "black": "ጥቁር", "ጥቁር": "black",
    "white": "ነጭ", "ነጭ": "white",
    
    # Common Phrases
    "how are you": "እንዴት ነህ", "እንዴት ነህ": "how are you",
    "i am fine": "ደህና ነኝ", "ደህና ነኝ": "i am fine",
    "what is your name": "ስምህ ማን ነው", "ስምህ ማን ነው": "what is your name",
    "my name is": "ስሜ", "ስሜ": "my name is",
    "nice to meet you": "ስለተገናኘን ደስ ብሎኛል", "ስለተገናኘን ደስ ብሎኛል": "nice to meet you",
    "i love you": "እወድሃለሁ", "እወድሃለሁ": "i love you",
    "see you later": "ደህና ሁን", 
    "have a good day": "መልካም ቀን",
}

class TranslationRequest(BaseModel):
    text: str
    source_lang: str = "auto"
    target_lang: str
    context: Optional[str] = "general"

class TranslationResponse(BaseModel):
    original_text: str
    translated_text: str
    source_language: str
    target_language: str
    confidence: float
    alternative_translations: Optional[List[str]] = []

@router.post("/translate", response_model=TranslationResponse)
async def translate_text(
    request: TranslationRequest,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """Translate text between Amharic and English"""
    
    # Check cache
    cache_key = hashlib.md5(f"{request.text}_{request.source_lang}_{request.target_lang}".encode()).hexdigest()
    
    try:
        cached = await db.translation_cache.find_one({"source_text_hash": cache_key})
        if cached:
            await db.translation_cache.update_one({"_id": cached["_id"]}, {"$inc": {"hits": 1}})
            return TranslationResponse(
                original_text=request.text,
                translated_text=cached["target_text"],
                source_language=request.source_lang,
                target_language=request.target_lang,
                confidence=0.95,
                alternative_translations=[]
            )
    except Exception:
        pass
    
    # Dictionary-based translation
    translated_words = []
    alternatives = []
    words = request.text.split()
    
    for word in words:
        word_lower = word.lower().strip()
        if word_lower in AMHARIC_DICTIONARY:
            translated = AMHARIC_DICTIONARY[word_lower]
            translated_words.append(translated)
            alternatives.append(translated)
        else:
            translated_words.append(word)
    
    translated_text = " ".join(translated_words) if translated_words else request.text
    
    # Save to cache
    try:
        await db.translation_cache.insert_one({
            "source_text_hash": cache_key,
            "source_text": request.text,
            "source_language": request.source_lang,
            "target_text": translated_text,
            "target_language": request.target_lang,
            "hits": 1,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(days=30)
        })
    except Exception:
        pass
    
    # Save to history (only if user is logged in)
    if current_user:
        try:
            await db.translations.insert_one({
                "user_id": current_user["_id"],
                "source_text": request.text,
                "source_language": request.source_lang,
                "target_text": translated_text,
                "target_language": request.target_lang,
                "confidence": 0.85,
                "context": request.context,
                "created_at": datetime.utcnow()
            })
        except Exception:
            pass
        
        # Update learning progress
        await update_learning_progress(current_user["_id"], len(words))
    
    return TranslationResponse(
        original_text=request.text,
        translated_text=translated_text,
        source_language=request.source_lang,
        target_language=request.target_lang,
        confidence=0.85,
        alternative_translations=alternatives[:3] if alternatives else []
    )

@router.post("/save-vocabulary")
async def save_vocabulary(vocab_data: dict, current_user: dict = Depends(get_current_user)):
    """Save word to vocabulary"""
    
    vocab = {
        "user_id": current_user["_id"],
        "word_amharic": vocab_data.get("word_amharic", ""),
        "word_english": vocab_data.get("word_english", ""),
        "part_of_speech": vocab_data.get("part_of_speech", ""),
        "example_sentence": vocab_data.get("example_sentence", ""),
        "notes": vocab_data.get("notes", ""),
        "mastery_level": 0,
        "review_count": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.user_vocabulary.insert_one(vocab)
    await update_learning_progress(current_user["_id"], 0, new_word=True)
    
    return {"message": "Vocabulary saved", "id": str(result.inserted_id)}

@router.get("/vocabulary")
async def get_vocabulary(current_user: dict = Depends(get_current_user), limit: int = 50):
    """Get user vocabulary"""
    
    cursor = db.user_vocabulary.find({"user_id": current_user["_id"]}).sort("created_at", -1).limit(limit)
    vocabulary = await cursor.to_list(length=limit)
    
    for item in vocabulary:
        item["_id"] = str(item["_id"])
        item["user_id"] = str(item["user_id"])
    
    return {"vocabulary": vocabulary}

@router.post("/favorite-phrase")
async def save_favorite(phrase_data: dict, current_user: dict = Depends(get_current_user)):
    """Save favorite phrase"""
    
    phrase = {
        "user_id": current_user["_id"],
        "phrase_amharic": phrase_data.get("phrase_amharic", ""),
        "phrase_english": phrase_data.get("phrase_english", ""),
        "category": phrase_data.get("category", "general"),
        "usage_count": 0,
        "created_at": datetime.utcnow()
    }
    
    result = await db.favorite_phrases.insert_one(phrase)
    return {"message": "Phrase saved", "id": str(result.inserted_id)}

@router.get("/favorites")
async def get_favorites(current_user: dict = Depends(get_current_user)):
    """Get favorite phrases"""
    
    cursor = db.favorite_phrases.find({"user_id": current_user["_id"]}).sort("created_at", -1)
    favorites = await cursor.to_list(length=100)
    
    for item in favorites:
        item["_id"] = str(item["_id"])
        item["user_id"] = str(item["user_id"])
    
    return {"favorites": favorites}

@router.get("/history")
async def get_history(current_user: dict = Depends(get_current_user), limit: int = 50):
    """Get translation history"""
    
    cursor = db.translations.find({"user_id": current_user["_id"]}).sort("created_at", -1).limit(limit)
    history = await cursor.to_list(length=limit)
    
    for item in history:
        item["_id"] = str(item["_id"])
        item["user_id"] = str(item["user_id"])
    
    return {"history": history}

@router.delete("/history/{translation_id}")
async def delete_history(translation_id: str, current_user: dict = Depends(get_current_user)):
    """Delete translation from history"""
    
    result = await db.translations.delete_one({
        "_id": ObjectId(translation_id),
        "user_id": current_user["_id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Translation not found")
    
    return {"message": "Translation deleted"}

@router.get("/learning/progress")
async def get_progress(current_user: dict = Depends(get_current_user)):
    """Get learning progress"""
    
    progress = await db.learning_progress.find_one({"user_id": current_user["_id"]})
    
    if not progress:
        progress = {
            "total_words_learned": 0,
            "total_translations": 0,
            "current_streak_days": 0,
            "longest_streak_days": 0,
            "daily_goal": 10,
            "achievements": []
        }
    else:
        progress["_id"] = str(progress["_id"])
        progress["user_id"] = str(progress["user_id"])
    
    recent = await db.translations.find({"user_id": current_user["_id"]}).sort("created_at", -1).limit(5).to_list(length=5)
    
    for item in recent:
        item["_id"] = str(item["_id"])
        item["user_id"] = str(item["user_id"])
    
    return {
        "progress": progress,
        "recent_activity": recent,
        "next_milestone": get_next_milestone(progress.get("total_words_learned", 0))
    }

async def update_learning_progress(user_id: ObjectId, word_count: int, new_word: bool = False):
    """Update learning progress"""
    
    progress = await db.learning_progress.find_one({"user_id": user_id})
    today = datetime.utcnow().date()
    
    if not progress:
        progress = {
            "user_id": user_id,
            "total_words_learned": 0,
            "total_translations": 0,
            "current_streak_days": 1,
            "longest_streak_days": 1,
            "last_active": datetime.utcnow(),
            "daily_goal": 10,
            "achievements": [],
            "created_at": datetime.utcnow()
        }
    
    progress["total_translations"] = progress.get("total_translations", 0) + 1
    
    if new_word:
        progress["total_words_learned"] = progress.get("total_words_learned", 0) + 1
    
    # Update streak
    last_active = progress.get("last_active")
    if last_active:
        last_date = last_active.date() if isinstance(last_active, datetime) else last_active
        if last_date == today:
            pass
        elif last_date == today - timedelta(days=1):
            progress["current_streak_days"] = progress.get("current_streak_days", 0) + 1
            if progress["current_streak_days"] > progress.get("longest_streak_days", 0):
                progress["longest_streak_days"] = progress["current_streak_days"]
        else:
            progress["current_streak_days"] = 1
    
    progress["last_active"] = datetime.utcnow()
    progress["updated_at"] = datetime.utcnow()
    
    # Achievements
    achievements = progress.get("achievements", [])
    total_words = progress.get("total_words_learned", 0)
    
    if total_words >= 10 and "First 10 Words" not in achievements:
        achievements.append("First 10 Words")
    if total_words >= 50 and "50 Words Master" not in achievements:
        achievements.append("50 Words Master")
    if total_words >= 100 and "100 Words Master" not in achievements:
        achievements.append("100 Words Master")
    
    progress["achievements"] = achievements
    
    await db.learning_progress.update_one(
        {"user_id": user_id},
        {"$set": progress},
        upsert=True
    )

def get_next_milestone(current_words: int) -> dict:
    """Get next milestone"""
    
    milestones = [
        {"words": 10, "title": "First 10 Words", "reward": "Beginner Badge"},
        {"words": 50, "title": "50 Words Master", "reward": "Intermediate Badge"},
        {"words": 100, "title": "100 Words Master", "reward": "Advanced Badge"},
        {"words": 500, "title": "500 Words Master", "reward": "Expert Badge"},
        {"words": 1000, "title": "1000 Words Master", "reward": "Fluent Badge"}
    ]
    
    for milestone in milestones:
        if current_words < milestone["words"]:
            return {
                "next_milestone": milestone["title"],
                "words_needed": milestone["words"] - current_words,
                "reward": milestone["reward"]
            }
    
    return {"next_milestone": "Max Level!", "words_needed": 0, "reward": "Master"}

@router.get("/common-phrases")
async def get_common_phrases():
    """Get common Amharic phrases"""
    
    phrases = {
        "greetings": [
            {"amharic": "ሰላም", "english": "Hello", "pronunciation": "selam"},
            {"amharic": "እንደምን አደርክ", "english": "Good morning (male)", "pronunciation": "endemin aderk"},
            {"amharic": "እንደምን ዋልክ", "english": "Good evening (male)", "pronunciation": "endemin walk"},
        ],
        "common": [
            {"amharic": "አመሰግናለሁ", "english": "Thank you", "pronunciation": "ameseginalehu"},
            {"amharic": "እባክህ", "english": "Please (male)", "pronunciation": "ebakeh"},
            {"amharic": "ይቅርታ", "english": "Sorry/Excuse me", "pronunciation": "yikirta"},
        ],
        "questions": [
            {"amharic": "ስምህ ማን ነው", "english": "What is your name?", "pronunciation": "simih man new"},
            {"amharic": "እንዴት ነህ", "english": "How are you?", "pronunciation": "endet neh"},
            {"amharic": "ከየት ነህ", "english": "Where are you from?", "pronunciation": "keyet neh"},
        ]
    }
    
    return {"phrases": phrases}
