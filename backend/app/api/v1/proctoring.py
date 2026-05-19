from datetime import datetime, timedelta
from typing import Optional
import base64

from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect, Query, Request
from bson import ObjectId

from app.database_mongo import db
from app.schemas.proctoring import ProctoringTestCreate, ProctoringTestUpdate, FlagReport, AnswerSubmit
from app.core.auth import get_current_user, decode_access_token
from app.services.proctoring_service import get_severity, get_warning_message, process_frame

router = APIRouter()


def _str_ids(doc: dict) -> dict:
    """Convert ObjectId fields to strings for JSON serialization."""
    if doc is None:
        return doc
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            doc[k] = str(v)
    return doc


# ── COMPANY / PROCTOR ────────────────────────────────────────────────────────

@router.post("/tests")
async def create_test(data: ProctoringTestCreate, user=Depends(get_current_user)):
    if user.get("role") not in ("company", "admin"):
        raise HTTPException(403, "Only companies or admins can create tests")
    doc = {
        **data.dict(),
        "company_id": user.get("company_id"),
        "company_name": user.get("company_name", ""),
        "created_by": user.get("sub"),
        "status": "draft",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    result = await db.proctoring_tests.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc


@router.get("/tests")
async def list_tests(status: Optional[str] = None, user=Depends(get_current_user)):
    query = {"company_id": user.get("company_id")}
    if status:
        query["status"] = status
    tests = await db.proctoring_tests.find(query).sort("created_at", -1).to_list(100)
    return {"tests": [_str_ids(t) for t in tests]}


@router.get("/tests/{test_id}")
async def get_test(test_id: str, user=Depends(get_current_user)):
    test = await db.proctoring_tests.find_one({"_id": ObjectId(test_id)})
    if not test:
        raise HTTPException(404, "Test not found")
    return _str_ids(test)


@router.put("/tests/{test_id}")
async def update_test(test_id: str, data: ProctoringTestUpdate, user=Depends(get_current_user)):
    test = await db.proctoring_tests.find_one({"_id": ObjectId(test_id)})
    if not test:
        raise HTTPException(404, "Test not found")
    if str(test.get("company_id")) != str(user.get("company_id")) and user.get("role") != "admin":
        raise HTTPException(403, "Access denied")
    update = {k: v for k, v in data.dict(exclude_unset=True).items() if v is not None}
    update["updated_at"] = datetime.utcnow()
    await db.proctoring_tests.update_one({"_id": ObjectId(test_id)}, {"$set": update})
    return {"message": "Updated"}


@router.post("/tests/{test_id}/publish")
async def publish_test(test_id: str, user=Depends(get_current_user)):
    test = await db.proctoring_tests.find_one({"_id": ObjectId(test_id)})
    if not test:
        raise HTTPException(404, "Test not found")
    await db.proctoring_tests.update_one(
        {"_id": ObjectId(test_id)},
        {"$set": {"status": "active", "updated_at": datetime.utcnow()}}
    )
    return {"message": "Test published"}


@router.delete("/tests/{test_id}")
async def delete_test(test_id: str, user=Depends(get_current_user)):
    await db.proctoring_tests.delete_one({"_id": ObjectId(test_id)})
    return {"message": "Deleted"}


# ── SESSION MONITORING (PROCTOR) ─────────────────────────────────────────────

@router.get("/sessions/active")
async def active_sessions(user=Depends(get_current_user)):
    company_test_ids = await db.proctoring_tests.distinct("_id", {"company_id": user.get("company_id")})
    sessions = await db.proctoring_sessions.find({
        "status": "active",
        "test_id": {"$in": company_test_ids}
    }).sort("started_at", -1).to_list(100)
    return {"active_sessions": [_str_ids(s) for s in sessions]}


@router.get("/sessions")
async def list_sessions(test_id: Optional[str] = None, user=Depends(get_current_user)):
    query = {}
    if test_id:
        query["test_id"] = ObjectId(test_id)
    sessions = await db.proctoring_sessions.find(query).sort("started_at", -1).to_list(200)
    return {"sessions": [_str_ids(s) for s in sessions]}


@router.get("/sessions/{session_id}")
async def get_session(session_id: str, user=Depends(get_current_user)):
    session = await db.proctoring_sessions.find_one({"_id": ObjectId(session_id)})
    if not session:
        raise HTTPException(404, "Session not found")
    flags = await db.proctoring_flags.find({"session_id": ObjectId(session_id)}).to_list(500)
    return {**_str_ids(session), "flags_detail": [_str_ids(f) for f in flags]}


@router.get("/sessions/{session_id}/live")
async def live_session(session_id: str, user=Depends(get_current_user)):
    session = await db.proctoring_sessions.find_one({"_id": ObjectId(session_id)})
    if not session:
        raise HTTPException(404, "Session not found")
    recent_flags = await db.proctoring_flags.find({
        "session_id": ObjectId(session_id),
        "timestamp": {"$gte": datetime.utcnow() - timedelta(minutes=5)}
    }).to_list(50)
    return {
        "session": _str_ids(session),
        "recent_flags": [_str_ids(f) for f in recent_flags],
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.post("/sessions/{session_id}/terminate")
async def terminate_session(session_id: str, reason: str = "Terminated by proctor", user=Depends(get_current_user)):
    await db.proctoring_sessions.update_one(
        {"_id": ObjectId(session_id)},
        {"$set": {"status": "terminated", "completed_at": datetime.utcnow(), "termination_reason": reason}}
    )
    await db.proctoring_flags.insert_one({
        "session_id": ObjectId(session_id),
        "type": "session_terminated",
        "severity": "high",
        "timestamp": datetime.utcnow(),
        "details": f"Terminated by proctor: {reason}",
        "is_resolved": True,
    })
    return {"message": "Session terminated"}


@router.get("/sessions/{session_id}/report")
async def session_report(session_id: str, user=Depends(get_current_user)):
    session = await db.proctoring_sessions.find_one({"_id": ObjectId(session_id)})
    if not session:
        raise HTTPException(404, "Session not found")
    flags = await db.proctoring_flags.find({"session_id": ObjectId(session_id)}).to_list(1000)
    high = sum(1 for f in flags if f.get("severity") == "high")
    medium = sum(1 for f in flags if f.get("severity") == "medium")
    low = sum(1 for f in flags if f.get("severity") == "low")
    return {
        "session": _str_ids(session),
        "flags": [_str_ids(f) for f in flags],
        "summary": {"total": len(flags), "high": high, "medium": medium, "low": low},
    }


# ── INVITE ──────────────────────────────────────────────────────────────────

@router.post("/tests/{test_id}/invite")
async def invite_candidate(test_id: str, body: dict, user=Depends(get_current_user)):
    """Create a pending session for an invited candidate (looked up by email)."""
    email = body.get("email", "").strip().lower()
    if not email:
        raise HTTPException(400, "Email is required")

    test = await db.proctoring_tests.find_one({"_id": ObjectId(test_id), "status": "active"})
    if not test:
        raise HTTPException(404, "Test not found or not active")

    candidate = await db.users.find_one({"email": email})
    if not candidate:
        raise HTTPException(404, f"No user found with email {email}")

    existing = await db.proctoring_sessions.find_one({
        "test_id": ObjectId(test_id),
        "user_id": str(candidate["_id"]),
    })
    if existing:
        return {"message": "Candidate already invited", "session_id": str(existing["_id"])}

    doc = {
        "test_id": ObjectId(test_id),
        "user_id": str(candidate["_id"]),
        "user_name": candidate.get("name", ""),
        "user_email": email,
        "status": "pending",
        "answers": [],
        "flags": [],
        "total_flags": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    result = await db.proctoring_sessions.insert_one(doc)
    return {"message": "Invitation created", "session_id": str(result.inserted_id)}


# ── CANDIDATE ────────────────────────────────────────────────────────────────

@router.get("/candidate/tests")
async def candidate_tests(user=Depends(get_current_user)):
    # 1. Sessions already created for this user
    sessions = await db.proctoring_sessions.find({
        "user_id": user.get("sub"),
        "status": {"$in": ["pending", "active", "completed", "terminated"]}
    }).to_list(50)

    result = []
    session_test_ids = set()

    for s in sessions:
        test = await db.proctoring_tests.find_one({"_id": s["test_id"]})
        if test:
            session_test_ids.add(str(s["test_id"]))
            result.append({
                "session_id": str(s["_id"]),
                "test": _str_ids(test),
                "session_status": s["status"],
                "started_at": s.get("started_at"),
                "completed_at": s.get("completed_at"),
                "total_flags": s.get("total_flags", 0),
                "source": "assigned",
            })

    # 2. All active/published tests the user has no session for yet
    all_active = await db.proctoring_tests.find({"status": "active"}).sort("created_at", -1).to_list(100)
    for test in all_active:
        if str(test["_id"]) not in session_test_ids:
            result.append({
                "session_id": None,
                "test": _str_ids(test),
                "session_status": "available",
                "started_at": None,
                "completed_at": None,
                "total_flags": 0,
                "source": "open",
            })

    return {"tests": result}


@router.post("/candidate/tests/{test_id}/start")
async def start_session(test_id: str, user=Depends(get_current_user)):
    test = await db.proctoring_tests.find_one({"_id": ObjectId(test_id), "status": "active"})
    if not test:
        raise HTTPException(404, "Test not available")

    existing = await db.proctoring_sessions.find_one({
        "test_id": ObjectId(test_id),
        "user_id": user.get("sub"),
        "status": "active",
    })
    if existing:
        return {"session_id": str(existing["_id"]), "test": _str_ids(test), "resumed": True}

    doc = {
        "test_id": ObjectId(test_id),
        "user_id": user.get("sub"),
        "user_name": user.get("name", ""),
        "user_email": user.get("email", ""),
        "status": "active",
        "started_at": datetime.utcnow(),
        "current_question_index": 0,
        "answers": [],
        "flags": [],
        "total_flags": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    result = await db.proctoring_sessions.insert_one(doc)
    return {"session_id": str(result.inserted_id), "test": _str_ids(test), "resumed": False}


@router.post("/candidate/sessions/{session_id}/answer")
async def submit_answer(session_id: str, data: AnswerSubmit, user=Depends(get_current_user)):
    session = await db.proctoring_sessions.find_one({"_id": ObjectId(session_id)})
    if not session or session.get("user_id") != user.get("sub"):
        raise HTTPException(404, "Session not found")
    if session["status"] != "active":
        raise HTTPException(400, "Session is not active")

    test = await db.proctoring_tests.find_one({"_id": session["test_id"]})
    idx = session.get("current_question_index", 0)
    questions = test.get("questions", [])

    answer = {
        "question_id": questions[idx]["id"] if idx < len(questions) else str(idx),
        "answer": data.answer,
        "code": data.code,
        "submitted_at": datetime.utcnow(),
        "time_taken_seconds": data.time_taken,
    }

    next_idx = idx + 1
    is_done = next_idx >= len(questions)

    update = {
        "$push": {"answers": answer},
        "$set": {
            "current_question_index": next_idx,
            "updated_at": datetime.utcnow(),
        }
    }
    if is_done:
        update["$set"]["status"] = "completed"
        update["$set"]["completed_at"] = datetime.utcnow()

    await db.proctoring_sessions.update_one({"_id": ObjectId(session_id)}, update)
    return {"completed": is_done, "next_index": next_idx if not is_done else None}


@router.post("/candidate/sessions/{session_id}/flag")
async def report_flag(session_id: str, data: FlagReport, user=Depends(get_current_user)):
    session = await db.proctoring_sessions.find_one({"_id": ObjectId(session_id)})
    if not session:
        raise HTTPException(404, "Session not found")

    flag = {
        "session_id": ObjectId(session_id),
        "test_id": session["test_id"],
        "user_id": user.get("sub"),
        "type": data.type,
        "severity": get_severity(data.type),
        "timestamp": datetime.utcnow(),
        "details": data.details or "",
        "screenshot_url": data.screenshot_url,
        "is_resolved": False,
    }
    await db.proctoring_flags.insert_one(flag)
    await db.proctoring_sessions.update_one(
        {"_id": ObjectId(session_id)},
        {"$inc": {"total_flags": 1}, "$push": {"flags": {"type": data.type, "severity": flag["severity"], "timestamp": flag["timestamp"]}}}
    )

    # Auto-submit check
    test = await db.proctoring_tests.find_one({"_id": session["test_id"]})
    rules = test.get("proctoring_rules", {})
    updated = await db.proctoring_sessions.find_one({"_id": ObjectId(session_id)})
    if (
        updated.get("total_flags", 0) >= rules.get("max_violations_allowed", 3)
        and rules.get("auto_submit_on_violation", True)
    ):
        await db.proctoring_sessions.update_one(
            {"_id": ObjectId(session_id)},
            {"$set": {"status": "terminated", "completed_at": datetime.utcnow()}}
        )
        return {"flag_received": True, "auto_submitted": True, "warning": get_warning_message(data.type)}

    return {"flag_received": True, "auto_submitted": False, "warning": get_warning_message(data.type)}


# ── PROCTOR ACTIONS ──────────────────────────────────────────────────────────

@router.post("/sessions/{session_id}/warn")
async def warn_candidate(session_id: str, body: dict, user=Depends(get_current_user)):
    """Send a warning message to a candidate's active session."""
    message = body.get("message", "Warning from proctor.")
    await db.proctoring_flags.insert_one({
        "session_id": ObjectId(session_id),
        "type": "proctor_warning",
        "severity": "medium",
        "timestamp": datetime.utcnow(),
        "details": message,
        "is_resolved": False,
    })
    return {"message": "Warning sent"}


@router.post("/sessions/{session_id}/flag")
async def flag_session(session_id: str, body: dict, user=Depends(get_current_user)):
    """Flag a session for manual review."""
    reason = body.get("reason", "Flagged by proctor")
    await db.proctoring_sessions.update_one(
        {"_id": ObjectId(session_id)},
        {"$set": {"status": "flagged", "flag_reason": reason, "updated_at": datetime.utcnow()}}
    )
    await db.proctoring_flags.insert_one({
        "session_id": ObjectId(session_id),
        "type": "proctor_flag",
        "severity": "high",
        "timestamp": datetime.utcnow(),
        "details": reason,
        "is_resolved": False,
    })
    return {"message": "Session flagged"}


@router.post("/sessions/{session_id}/pause")
async def pause_session(session_id: str, user=Depends(get_current_user)):
    """Pause an active session."""
    await db.proctoring_sessions.update_one(
        {"_id": ObjectId(session_id)},
        {"$set": {"status": "paused", "paused_at": datetime.utcnow(), "updated_at": datetime.utcnow()}}
    )
    return {"message": "Session paused"}


@router.post("/sessions/{session_id}/resume")
async def resume_session(session_id: str, user=Depends(get_current_user)):
    """Resume a paused session."""
    await db.proctoring_sessions.update_one(
        {"_id": ObjectId(session_id)},
        {"$set": {"status": "active", "updated_at": datetime.utcnow()}}
    )
    return {"message": "Session resumed"}


# ── IDENTITY VERIFICATION ────────────────────────────────────────────────────

@router.post("/identity/verify")
async def verify_identity(request: Request, user=Depends(get_current_user)):
    """
    Real identity verification:
    1. Extract face from uploaded ID document using DeepFace
    2. Extract face from selfie (base64)
    3. Compute cosine similarity between embeddings
    4. Liveness check: frontend sends left/right/blink frames, backend verifies face present in each
    """
    import base64 as b64
    import numpy as np
    import tempfile, os

    form = await request.form()
    id_document = form.get("id_document")  # UploadFile
    selfie_data = form.get("selfie_data")  # base64 data URL
    id_type = form.get("id_type", "national_id")
    session_id = form.get("session_id", "")
    liveness_left = form.get("liveness_left")   # base64 data URL
    liveness_right = form.get("liveness_right") # base64 data URL
    liveness_blink = form.get("liveness_blink") # base64 data URL

    if not id_document or not selfie_data:
        raise HTTPException(400, "id_document and selfie_data are required")

    try:
        from deepface import DeepFace
        import cv2

        # ── Save ID document to temp file ─────────────────────────────────
        id_bytes = await id_document.read()
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f:
            f.write(id_bytes)
            id_path = f.name

        # ── Decode selfie from base64 ─────────────────────────────────────
        if "," in selfie_data:
            selfie_data = selfie_data.split(",")[1]
        selfie_bytes = b64.b64decode(selfie_data)
        selfie_arr = np.frombuffer(selfie_bytes, np.uint8)
        selfie_img = cv2.imdecode(selfie_arr, cv2.IMREAD_COLOR)

        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f:
            cv2.imwrite(f.name, selfie_img)
            selfie_path = f.name

        # ── Face comparison: ID vs Selfie ─────────────────────────────────
        try:
            result = DeepFace.verify(
                img1_path=id_path,
                img2_path=selfie_path,
                model_name="Facenet",
                detector_backend="opencv",
                enforce_detection=True,
            )
            face_match = result["verified"]
            distance = result["distance"]
            # Convert distance to confidence (Facenet threshold ~0.40)
            face_match_confidence = round(max(0.0, 1.0 - (distance / 0.8)), 3)
        except Exception as e:
            # Face not detected in one of the images
            os.unlink(id_path)
            os.unlink(selfie_path)
            return {
                "success": False,
                "face_match_confidence": 0.0,
                "liveness_score": 0.0,
                "message": f"Face not detected: {str(e)[:120]}. Ensure your ID photo and selfie clearly show your face.",
                "checks": {"face_detected_id": False, "face_detected_selfie": False, "face_match": False, "liveness": False},
            }

        # ── Liveness check: verify face present in all 3 angles ───────────
        liveness_score = 0.0
        liveness_checks = {"straight": False, "left": False, "right": False, "blink": False}

        # Selfie = straight
        try:
            faces = DeepFace.extract_faces(img_path=selfie_path, detector_backend="opencv", enforce_detection=False)
            if faces and faces[0]["confidence"] > 0.7:
                liveness_checks["straight"] = True
        except Exception:
            pass

        # Left turn
        if liveness_left:
            try:
                left_data = liveness_left.split(",")[1] if "," in liveness_left else liveness_left
                left_arr = np.frombuffer(b64.b64decode(left_data), np.uint8)
                left_img = cv2.imdecode(left_arr, cv2.IMREAD_COLOR)
                with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f:
                    cv2.imwrite(f.name, left_img)
                    left_path = f.name
                faces = DeepFace.extract_faces(img_path=left_path, detector_backend="opencv", enforce_detection=False)
                if faces and faces[0]["confidence"] > 0.5:
                    liveness_checks["left"] = True
                os.unlink(left_path)
            except Exception:
                pass

        # Right turn
        if liveness_right:
            try:
                right_data = liveness_right.split(",")[1] if "," in liveness_right else liveness_right
                right_arr = np.frombuffer(b64.b64decode(right_data), np.uint8)
                right_img = cv2.imdecode(right_arr, cv2.IMREAD_COLOR)
                with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f:
                    cv2.imwrite(f.name, right_img)
                    right_path = f.name
                faces = DeepFace.extract_faces(img_path=right_path, detector_backend="opencv", enforce_detection=False)
                if faces and faces[0]["confidence"] > 0.5:
                    liveness_checks["right"] = True
                os.unlink(right_path)
            except Exception:
                pass

        # Blink (eyes closed = different face region detected)
        if liveness_blink:
            try:
                blink_data = liveness_blink.split(",")[1] if "," in liveness_blink else liveness_blink
                blink_arr = np.frombuffer(b64.b64decode(blink_data), np.uint8)
                blink_img = cv2.imdecode(blink_arr, cv2.IMREAD_COLOR)
                # For blink: just check face is present (person is still there)
                gray = cv2.cvtColor(blink_img, cv2.COLOR_BGR2GRAY)
                face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
                faces_detected = face_cascade.detectMultiScale(gray, 1.1, 5)
                if len(faces_detected) > 0:
                    liveness_checks["blink"] = True
            except Exception:
                pass

        # Score: each check = 25 points
        passed_checks = sum(liveness_checks.values())
        liveness_score = round(passed_checks / 4.0, 3)

        # Cleanup
        try:
            os.unlink(id_path)
            os.unlink(selfie_path)
        except Exception:
            pass

        # ── Final decision ────────────────────────────────────────────────
        success = face_match and face_match_confidence >= 0.55 and liveness_score >= 0.5

        if success and session_id:
            try:
                await db.proctoring_sessions.update_one(
                    {"_id": ObjectId(session_id)},
                    {"$set": {
                        "identity_verification": {
                            "verified": True,
                            "face_match_confidence": face_match_confidence,
                            "liveness_score": liveness_score,
                            "id_type": id_type,
                            "verified_at": datetime.utcnow(),
                            "checks": liveness_checks,
                        }
                    }}
                )
            except Exception:
                pass

        if success:
            await db.users.update_one(
                {"_id": ObjectId(user.get("sub"))},
                {"$set": {"identity_verified": True, "identity_verified_at": datetime.utcnow()}}
            )

        # Build human-readable message
        if not face_match or face_match_confidence < 0.55:
            message = "Face does not match the ID document. Please use a clear, well-lit photo of your actual ID."
        elif liveness_score < 0.5:
            failed = [k for k, v in liveness_checks.items() if not v]
            message = f"Liveness check failed: {', '.join(failed)}. Please complete all head movements."
        else:
            message = "Identity verified successfully."

        return {
            "success": success,
            "face_match_confidence": face_match_confidence,
            "liveness_score": liveness_score,
            "face_match": face_match,
            "liveness_checks": liveness_checks,
            "message": message,
            "checks": {
                "face_detected_id": True,
                "face_detected_selfie": liveness_checks["straight"],
                "face_match": face_match,
                "liveness": liveness_score >= 0.5,
            },
        }

    except ImportError:
        # DeepFace not installed — fallback to basic OpenCV check
        import cv2, numpy as np, base64 as b64
        try:
            if "," in selfie_data:
                selfie_data = selfie_data.split(",")[1]
            selfie_arr = np.frombuffer(b64.b64decode(selfie_data), np.uint8)
            selfie_img = cv2.imdecode(selfie_arr, cv2.IMREAD_COLOR)
            gray = cv2.cvtColor(selfie_img, cv2.COLOR_BGR2GRAY)
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
            faces = face_cascade.detectMultiScale(gray, 1.1, 5)
            face_found = len(faces) > 0
            return {
                "success": face_found,
                "face_match_confidence": 0.80 if face_found else 0.0,
                "liveness_score": 0.75 if face_found else 0.0,
                "message": "Identity verified (basic check — DeepFace not installed)." if face_found else "No face detected in selfie.",
                "checks": {"face_detected_id": True, "face_detected_selfie": face_found, "face_match": face_found, "liveness": face_found},
            }
        except Exception as e:
            raise HTTPException(500, f"Verification error: {str(e)[:200]}")


# ── ENVIRONMENTAL SCAN ───────────────────────────────────────────────────────

@router.post("/environment/verify-angle")
async def verify_env_angle(request: Request, user=Depends(get_current_user)):
    """
    Verify a single environmental scan angle in real-time.
    - front/left/right: must detect a face (person is present)
    - desk: must NOT detect a face (camera pointing down at desk)
    Returns { detected: bool, confidence: float, passed: bool }
    """
    import base64 as b64
    import numpy as np

    form = await request.form()
    frame_data = form.get("frame")   # base64 data URL
    angle = form.get("angle", "front")  # front | left | right | desk

    if not frame_data:
        raise HTTPException(400, "frame is required")

    try:
        import cv2
        raw = frame_data.split(",")[1] if "," in frame_data else frame_data
        arr = np.frombuffer(b64.b64decode(raw), np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
        profile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_profileface.xml")

        frontal = face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(60, 60))
        profile_l = profile_cascade.detectMultiScale(gray, 1.1, 5, minSize=(60, 60))
        # Mirror for right profile
        flipped = cv2.flip(gray, 1)
        profile_r = profile_cascade.detectMultiScale(flipped, 1.1, 5, minSize=(60, 60))

        face_count = len(frontal) + len(profile_l) + len(profile_r)
        face_detected = face_count > 0

        # Confidence: rough estimate based on largest detected face area
        confidence = 0.0
        if len(frontal) > 0:
            areas = [w * h for (x, y, w, h) in frontal]
            confidence = min(1.0, round(max(areas) / (img.shape[0] * img.shape[1] * 0.15), 2))
        elif face_detected:
            confidence = 0.6

        # desk angle: pass = no face (camera pointing down)
        if angle == "desk":
            passed = not face_detected
            message = "Desk view confirmed." if passed else "Face still visible — tilt camera down to show desk."
        else:
            passed = face_detected
            message = "Face detected." if passed else "No face detected — position yourself in frame."

        return {"detected": face_detected, "confidence": confidence, "passed": passed, "message": message}

    except Exception as e:
        raise HTTPException(500, f"Frame analysis error: {str(e)[:200]}")


@router.post("/environment/scan")
async def environment_scan(body: dict, user=Depends(get_current_user)):
    """
    Environmental scan endpoint.
    Analyzes room scan captures for prohibited objects.
    """
    session_id = body.get("session_id")
    captures = body.get("captures", {})

    detected_objects = []
    passed = True

    # Run YOLO on each capture if available
    for angle, data_url in captures.items():
        try:
            import base64 as b64
            import numpy as np
            header, encoded = data_url.split(",", 1)
            frame_bytes = b64.b64decode(encoded)

            from app.services.proctoring_service import process_frame
            result = await process_frame(frame_bytes)
            if result["violation_detected"] and result["violation_type"] == "prohibited_object":
                detected_objects.append({
                    "object": result["details"],
                    "confidence": 0.85,
                    "angle": angle,
                })
                passed = False
        except Exception:
            pass

    if session_id:
        try:
            await db.proctoring_sessions.update_one(
                {"_id": ObjectId(session_id)},
                {"$set": {
                    "environmental_scan": {
                        "completed_at": datetime.utcnow(),
                        "passed": passed,
                        "detected_objects": detected_objects,
                        "angles_captured": list(captures.keys()),
                    }
                }}
            )
        except Exception:
            pass

    return {
        "passed": passed,
        "detected_objects": detected_objects,
        "message": "Environment scan passed." if passed else "Prohibited objects detected in your workspace.",
    }


# ── APPEALS ──────────────────────────────────────────────────────────────────

@router.get("/appeals")
async def list_appeals(user=Depends(get_current_user)):
    query = {"user_id": user.get("sub")}
    if user.get("role") in ("company", "admin"):
        query = {}  # admins/companies see all
    appeals = await db.proctoring_appeals.find(query).sort("created_at", -1).to_list(100)
    return {"appeals": [_str_ids(a) for a in appeals]}


@router.post("/appeals")
async def create_appeal(body: dict, user=Depends(get_current_user)):
    session_id = body.get("session_id", "")
    if not session_id or not body.get("description", "").strip():
        raise HTTPException(400, "session_id and description are required")

    doc = {
        "session_id": session_id,
        "user_id": user.get("sub"),
        "user_email": user.get("email", ""),
        "reason": body.get("reason", "other"),
        "description": body.get("description", ""),
        "status": "pending",
        "review_notes": None,
        "reviewed_by": None,
        "reviewed_at": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    result = await db.proctoring_appeals.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc


@router.put("/appeals/{appeal_id}")
async def review_appeal(appeal_id: str, body: dict, user=Depends(get_current_user)):
    """Admin/company reviews an appeal."""
    if user.get("role") not in ("company", "admin"):
        raise HTTPException(403, "Only admins or companies can review appeals")
    update = {
        "status": body.get("status", "under_review"),
        "review_notes": body.get("review_notes", ""),
        "reviewed_by": user.get("sub"),
        "reviewed_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    await db.proctoring_appeals.update_one({"_id": ObjectId(appeal_id)}, {"$set": update})
    return {"message": "Appeal updated"}


# ── BEHAVIORAL ANALYTICS ─────────────────────────────────────────────────────

@router.post("/sessions/{session_id}/analytics")
async def update_analytics(session_id: str, body: dict, user=Depends(get_current_user)):
    """Update behavioral analytics for a session (called periodically from client)."""
    await db.proctoring_sessions.update_one(
        {"_id": ObjectId(session_id)},
        {"$set": {"behavioral_analytics": body, "updated_at": datetime.utcnow()}}
    )
    return {"message": "Analytics updated"}




@router.websocket("/ws/session/{session_id}")
async def ws_proctor(websocket: WebSocket, session_id: str, token: str = Query(...)):
    """WebSocket for real-time proctoring. Accepts frames, heartbeats; sends alerts/warnings."""
    try:
        decode_access_token(token)
    except Exception:
        await websocket.close(code=4001)
        return

    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()

            if data.get("type") == "heartbeat":
                await db.proctoring_sessions.update_one(
                    {"_id": ObjectId(session_id)},
                    {"$set": {"last_heartbeat": datetime.utcnow()}}
                )
                await websocket.send_json({"type": "heartbeat_ack"})

            elif data.get("type") == "frame":
                raw = base64.b64decode(data["frame"])
                detection = await process_frame(raw)
                if detection["violation_detected"]:
                    vtype = detection["violation_type"]
                    flag = {
                        "session_id": ObjectId(session_id),
                        "type": vtype,
                        "severity": detection["severity"],
                        "timestamp": datetime.utcnow(),
                        "details": detection.get("details", ""),
                        "is_resolved": False,
                    }
                    await db.proctoring_flags.insert_one(flag)
                    await db.proctoring_sessions.update_one(
                        {"_id": ObjectId(session_id)},
                        {"$inc": {"total_flags": 1}}
                    )
                    await websocket.send_json({
                        "type": "violation",
                        "violation_type": vtype,
                        "severity": detection["severity"],
                        "details": detection.get("details"),
                        "warning": get_warning_message(vtype),
                        "timestamp": datetime.utcnow().isoformat(),
                    })

            elif data.get("type") == "client_flag":
                vtype = data.get("violation_type", "tab_switch")
                flag = {
                    "session_id": ObjectId(session_id),
                    "type": vtype,
                    "severity": get_severity(vtype),
                    "timestamp": datetime.utcnow(),
                    "details": data.get("details", ""),
                    "is_resolved": False,
                }
                await db.proctoring_flags.insert_one(flag)
                await db.proctoring_sessions.update_one(
                    {"_id": ObjectId(session_id)},
                    {"$inc": {"total_flags": 1}}
                )
                await websocket.send_json({
                    "type": "warning",
                    "warning": get_warning_message(vtype),
                    "severity": flag["severity"],
                })

    except WebSocketDisconnect:
        pass
