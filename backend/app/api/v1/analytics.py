"""
Analytics API routes.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta

from app.core.security import get_current_user

router = APIRouter()


class SubjectPerformance(BaseModel):
    """Subject performance data."""
    subject: str
    score: float
    total_study_hours: float
    quizzes_taken: int
    average_quiz_score: float


class WeeklyProgress(BaseModel):
    """Weekly progress data."""
    day: str
    study_hours: float
    tasks_completed: int
    quizzes_taken: int


class AnalyticsResponse(BaseModel):
    """Analytics response schema."""
    total_study_hours: float
    total_tasks_completed: int
    total_quizzes_taken: int
    average_quiz_score: float
    current_streak: int
    weekly_goal_progress: float
    subject_performance: List[SubjectPerformance]
    weekly_progress: List[WeeklyProgress]
    weak_areas: List[dict]
    strong_areas: List[dict]


@router.get("", response_model=AnalyticsResponse)
async def get_analytics(current_user: dict = Depends(get_current_user)):
    """Get user analytics and performance data."""
    # Generate sample analytics data
    subject_performance = [
        SubjectPerformance(
            subject="Mathematics",
            score=78,
            total_study_hours=25.5,
            quizzes_taken=8,
            average_quiz_score=75
        ),
        SubjectPerformance(
            subject="Physics",
            score=65,
            total_study_hours=20.0,
            quizzes_taken=6,
            average_quiz_score=62
        ),
        SubjectPerformance(
            subject="Computer Science",
            score=88,
            total_study_hours=35.0,
            quizzes_taken=12,
            average_quiz_score=85
        ),
        SubjectPerformance(
            subject="English",
            score=72,
            total_study_hours=15.0,
            quizzes_taken=5,
            average_quiz_score=70
        ),
    ]
    
    weekly_progress = [
        WeeklyProgress(day="Mon", study_hours=4.5, tasks_completed=5, quizzes_taken=1),
        WeeklyProgress(day="Tue", study_hours=5.2, tasks_completed=6, quizzes_taken=2),
        WeeklyProgress(day="Wed", study_hours=3.8, tasks_completed=4, quizzes_taken=1),
        WeeklyProgress(day="Thu", study_hours=6.1, tasks_completed=7, quizzes_taken=2),
        WeeklyProgress(day="Fri", study_hours=4.9, tasks_completed=5, quizzes_taken=1),
        WeeklyProgress(day="Sat", study_hours=2.5, tasks_completed=3, quizzes_taken=0),
        WeeklyProgress(day="Sun", study_hours=5.0, tasks_completed=4, quizzes_taken=1),
    ]
    
    return AnalyticsResponse(
        total_study_hours=95.5,
        total_tasks_completed=34,
        total_quizzes_taken=31,
        average_quiz_score=73,
        current_streak=12,
        weekly_goal_progress=0.85,
        subject_performance=subject_performance,
        weekly_progress=weekly_progress,
        weak_areas=[
            {"topic": "Integration", "score": 45, "subject": "Mathematics"},
            {"topic": "Thermodynamics", "score": 52, "subject": "Physics"},
            {"topic": "Essay Writing", "score": 58, "subject": "English"},
        ],
        strong_areas=[
            {"topic": "Data Structures", "score": 92, "subject": "Computer Science"},
            {"topic": "Algebra", "score": 88, "subject": "Mathematics"},
            {"topic": "Algorithms", "score": 90, "subject": "Computer Science"},
        ]
    )


@router.get("/study-sessions")
async def get_study_sessions(
    days: int = 7,
    current_user: dict = Depends(get_current_user)
):
    """Get study session history."""
    sessions = []
    base_date = datetime.now()
    
    for i in range(days):
        date = base_date - timedelta(days=i)
        sessions.append({
            "date": date.strftime("%Y-%m-%d"),
            "total_minutes": 180 + (i * 20) % 120,
            "subjects": ["Mathematics", "Physics", "Computer Science"][i % 3:],
            "breaks_taken": 3 + (i % 2),
            "focus_score": 75 + (i * 3) % 25
        })
    
    return sessions


@router.get("/insights")
async def get_ai_insights(current_user: dict = Depends(get_current_user)):
    """Get AI-generated learning insights."""
    return {
        "insights": [
            {
                "type": "recommendation",
                "title": "Focus on Integration",
                "description": "Your performance in integration problems is below average. Consider spending more time on Chapter 6.",
                "priority": "high"
            },
            {
                "type": "achievement",
                "title": "Strong in Algorithms",
                "description": "You're excelling in algorithms! Your score is 20% above the class average.",
                "priority": "low"
            },
            {
                "type": "habit",
                "title": "Study Time Pattern",
                "description": "You study best between 9-11 AM. Consider scheduling difficult topics during this time.",
                "priority": "medium"
            },
            {
                "type": "goal",
                "title": "Weekly Goal Progress",
                "description": "You're on track to complete 85% of your weekly study goal. 2 more hours needed!",
                "priority": "medium"
            }
        ],
        "generated_at": datetime.utcnow().isoformat()
    }


@router.get("/comparison")
async def get_peer_comparison(current_user: dict = Depends(get_current_user)):
    """Get anonymous peer comparison data."""
    return {
        "your_percentile": 75,
        "avg_study_hours_comparison": {
            "you": 32.5,
            "class_average": 28.0
        },
        "quiz_score_comparison": {
            "you": 78,
            "class_average": 72
        },
        "consistency_score": 85,
        "rank_in_subject": {
            "Mathematics": 12,
            "Physics": 25,
            "Computer Science": 5
        },
        "improvement_areas": ["Physics", "Essay Writing"],
        "note": "Comparison is anonymized and based on aggregate data"
    }
