"""
Intelligent Insights Engine
5 insight types: daily, skill-gaps, learning-path, time-optimization, peer-comparison
"""
import statistics
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Optional

from app.database_mongo import (
    db,
    users_collection,
    user_activities_collection,
    daily_aggregates_collection,
)


# ─────────────────────────────────────────────────────────────
# SHARED HELPERS
# ─────────────────────────────────────────────────────────────

async def _aggs(user_id: str, days: int = 30) -> list[dict]:
    cutoff = datetime.utcnow() - timedelta(days=days)
    return await daily_aggregates_collection.find(
        {"user_id": user_id, "date": {"$gte": cutoff}}
    ).sort("date", 1).to_list(days)


async def _user(user_id: str) -> dict:
    return await users_collection.find_one({"_id": user_id}) or {}


async def _activities(user_id: str, days: int = 30) -> list[dict]:
    cutoff = datetime.utcnow() - timedelta(days=days)
    return await user_activities_collection.find(
        {"user_id": user_id, "created_at": {"$gte": cutoff}}
    ).sort("created_at", -1).to_list(500)


# ─────────────────────────────────────────────────────────────
# 1. DAILY PERSONALIZED INSIGHTS
# ─────────────────────────────────────────────────────────────

async def get_daily_insights(user_id: str) -> dict:
    agg_list = await _aggs(user_id, 7)
    user = await _user(user_id)
    acts = await _activities(user_id, 1)

    today_agg = agg_list[-1] if agg_list else {}
    yesterday_agg = agg_list[-2] if len(agg_list) >= 2 else {}

    xp_today = today_agg.get("xp_earned", 0)
    xp_yesterday = yesterday_agg.get("xp_earned", 0)
    time_today = today_agg.get("time_spent", 0)
    streak = today_agg.get("longest_streak", user.get("learning", {}).get("learning_streak", 0))
    weekly_goal = user.get("learning", {}).get("weekly_goal_hours", 10) * 60
    weekly_time = sum(a.get("time_spent", 0) for a in agg_list)
    goal_pct = round(min(weekly_time / max(weekly_goal, 1) * 100, 100), 1)

    # Motivational message
    if streak >= 7:
        motivation = f"🔥 {streak}-day streak! You're unstoppable!"
    elif xp_today > xp_yesterday:
        motivation = f"📈 You earned {xp_today} XP today — better than yesterday!"
    elif time_today == 0:
        motivation = "👋 You haven't started today yet. Even 15 minutes counts!"
    else:
        motivation = "💪 Keep going — consistency beats intensity!"

    # Today's focus areas from recent activity tags
    tag_freq: dict[str, int] = defaultdict(int)
    for a in acts:
        for tag in a.get("metadata", {}).get("tags", []):
            tag_freq[tag] += 1
    focus_areas = sorted(tag_freq, key=tag_freq.get, reverse=True)[:3]

    # Quick wins
    quick_wins = []
    if today_agg.get("challenges_solved", 0) == 0:
        quick_wins.append({"action": "Solve 1 challenge", "xp_reward": 50, "time_min": 15})
    if today_agg.get("courses_completed", 0) == 0:
        quick_wins.append({"action": "Complete 1 lesson", "xp_reward": 30, "time_min": 20})
    if streak < 3:
        quick_wins.append({"action": "Log in tomorrow to build streak", "xp_reward": 20, "time_min": 5})

    return {
        "date": datetime.utcnow().strftime("%Y-%m-%d"),
        "greeting": f"Good {'morning' if datetime.utcnow().hour < 12 else 'afternoon' if datetime.utcnow().hour < 17 else 'evening'}!",
        "motivation": motivation,
        "stats": {
            "xp_today": xp_today,
            "xp_change_vs_yesterday": xp_today - xp_yesterday,
            "time_today_min": time_today,
            "streak_days": streak,
            "weekly_goal_progress_pct": goal_pct,
        },
        "focus_areas": focus_areas,
        "quick_wins": quick_wins[:3],
        "insight": "You learn best in short focused sessions. Try 3×20 min today." if time_today < 30 else "Great session length! Keep it up.",
    }


# ─────────────────────────────────────────────────────────────
# 2. SKILL GAP ANALYSIS
# ─────────────────────────────────────────────────────────────

# Market demand weights per skill (higher = more in-demand)
MARKET_DEMAND = {
    "python": 95, "javascript": 93, "react": 90, "node.js": 88,
    "typescript": 87, "aws": 92, "docker": 85, "kubernetes": 83,
    "postgresql": 80, "mongodb": 78, "fastapi": 75, "machine learning": 90,
    "git": 85, "linux": 82, "rest api": 80, "graphql": 72,
    "redis": 70, "ci/cd": 78, "terraform": 75, "next.js": 82,
}

async def get_skill_gaps(user_id: str) -> dict:
    user = await _user(user_id)
    prof = user.get("professional", {})
    user_skills = {s["name"].lower(): s.get("level", 0) for s in prof.get("skills", [])}
    role = user.get("role", "developer")
    goals = user.get("learning", {}).get("learning_goals", [])

    # Role-based required skills
    role_skills = {
        "developer":    ["python", "javascript", "git", "rest api", "postgresql"],
        "professional": ["python", "aws", "docker", "ci/cd", "typescript"],
        "creator":      ["javascript", "react", "next.js", "git", "rest api"],
        "freelancer":   ["javascript", "react", "node.js", "postgresql", "git"],
        "founder":      ["python", "aws", "postgresql", "rest api", "docker"],
        "enterprise":   ["aws", "kubernetes", "terraform", "ci/cd", "docker"],
        "instructor":   ["python", "javascript", "git", "rest api", "postgresql"],
        "recruiter":    ["rest api", "postgresql", "git", "javascript", "python"],
        "admin":        ["python", "postgresql", "redis", "docker", "linux"],
    }
    required = role_skills.get(role, role_skills["developer"])

    gaps = []
    for skill in required:
        user_level = user_skills.get(skill, 0)
        demand = MARKET_DEMAND.get(skill, 70)
        if user_level < 70:
            gaps.append({
                "skill": skill,
                "current_level": user_level,
                "target_level": 80,
                "gap": 80 - user_level,
                "market_demand": demand,
                "priority": "high" if demand >= 85 else "medium" if demand >= 75 else "low",
                "estimated_hours": round((80 - user_level) * 0.5),
            })

    gaps.sort(key=lambda x: x["market_demand"], reverse=True)

    # Strengths
    strengths = [
        {"skill": k, "level": v, "market_demand": MARKET_DEMAND.get(k, 60)}
        for k, v in user_skills.items() if v >= 70
    ]
    strengths.sort(key=lambda x: x["market_demand"], reverse=True)

    return {
        "role": role,
        "total_skills": len(user_skills),
        "skill_gaps": gaps[:10],
        "strengths": strengths[:5],
        "gap_summary": {
            "high_priority": len([g for g in gaps if g["priority"] == "high"]),
            "medium_priority": len([g for g in gaps if g["priority"] == "medium"]),
            "total_hours_to_close": sum(g["estimated_hours"] for g in gaps),
        },
        "next_skill_to_learn": gaps[0]["skill"] if gaps else None,
    }


# ─────────────────────────────────────────────────────────────
# 3. OPTIMAL LEARNING PATH
# ─────────────────────────────────────────────────────────────

SKILL_PREREQUISITES = {
    "react":          ["javascript", "html5", "css3"],
    "next.js":        ["react", "javascript"],
    "node.js":        ["javascript"],
    "fastapi":        ["python", "rest api"],
    "kubernetes":     ["docker", "linux"],
    "terraform":      ["aws", "linux"],
    "machine learning": ["python", "postgresql"],
    "graphql":        ["rest api", "javascript"],
    "typescript":     ["javascript"],
    "ci/cd":          ["git", "docker"],
    "redis":          ["postgresql"],
    "aws":            ["linux", "rest api"],
}

async def get_learning_path(user_id: str) -> dict:
    user = await _user(user_id)
    prof = user.get("professional", {})
    user_skills = {s["name"].lower(): s.get("level", 0) for s in prof.get("skills", [])}
    goals = user.get("learning", {}).get("learning_goals", [])
    weekly_hours = user.get("learning", {}).get("weekly_goal_hours", 5)

    # Get skill gaps
    gaps_data = await get_skill_gaps(user_id)
    gap_skills = [g["skill"] for g in gaps_data["skill_gaps"]]

    # Topological sort respecting prerequisites
    def resolve_order(skills: list[str]) -> list[str]:
        ordered = []
        visited = set()

        def visit(skill):
            if skill in visited:
                return
            visited.add(skill)
            for prereq in SKILL_PREREQUISITES.get(skill, []):
                if prereq not in user_skills or user_skills[prereq] < 50:
                    visit(prereq)
            ordered.append(skill)

        for s in skills:
            visit(s)
        return ordered

    path_skills = resolve_order(gap_skills[:8])

    # Build phases (group by weeks)
    phases = []
    week = 1
    for i, skill in enumerate(path_skills):
        hours = MARKET_DEMAND.get(skill, 70) * 0.3
        weeks_needed = max(1, round(hours / max(weekly_hours, 1)))
        phases.append({
            "phase": i + 1,
            "skill": skill,
            "start_week": week,
            "duration_weeks": weeks_needed,
            "hours_required": round(hours),
            "prerequisites_met": all(
                user_skills.get(p, 0) >= 50
                for p in SKILL_PREREQUISITES.get(skill, [])
            ),
            "resources": {
                "docs": f"https://google.com/search?q={skill}+documentation",
                "practice": f"https://exercism.org/tracks/{skill.replace(' ', '-')}",
            }
        })
        week += weeks_needed

    total_weeks = week - 1
    return {
        "user_level": user.get("learning", {}).get("level", "beginner"),
        "weekly_commitment_hours": weekly_hours,
        "total_duration_weeks": total_weeks,
        "estimated_completion": (datetime.utcnow() + timedelta(weeks=total_weeks)).strftime("%Y-%m-%d"),
        "path": phases,
        "milestones": [
            {"week": total_weeks // 4,      "title": "Foundation Complete 🏗️"},
            {"week": total_weeks // 2,      "title": "Mid-Path Achievement 🎯"},
            {"week": total_weeks * 3 // 4,  "title": "Advanced Skills Unlocked 🚀"},
            {"week": total_weeks,           "title": "Learning Path Complete 🏆"},
        ],
    }


# ─────────────────────────────────────────────────────────────
# 4. TIME OPTIMIZATION
# ─────────────────────────────────────────────────────────────

async def get_time_optimization(user_id: str) -> dict:
    acts = await _activities(user_id, 60)

    # Bucket activities by hour of day and day of week
    hour_xp: dict[int, list[float]] = defaultdict(list)
    dow_xp: dict[int, list[float]] = defaultdict(list)
    hour_time: dict[int, list[int]] = defaultdict(list)

    for a in acts:
        ts = a.get("created_at")
        if not ts:
            continue
        xp = a.get("metadata", {}).get("xp", 0)
        duration = a.get("metadata", {}).get("duration_min", 0)
        hour_xp[ts.hour].append(xp)
        dow_xp[ts.weekday()].append(xp)
        hour_time[ts.hour].append(duration)

    # Best hours by avg XP
    hour_scores = {
        h: statistics.mean(vals) for h, vals in hour_xp.items() if vals
    }
    best_hours = sorted(hour_scores, key=hour_scores.get, reverse=True)[:3]

    # Best days
    dow_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    dow_scores = {
        dow_names[d]: statistics.mean(vals)
        for d, vals in dow_xp.items() if vals
    }
    best_days = sorted(dow_scores, key=dow_scores.get, reverse=True)[:3]

    # Session length analysis
    all_durations = [d for durs in hour_time.values() for d in durs if d > 0]
    optimal_session = round(statistics.median(all_durations)) if all_durations else 25

    # Productivity windows
    def label_hour(h: int) -> str:
        if 5 <= h < 9:   return "Early Morning"
        if 9 <= h < 12:  return "Morning"
        if 12 <= h < 14: return "Midday"
        if 14 <= h < 18: return "Afternoon"
        if 18 <= h < 22: return "Evening"
        return "Night"

    windows = {}
    for h in best_hours:
        label = label_hour(h)
        windows[label] = windows.get(label, 0) + 1

    best_window = max(windows, key=windows.get) if windows else "Morning"

    return {
        "best_study_hours": [f"{h:02d}:00" for h in best_hours],
        "best_study_days": best_days,
        "best_productivity_window": best_window,
        "optimal_session_length_min": optimal_session,
        "recommendations": [
            f"Schedule your hardest topics during {best_window} when you're most productive.",
            f"Aim for {optimal_session}-minute focused sessions with 5-min breaks.",
            f"Your best days are {', '.join(best_days[:2])} — plan deep work then.",
            "Avoid multitasking — single-topic sessions yield 40% better retention.",
        ],
        "weekly_schedule_suggestion": {
            day: f"Study {optimal_session} min at {best_hours[0]:02d}:00"
            if day in best_days else "Light review or rest"
            for day in dow_names
        },
        "data_points_analyzed": len(acts),
    }


# ─────────────────────────────────────────────────────────────
# 5. PEER COMPARISON
# ─────────────────────────────────────────────────────────────

async def get_peer_comparison(user_id: str) -> dict:
    user = await _user(user_id)
    role = user.get("role", "developer")
    level = user.get("learning", {}).get("level", "beginner")
    user_xp = user.get("learning", {}).get("xp_points", 0)
    user_streak = user.get("learning", {}).get("learning_streak", 0)

    # Find peers (same role + level, limit 100)
    peers = await users_collection.find(
        {"role": role, "learning.level": level, "_id": {"$ne": user_id}},
        {"learning.xp_points": 1, "learning.learning_streak": 1,
         "learning.total_hours": 1, "professional.skills": 1}
    ).limit(100).to_list(100)

    if not peers:
        return {"message": "Not enough peers for comparison yet.", "peer_count": 0}

    peer_xp = [p.get("learning", {}).get("xp_points", 0) for p in peers]
    peer_streaks = [p.get("learning", {}).get("learning_streak", 0) for p in peers]
    peer_hours = [p.get("learning", {}).get("total_hours", 0) for p in peers]
    peer_skill_counts = [len(p.get("professional", {}).get("skills", [])) for p in peers]

    def percentile(value: float, data: list[float]) -> float:
        if not data:
            return 0
        below = sum(1 for x in data if x < value)
        return round(below / len(data) * 100, 1)

    xp_pct = percentile(user_xp, peer_xp)
    streak_pct = percentile(user_streak, peer_streaks)
    user_hours = user.get("learning", {}).get("total_hours", 0)
    hours_pct = percentile(user_hours, peer_hours)
    user_skill_count = len(user.get("professional", {}).get("skills", []))
    skills_pct = percentile(user_skill_count, peer_skill_counts)

    overall_pct = round(statistics.mean([xp_pct, streak_pct, hours_pct, skills_pct]), 1)

    avg_xp = round(statistics.mean(peer_xp)) if peer_xp else 0
    avg_streak = round(statistics.mean(peer_streaks)) if peer_streaks else 0

    insights = []
    if xp_pct < 50:
        insights.append(f"Your XP is below average. Peers earn ~{avg_xp} XP — try solving more challenges.")
    else:
        insights.append(f"Your XP is in the top {100 - xp_pct:.0f}% of {role}s at your level! 🎉")
    if streak_pct < 40:
        insights.append(f"Your streak ({user_streak} days) is below peers ({avg_streak} days avg). Daily consistency is key.")
    if skills_pct > 70:
        insights.append(f"You have more skills than {skills_pct}% of your peers — great portfolio!")

    return {
        "peer_group": {"role": role, "level": level, "peer_count": len(peers)},
        "your_percentiles": {
            "xp": xp_pct,
            "streak": streak_pct,
            "total_hours": hours_pct,
            "skill_count": skills_pct,
            "overall": overall_pct,
        },
        "peer_averages": {
            "xp": avg_xp,
            "streak": avg_streak,
            "total_hours": round(statistics.mean(peer_hours)) if peer_hours else 0,
            "skill_count": round(statistics.mean(peer_skill_counts)) if peer_skill_counts else 0,
        },
        "your_stats": {
            "xp": user_xp,
            "streak": user_streak,
            "total_hours": user_hours,
            "skill_count": user_skill_count,
        },
        "rank": f"Top {100 - overall_pct:.0f}%" if overall_pct > 0 else "Unranked",
        "insights": insights,
    }
