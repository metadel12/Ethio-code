from datetime import datetime
import uuid
from typing import Any

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect

from app.database import db

router = APIRouter(prefix="/video-chat", tags=["Video Chat"])

memory_sessions: dict[str, dict[str, Any]] = {}
memory_device_tests: list[dict[str, Any]] = []
memory_history: list[dict[str, Any]] = []
memory_interviews: list[dict[str, Any]] = []


def now_iso() -> str:
    return datetime.utcnow().isoformat()


def public_user(data: dict | None = None) -> dict:
    data = data or {}
    user_id = data.get("user_id") or f"guest-{uuid.uuid4().hex[:8]}"
    return {
        "user_id": str(user_id),
        "user_name": data.get("user_name") or data.get("name") or "Guest",
        "user_email": data.get("user_email") or data.get("email") or "",
    }


def clean_document(document):
    if isinstance(document, list):
        return [clean_document(item) for item in document]
    if isinstance(document, dict):
        return {key: clean_document(value) for key, value in document.items()}
    if hasattr(document, "__str__") and document.__class__.__name__ == "ObjectId":
        return str(document)
    if isinstance(document, datetime):
        return document.isoformat()
    return document


async def try_insert(collection: str, document: dict):
    try:
        result = await getattr(db, collection).insert_one(document)
        document["_id"] = str(result.inserted_id)
        return True
    except Exception:
        return False


async def try_find_one(collection: str, query: dict):
    try:
        return clean_document(await getattr(db, collection).find_one(query))
    except Exception:
        return None


async def try_update_one(collection: str, query: dict, update: dict):
    try:
        await getattr(db, collection).update_one(query, update)
        return True
    except Exception:
        return False


class ConnectionManager:
    def __init__(self):
        self.rooms: dict[str, dict[str, WebSocket]] = {}
        self.users: dict[str, dict[str, dict[str, Any]]] = {}

    async def connect(self, websocket: WebSocket, room_id: str, user_id: str, user_name: str):
        await websocket.accept()
        self.rooms.setdefault(room_id, {})[user_id] = websocket
        self.users.setdefault(room_id, {})[user_id] = {
            "user_id": user_id,
            "user_name": user_name,
            "role": "participant",
            "is_video_on": True,
            "is_audio_on": True,
            "is_screen_sharing": False,
            "connection_quality": "good",
            "joined_at": now_iso(),
        }
        await websocket.send_json({
            "type": "room-users",
            "users": list(self.users.get(room_id, {}).values()),
        })
        await self.broadcast({
            "type": "user-joined",
            "user": self.users[room_id][user_id],
        }, room_id, exclude_user_id=user_id)

    def disconnect(self, room_id: str, user_id: str):
        self.rooms.get(room_id, {}).pop(user_id, None)
        self.users.get(room_id, {}).pop(user_id, None)
        if not self.rooms.get(room_id):
            self.rooms.pop(room_id, None)
            self.users.pop(room_id, None)

    async def send_to(self, room_id: str, target_id: str, message: dict):
        connection = self.rooms.get(room_id, {}).get(target_id)
        if connection:
            await connection.send_json(message)

    async def broadcast(self, message: dict, room_id: str, exclude_user_id: str | None = None):
        stale = []
        for user_id, connection in self.rooms.get(room_id, {}).items():
            if user_id == exclude_user_id:
                continue
            try:
                await connection.send_json(message)
            except Exception:
                stale.append(user_id)
        for user_id in stale:
            self.disconnect(room_id, user_id)


manager = ConnectionManager()


@router.post("/sessions/create")
async def create_session(session_data: dict):
    user = public_user(session_data)
    session_id = session_data.get("session_id") or uuid.uuid4().hex[:8]
    settings = {
        "max_participants": session_data.get("max_participants", 50),
        "recording_enabled": bool(session_data.get("recording_enabled", False)),
        "chat_enabled": True,
        "screen_sharing_enabled": True,
        "waiting_room_enabled": bool(session_data.get("waiting_room_enabled", False)),
        "require_approval": False,
        "mute_on_join": bool(session_data.get("mute_on_join", False)),
        "video_off_on_join": bool(session_data.get("video_off_on_join", False)),
        "encryption_type": "webrtc-srtp",
    }
    session = {
        "session_id": session_id,
        "title": session_data.get("title", "EthioCode Video Call"),
        "description": session_data.get("description", ""),
        "type": session_data.get("type", "one-on-one"),
        "status": "scheduled",
        "host_id": user["user_id"],
        "host_name": user["user_name"],
        "participants": [{
            **user,
            "role": "host",
            "joined_at": now_iso(),
            "left_at": None,
            "is_video_on": not settings["video_off_on_join"],
            "is_audio_on": not settings["mute_on_join"],
            "is_screen_sharing": False,
            "connection_quality": "good",
            "device_info": session_data.get("device_info", {}),
        }],
        "scheduled_start": session_data.get("scheduled_start") or now_iso(),
        "scheduled_end": session_data.get("scheduled_end"),
        "actual_start": None,
        "actual_end": None,
        "duration_minutes": 0,
        "settings": settings,
        "recordings": [],
        "chat_messages": [],
        "shared_files": [],
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }
    persisted = await try_insert("video_sessions", session)
    memory_sessions[session_id] = clean_document(session)
    return {
        "session_id": session_id,
        "meeting_link": f"/video-chat/join/{session_id}",
        "persisted": persisted,
        "session": clean_document(session),
    }


@router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    session = await try_find_one("video_sessions", {"session_id": session_id}) or memory_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.post("/sessions/{session_id}/join")
async def join_session(session_id: str, join_data: dict):
    session = await try_find_one("video_sessions", {"session_id": session_id}) or memory_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.get("status") not in {"scheduled", "active"}:
        raise HTTPException(status_code=400, detail="Session is not available")
    if len(session.get("participants", [])) >= session.get("settings", {}).get("max_participants", 50):
        raise HTTPException(status_code=400, detail="Session is full")

    user = public_user(join_data)
    participant = {
        **user,
        "role": join_data.get("role", "participant"),
        "joined_at": now_iso(),
        "left_at": None,
        "is_video_on": not session.get("settings", {}).get("video_off_on_join", False),
        "is_audio_on": not session.get("settings", {}).get("mute_on_join", False),
        "is_screen_sharing": False,
        "connection_quality": "good",
        "device_info": join_data.get("device_info", {}),
    }
    await try_update_one(
        "video_sessions",
        {"session_id": session_id},
        {"$set": {"status": "active", "actual_start": session.get("actual_start") or now_iso()}, "$push": {"participants": participant}},
    )
    if session_id in memory_sessions:
        memory_sessions[session_id]["status"] = "active"
        existing_ids = {item.get("user_id") for item in memory_sessions[session_id].get("participants", [])}
        if participant["user_id"] not in existing_ids:
            memory_sessions[session_id].setdefault("participants", []).append(participant)
    return {"message": "Joined successfully", "user": user, "session": memory_sessions.get(session_id, session)}


@router.post("/sessions/{session_id}/leave")
async def leave_session(session_id: str, body: dict):
    user_id = str(body.get("user_id", "guest"))
    await try_update_one(
        "video_sessions",
        {"session_id": session_id, "participants.user_id": user_id},
        {"$set": {"participants.$.left_at": now_iso(), "updated_at": now_iso()}},
    )
    if session_id in memory_sessions:
        for participant in memory_sessions[session_id].get("participants", []):
            if participant.get("user_id") == user_id:
                participant["left_at"] = now_iso()
    return {"message": "Left session"}


@router.get("/sessions/active/list")
async def active_sessions():
    try:
        sessions = await db.video_sessions.find({"status": {"$in": ["scheduled", "active"]}}).to_list(length=50)
        return clean_document(sessions)
    except Exception:
        return list(memory_sessions.values())


@router.post("/device-test")
async def save_device_test(test_data: dict):
    result = {
        "user_id": str(test_data.get("user_id", "guest")),
        "camera_working": bool(test_data.get("camera_working", False)),
        "microphone_working": bool(test_data.get("microphone_working", False)),
        "speakers_working": bool(test_data.get("speakers_working", False)),
        "camera_devices": test_data.get("camera_devices", []),
        "microphone_devices": test_data.get("microphone_devices", []),
        "bandwidth_mbps": float(test_data.get("bandwidth_mbps", test_data.get("bandwidth", 0)) or 0),
        "latency_ms": int(test_data.get("latency_ms", test_data.get("latency", 0)) or 0),
        "test_duration": int(test_data.get("test_duration", 0) or 0),
        "created_at": now_iso(),
    }
    persisted = await try_insert("device_test_results", result)
    memory_device_tests.append(clean_document(result))
    return {"message": "Test results saved", "persisted": persisted, "result": clean_document(result)}


@router.get("/device-test/latest/{user_id}")
async def latest_device_test(user_id: str):
    try:
        test = await db.device_test_results.find_one({"user_id": user_id}, sort=[("created_at", -1)])
        return clean_document(test or {})
    except Exception:
        matches = [item for item in memory_device_tests if item.get("user_id") == user_id]
        return matches[-1] if matches else {}


@router.post("/interviews/schedule")
async def schedule_interview(interview_data: dict):
    session_response = await create_session({
        "title": f"Interview: {interview_data.get('title', 'Candidate Call')}",
        "type": "interview",
        "user_name": interview_data.get("interviewer_name", "Interviewer"),
        "user_email": interview_data.get("interviewer_email", ""),
        "max_participants": 3,
        "recording_enabled": True,
    })
    interview = {
        "title": interview_data.get("title", "Interview"),
        "description": interview_data.get("description", ""),
        "interviewer_id": str(interview_data.get("interviewer_id", "interviewer")),
        "candidate_id": str(interview_data.get("candidate_id", "candidate")),
        "candidate_email": interview_data.get("candidate_email", ""),
        "session_id": session_response["session_id"],
        "scheduled_time": interview_data.get("scheduled_time") or now_iso(),
        "duration_minutes": int(interview_data.get("duration_minutes", 60)),
        "meeting_link": session_response["meeting_link"],
        "status": "scheduled",
        "reminder_sent": False,
        "feedback": {},
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }
    persisted = await try_insert("scheduled_interviews", interview)
    memory_interviews.append(clean_document(interview))
    return {"persisted": persisted, "interview": clean_document(interview)}


@router.get("/interviews/upcoming")
async def upcoming_interviews():
    try:
        interviews = await db.scheduled_interviews.find({"status": "scheduled"}).to_list(length=20)
        return clean_document(interviews)
    except Exception:
        return memory_interviews[-20:]


@router.get("/history")
async def call_history():
    try:
        history = await db.user_call_history.find({}).sort("started_at", -1).to_list(length=50)
        return clean_document(history)
    except Exception:
        return memory_history[-50:]


@router.websocket("/ws/{session_id}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str, user_id: str, user_name: str = "Guest"):
    await manager.connect(websocket, session_id, user_id, user_name)
    try:
        while True:
            data = await websocket.receive_json()
            data_type = data.get("type")
            target_id = data.get("target_id")
            message = {**data, "from": user_id}

            if data_type in {"offer", "answer", "ice-candidate"} and target_id:
                await manager.send_to(session_id, target_id, message)
            elif data_type == "chat-message":
                chat_message = {
                    "user_id": user_id,
                    "user_name": data.get("user_name", user_name),
                    "message": data.get("message", ""),
                    "timestamp": now_iso(),
                    "is_private": bool(data.get("is_private", False)),
                    "recipient_id": data.get("recipient_id"),
                }
                await try_update_one("video_sessions", {"session_id": session_id}, {"$push": {"chat_messages": chat_message}})
                if session_id in memory_sessions:
                    memory_sessions[session_id].setdefault("chat_messages", []).append(chat_message)
                await manager.broadcast({"type": "chat-message", **chat_message}, session_id)
            elif data_type == "user-media-status":
                if user_id in manager.users.get(session_id, {}):
                    manager.users[session_id][user_id]["is_video_on"] = bool(data.get("video_on", True))
                    manager.users[session_id][user_id]["is_audio_on"] = bool(data.get("audio_on", True))
                await manager.broadcast({
                    "type": "user-media-status",
                    "user_id": user_id,
                    "video_on": data.get("video_on", True),
                    "audio_on": data.get("audio_on", True),
                }, session_id)
            elif data_type == "screen-sharing":
                if user_id in manager.users.get(session_id, {}):
                    manager.users[session_id][user_id]["is_screen_sharing"] = bool(data.get("sharing", False))
                await manager.broadcast({"type": "screen-sharing", "user_id": user_id, "sharing": data.get("sharing", False)}, session_id)
            elif data_type in {"typing", "raise-hand", "recording", "connection-quality", "file-shared"}:
                await manager.broadcast(message, session_id, exclude_user_id=None if data_type == "raise-hand" else user_id)
            else:
                await manager.broadcast(message, session_id, exclude_user_id=user_id)
    except WebSocketDisconnect:
        manager.disconnect(session_id, user_id)
        await manager.broadcast({"type": "user-left", "user_id": user_id}, session_id)
