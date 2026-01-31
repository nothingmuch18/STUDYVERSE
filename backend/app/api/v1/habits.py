"""
Habits API routes.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date

from app.core.security import get_current_user

router = APIRouter()

# In-memory storage
habits_db: dict = {}
habit_logs_db: dict = {}


class HabitCreate(BaseModel):
    """Habit creation request."""
    name: str
    description: Optional[str] = None
    frequency: str = "daily"  # daily, weekly
    target_count: int = 1
    icon: Optional[str] = None


class HabitResponse(BaseModel):
    """Habit response schema."""
    id: str
    user_id: str
    name: str
    description: Optional[str]
    frequency: str
    target_count: int
    current_count: int
    streak: int
    icon: Optional[str]
    created_at: str


class HabitLog(BaseModel):
    """Habit completion log."""
    habit_id: str
    date: str
    count: int


@router.get("", response_model=List[HabitResponse])
async def get_habits(current_user: dict = Depends(get_current_user)):
    """Get all habits for current user."""
    user_habits = [
        habit for habit in habits_db.values()
        if habit["user_id"] == current_user["id"]
    ]
    
    # Return demo habits if empty
    if not user_habits:
        demo_habits = [
            HabitResponse(
                id="habit_1",
                user_id=current_user["id"],
                name="Morning Study",
                description="Study for 1 hour in the morning",
                frequency="daily",
                target_count=1,
                current_count=1,
                streak=7,
                icon="📚",
                created_at=datetime.utcnow().isoformat()
            ),
            HabitResponse(
                id="habit_2",
                user_id=current_user["id"],
                name="Practice Problems",
                description="Solve 5 practice problems daily",
                frequency="daily",
                target_count=5,
                current_count=3,
                streak=4,
                icon="✏️",
                created_at=datetime.utcnow().isoformat()
            ),
            HabitResponse(
                id="habit_3",
                user_id=current_user["id"],
                name="Review Notes",
                description="Review notes before bed",
                frequency="daily",
                target_count=1,
                current_count=0,
                streak=2,
                icon="📝",
                created_at=datetime.utcnow().isoformat()
            ),
        ]
        return demo_habits
    
    return user_habits


@router.post("", response_model=HabitResponse)
async def create_habit(
    habit_data: HabitCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new habit."""
    habit_id = f"habit_{len(habits_db) + 1}"
    
    habit = {
        "id": habit_id,
        "user_id": current_user["id"],
        "name": habit_data.name,
        "description": habit_data.description,
        "frequency": habit_data.frequency,
        "target_count": habit_data.target_count,
        "current_count": 0,
        "streak": 0,
        "icon": habit_data.icon,
        "created_at": datetime.utcnow().isoformat(),
    }
    
    habits_db[habit_id] = habit
    return habit


@router.post("/{habit_id}/log", response_model=HabitResponse)
async def log_habit(
    habit_id: str,
    count: int = 1,
    current_user: dict = Depends(get_current_user)
):
    """Log habit completion."""
    habit = habits_db.get(habit_id)
    if not habit or habit["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    today = date.today().isoformat()
    log_key = f"{habit_id}_{today}"
    
    if log_key in habit_logs_db:
        habit_logs_db[log_key]["count"] += count
    else:
        habit_logs_db[log_key] = {
            "habit_id": habit_id,
            "date": today,
            "count": count
        }
    
    habit["current_count"] = habit_logs_db[log_key]["count"]
    
    # Update streak if target reached
    if habit["current_count"] >= habit["target_count"]:
        habit["streak"] += 1
    
    return habit


@router.get("/{habit_id}/history")
async def get_habit_history(
    habit_id: str,
    days: int = 30,
    current_user: dict = Depends(get_current_user)
):
    """Get habit completion history."""
    habit = habits_db.get(habit_id)
    if not habit or habit["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    history = [
        log for log in habit_logs_db.values()
        if log["habit_id"] == habit_id
    ]
    
    return {"habit_id": habit_id, "history": history}


@router.delete("/{habit_id}")
async def delete_habit(
    habit_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a habit."""
    habit = habits_db.get(habit_id)
    if not habit or habit["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    del habits_db[habit_id]
    
    # Clean up logs
    keys_to_delete = [k for k in habit_logs_db if k.startswith(f"{habit_id}_")]
    for key in keys_to_delete:
        del habit_logs_db[key]
    
    return {"message": "Habit deleted successfully"}
