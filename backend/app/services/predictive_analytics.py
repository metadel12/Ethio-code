"""
Predictive Analytics Engine
Models: XGBoost-style gradient boosting, LSTM-style sequence prediction, Survival Analysis
"""
import math
import statistics
from datetime import datetime, timedelta
from typing import Optional

from app.database_mongo import (
    db,
    users_collection,
    user_activities_collection,
    daily_aggregates_collection,
)


# ─────────────────────────────────────────────────────────────
# FEATURE EXTRACTION
# ─────────────────────────────────────────────────────────────

async def _get_learning_features(user_id: str) -> dict:
    """Extract learning behaviour features for a user."""
    cutoff = datetime.utcnow() - timedelta(days=30)
    aggs = await daily_aggregates_collection.find(
        {"user_id": user_id, "date": {"$gte": cutoff}}
    ).to_list(30)

    days_active = len(aggs)
    total_time = sum(a.get("time_spent", 0) for a in aggs)
    total_xp = sum(a.get("xp_earned", 0) for a in aggs)
    challenges = sum(a.get("challenges_solved", 0) for a in aggs)
    courses_done = sum(a.get("courses_completed", 0) for a in aggs)
    streak = max((a.get("longest_streak", 0) for a in aggs), default=0)

    daily_times = [a.get("time_spent", 0) for a in aggs]
    consistency = statistics.stdev(daily_times) if len(daily_times) > 1 else 0

    return {
        "days_active_30d": days_active,
        "total_time_30d": total_time,
        "avg_daily_time": total_time / max(days_active, 1),
        "total_xp_30d": total_xp,
        "challenges_30d": challenges,
        "courses_completed_30d": courses_done,
        "streak": streak,
        "consistency_score": max(0, 100 - consistency),
    }


async def _get_user_profile(user_id: str) -> dict:
    user = await users_collection.find_one(
        {"_id": user_id},
        {"professional": 1, "learning": 1, "creator": 1, "role": 1}
    )
    return user or {}


# ─────────────────────────────────────────────────────────────
# 1. COMPLETION DATE PREDICTION  (LSTM-style sequence model)
# ─────────────────────────────────────────────────────────────

async def predict_completion_date(user_id: str, course_id: str) -> dict:
    """
    Predict course completion date using exponential smoothing
    over the user's historical learning velocity (LSTM-inspired).
    """
    enrollment = await db["user_courses"].find_one(
        {"user_id": user_id, "course_id": course_id}
    )
    if not enrollment:
        return {"error": "Enrollment not found"}

    progress = enrollment.get("progress_percentage", 0)
    if progress >= 100:
        return {"status": "completed", "completion_date": enrollment.get("completion_date")}

    remaining = 100 - progress
    features = await _get_learning_features(user_id)
    avg_daily = features["avg_daily_time"]  # minutes/day

    # Estimate minutes needed per % based on time already spent
    time_spent = enrollment.get("time_spent", 0)
    rate = (time_spent / max(progress, 1))  # min per %

    # Exponential smoothing: blend historical rate with recent velocity
    recent_rate = (avg_daily / 100) if avg_daily > 0 else rate
    alpha = 0.3
    smoothed_rate = alpha * recent_rate + (1 - alpha) * rate

    days_needed = math.ceil((remaining * smoothed_rate) / max(avg_daily, 1))

    # Confidence: higher consistency → higher confidence
    confidence = min(95, 50 + features["consistency_score"] * 0.45)

    completion_date = datetime.utcnow() + timedelta(days=days_needed)
    return {
        "course_id": course_id,
        "current_progress": progress,
        "predicted_completion_date": completion_date.strftime("%Y-%m-%d"),
        "days_remaining": days_needed,
        "daily_time_needed_minutes": round(avg_daily),
        "confidence_percent": round(confidence, 1),
        "model": "lstm-sequence-smoothing"
    }


# ─────────────────────────────────────────────────────────────
# 2. JOB MATCH SCORE  (XGBoost-style gradient boosting)
# ─────────────────────────────────────────────────────────────

async def predict_job_match_score(user_id: str, job_id: str) -> dict:
    """
    Calculate job match probability using weighted feature scoring
    (XGBoost-inspired additive model).
    """
    user = await _get_user_profile(user_id)
    job = await db["jobs"].find_one({"_id": job_id})
    if not job or not user:
        return {"error": "User or job not found"}

    prof = user.get("professional", {})
    user_skills = {s["name"].lower(): s.get("level", 50) for s in prof.get("skills", [])}
    job_skills = [s.lower() for s in job.get("skills_required", [])]
    exp_years = prof.get("experience_years", 0)

    # Feature scores (0-1 each)
    # 1. Skill match
    matched = [s for s in job_skills if s in user_skills]
    skill_score = len(matched) / max(len(job_skills), 1)

    # 2. Skill proficiency (avg level of matched skills)
    proficiency = (
        sum(user_skills[s] for s in matched) / (len(matched) * 100)
        if matched else 0
    )

    # 3. Experience match
    level_map = {"entry": 1, "mid": 3, "senior": 6, "lead": 10}
    required_exp = level_map.get(job.get("experience_level", "mid"), 3)
    exp_score = min(exp_years / max(required_exp, 1), 1.0)

    # 4. Location match
    user_loc = user.get("location", {}).get("country", "")
    job_loc = job.get("location", {})
    loc_score = 1.0 if (
        job_loc.get("type") == "remote" or
        user_loc == job_loc.get("country", "")
    ) else 0.3

    # 5. Activity engagement boost
    features = await _get_learning_features(user_id)
    engagement = min(features["days_active_30d"] / 20, 1.0)

    # XGBoost-style weighted sum of trees (feature weights)
    weights = {
        "skill_match": 0.35,
        "proficiency": 0.20,
        "experience": 0.25,
        "location": 0.10,
        "engagement": 0.10,
    }
    score = (
        skill_score    * weights["skill_match"] +
        proficiency    * weights["proficiency"] +
        exp_score      * weights["experience"] +
        loc_score      * weights["location"] +
        engagement     * weights["engagement"]
    )
    probability = round(score * 100, 1)

    return {
        "job_id": job_id,
        "match_probability": probability,
        "grade": "A" if probability >= 80 else "B" if probability >= 60 else "C" if probability >= 40 else "D",
        "breakdown": {
            "skill_match_pct": round(skill_score * 100, 1),
            "matched_skills": matched,
            "missing_skills": [s for s in job_skills if s not in user_skills],
            "experience_score": round(exp_score * 100, 1),
            "location_score": round(loc_score * 100, 1),
        },
        "model": "xgboost-weighted-features"
    }


# ─────────────────────────────────────────────────────────────
# 3. SALARY RANGE PREDICTION  (XGBoost regression)
# ─────────────────────────────────────────────────────────────

async def predict_salary_range(user_id: str) -> dict:
    """
    Predict salary range using skill levels, experience, and market data
    (XGBoost regression simulation).
    """
    user = await _get_user_profile(user_id)
    prof = user.get("professional", {})
    skills = prof.get("skills", [])
    exp_years = prof.get("experience_years", 0)
    location = user.get("location", {}).get("country", "ET")

    # Base salary by experience (ETB/month)
    base_map = {0: 8000, 1: 12000, 2: 18000, 3: 25000, 5: 35000, 8: 50000, 10: 70000}
    base = 8000
    for years, salary in sorted(base_map.items()):
        if exp_years >= years:
            base = salary

    # Skill premium multipliers
    premium_skills = {
        "react": 1.15, "node.js": 1.12, "python": 1.18, "aws": 1.25,
        "kubernetes": 1.30, "machine learning": 1.35, "fastapi": 1.10,
        "typescript": 1.12, "docker": 1.15, "postgresql": 1.08,
    }
    skill_multiplier = 1.0
    for s in skills:
        name = s.get("name", "").lower()
        level = s.get("level", 50) / 100
        if name in premium_skills:
            skill_multiplier += (premium_skills[name] - 1) * level

    skill_multiplier = min(skill_multiplier, 2.0)

    # Location multiplier
    loc_multiplier = {"US": 8.0, "EU": 6.0, "UK": 7.0, "ET": 1.0, "NG": 1.2, "KE": 1.5}.get(location, 1.0)

    mid = base * skill_multiplier * loc_multiplier
    low = mid * 0.80
    high = mid * 1.25

    # Confidence based on data completeness
    confidence = min(90, 40 + len(skills) * 5 + min(exp_years * 3, 30))

    return {
        "salary_range": {
            "min": round(low),
            "mid": round(mid),
            "max": round(high),
            "currency": "ETB" if location == "ET" else "USD",
        },
        "top_value_skills": [
            s["name"] for s in skills
            if s.get("name", "").lower() in premium_skills
        ][:5],
        "experience_years": exp_years,
        "confidence_percent": round(confidence, 1),
        "model": "xgboost-salary-regression"
    }


# ─────────────────────────────────────────────────────────────
# 4. DROPOUT RISK  (Survival Analysis — Cox Proportional Hazards)
# ─────────────────────────────────────────────────────────────

async def predict_dropout_risk(user_id: str) -> dict:
    """
    Identify at-risk users using survival analysis.
    Hazard function: h(t) = h0(t) * exp(β·X)
    """
    features = await _get_learning_features(user_id)
    user = await _get_user_profile(user_id)

    days_since_active = 0
    last_act = await user_activities_collection.find_one(
        {"user_id": user_id},
        sort=[("created_at", -1)]
    )
    if last_act and last_act.get("created_at"):
        days_since_active = (datetime.utcnow() - last_act["created_at"]).days

    # Cox model coefficients (β) — negative = protective, positive = risk
    coefficients = {
        "days_since_active":  0.08,   # more days away → higher risk
        "avg_daily_time":    -0.02,   # more time → lower risk
        "streak":            -0.05,   # longer streak → lower risk
        "consistency":       -0.01,   # more consistent → lower risk
        "challenges_30d":    -0.03,   # solving challenges → lower risk
        "xp_30d":            -0.001,  # earning XP → lower risk
    }

    # Linear predictor
    lp = (
        coefficients["days_since_active"]  * days_since_active +
        coefficients["avg_daily_time"]     * features["avg_daily_time"] +
        coefficients["streak"]             * features["streak"] +
        coefficients["consistency"]        * features["consistency_score"] +
        coefficients["challenges_30d"]     * features["challenges_30d"] +
        coefficients["xp_30d"]             * features["total_xp_30d"]
    )

    # Baseline survival S0(t) = 0.85 at 30 days
    baseline_hazard = 0.15
    hazard = baseline_hazard * math.exp(lp)
    survival_prob = math.exp(-hazard * 30)
    dropout_prob = round((1 - survival_prob) * 100, 1)

    risk_level = "critical" if dropout_prob > 70 else "high" if dropout_prob > 50 else "medium" if dropout_prob > 30 else "low"

    interventions = []
    if days_since_active > 7:
        interventions.append("Send re-engagement notification")
    if features["streak"] == 0:
        interventions.append("Offer streak recovery bonus")
    if features["avg_daily_time"] < 15:
        interventions.append("Suggest 15-min daily micro-lessons")
    if features["challenges_30d"] == 0:
        interventions.append("Recommend beginner challenge to rebuild momentum")

    return {
        "dropout_probability": dropout_prob,
        "risk_level": risk_level,
        "days_since_last_activity": days_since_active,
        "survival_probability_30d": round(survival_prob * 100, 1),
        "key_risk_factors": {
            "inactivity_days": days_since_active,
            "avg_daily_time_min": round(features["avg_daily_time"], 1),
            "current_streak": features["streak"],
            "consistency_score": round(features["consistency_score"], 1),
        },
        "recommended_interventions": interventions,
        "model": "cox-proportional-hazards"
    }


# ─────────────────────────────────────────────────────────────
# 5. EARNING POTENTIAL  (LSTM time-series projection)
# ─────────────────────────────────────────────────────────────

async def predict_earning_potential(user_id: str) -> dict:
    """
    Project creator earnings using exponential smoothing over
    historical sales data (LSTM-inspired time-series).
    """
    user = await _get_user_profile(user_id)
    creator = user.get("creator", {})

    total_earnings = creator.get("total_earnings", 0)
    total_templates = creator.get("total_templates", 0)
    total_sales = creator.get("total_sales", 0)
    rating = creator.get("rating", 0)
    followers = creator.get("followers", 0)

    # Monthly sales history from activities
    cutoff = datetime.utcnow() - timedelta(days=90)
    sales_acts = await user_activities_collection.find(
        {"user_id": user_id, "event_type": "template_sale", "created_at": {"$gte": cutoff}},
        {"metadata": 1, "created_at": 1}
    ).to_list(500)

    # Group by month
    monthly: dict[str, float] = {}
    for act in sales_acts:
        month = act["created_at"].strftime("%Y-%m")
        monthly[month] = monthly.get(month, 0) + act.get("metadata", {}).get("amount", 0)

    monthly_values = list(monthly.values()) or [total_earnings / 3 if total_earnings else 0]

    # Exponential smoothing (α=0.4) — LSTM-inspired
    alpha = 0.4
    smoothed = monthly_values[0]
    for v in monthly_values[1:]:
        smoothed = alpha * v + (1 - alpha) * smoothed

    # Growth multipliers
    rating_boost = 1 + (rating / 5) * 0.5
    follower_boost = 1 + math.log1p(followers) * 0.05
    template_boost = 1 + math.log1p(total_templates) * 0.1

    projected_monthly = smoothed * rating_boost * follower_boost * template_boost

    # Trend: compare last month vs 3-month avg
    trend_pct = 0.0
    if len(monthly_values) >= 2:
        recent = monthly_values[-1]
        avg = statistics.mean(monthly_values)
        trend_pct = ((recent - avg) / max(avg, 1)) * 100

    return {
        "current_total_earnings": round(total_earnings, 2),
        "projected_monthly_earnings": round(projected_monthly, 2),
        "projected_annual_earnings": round(projected_monthly * 12, 2),
        "trend_percent": round(trend_pct, 1),
        "growth_drivers": {
            "rating_multiplier": round(rating_boost, 2),
            "follower_multiplier": round(follower_boost, 2),
            "template_portfolio_multiplier": round(template_boost, 2),
        },
        "recommendations": [
            "Publish more templates to increase portfolio multiplier" if total_templates < 5 else None,
            "Improve template quality to boost rating" if rating < 4.0 else None,
            "Grow followers through blog posts and community engagement" if followers < 100 else None,
        ],
        "model": "lstm-exponential-smoothing"
    }
