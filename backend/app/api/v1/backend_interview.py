from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.database import db
from app.models.backend_question import BackendQuestion
from app.models.user_attempt import UserBackendAttempt
from app.models.system_design import SystemDesignScenario
from app.models.ethiopian_company import EthiopianCompany
from app.models.ethiopian_company_question import EthiopianCompanyQuestion
from app.models.remote_job_question import RemoteJobQuestion
from app.core.auth import get_current_user

router = APIRouter(prefix="/backend-interview", tags=["Backend Interview"])


def serialize_mongo_document(document):
    if not document:
        return document
    document = dict(document)
    if "_id" in document:
        document["_id"] = str(document["_id"])
    return document


def serialize_mongo_documents(documents):
    return [serialize_mongo_document(document) for document in documents]


def get_model_answer(question):
    fallback_answers = {
        "python": "Explain the backend concept, when to use it, tradeoffs, and one practical API or database example.",
        "java": "Explain the JVM or Spring backend concept, why it matters, and a production example.",
        "nodejs": "Explain async behavior, reliability, errors, resource limits, and backend tradeoffs.",
        "databases": "Explain schema or query design, indexes, transactions, consistency, and performance validation.",
        "system_design": "Break the design into components, data flow, storage, scaling, reliability, security, and observability.",
        "devops": "Explain deployment safety, health checks, rollback, monitoring, configuration, and production risk.",
        "cloud": "Explain managed services, networking, security, scaling, cost, and operational tradeoffs.",
    }
    return (
        question.get("answer_text")
        or question.get("sample_solution")
        or fallback_answers.get(question.get("category"), fallback_answers["python"])
    )


def evaluate_practice_answer(question, answer):
    clean_answer = answer.lower()
    model_answer = get_model_answer(question).lower()
    tags = question.get("tags") if isinstance(question.get("tags"), list) else []
    keywords = []
    for keyword in tags + [
        word
        for word in model_answer.replace(".", " ").replace(",", " ").split()
        if len(word) > 5
    ][:12]:
        normalized = str(keyword).lower()
        if normalized not in keywords:
            keywords.append(normalized)

    matched = [keyword for keyword in keywords if keyword in clean_answer]
    word_count = len([word for word in answer.strip().split() if word])
    coverage = len(matched) / len(keywords) if keywords else 0
    detail_score = min(word_count / 80, 1)
    score = round((coverage * 70) + (detail_score * 30))
    score = max(10, min(100, score))

    return {
        "score": score,
        "matched": matched[:12],
        "word_count": word_count,
        "is_correct": score >= 70,
        "feedback": (
            "Good answer. You covered several important backend concepts."
            if score >= 70
            else "Add more specific backend details, tradeoffs, and examples."
        ),
        "model_answer": get_model_answer(question),
    }


def build_practice_question_snapshot(question_id: str, question_snapshot: dict):
    question = question_snapshot if isinstance(question_snapshot, dict) else {}
    if question:
        return question

    return {
        "_id": str(question_id),
        "title": "Backend interview question",
        "category": "backend",
        "difficulty": "practice",
        "question_text": "Practice answer",
        "answer_text": get_model_answer({}),
        "tags": [],
        "points": 10,
    }

SAMPLE_BACKEND_QUESTIONS = [
    {
        "_id": "sample-python-1",
        "title": "Explain Python async and await",
        "category": "python",
        "subcategory": "async",
        "difficulty": "intermediate",
        "question_type": "theoretical",
        "question_text": "Explain how async and await work in Python and when you would use them in a backend API.",
        "answer_text": "Async and await let Python pause coroutines while waiting for I/O so the event loop can run other work.",
        "time_limit_seconds": 600,
        "points": 20,
        "tags": ["async", "api", "performance"],
        "total_attempts": 124,
        "correct_attempts": 84,
        "success_rate": 0.68,
    },
    {
        "_id": "sample-db-1",
        "title": "Design indexes for a job platform",
        "category": "databases",
        "subcategory": "indexing",
        "difficulty": "advanced",
        "question_type": "system_design",
        "question_text": "A jobs page filters by location, skill, salary, and posted date. Which indexes would you create and why?",
        "answer_text": "Start with indexes that match the most selective filters and sort order, then validate with query plans.",
        "time_limit_seconds": 900,
        "points": 30,
        "tags": ["indexes", "mongodb", "query-planning"],
        "total_attempts": 89,
        "correct_attempts": 46,
        "success_rate": 0.52,
    },
    {
        "_id": "sample-java-1",
        "title": "Java thread pools for APIs",
        "category": "java",
        "subcategory": "concurrency",
        "difficulty": "beginner",
        "question_type": "theoretical",
        "question_text": "What is a thread pool in Java, and why is it useful for backend request handling?",
        "answer_text": "A thread pool reuses worker threads, reducing creation overhead and helping control concurrency.",
        "time_limit_seconds": 480,
        "points": 15,
        "tags": ["threads", "java", "api"],
        "total_attempts": 76,
        "correct_attempts": 55,
        "success_rate": 0.72,
    },
    {
        "_id": "sample-node-1",
        "title": "Node.js event loop under load",
        "category": "nodejs",
        "subcategory": "runtime",
        "difficulty": "intermediate",
        "question_type": "theoretical",
        "question_text": "Describe how the Node.js event loop handles concurrent requests and what can block it.",
        "answer_text": "The event loop schedules async callbacks, but CPU-heavy synchronous work blocks other requests.",
        "time_limit_seconds": 600,
        "points": 20,
        "tags": ["event-loop", "nodejs", "scaling"],
        "total_attempts": 98,
        "correct_attempts": 60,
        "success_rate": 0.61,
    },
    {
        "_id": "sample-system-1",
        "title": "Design a scalable code runner",
        "category": "system_design",
        "subcategory": "architecture",
        "difficulty": "expert",
        "question_type": "system_design",
        "question_text": "Design a secure service that executes user-submitted code for interview practice.",
        "answer_text": "Use isolated workers, queues, strict timeouts, resource limits, and no direct host access.",
        "time_limit_seconds": 1200,
        "points": 40,
        "tags": ["queues", "containers", "security"],
        "total_attempts": 67,
        "correct_attempts": 26,
        "success_rate": 0.39,
    },
    {
        "_id": "sample-devops-1",
        "title": "Docker health checks",
        "category": "devops",
        "subcategory": "containers",
        "difficulty": "beginner",
        "question_type": "theoretical",
        "question_text": "How would you add a health check for a backend service running in Docker?",
        "answer_text": "Expose a lightweight health endpoint and configure Docker or the orchestrator to probe it.",
        "time_limit_seconds": 480,
        "points": 15,
        "tags": ["docker", "health-checks", "deployment"],
        "total_attempts": 81,
        "correct_attempts": 60,
        "success_rate": 0.74,
    },
    {
        "_id": "sample-cloud-1",
        "title": "Choose cloud storage for uploads",
        "category": "cloud",
        "subcategory": "storage",
        "difficulty": "intermediate",
        "question_type": "theoretical",
        "question_text": "A backend API accepts user file uploads. How would you store those files in the cloud and keep access secure?",
        "answer_text": "Store files in object storage, keep buckets private, and serve files with signed URLs or scoped permissions.",
        "time_limit_seconds": 720,
        "points": 25,
        "tags": ["object-storage", "security", "uploads"],
        "total_attempts": 63,
        "correct_attempts": 36,
        "success_rate": 0.57,
    },
]

# ==================== QUESTION ENDPOINTS ====================

@router.get("/questions")
async def get_questions(
    category: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    question_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=100)
):
    """Get backend interview questions with filters"""

    query = {}
    if category:
        query["category"] = category
    if difficulty:
        query["difficulty"] = difficulty
    if question_type:
        query["question_type"] = question_type
    if search:
        query["$text"] = {"$search": search}

    skip = (page - 1) * limit
    try:
        total = await db.backend_questions.count_documents(query)

        cursor = db.backend_questions.find(query).skip(skip).limit(limit)
        questions = serialize_mongo_documents(await cursor.to_list(length=limit))
    except Exception:
        questions = [
            question for question in SAMPLE_BACKEND_QUESTIONS
            if (not category or question["category"] == category)
            and (not difficulty or question["difficulty"] == difficulty)
            and (not question_type or question["question_type"] == question_type)
        ]
        total = len(questions)

    if not questions:
        questions = [
            question for question in SAMPLE_BACKEND_QUESTIONS
            if (not category or question["category"] == category)
            and (not question_type or question["question_type"] == question_type)
        ] or SAMPLE_BACKEND_QUESTIONS
        total = len(questions)

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit,
        "questions": questions
    }

@router.get("/questions/{question_id}")
async def get_question(
    question_id: str
):
    """Get single question by ID"""

    try:
        query_id = ObjectId(question_id) if ObjectId.is_valid(question_id) else question_id
        question = serialize_mongo_document(await db.backend_questions.find_one({"_id": query_id}))
    except Exception:
        question = next((item for item in SAMPLE_BACKEND_QUESTIONS if item["_id"] == question_id), None)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    return question

@router.get("/categories")
async def get_categories():
    """Get all categories with question counts"""

    pipeline = [
        {"$group": {
            "_id": "$category",
            "count": {"$sum": 1},
            "subcategories": {"$addToSet": "$subcategory"}
        }}
    ]
    try:
        categories = await db.backend_questions.aggregate(pipeline).to_list(length=20)
    except Exception:
        categories = [
            {"_id": "python", "count": 1, "subcategories": ["async"]},
            {"_id": "databases", "count": 1, "subcategories": ["indexing"]},
        ]
    return categories

@router.get("/statistics")
async def get_statistics():
    """Get overall statistics for the user"""

    return {
        "overall": {
            "total_questions": 0,
            "correct_answers": 0,
            "average_score": 0,
            "current_streak": 0,
            "longest_streak": 0,
            "xp_points": 0,
            "level": 1,
            "badges": []
        },
        "by_category": []
    }

# ==================== USER ATTEMPT ENDPOINTS ====================

@router.post("/questions/{question_id}/attempt")
async def submit_answer(
    question_id: str,
    attempt_data: dict,
    current_user = Depends(get_current_user)
):
    """Submit answer for a question"""

    question = await db.backend_questions.find_one({"_id": ObjectId(question_id)})
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # Create attempt record
    attempt = {
        "user_id": str(current_user.get("_id", current_user.get("sub", ""))),
        "question_id": question_id,
        "user_answer": attempt_data.get("answer", ""),
        "user_code": attempt_data.get("code", ""),
        "code_output": attempt_data.get("output", ""),
        "time_taken_seconds": attempt_data.get("time_taken", 0),
        "is_correct": False,
        "points_earned": 0,
        "created_at": datetime.utcnow()
    }

    # Check if answer is correct (for theoretical questions)
    if question["question_type"] == "theoretical":
        # Simple keyword matching (would be enhanced with AI)
        user_answer_lower = attempt["user_answer"].lower()
        answer_keywords = question["answer_text"].lower().split()[:10]
        keyword_matches = sum(1 for kw in answer_keywords if kw in user_answer_lower)
        is_correct = keyword_matches / len(answer_keywords) > 0.5

        attempt["is_correct"] = is_correct
        attempt["points_earned"] = question["points"] if is_correct else 0

    result = await db.user_backend_attempts.insert_one(attempt)

    # Update question statistics
    await db.backend_questions.update_one(
        {"_id": ObjectId(question_id)},
        {
            "$inc": {"total_attempts": 1},
            "$set": {"success_rate": (question["correct_attempts"] + (1 if attempt["is_correct"] else 0)) / (question["total_attempts"] + 1)}
        }
    )

    # Update user progress
    await update_user_progress(current_user.get("_id", current_user.get("sub", "")), attempt["is_correct"], attempt["points_earned"])

    return {
        "attempt_id": str(result.inserted_id),
        "is_correct": attempt["is_correct"],
        "points_earned": attempt["points_earned"],
        "message": "Answer submitted successfully"
    }

async def update_user_progress(user_id: ObjectId, is_correct: bool, points_earned: int):
    """Update user's overall progress"""

    user = await db.users.find_one({"_id": user_id}) or {}
    stats = user.get("backend_interview_stats", {})

    new_stats = {
        "total_questions": stats.get("total_questions", 0) + 1,
        "correct_answers": stats.get("correct_answers", 0) + (1 if is_correct else 0),
        "average_score": 0,
        "current_streak": stats.get("current_streak", 0) + 1 if is_correct else 0,
        "longest_streak": stats.get("longest_streak", 0),
        "xp_points": stats.get("xp_points", 0) + points_earned,
        "level": 1,
        "badges": stats.get("badges", [])
    }

    # Calculate average score
    new_stats["average_score"] = (new_stats["correct_answers"] / new_stats["total_questions"]) * 100

    # Update longest streak
    if new_stats["current_streak"] > new_stats["longest_streak"]:
        new_stats["longest_streak"] = new_stats["current_streak"]

    # Calculate level (1 XP = 1, level 1 = 0-100, level 2 = 101-300, etc.)
    new_stats["level"] = new_stats["xp_points"] // 100 + 1

    await db.users.update_one(
        {"_id": user_id},
        {"$set": {"backend_interview_stats": new_stats}}
    )


@router.post("/practice-attempts")
async def save_practice_attempt(attempt_data: dict):
    """Save an unauthenticated practice answer and return its evaluated result."""

    session_id = attempt_data.get("session_id")
    question_id = attempt_data.get("question_id")
    answer = attempt_data.get("answer", "")
    question_snapshot = attempt_data.get("question", {}) or {}

    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")
    if not question_id:
        raise HTTPException(status_code=400, detail="question_id is required")
    if not answer.strip():
        raise HTTPException(status_code=400, detail="answer is required")

    question = None
    try:
        if ObjectId.is_valid(str(question_id)):
            question = serialize_mongo_document(
                await db.backend_questions.find_one({"_id": ObjectId(str(question_id))})
            )
    except Exception:
        question = None

    question = question or build_practice_question_snapshot(str(question_id), question_snapshot)

    evaluation = evaluate_practice_answer(question, answer)
    now = datetime.utcnow()
    attempt = {
        "session_id": session_id,
        "question_id": str(question_id),
        "question_title": question.get("title", "Backend interview question"),
        "category": question.get("category", "backend"),
        "difficulty": question.get("difficulty", "practice"),
        "user_answer": answer,
        "ai_score": evaluation["score"],
        "ai_feedback": evaluation["feedback"],
        "ai_strengths": evaluation["matched"],
        "ai_improvements": [] if evaluation["is_correct"] else ["Add more backend-specific details", "Mention tradeoffs and examples"],
        "is_correct": evaluation["is_correct"],
        "points_earned": question.get("points", 10) if evaluation["is_correct"] else 0,
        "word_count": evaluation["word_count"],
        "model_answer": evaluation["model_answer"],
        "created_at": now,
    }

    try:
        result = await db.user_backend_attempts.insert_one(attempt)
        attempt_id = str(result.inserted_id)
    except Exception:
        attempt_id = "local"

    return {
        "attempt_id": attempt_id,
        "accepted": True,
        "persisted": attempt_id != "local",
        "score": evaluation["score"],
        "feedback": evaluation["feedback"],
        "matched": evaluation["matched"],
        "word_count": evaluation["word_count"],
        "is_correct": evaluation["is_correct"],
        "points_earned": attempt["points_earned"],
        "model_answer": evaluation["model_answer"],
    }


@router.get("/practice-results")
async def get_practice_results(
    session_id: str = Query(...),
    category: Optional[str] = Query(None),
):
    """Get total result summary for a browser practice session."""

    match = {"session_id": session_id}
    if category and category != "all":
        match["category"] = category

    try:
        attempts = serialize_mongo_documents(
            await db.user_backend_attempts.find(match).sort("created_at", -1).to_list(length=500)
        )
    except Exception:
        attempts = []

    latest_by_question = {}
    for attempt in attempts:
        latest_by_question.setdefault(attempt.get("question_id"), attempt)

    latest_attempts = list(latest_by_question.values())
    total_answered = len(latest_attempts)
    total_score = sum(int(attempt.get("ai_score", 0)) for attempt in latest_attempts)
    average_score = round(total_score / total_answered) if total_answered else 0
    correct_answers = sum(1 for attempt in latest_attempts if attempt.get("is_correct"))

    return {
        "session_id": session_id,
        "category": category or "all",
        "target_questions": 10 if category and category != "all" else 70,
        "answered": total_answered,
        "correct_answers": correct_answers,
        "average_score": average_score,
        "total_score": total_score,
        "completed": total_answered >= (10 if category and category != "all" else 70),
        "attempts": latest_attempts,
    }

# ==================== SYSTEM DESIGN ENDPOINTS ====================

@router.get("/system-design")
async def get_system_design_scenarios(
    difficulty: Optional[str] = Query(None),
    limit: int = Query(20)
):
    """Get system design scenarios"""

    query = {}
    if difficulty:
        query["difficulty"] = difficulty

    try:
        cursor = db.system_design_scenarios.find(query).limit(limit)
        scenarios = serialize_mongo_documents(await cursor.to_list(length=limit))
    except Exception:
        scenarios = []
    return scenarios

@router.get("/system-design/{scenario_id}")
async def get_system_design_scenario(scenario_id: str):
    """Get single system design scenario"""

    scenario = serialize_mongo_document(await db.system_design_scenarios.find_one({"_id": ObjectId(scenario_id)}))
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return scenario

# ==================== ETHIOPIAN COMPANIES ENDPOINTS ====================

@router.get("/ethiopian/companies")
async def get_ethiopian_companies():
    """Get Ethiopian tech companies"""

    try:
        companies = serialize_mongo_documents(await db.ethiopian_companies.find().to_list(length=50))
    except Exception:
        companies = []
    return companies

@router.get("/ethiopian/questions")
async def get_ethiopian_company_questions(company_id: str = None):
    """Get interview questions from Ethiopian companies"""

    query = {}
    if company_id:
        query["company_id"] = company_id

    try:
        questions = serialize_mongo_documents(await db.ethiopian_company_questions.find(query).to_list(length=100))
    except Exception:
        questions = []
    return questions

# ==================== REMOTE JOB QUESTIONS ====================

@router.get("/remote/questions")
async def get_remote_job_questions():
    """Get questions for remote job interviews"""

    try:
        questions = serialize_mongo_documents(await db.remote_job_questions.find().to_list(length=50))
    except Exception:
        questions = []
    return questions

# ==================== LEADERBOARD ====================

@router.get("/leaderboard")
async def get_leaderboard(limit: int = Query(50)):
    """Get top users by XP"""

    pipeline = [
        {"$match": {"backend_interview_stats.xp_points": {"$gt": 0}}},
        {"$sort": {"backend_interview_stats.xp_points": -1}},
        {"$limit": limit},
        {"$project": {
            "_id": 0,
            "user_id": "$_id",
            "name": 1,
            "email": 1,
            "xp_points": "$backend_interview_stats.xp_points",
            "level": "$backend_interview_stats.level",
            "total_questions": "$backend_interview_stats.total_questions"
        }}
    ]
    try:
        leaderboard = serialize_mongo_documents(await db.users.aggregate(pipeline).to_list(length=limit))
    except Exception:
        leaderboard = []
    return leaderboard
