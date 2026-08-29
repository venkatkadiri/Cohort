from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.db.session import get_db
from app.db.models import User, EventType, AvailabilityRule, AvailabilityException, Slot, Booking
from app.domain.slot_service import regenerate_host_slots

router = APIRouter()

# Health check
@router.get("/health")
def health_check():
    return {"status": "ok", "service": "cohort-domain-service"}

# User schemas
class UserCreateSchema(BaseModel):
    name: str
    email: str
    slug: Optional[str] = None
    timezone: Optional[str] = "UTC"

class UserResponseSchema(BaseModel):
    id: int
    name: str
    email: str
    slug: str
    timezone: str

@router.get("/users", response_model=List[UserResponseSchema])
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

@router.post("/users", response_model=UserResponseSchema)
def create_user(payload: UserCreateSchema, db: Session = Depends(get_db)):
    from slugify import slugify
    import datetime
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    slug_val = payload.slug or slugify(payload.name)
    user = User(
        name=payload.name,
        email=payload.email,
        slug=slug_val,
        timezone=payload.timezone or "UTC",
        createdAt=datetime.datetime.utcnow(),
        updatedAt=datetime.datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/hosts/{host_id}/regenerate-slots")
def trigger_regenerate_slots(host_id: int, db: Session = Depends(get_db)):
    count = regenerate_host_slots(db, host_id)
    return {"success": True, "generated_count": count}
