"""
Notes Generation API routes.
"""
from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.core.security import get_current_user

router = APIRouter()

# In-memory storage
notes_db: dict = {}


class MCQ(BaseModel):
    """Multiple choice question schema."""
    id: str
    question: str
    options: dict  # {"a": str, "b": str, "c": str, "d": str}
    correct_answer: str
    explanation: str
    difficulty: str = "medium"


class NoteResponse(BaseModel):
    """Note response schema."""
    id: str
    user_id: str
    title: str
    content: str
    source_type: str  # pdf, youtube, text
    source_url: Optional[str] = None
    key_points: List[str]
    summary: str
    mcqs: List[MCQ]
    created_at: str


class GenerateFromTextRequest(BaseModel):
    """Request to generate notes from text."""
    content: str
    title: Optional[str] = None


class GenerateFromYoutubeRequest(BaseModel):
    """Request to generate notes from YouTube."""
    url: str


@router.get("", response_model=List[NoteResponse])
async def get_notes(current_user: dict = Depends(get_current_user)):
    """Get all notes for current user."""
    user_notes = [
        note for note in notes_db.values()
        if note["user_id"] == current_user["id"]
    ]
    return user_notes


@router.post("/from-text", response_model=NoteResponse)
async def generate_from_text(
    request: GenerateFromTextRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate notes from text content using AI."""
    note_id = f"note_{len(notes_db) + 1}"
    
    # In production, this would call AI (Gemini) to generate notes
    # For demo, we'll create structured content
    note = {
        "id": note_id,
        "user_id": current_user["id"],
        "title": request.title or "Generated Notes",
        "content": request.content,
        "source_type": "text",
        "source_url": None,
        "key_points": [
            "Main concept explanation from the content",
            "Key terminology and definitions",
            "Important relationships between concepts",
            "Practical applications mentioned",
            "Summary of main arguments"
        ],
        "summary": f"AI-generated summary of the provided content. The content covers key concepts and their relationships. {request.content[:200]}...",
        "mcqs": [
            {
                "id": "mcq_1",
                "question": "What is the main topic discussed in this content?",
                "options": {"a": "Option A", "b": "Option B", "c": "Option C", "d": "Option D"},
                "correct_answer": "a",
                "explanation": "This is the correct answer because...",
                "difficulty": "medium"
            }
        ],
        "created_at": datetime.utcnow().isoformat(),
    }
    
    notes_db[note_id] = note
    return note


@router.post("/from-youtube", response_model=NoteResponse)
async def generate_from_youtube(
    request: GenerateFromYoutubeRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate notes from YouTube video using AI."""
    note_id = f"note_{len(notes_db) + 1}"
    
    # In production, this would:
    # 1. Extract video ID from URL
    # 2. Fetch transcript using YouTube API
    # 3. Process with AI to generate notes
    
    note = {
        "id": note_id,
        "user_id": current_user["id"],
        "title": "Notes from YouTube Video",
        "content": "Extracted transcript content would appear here...",
        "source_type": "youtube",
        "source_url": request.url,
        "key_points": [
            "Key concept from video",
            "Important explanation point",
            "Practical demonstration summary",
            "Key takeaway 1",
            "Key takeaway 2"
        ],
        "summary": "AI-generated summary of the YouTube video content. The video covers important topics with practical demonstrations.",
        "mcqs": [
            {
                "id": "mcq_1",
                "question": "Based on the video, what is the correct approach?",
                "options": {"a": "Approach A", "b": "Approach B", "c": "Approach C", "d": "Approach D"},
                "correct_answer": "b",
                "explanation": "As explained in the video...",
                "difficulty": "medium"
            }
        ],
        "created_at": datetime.utcnow().isoformat(),
    }
    
    notes_db[note_id] = note
    return note


@router.post("/from-pdf", response_model=NoteResponse)
async def generate_from_pdf(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Generate notes from uploaded PDF using AI."""
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed"
        )
    
    note_id = f"note_{len(notes_db) + 1}"
    
    # In production, this would:
    # 1. Extract text from PDF using PyMuPDF
    # 2. Process with AI to generate notes
    
    note = {
        "id": note_id,
        "user_id": current_user["id"],
        "title": f"Notes from {file.filename}",
        "content": "Extracted PDF content would appear here...",
        "source_type": "pdf",
        "source_url": file.filename,
        "key_points": [
            "Main concept from PDF",
            "Key definition or formula",
            "Important theorem or principle",
            "Application example",
            "Summary of chapter"
        ],
        "summary": f"AI-generated summary of {file.filename}. The document covers fundamental concepts with detailed explanations.",
        "mcqs": [
            {
                "id": "mcq_1",
                "question": "Based on the document, which statement is correct?",
                "options": {"a": "Statement A", "b": "Statement B", "c": "Statement C", "d": "Statement D"},
                "correct_answer": "a",
                "explanation": "According to the document...",
                "difficulty": "medium"
            },
            {
                "id": "mcq_2",
                "question": "What is the key formula mentioned?",
                "options": {"a": "E = mc²", "b": "F = ma", "c": "V = IR", "d": "PV = nRT"},
                "correct_answer": "b",
                "explanation": "The document emphasizes this formula for...",
                "difficulty": "easy"
            }
        ],
        "created_at": datetime.utcnow().isoformat(),
    }
    
    notes_db[note_id] = note
    return note


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific note."""
    note = notes_db.get(note_id)
    if not note or note["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    return note


@router.delete("/{note_id}")
async def delete_note(
    note_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a note."""
    note = notes_db.get(note_id)
    if not note or note["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    del notes_db[note_id]
    return {"message": "Note deleted successfully"}


@router.post("/{note_id}/generate-mcq")
async def generate_more_mcqs(
    note_id: str,
    count: int = 5,
    difficulty: str = "mixed",
    current_user: dict = Depends(get_current_user)
):
    """Generate additional MCQs from a note."""
    note = notes_db.get(note_id)
    if not note or note["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    # In production, AI would generate MCQs based on note content
    new_mcqs = []
    for i in range(count):
        new_mcqs.append({
            "id": f"mcq_{len(note['mcqs']) + i + 1}",
            "question": f"Generated question {i + 1} about the content?",
            "options": {"a": "Option A", "b": "Option B", "c": "Option C", "d": "Option D"},
            "correct_answer": ["a", "b", "c", "d"][i % 4],
            "explanation": "AI-generated explanation for the answer.",
            "difficulty": difficulty if difficulty != "mixed" else ["easy", "medium", "hard"][i % 3]
        })
    
    note["mcqs"].extend(new_mcqs)
    return {"message": f"Generated {count} new MCQs", "mcqs": new_mcqs}
