from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import Dict, Any
import openai
from app.config import settings

router = APIRouter(prefix="/ai-feedback", tags=["AI Feedback"])

openai.api_key = settings.OPENAI_API_KEY

@router.post("/evaluate")
async def get_ai_feedback(request: Dict[str, Any]):
    """Get AI feedback on user's answer"""

    question_text = request.get("question_text", "")
    user_answer = request.get("user_answer", "")
    question_type = request.get("question_type", "theoretical")

    if not user_answer:
        raise HTTPException(status_code=400, detail="No answer provided")

    if question_type == "theoretical":
        return await evaluate_theoretical_answer(question_text, user_answer)
    elif question_type == "coding":
        return await evaluate_code_answer(question_text, user_answer)
    else:
        return {"score": 0, "feedback": "Question type not supported"}

async def evaluate_theoretical_answer(question: str, answer: str) -> Dict[str, Any]:
    """Evaluate theoretical answer using OpenAI"""

    prompt = f"""
    Question: {question}

    User Answer: {answer}

    Please evaluate this answer on the following criteria:
    1. Accuracy (0-100)
    2. Completeness (0-100)
    3. Clarity (0-100)

    Provide:
    - Overall score (0-100)
    - Strengths (2-3 points)
    - Areas for improvement (2-3 points)
    - Recommended resources (2-3 links)
    """

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )

        feedback_text = response.choices[0].message.content

        # Parse feedback (simplified)
        return {
            "score": 75,  # Would be parsed from response
            "feedback": feedback_text,
            "strengths": ["Good understanding", "Clear explanation"],
            "improvements": ["Add more examples", "Be more specific"],
            "resources": [
                "MDN Web Docs",
                "Stack Overflow article"
            ]
        }

    except Exception as e:
        return {
            "score": 0,
            "feedback": f"AI evaluation failed: {str(e)}",
            "strengths": [],
            "improvements": [],
            "resources": []
        }

async def evaluate_code_answer(question: str, code: str) -> Dict[str, Any]:
    """Evaluate code solution using OpenAI"""

    prompt = f"""
    Question: {question}

    Code Solution:
    ```python
    {code}
    ```

    Evaluate the code on:
    1. Correctness (0-100)
    2. Efficiency (0-100)
    3. Code quality (0-100)
    4. Best practices (0-100)

    Provide overall score and specific suggestions for improvement.
    """

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )

        return {
            "score": 80,
            "feedback": response.choices[0].message.content,
            "suggestions": "Consider using list comprehension for better performance"
        }

    except Exception as e:
        return {"score": 0, "feedback": f"Evaluation failed: {str(e)}"}

@router.post("/voice-to-text")
async def voice_to_text(audio: UploadFile = File(...)):
    """Convert voice recording to text"""

    # Save audio temporarily
    import tempfile
    import speech_recognition as sr

    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp:
        content = await audio.read()
        tmp.write(content)
        tmp_path = tmp.name

    # Convert speech to text
    recognizer = sr.Recognizer()
    with sr.AudioFile(tmp_path) as source:
        audio_data = recognizer.record(source)
        try:
            text = recognizer.recognize_google(audio_data)
        except:
            text = ""

    import os
    os.unlink(tmp_path)

    return {"text": text}