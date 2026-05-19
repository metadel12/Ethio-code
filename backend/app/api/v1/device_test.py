from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from typing import Optional
from datetime import datetime
import speedtest
import asyncio
from bson import ObjectId
from app.database import db
from app.core.auth import get_current_user

router = APIRouter(prefix="/device-test", tags=["Device Test"])

@router.post("/results")
async def save_test_results(
    test_data: dict,
    current_user = Depends(get_current_user)
):
    """Save test results"""

    test_result = {
        "user_id": current_user["user_id"],
        "user_name": current_user["full_name"],
        "user_email": current_user["sub"],
        "test_id": str(ObjectId()),
        "test_date": datetime.utcnow(),
        "overall_score": test_data.get("overall_score", 0),
        "passed": test_data.get("passed", False),
        "camera": test_data.get("camera", {}),
        "microphone": test_data.get("microphone", {}),
        "speaker": test_data.get("speaker", {}),
        "screen_share": test_data.get("screen_share", {}),
        "network": test_data.get("network", {}),
        "system": test_data.get("system", {}),
        "recommendations": test_data.get("recommendations", []),
        "created_at": datetime.utcnow()
    }
    
    result = await db.device_test_results.insert_one(test_result)
    
    return {"message": "Test results saved", "test_id": str(result.inserted_id)}

@router.get("/results/latest")
async def get_latest_test(current_user = Depends(get_current_user)):
    """Get user's latest device test results"""
    
    test = await db.device_test_results.find_one(
        {"user_id": current_user["user_id"]},
        sort=[("test_date", -1)]
    )
    
    if test:
        test["_id"] = str(test["_id"])
        test["user_id"] = str(test["user_id"])
    
    return test or {}

@router.get("/results/history")
async def get_test_history(
    limit: int = 10,
    current_user = Depends(get_current_user)
):
    """Get user's device test history"""
    
    cursor = db.device_test_results.find(
        {"user_id": current_user["user_id"]}
    ).sort("test_date", -1).limit(limit)
    
    history = await cursor.to_list(length=limit)
    
    for test in history:
        test["_id"] = str(test["_id"])
        test["user_id"] = str(test["user_id"])
    
    return history

@router.get("/network-speed")
async def test_network_speed(current_user = Depends(get_current_user)):
    """Test network speed (download, upload, latency)"""
    
    try:
        st = speedtest.Speedtest()
        st.get_best_server()
        
        download = st.download() / 1_000_000  # Convert to Mbps
        upload = st.upload() / 1_000_000      # Convert to Mbps
        ping = st.results.ping
        
        # Determine quality
        if download >= 10 and ping <= 50:
            quality = "excellent"
        elif download >= 5 and ping <= 100:
            quality = "good"
        elif download >= 2:
            quality = "fair"
        else:
            quality = "poor"
        
        return {
            "download_mbps": round(download, 2),
            "upload_mbps": round(upload, 2),
            "latency_ms": round(ping, 2),
            "quality": quality,
            "suitable_for_video": download >= 2 and ping <= 150
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "download_mbps": 0,
            "upload_mbps": 0,
            "latency_ms": 0,
            "quality": "unknown",
            "suitable_for_video": False
        }

@router.post("/settings")
async def save_device_settings(
    settings: dict,
    current_user = Depends(get_current_user)
):
    """Save user's preferred device settings"""
    
    await db.user_device_settings.update_one(
        {"user_id": current_user["user_id"]},
        {"$set": {
            "preferred_camera": settings.get("preferred_camera"),
            "preferred_microphone": settings.get("preferred_microphone"),
            "preferred_speaker": settings.get("preferred_speaker"),
            "camera_settings": settings.get("camera_settings", {}),
            "microphone_settings": settings.get("microphone_settings", {}),
            "updated_at": datetime.utcnow()
        }},
        upsert=True
    )
    
    return {"message": "Settings saved"}

@router.get("/settings")
async def get_device_settings(current_user = Depends(get_current_user)):
    """Get user's saved device settings"""
    
    settings = await db.user_device_settings.find_one(
        {"user_id": current_user["user_id"]}
    )
    
    if settings:
        settings["_id"] = str(settings["_id"])
        settings["user_id"] = str(settings["user_id"])
    
    return settings or {}