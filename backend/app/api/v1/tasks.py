"""
Tasks API routes.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.core.security import get_current_user

router = APIRouter()

# In-memory storage
tasks_db: dict = {}


class TaskCreate(BaseModel):
    """Task creation request."""
    title: str
    description: Optional[str] = None
    priority: str = "medium"  # high, medium, low
    category: Optional[str] = None
    due_date: Optional[str] = None
    estimated_minutes: Optional[int] = None


class TaskUpdate(BaseModel):
    """Task update request."""
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[str] = None


class TaskResponse(BaseModel):
    """Task response schema."""
    id: str
    user_id: str
    title: str
    description: Optional[str]
    priority: str
    category: Optional[str]
    status: str
    due_date: Optional[str]
    estimated_minutes: Optional[int]
    completed_at: Optional[str]
    created_at: str


@router.get("", response_model=List[TaskResponse])
async def get_tasks(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all tasks for current user."""
    user_tasks = [
        task for task in tasks_db.values()
        if task["user_id"] == current_user["id"]
    ]
    
    if status:
        user_tasks = [t for t in user_tasks if t["status"] == status]
    if priority:
        user_tasks = [t for t in user_tasks if t["priority"] == priority]
    
    # Return demo tasks if empty
    if not user_tasks:
        demo_tasks = [
            TaskResponse(
                id="task_1",
                user_id=current_user["id"],
                title="Complete Math Chapter 5",
                description="Focus on integration problems",
                priority="high",
                category="Study",
                status="pending",
                due_date=datetime.now().strftime("%Y-%m-%d"),
                estimated_minutes=60,
                completed_at=None,
                created_at=datetime.utcnow().isoformat()
            ),
            TaskResponse(
                id="task_2",
                user_id=current_user["id"],
                title="Review Physics Notes",
                description="Thermodynamics chapter",
                priority="medium",
                category="Study",
                status="pending",
                due_date=datetime.now().strftime("%Y-%m-%d"),
                estimated_minutes=45,
                completed_at=None,
                created_at=datetime.utcnow().isoformat()
            ),
        ]
        return demo_tasks
    
    return user_tasks


@router.post("", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new task."""
    task_id = f"task_{len(tasks_db) + 1}"
    
    task = {
        "id": task_id,
        "user_id": current_user["id"],
        "title": task_data.title,
        "description": task_data.description,
        "priority": task_data.priority,
        "category": task_data.category,
        "status": "pending",
        "due_date": task_data.due_date,
        "estimated_minutes": task_data.estimated_minutes,
        "completed_at": None,
        "created_at": datetime.utcnow().isoformat(),
    }
    
    tasks_db[task_id] = task
    return task


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific task."""
    task = tasks_db.get(task_id)
    if not task or task["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a task."""
    task = tasks_db.get(task_id)
    if not task or task["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    update_data = task_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            task[key] = value
    
    return task


@router.post("/{task_id}/complete", response_model=TaskResponse)
async def complete_task(
    task_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Mark a task as completed."""
    task = tasks_db.get(task_id)
    if not task or task["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    task["status"] = "completed"
    task["completed_at"] = datetime.utcnow().isoformat()
    
    return task


@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a task."""
    task = tasks_db.get(task_id)
    if not task or task["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    del tasks_db[task_id]
    return {"message": "Task deleted successfully"}
