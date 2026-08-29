import datetime
from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    timezone = Column(String, default="UTC", nullable=False)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    event_types = relationship("EventType", back_populates="host", cascade="all, delete-orphan")
    availability_rules = relationship("AvailabilityRule", back_populates="user", cascade="all, delete-orphan")
    availability_exceptions = relationship("AvailabilityException", back_populates="user", cascade="all, delete-orphan")
    slots = relationship("Slot", back_populates="host", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="host", cascade="all, delete-orphan")
    teacher = relationship("Teacher", back_populates="user", uselist=False, cascade="all, delete-orphan")


class EventType(Base):
    __tablename__ = "event_types"

    id = Column(Integer, primary_key=True, autoincrement=True)
    hostId = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    slug = Column(String, nullable=False)
    durationMinutes = Column(Integer, nullable=False)
    isActive = Column(Boolean, default=True, nullable=False)
    locationType = Column(String, default="online", nullable=False)
    locationValue = Column(String, nullable=True)
    bufferBeforeMinutes = Column(Integer, default=0, nullable=False)
    bufferAfterMinutes = Column(Integer, default=0, nullable=False)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    host = relationship("User", back_populates="event_types")
    slots = relationship("Slot", back_populates="event_type", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="event_type", cascade="all, delete-orphan")
    subscriptions = relationship("Subscription", back_populates="event_type", cascade="all, delete-orphan")
    slot_requests = relationship("SlotRequest", back_populates="event_type", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("hostId", "slug", name="event_types_hostId_slug_key"),
    )


class AvailabilityRule(Base):
    __tablename__ = "availability_rules"

    id = Column(Integer, primary_key=True, autoincrement=True)
    userId = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    weekday = Column(Integer, nullable=False) # 0=Sunday, 1=Monday... 6=Saturday
    startTime = Column(String, nullable=False) # "09:00"
    endTime = Column(String, nullable=False)   # "17:00"
    isActive = Column(Boolean, default=True, nullable=False)
    timezone = Column(String, default="UTC", nullable=False)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="availability_rules")

    __table_args__ = (
        Index("availability_rules_userId_weekday_idx", "userId", "weekday"),
    )


class AvailabilityException(Base):
    __tablename__ = "availability_exceptions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    userId = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    type = Column(String, nullable=False) # BLOCK_FULL_DAY, BLOCK_PARTIAL, ADD_AVAILABLE_WINDOW
    startTime = Column(String, nullable=True)
    endTime = Column(String, nullable=True)
    timezone = Column(String, default="UTC", nullable=False)
    reason = Column(String, nullable=True)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="availability_exceptions")

    __table_args__ = (
        Index("availability_exceptions_userId_date_idx", "userId", "date"),
    )


class Slot(Base):
    __tablename__ = "slots"

    id = Column(String, primary_key=True) # cuid or uuid
    hostId = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    eventTypeId = Column(Integer, ForeignKey("event_types.id", ondelete="CASCADE"), nullable=False)
    startAt = Column(DateTime(timezone=True), nullable=False)
    endAt = Column(DateTime(timezone=True), nullable=False)
    status = Column(String, default="AVAILABLE", nullable=False) # AVAILABLE, BOOKED, BLOCKED
    createdAt = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    host = relationship("User", back_populates="slots")
    event_type = relationship("EventType", back_populates="slots")
    bookings = relationship("Booking", back_populates="slot", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("eventTypeId", "startAt", "endAt", name="slots_eventTypeId_startAt_endAt_key"),
        Index("slots_hostId_startAt_idx", "hostId", "startAt"),
        Index("slots_eventTypeId_startAt_status_idx", "eventTypeId", "startAt", "status"),
    )


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    hostId = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    eventTypeId = Column(Integer, ForeignKey("event_types.id", ondelete="CASCADE"), nullable=False)
    slotId = Column(String, ForeignKey("slots.id", ondelete="CASCADE"), nullable=False)
    inviteeEmail = Column(String, nullable=False)
    inviteeNotes = Column(Text, nullable=True)
    inviteeName = Column(String, nullable=False)
    status = Column(String, default="PENDING", nullable=False) # PENDING, CONFIRMED, CANCELLED
    meetLink = Column(String, nullable=True)
    calendarEventId = Column(String, nullable=True)
    cancelledAt = Column(DateTime, nullable=True)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    host = relationship("User", back_populates="bookings")
    event_type = relationship("EventType", back_populates="bookings")
    slot = relationship("Slot", back_populates="bookings")

    __table_args__ = (
        Index("bookings_status_idx", "status"),
        Index("bookings_inviteeEmail_idx", "inviteeEmail"),
        Index("bookings_hostId_createdAt_idx", "hostId", "createdAt"),
    )


class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    authId = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    userId = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=True)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="teacher")


class Enroller(Base):
    __tablename__ = "enrollers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    authId = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    subscriptions = relationship("Subscription", back_populates="enroller", cascade="all, delete-orphan")
    slot_requests = relationship("SlotRequest", back_populates="enroller", cascade="all, delete-orphan")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    enrollerId = Column(Integer, ForeignKey("enrollers.id", ondelete="CASCADE"), nullable=False)
    eventTypeId = Column(Integer, ForeignKey("event_types.id", ondelete="CASCADE"), nullable=False)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    enroller = relationship("Enroller", back_populates="subscriptions")
    event_type = relationship("EventType", back_populates="subscriptions")

    __table_args__ = (
        UniqueConstraint("enrollerId", "eventTypeId", name="subscriptions_enrollerId_eventTypeId_key"),
    )


class SlotRequest(Base):
    __tablename__ = "slot_requests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    enrollerId = Column(Integer, ForeignKey("enrollers.id", ondelete="CASCADE"), nullable=False)
    eventTypeId = Column(Integer, ForeignKey("event_types.id", ondelete="CASCADE"), nullable=False)
    message = Column(Text, nullable=True)
    status = Column(String, default="PENDING", nullable=False)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    enroller = relationship("Enroller", back_populates="slot_requests")
    event_type = relationship("EventType", back_populates="slot_requests")
