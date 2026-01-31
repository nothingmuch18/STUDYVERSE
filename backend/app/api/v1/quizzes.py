"""
Quizzes API routes.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.core.security import get_current_user

router = APIRouter()

# In-memory storage
quizzes_db: dict = {}
quiz_attempts_db: dict = {}


class QuizQuestion(BaseModel):
    """Quiz question schema."""
    id: str
    question: str
    options: dict  # {"a": str, "b": str, "c": str, "d": str}
    correct_answer: str
    explanation: str
    difficulty: str = "medium"
    topic: str


class QuizCreate(BaseModel):
    """Quiz creation request."""
    title: str
    subject: str
    topic: Optional[str] = None
    difficulty: str = "mixed"
    num_questions: int = 10


class QuizResponse(BaseModel):
    """Quiz response schema."""
    id: str
    title: str
    subject: str
    questions: List[QuizQuestion]
    difficulty: str
    time_limit_minutes: int
    created_at: str


class QuizAttempt(BaseModel):
    """Quiz attempt submission."""
    answers: dict  # {question_id: selected_answer}


class QuizResult(BaseModel):
    """Quiz result schema."""
    id: str
    quiz_id: str
    user_id: str
    score: int
    total_questions: int
    percentage: float
    time_taken_seconds: int
    answers: dict
    correct_answers: dict
    completed_at: str


@router.get("", response_model=List[dict])
async def get_quizzes(
    subject: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get available quizzes."""
    quizzes = list(quizzes_db.values())
    
    if subject:
        quizzes = [q for q in quizzes if q["subject"].lower() == subject.lower()]
    
    # Add sample quizzes if empty
    if not quizzes:
        sample_quizzes = [
            {"id": "quiz_1", "title": "Machine Learning Basics", "subject": "Computer Science", "difficulty": "medium", "num_questions": 10, "time_limit": 15},
            {"id": "quiz_2", "title": "Calculus Chapter 5", "subject": "Mathematics", "difficulty": "hard", "num_questions": 8, "time_limit": 12},
            {"id": "quiz_3", "title": "Thermodynamics", "subject": "Physics", "difficulty": "medium", "num_questions": 12, "time_limit": 18},
        ]
        return sample_quizzes
    
    return quizzes


@router.post("", response_model=QuizResponse)
async def create_quiz(
    quiz_data: QuizCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a custom quiz (AI-generated questions)."""
    quiz_id = f"quiz_{len(quizzes_db) + 1}"
    
    # Generate sample questions (in production, AI would generate these)
    questions = []
    for i in range(quiz_data.num_questions):
        questions.append(QuizQuestion(
            id=f"q_{i + 1}",
            question=f"Sample question {i + 1} about {quiz_data.subject}?",
            options={
                "a": f"Option A for question {i + 1}",
                "b": f"Option B for question {i + 1}",
                "c": f"Option C for question {i + 1}",
                "d": f"Option D for question {i + 1}"
            },
            correct_answer=["a", "b", "c", "d"][i % 4],
            explanation=f"Explanation for question {i + 1}",
            difficulty=quiz_data.difficulty if quiz_data.difficulty != "mixed" else ["easy", "medium", "hard"][i % 3],
            topic=quiz_data.topic or quiz_data.subject
        ))
    
    quiz = {
        "id": quiz_id,
        "title": quiz_data.title,
        "subject": quiz_data.subject,
        "questions": [q.model_dump() for q in questions],
        "difficulty": quiz_data.difficulty,
        "time_limit_minutes": quiz_data.num_questions * 2,
        "created_at": datetime.utcnow().isoformat(),
    }
    
    quizzes_db[quiz_id] = quiz
    return quiz


@router.get("/{quiz_id}", response_model=QuizResponse)
async def get_quiz(
    quiz_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific quiz."""
    quiz = quizzes_db.get(quiz_id)
    
    if not quiz:
        # Return sample quiz for demo
        return QuizResponse(
            id=quiz_id,
            title="Sample Quiz",
            subject="General",
            questions=[
                QuizQuestion(
                    id="q_1",
                    question="What is the capital of France?",
                    options={"a": "London", "b": "Paris", "c": "Berlin", "d": "Madrid"},
                    correct_answer="b",
                    explanation="Paris is the capital of France.",
                    difficulty="easy",
                    topic="Geography"
                )
            ],
            difficulty="easy",
            time_limit_minutes=10,
            created_at=datetime.utcnow().isoformat()
        )
    
    return quiz


@router.post("/{quiz_id}/submit", response_model=QuizResult)
async def submit_quiz(
    quiz_id: str,
    attempt: QuizAttempt,
    current_user: dict = Depends(get_current_user)
):
    """Submit quiz answers and get results."""
    quiz = quizzes_db.get(quiz_id)
    
    # Calculate score
    correct_count = 0
    correct_answers = {}
    
    if quiz:
        for question in quiz["questions"]:
            correct_answers[question["id"]] = question["correct_answer"]
            if attempt.answers.get(question["id"]) == question["correct_answer"]:
                correct_count += 1
        total_questions = len(quiz["questions"])
    else:
        # Demo result
        total_questions = len(attempt.answers)
        correct_count = int(total_questions * 0.7)  # 70% demo score
    
    percentage = (correct_count / total_questions * 100) if total_questions > 0 else 0
    
    result_id = f"result_{len(quiz_attempts_db) + 1}"
    result = {
        "id": result_id,
        "quiz_id": quiz_id,
        "user_id": current_user["id"],
        "score": correct_count,
        "total_questions": total_questions,
        "percentage": round(percentage, 2),
        "time_taken_seconds": 600,  # 10 min demo
        "answers": attempt.answers,
        "correct_answers": correct_answers,
        "completed_at": datetime.utcnow().isoformat(),
    }
    
    quiz_attempts_db[result_id] = result
    return result


@router.get("/{quiz_id}/results", response_model=List[QuizResult])
async def get_quiz_results(
    quiz_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get all results for a quiz."""
    results = [
        r for r in quiz_attempts_db.values()
        if r["quiz_id"] == quiz_id and r["user_id"] == current_user["id"]
    ]
    return results
