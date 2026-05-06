import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.core.auth import decode_access_token
from app.websockets.connection_manager import manager
from app.websockets.events import emit_live_count

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...)
):
    # Authenticate via token query param
    try:
        payload = decode_access_token(token)
        user_id = str(payload.get("user_id", payload.get("sub", "anonymous")))
    except Exception:
        await websocket.accept()
        await websocket.close(code=4001)
        return

    await manager.connect(websocket, user_id)
    await emit_live_count()

    # Send welcome event
    await manager.send_to_user(user_id, "connect", {
        "user_id": user_id,
        "online_users": manager.online_count,
        "message": "Connected to EthioCode real-time server"
    })

    try:
        while True:
            try:
                raw = await websocket.receive_text()
            except WebSocketDisconnect:
                break
            try:
                msg = json.loads(raw)
                event = msg.get("event", "")
                if event == "ping":
                    await manager.send_to_user(user_id, "pong", {"ts": msg.get("ts")})
            except json.JSONDecodeError:
                pass

    except Exception:
        pass
    finally:
        manager.disconnect(websocket, user_id)
        await emit_live_count()
