"""
AI-Powered Recommendations Engine
Algorithms: Collaborative Filtering + Content-Based + Contextual Bandits
"""
import math
import random
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Any

from app.database_mongo import (
    db,
    users_collection,
    user_activities_collection,
    daily_aggregates_collection,
)


# ─────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────

def _cosine_similarity(vec_a: dict, vec_b: dict) -> float:
    keys = set(vec_a) | set(vec_b)
    dot = sum(vec_a.get(k, 0) * vec_b.get(k, 0) for k in keys)
    mag_a = math.sqrt(sum(v ** 2 for v in vec_a.values()))
    mag_b = math.sqrt(sum(v ** 2 for v in vec_b.values()))
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot / (mag_a * mag_b)


def _build_user_vector(activities: list[dict]) -> dict:
    """Build a skill/tag frequency vector from user activity history."""
    vec: dict[str, float] = defaultdict(float)
    decay = 0.95
    now = datetime.utcnow()
    for act in activities:
        age_days = (now - act.get("created_at", now)).days
        weight = decay ** age_days
        for tag in act.get("metadata", {}).get("tags", []):
            vec[tag] += weight
        entity = act.get("entity_type", "")
        if entity:
            vec[entity] += weight * 0.5
    return dict(vec)


# ─────────────────────────────────────────────────────────────
# CONTEXTUAL BANDIT (ε-greedy)
# ─────────────────────────────────────────────────────────────

class EpsilonGreedyBandit:
    """Simple ε-greedy multi-armed bandit for exploration/exploitation."""

    def __init__(self, epsilon: float = 0.15):
        self.epsilon = epsilon
        self.counts: dict[str, int] = defaultdict(int)
        self.values: dict[str, float] = defaultdict(float)

    def select(self, arms: list[str]) -> str:
        if not arms:
            return ""
        if random.random() < self.epsilon:
            return random.choice(arms)
        return max(arms, key=lambda a: self.values[a])

    def update(self, arm: str, reward: float):
        self.counts[arm] += 1
        n = self.counts[arm]
        self.values[arm] += (reward - self.values[arm]) / n


_bandit = EpsilonGreedyBandit()


# ─────────────────────────────────────────────────────────────
# COLLABORATIVE FILTERING
# ─────────────────────────────────────────────────────────────

async def _collaborative_filter(user_id: str, entity_type: str, limit: int = 20) -> list[str]:
    """
    Find similar users by activity overlap, return entity_ids they interacted
    with that the current user hasn't seen.
    """
    # Current user's seen entities
    user_acts = await user_activities_collection.find(
        {"user_id": user_id, "entity_type": entity_type},
        {"entity_id": 1}
    ).to_list(500)
    seen = {str(a["entity_id"]) for a in user_acts if a.get("entity_id")}

    # All recent activities for this entity type
    cutoff = datetime.utcnow() - timedelta(days=30)
    all_acts = await user_activities_collection.find(
        {"entity_type": entity_type, "created_at": {"$gte": cutoff}},
        {"user_id": 1, "entity_id": 1}
    ).to_list(5000)

    # Build user→entity matrix
    user_entities: dict[str, set] = defaultdict(set)
    for a in all_acts:
        uid = str(a["user_id"])
        eid = str(a.get("entity_id", ""))
        if eid:
            user_entities[uid].add(eid)

    current_set = user_entities.get(user_id, set())

    # Score other users by Jaccard similarity
    scores: dict[str, float] = {}
    for uid, entities in user_entities.items():
        if uid == user_id:
            continue
        intersection = len(current_set & entities)
        union = len(current_set | entities)
        if union > 0:
            scores[uid] = intersection / union

    # Collect unseen entities from top similar users
    top_users = sorted(scores, key=scores.get, reverse=True)[:10]
    candidates: dict[str, float] = defaultdict(float)
    for uid in top_users:
        for eid in user_entities[uid]:
            if eid not in seen:
                candidates[eid] += scores[uid]

    return sorted(candidates, key=candidates.get, reverse=True)[:limit]


# ─────────────────────────────────────────────────────────────
# CONTENT-BASED FILTERING
# ─────────────────────────────────────────────────────────────

async def _content_based_filter(
    user_id: str,
    collection_name: str,
    tag_field: str,
    limit: int = 20
) -> list[dict]:
    """Score items by cosine similarity to user's interest vector."""
    acts = await user_activities_collection.find(
        {"user_id": user_id},
        {"metadata": 1, "entity_type": 1, "created_at": 1}
    ).sort("created_at", -1).to_list(200)

    user_vec = _build_user_vector(acts)
    if not user_vec:
        # Cold start: return popular items
        items = await db[collection_name].find(
            {"status": {"$in": ["approved", "published", "active"]}},
            {"_id": 1, tag_field: 1, "title": 1}
        ).sort("views", -1).limit(limit).to_list(limit)
        return items

    items = await db[collection_name].find(
        {"status": {"$in": ["approved", "published", "active"]}},
        {"_id": 1, tag_field: 1, "title": 1, "views": 1}
    ).to_list(500)

    scored = []
    for item in items:
        tags = item.get(tag_field, [])
        if isinstance(tags, str):
            tags = [tags]
        item_vec = {t: 1.0 for t in tags}
        score = _cosine_similarity(user_vec, item_vec)
        # Boost popular items slightly
        popularity_boost = math.log1p(item.get("views", 0)) * 0.01
        scored.append((item, score + popularity_boost))

    scored.sort(key=lambda x: x[1], reverse=True)
    return [item for item, _ in scored[:limit]]


# ─────────────────────────────────────────────────────────────
# HYBRID SCORER
# ─────────────────────────────────────────────────────────────

def _hybrid_score(
    cf_ids: list[str],
    cb_items: list[dict],
    cf_weight: float = 0.4,
    cb_weight: float = 0.6
) -> list[str]:
    """Merge collaborative + content-based scores."""
    scores: dict[str, float] = defaultdict(float)

    for rank, eid in enumerate(cf_ids):
        scores[eid] += cf_weight * (1 / (rank + 1))

    for rank, item in enumerate(cb_items):
        eid = str(item["_id"])
        scores[eid] += cb_weight * (1 / (rank + 1))

    return sorted(scores, key=scores.get, reverse=True)


# ─────────────────────────────────────────────────────────────
# PUBLIC RECOMMENDATION FUNCTIONS
# ─────────────────────────────────────────────────────────────

async def recommend_courses(user_id: str, limit: int = 10) -> list[dict]:
    cf_ids = await _collaborative_filter(user_id, "course", limit * 2)
    cb_items = await _content_based_filter(user_id, "courses", "tags", limit * 2)
    merged = _hybrid_score(cf_ids, cb_items)

    # Apply bandit to pick final order
    selected = [_bandit.select(merged[i:i+3]) for i in range(0, min(len(merged), limit * 2), 3)]
    selected = list(dict.fromkeys(selected))[:limit]

    if not selected:
        return await db["courses"].find(
            {"status": "published"},
            {"_id": 1, "title": 1, "tags": 1, "thumbnail": 1, "level": 1}
        ).sort("views", -1).limit(limit).to_list(limit)

    from bson import ObjectId
    valid_ids = [ObjectId(i) for i in selected if ObjectId.is_valid(i)]
    return await db["courses"].find(
        {"_id": {"$in": valid_ids}},
        {"_id": 1, "title": 1, "tags": 1, "thumbnail": 1, "level": 1}
    ).to_list(limit)


async def recommend_challenges(user_id: str, limit: int = 10) -> list[dict]:
    user = await users_collection.find_one({"_id": user_id}, {"learning": 1})
    level = user.get("learning", {}).get("level", "beginner") if user else "beginner"

    cf_ids = await _collaborative_filter(user_id, "challenge", limit * 2)
    cb_items = await _content_based_filter(user_id, "challenges", "tags", limit * 2)
    merged = _hybrid_score(cf_ids, cb_items)[:limit]

    if not merged:
        return await db["challenges"].find(
            {"difficulty": level},
            {"_id": 1, "title": 1, "difficulty": 1, "tags": 1, "points": 1}
        ).limit(limit).to_list(limit)

    from bson import ObjectId
    valid_ids = [ObjectId(i) for i in merged if ObjectId.is_valid(i)]
    return await db["challenges"].find(
        {"_id": {"$in": valid_ids}},
        {"_id": 1, "title": 1, "difficulty": 1, "tags": 1, "points": 1}
    ).to_list(limit)


async def recommend_jobs(user_id: str, limit: int = 10) -> list[dict]:
    user = await users_collection.find_one(
        {"_id": user_id},
        {"professional.skills": 1, "location": 1}
    )
    skills = []
    location = {}
    if user:
        skills = [s["name"] for s in user.get("professional", {}).get("skills", [])]
        location = user.get("location", {})

    # Skills-based query
    query: dict[str, Any] = {"is_active": True}
    if skills:
        query["skills_required"] = {"$in": skills}

    cf_ids = await _collaborative_filter(user_id, "job", limit * 2)
    skill_jobs = await db["jobs"].find(
        query,
        {"_id": 1, "title": 1, "company_id": 1, "skills_required": 1, "salary": 1, "location": 1}
    ).sort("posted_date", -1).limit(limit * 2).to_list(limit * 2)

    cb_ids = [str(j["_id"]) for j in skill_jobs]
    merged = _hybrid_score(cf_ids, [{"_id": i} for i in cb_ids])[:limit]

    if not merged:
        return skill_jobs[:limit]

    from bson import ObjectId
    valid_ids = [ObjectId(i) for i in merged if ObjectId.is_valid(i)]
    return await db["jobs"].find(
        {"_id": {"$in": valid_ids}},
        {"_id": 1, "title": 1, "company_id": 1, "skills_required": 1, "salary": 1, "location": 1}
    ).to_list(limit)


async def recommend_templates(user_id: str, limit: int = 10) -> list[dict]:
    cf_ids = await _collaborative_filter(user_id, "template", limit * 2)
    cb_items = await _content_based_filter(user_id, "templates", "tags", limit * 2)
    merged = _hybrid_score(cf_ids, cb_items)[:limit]

    if not merged:
        return await db["templates"].find(
            {"status": "approved"},
            {"_id": 1, "title": 1, "category": 1, "tags": 1, "price": 1, "rating_average": 1}
        ).sort("downloads", -1).limit(limit).to_list(limit)

    from bson import ObjectId
    valid_ids = [ObjectId(i) for i in merged if ObjectId.is_valid(i)]
    return await db["templates"].find(
        {"_id": {"$in": valid_ids}},
        {"_id": 1, "title": 1, "category": 1, "tags": 1, "price": 1, "rating_average": 1}
    ).to_list(limit)


async def recommend_mentors(user_id: str, limit: int = 10) -> list[dict]:
    user = await users_collection.find_one(
        {"_id": user_id},
        {"professional.skills": 1, "learning.learning_goals": 1}
    )
    skills = []
    goals = []
    if user:
        skills = [s["name"] for s in user.get("professional", {}).get("skills", [])]
        goals = user.get("learning", {}).get("learning_goals", [])

    query: dict[str, Any] = {
        "role": {"$in": ["professional", "instructor"]},
        "is_active": True,
        "creator.verified": True,
    }
    if skills or goals:
        query["$or"] = [
            {"professional.skills.name": {"$in": skills}},
            {"learning.learning_goals": {"$in": goals}},
        ]

    mentors = await users_collection.find(
        query,
        {"_id": 1, "name": 1, "avatar": 1, "professional.title": 1,
         "professional.skills": 1, "creator.rating": 1}
    ).limit(limit * 2).to_list(limit * 2)

    # Score by skill overlap
    user_skill_set = set(skills)
    scored = []
    for m in mentors:
        m_skills = {s["name"] for s in m.get("professional", {}).get("skills", [])}
        overlap = len(user_skill_set & m_skills)
        rating = m.get("creator", {}).get("rating", 0)
        scored.append((m, overlap * 2 + rating))

    scored.sort(key=lambda x: x[1], reverse=True)
    return [m for m, _ in scored[:limit]]


async def record_recommendation_feedback(item_id: str, clicked: bool):
    """Update bandit reward based on user interaction."""
    reward = 1.0 if clicked else 0.0
    _bandit.update(item_id, reward)
