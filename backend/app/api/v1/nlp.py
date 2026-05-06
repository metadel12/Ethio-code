from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional

from app.core.auth import get_current_user
from app.services.nlp_engine import (
    summarize,
    analyze_sentiment,
    translate,
    generate_tags,
    check_grammar,
)

router = APIRouter(prefix="/ai/nlp", tags=["NLP"])


class TextRequest(BaseModel):
    text: str
    max_sentences: Optional[int] = 3

class TranslateRequest(BaseModel):
    text: str
    target_lang: Optional[str] = None  # "amharic" | "english" | None (auto)

class TagRequest(BaseModel):
    text: str
    max_tags: Optional[int] = 10


@router.post("/summarize")
async def nlp_summarize(
    body: TextRequest,
    current_user: dict = Depends(get_current_user)
):
    return summarize(body.text, body.max_sentences or 3)


@router.post("/sentiment")
async def nlp_sentiment(
    body: TextRequest,
    current_user: dict = Depends(get_current_user)
):
    return analyze_sentiment(body.text)


@router.post("/translate")
async def nlp_translate(
    body: TranslateRequest,
    current_user: dict = Depends(get_current_user)
):
    return translate(body.text, body.target_lang)


@router.post("/tag-generator")
async def nlp_tags(
    body: TagRequest,
    current_user: dict = Depends(get_current_user)
):
    return generate_tags(body.text, body.max_tags or 10)


@router.post("/grammar-check")
async def nlp_grammar(
    body: TextRequest,
    current_user: dict = Depends(get_current_user)
):
    return check_grammar(body.text)
