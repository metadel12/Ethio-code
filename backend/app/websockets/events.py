"""
Real-time event emitter — call these from any API endpoint or background task.
"""
from app.websockets.connection_manager import manager


async def emit_notification(user_id: str, notification: dict):
    await manager.send_to_user(user_id, "notification:new", notification)


async def emit_activity(user_id: str, activity: dict):
    await manager.send_to_user(user_id, "activity:new", activity)


async def emit_xp_update(user_id: str, new_xp: int, gained: int):
    await manager.send_to_user(user_id, "xp:update", {
        "newXP": new_xp,
        "gained": gained,
    })


async def emit_badge_earned(user_id: str, badge: dict):
    await manager.send_to_user(user_id, "badge:earned", badge)


async def emit_application_status(user_id: str, application: dict):
    await manager.send_to_user(user_id, "application:status-update", application)


async def emit_purchase(user_id: str, purchase: dict):
    await manager.send_to_user(user_id, "purchase:new", purchase)


async def emit_comment(user_id: str, comment: dict):
    await manager.send_to_user(user_id, "comment:new", comment)


async def emit_leaderboard_update(leaderboard: list):
    await manager.broadcast("leaderboard:update", {"leaderboard": leaderboard})


async def emit_live_count():
    await manager.broadcast_live_count()
