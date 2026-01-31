"""
Study Plans API routes.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date

from app.core.security import get_current_user

router = APIRouter()

# In-memory storage
study_plans_db: dict = {}


class Subject(BaseModel):
    """Subject schema."""
    name: str
    topics: List[str]
    priority: str = "medium"
    hours_allocated: float = 0


class ScheduleItem(BaseModel):
    """Schedule item schema."""
    subject: str
    topic: str
    duration_minutes: int
    priority: str = "medium"
    completed: bool = False


class DailySchedule(BaseModel):
    """Daily schedule schema."""
    date: str
    subjects: List[ScheduleItem]
    total_hours: float
    notes: Optional[str] = None


class StudyPlanCreate(BaseModel):
    """Study plan creation request."""
    title: str
    subjects: List[Subject]
    start_date: str
    end_date: str
    study_hours_per_day: float = 4


class StudyPlanResponse(BaseModel):
    """Study plan response."""
    id: str
    user_id: str
    title: str
    subjects: List[Subject]
    start_date: str
    end_date: str
    daily_schedule: List[DailySchedule]
    is_active: bool
    created_at: str


@router.get("", response_model=List[StudyPlanResponse])
async def get_study_plans(current_user: dict = Depends(get_current_user)):
    """Get all study plans for current user."""
    user_plans = [
        plan for plan in study_plans_db.values() 
        if plan["user_id"] == current_user["id"]
    ]
    return user_plans


@router.post("", response_model=StudyPlanResponse)
async def create_study_plan(
    plan_data: StudyPlanCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new study plan (AI-generated schedule)."""
    plan_id = f"plan_{len(study_plans_db) + 1}"
    
    # Generate sample daily schedule (in production, this would use AI)
    daily_schedule = []
    start = datetime.strptime(plan_data.start_date, "%Y-%m-%d")
    end = datetime.strptime(plan_data.end_date, "%Y-%m-%d")
    
    current_date = start
    while current_date <= end:
        schedule_items = []
        for subject in plan_data.subjects[:3]:  # Max 3 subjects per day
            schedule_items.append(ScheduleItem(
                subject=subject.name,
                topic=subject.topics[0] if subject.topics else "General Review",
                duration_minutes=60,
                priority=subject.priority,
            ))
        
        daily_schedule.append(DailySchedule(
            date=current_date.strftime("%Y-%m-%d"),
            subjects=schedule_items,
            total_hours=len(schedule_items),
        ))
        current_date = datetime(current_date.year, current_date.month, current_date.day + 1) if current_date.day < 28 else datetime(current_date.year, current_date.month + 1, 1)
    
    plan = {
        "id": plan_id,
        "user_id": current_user["id"],
        "title": plan_data.title,
        "subjects": [s.model_dump() for s in plan_data.subjects],
        "start_date": plan_data.start_date,
        "end_date": plan_data.end_date,
        "daily_schedule": [d.model_dump() for d in daily_schedule[:30]],  # Limit to 30 days
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
    }
    
    study_plans_db[plan_id] = plan
    return plan


@router.get("/{plan_id}", response_model=StudyPlanResponse)
async def get_study_plan(
    plan_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific study plan."""
    plan = study_plans_db.get(plan_id)
    if not plan or plan["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study plan not found"
        )
    return plan


@router.delete("/{plan_id}")
async def delete_study_plan(
    plan_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a study plan."""
    plan = study_plans_db.get(plan_id)
    if not plan or plan["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study plan not found"
        )
    
    del study_plans_db[plan_id]
    return {"message": "Study plan deleted successfully"}


@router.post("/{plan_id}/adapt")
async def adapt_study_plan(
    plan_id: str,
    current_user: dict = Depends(get_current_user)
):
    """AI-adapt study plan based on performance."""
    plan = study_plans_db.get(plan_id)
    if not plan or plan["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study plan not found"
        )
    
    # In production, this would use AI to analyze performance and adapt
    return {
        "message": "Study plan adapted based on your performance",
        "adaptations": [
            "Increased focus on Mathematics - Integration",
            "Added extra revision sessions for Physics",
            "Optimized schedule for better retention"
        ]
    }
