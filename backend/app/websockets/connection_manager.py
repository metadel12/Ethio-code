import asyncio
import json
from datetime import datetime
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # user_id -> list of websockets (multi-tab support)
        self._user_connections: dict[str, list[WebSocket]] = {}
        # all active websockets
        self._all: list[WebSocket] = []

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self._all.append(websocket)
        self._user_connections.setdefault(user_id, []).append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        self._all = [ws for ws in self._all if ws != websocket]
        conns = self._user_connections.get(user_id, [])
        self._user_connections[user_id] = [ws for ws in conns if ws != websocket]
        if not self._user_connections[user_id]:
            del self._user_connections[user_id]

    @property
    def online_count(self) -> int:
        return len(self._user_connections)

    @property
    def online_users(self) -> list[str]:
        return list(self._user_connections.keys())

    async def send_to_user(self, user_id: str, event: str, data: dict):
        payload = json.dumps({"event": event, "data": data, "ts": datetime.utcnow().isoformat()})
        dead = []
        for ws in self._user_connections.get(user_id, []):
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self._user_connections[user_id] = [
                w for w in self._user_connections.get(user_id, []) if w != ws
            ]

    async def broadcast(self, event: str, data: dict):
        payload = json.dumps({"event": event, "data": data, "ts": datetime.utcnow().isoformat()})
        dead = []
        for ws in list(self._all):
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append(ws)
        self._all = [ws for ws in self._all if ws not in dead]

    async def broadcast_live_count(self):
        await self.broadcast("live:user-count", {"count": self.online_count})


manager = ConnectionManager()
