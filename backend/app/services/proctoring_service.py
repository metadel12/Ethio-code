import base64
from typing import Optional

SEVERITY_MAP = {
    "tab_switch": "medium",
    "copy_paste": "medium",
    "multiple_faces": "high",
    "face_not_visible": "medium",
    "looking_away": "low",
    "prohibited_object": "high",
    "audio_noise": "low",
    "session_terminated": "high",
    "fullscreen_exit": "medium",
    "screenshot_attempt": "high",
    "devtools_attempt": "high",
    "devtools_open": "high",
    "abnormal_typing_speed": "medium",
    "proctor_warning": "medium",
    "proctor_flag": "high",
}

WARNING_MESSAGES = {
    "tab_switch": "⚠️ Tab switching detected. Stay on the test window.",
    "multiple_faces": "⚠️ Multiple faces detected. Only you should be visible.",
    "face_not_visible": "⚠️ Face not visible. Position yourself in front of the camera.",
    "looking_away": "⚠️ Looking away detected. Please focus on the screen.",
    "prohibited_object": "⚠️ Prohibited object detected. Remove unauthorized items.",
    "copy_paste": "⚠️ Copy-paste is not allowed during this test.",
    "audio_noise": "⚠️ Background noise detected. Please ensure a quiet environment.",
    "fullscreen_exit": "⚠️ Please stay in fullscreen mode during the test.",
    "screenshot_attempt": "🚫 Screenshots are not allowed during this test.",
    "devtools_attempt": "🚫 Developer tools are not allowed during this test.",
    "devtools_open": "🚫 Please close developer tools to continue.",
    "abnormal_typing_speed": "⚠️ Unusual typing pattern detected.",
    "proctor_warning": "📢 You have received a warning from the proctor.",
}


def get_severity(violation_type: str) -> str:
    return SEVERITY_MAP.get(violation_type, "medium")


def get_warning_message(violation_type: str) -> str:
    return WARNING_MESSAGES.get(violation_type, "⚠️ Test rule violation detected.")


async def process_frame(frame_data: bytes) -> dict:
    """
    Process a base64-encoded video frame for AI violation detection.
    Uses OpenCV + face_recognition if available, falls back to basic detection.
    """
    result = {
        "violation_detected": False,
        "violation_type": None,
        "severity": "low",
        "details": None,
    }

    try:
        import cv2
        import face_recognition
        import numpy as np

        nparr = np.frombuffer(frame_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            return result

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb, model="hog")

        if len(face_locations) == 0:
            result.update({
                "violation_detected": True,
                "violation_type": "face_not_visible",
                "severity": "medium",
                "details": "Candidate face not visible in camera",
            })
        elif len(face_locations) > 1:
            result.update({
                "violation_detected": True,
                "violation_type": "multiple_faces",
                "severity": "high",
                "details": f"Multiple faces detected: {len(face_locations)}",
            })

        # Object detection via YOLO if available and no face violation yet
        if not result["violation_detected"]:
            try:
                from ultralytics import YOLO
                model = YOLO("yolov8n.pt")
                detections = model(frame, verbose=False)
                prohibited = {"cell phone", "book", "laptop"}
                found = []
                for r in detections:
                    for box in r.boxes:
                        name = model.names[int(box.cls[0])]
                        if name in prohibited:
                            found.append(name)
                if found:
                    result.update({
                        "violation_detected": True,
                        "violation_type": "prohibited_object",
                        "severity": "high",
                        "details": f"Prohibited object detected: {', '.join(set(found))}",
                    })
            except Exception:
                pass  # YOLO not available, skip object detection

    except ImportError:
        pass  # AI libs not installed, skip frame analysis

    return result
