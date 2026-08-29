import datetime
import grpc
from typing import Optional
from slugify import slugify
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import SessionLocal
from app.db.models import (
    User,
    EventType,
    AvailabilityRule,
    AvailabilityException,
    Slot,
    Booking,
    Teacher,
    Enroller,
    Subscription,
    SlotRequest,
)
from app.domain.slot_service import regenerate_host_slots, generate_slot_id
from app.domain.slot_generation import parse_iso_datetime, parse_iso_date
from app.proto import cohort_pb2, cohort_pb2_grpc

def to_iso(dt: Optional[datetime.datetime]) -> str:
    return dt.isoformat() if dt else ""

def to_date_str(d: Optional[datetime.date]) -> str:
    return d.isoformat() if d else ""

def user_to_proto(user: User, event_types_count: int = 0, bookings_count: int = 0) -> cohort_pb2.UserModel:
    return cohort_pb2.UserModel(
        id=user.id,
        email=user.email,
        name=user.name,
        slug=user.slug,
        timezone=user.timezone or "UTC",
        created_at=to_iso(user.createdAt),
        updated_at=to_iso(user.updatedAt),
        count=cohort_pb2.UserCount(
            event_types=event_types_count,
            bookings=bookings_count,
        ),
    )

def event_type_to_proto(et: EventType) -> cohort_pb2.EventTypeModel:
    return cohort_pb2.EventTypeModel(
        id=et.id,
        host_id=et.hostId,
        title=et.title,
        description=et.description or "",
        slug=et.slug,
        duration_minutes=et.durationMinutes,
        is_active=et.isActive,
        location_type=et.locationType or "online",
        location_value=et.locationValue or "",
        buffer_before_minutes=et.bufferBeforeMinutes,
        buffer_after_minutes=et.bufferAfterMinutes,
        created_at=to_iso(et.createdAt),
        updated_at=to_iso(et.updatedAt),
    )

def rule_to_proto(r: AvailabilityRule) -> cohort_pb2.AvailabilityRuleModel:
    return cohort_pb2.AvailabilityRuleModel(
        id=r.id,
        user_id=r.userId,
        weekday=r.weekday,
        start_time=r.startTime,
        end_time=r.endTime,
        is_active=r.isActive,
        timezone=r.timezone or "UTC",
        created_at=to_iso(r.createdAt),
        updated_at=to_iso(r.updatedAt),
    )

def exception_to_proto(ex: AvailabilityException) -> cohort_pb2.AvailabilityExceptionModel:
    return cohort_pb2.AvailabilityExceptionModel(
        id=ex.id,
        user_id=ex.userId,
        date=to_date_str(ex.date),
        type=ex.type,
        start_time=ex.startTime or "",
        end_time=ex.endTime or "",
        timezone=ex.timezone or "UTC",
        reason=ex.reason or "",
        created_at=to_iso(ex.createdAt),
        updated_at=to_iso(ex.updatedAt),
    )

def slot_to_proto(s: Slot) -> cohort_pb2.SlotModel:
    et_proto = event_type_to_proto(s.event_type) if s.event_type else None
    return cohort_pb2.SlotModel(
        id=s.id,
        host_id=s.hostId,
        event_type_id=s.eventTypeId,
        start_at=to_iso(s.startAt),
        end_at=to_iso(s.endAt),
        status=s.status,
        created_at=to_iso(s.createdAt),
        updated_at=to_iso(s.updatedAt),
        event_type=et_proto,
    )

def booking_to_proto(b: Booking) -> cohort_pb2.BookingModel:
    slot_proto = slot_to_proto(b.slot) if b.slot else None
    et_proto = event_type_to_proto(b.event_type) if b.event_type else None
    host_proto = user_to_proto(b.host) if b.host else None

    return cohort_pb2.BookingModel(
        id=b.id,
        host_id=b.hostId,
        event_type_id=b.eventTypeId,
        slot_id=b.slotId,
        invitee_email=b.inviteeEmail,
        invitee_name=b.inviteeName,
        invitee_notes=b.inviteeNotes or "",
        status=b.status,
        meet_link=b.meetLink or "",
        calendar_event_id=b.calendarEventId or "",
        cancelled_at=to_iso(b.cancelledAt),
        created_at=to_iso(b.createdAt),
        updated_at=to_iso(b.updatedAt),
        slot=slot_proto,
        event_type=et_proto,
        host=host_proto,
    )


# ========================================================
# USER SERVICER
# ========================================================

class UserServicer(cohort_pb2_grpc.UserServiceServicer):
    def ListUsers(self, request, context):
        with SessionLocal() as db:
            users = db.query(User).order_by(User.createdAt.asc()).all()
            result = []
            for u in users:
                et_count = db.query(func.count(EventType.id)).filter(EventType.hostId == u.id).scalar() or 0
                b_count = db.query(func.count(Booking.id)).filter(Booking.hostId == u.id).scalar() or 0
                result.append(user_to_proto(u, et_count, b_count))
            return cohort_pb2.ListUsersResponse(users=result)

    def GetUserById(self, request, context):
        with SessionLocal() as db:
            user = db.query(User).filter(User.id == request.id).first()
            if not user:
                context.abort(grpc.StatusCode.NOT_FOUND, f"User with id {request.id} not found")
            return user_to_proto(user)

    def GetUserBySlug(self, request, context):
        with SessionLocal() as db:
            user = db.query(User).filter(User.slug == request.slug).first()
            if not user:
                context.abort(grpc.StatusCode.NOT_FOUND, f"User with slug {request.slug} not found")
            return user_to_proto(user)

    def CreateUser(self, request, context):
        with SessionLocal() as db:
            existing = db.query(User).filter(User.email == request.email).first()
            if existing:
                context.abort(grpc.StatusCode.ALREADY_EXISTS, "User with this email already exists")

            slug_val = request.slug or slugify(request.name)
            slug_exists = db.query(User).filter(User.slug == slug_val).first()
            if slug_exists:
                context.abort(grpc.StatusCode.ALREADY_EXISTS, "User with this slug already exists")

            user = User(
                name=request.name,
                email=request.email,
                slug=slug_val,
                timezone=request.timezone or "UTC",
                createdAt=datetime.datetime.utcnow(),
                updatedAt=datetime.datetime.utcnow(),
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            # Automatically create default availability rules Mon-Fri 09:00 - 17:00
            for day in range(1, 6):
                db.add(AvailabilityRule(
                    userId=user.id,
                    weekday=day,
                    startTime="09:00",
                    endTime="17:00",
                    isActive=True,
                    timezone=user.timezone,
                    createdAt=datetime.datetime.utcnow(),
                    updatedAt=datetime.datetime.utcnow(),
                ))
            db.commit()

            return user_to_proto(user)

    def UpdateUser(self, request, context):
        with SessionLocal() as db:
            user = db.query(User).filter(User.id == request.id).first()
            if not user:
                context.abort(grpc.StatusCode.NOT_FOUND, "User not found")

            if request.HasField("name"):
                user.name = request.name
            if request.HasField("email") and request.email != user.email:
                if db.query(User).filter(User.email == request.email).first():
                    context.abort(grpc.StatusCode.ALREADY_EXISTS, "Email already taken")
                user.email = request.email
            if request.HasField("slug") and request.slug != user.slug:
                if db.query(User).filter(User.slug == request.slug).first():
                    context.abort(grpc.StatusCode.ALREADY_EXISTS, "Slug already taken")
                user.slug = request.slug
            if request.HasField("timezone"):
                user.timezone = request.timezone

            user.updatedAt = datetime.datetime.utcnow()
            db.commit()
            db.refresh(user)
            return user_to_proto(user)

    def DeleteUser(self, request, context):
        with SessionLocal() as db:
            user = db.query(User).filter(User.id == request.id).first()
            if not user:
                context.abort(grpc.StatusCode.NOT_FOUND, "User not found")
            db.delete(user)
            db.commit()
            return cohort_pb2.StatusResponse(success=True, message="User deleted")


# ========================================================
# EVENT TYPE SERVICER
# ========================================================

class EventTypeServicer(cohort_pb2_grpc.EventTypeServiceServicer):
    def ListEventTypes(self, request, context):
        with SessionLocal() as db:
            ets = db.query(EventType).filter(EventType.hostId == request.host_id).order_by(EventType.createdAt.asc()).all()
            return cohort_pb2.ListEventTypesResponse(event_types=[event_type_to_proto(et) for et in ets])

    def GetEventTypeById(self, request, context):
        with SessionLocal() as db:
            et = db.query(EventType).filter(EventType.id == request.id).first()
            if not et:
                context.abort(grpc.StatusCode.NOT_FOUND, "Event type not found")
            return event_type_to_proto(et)

    def GetEventTypeBySlug(self, request, context):
        with SessionLocal() as db:
            et = db.query(EventType).filter(
                EventType.hostId == request.host_id,
                EventType.slug == request.slug
            ).first()
            if not et:
                context.abort(grpc.StatusCode.NOT_FOUND, "Event type not found")
            return event_type_to_proto(et)

    def GetPublicEventType(self, request, context):
        with SessionLocal() as db:
            et = db.query(EventType).filter(
                EventType.hostId == request.host_id,
                EventType.slug == request.slug,
                EventType.isActive == True
            ).first()
            if not et:
                context.abort(grpc.StatusCode.NOT_FOUND, "Event type not found or inactive")

            host = db.query(User).filter(User.id == request.host_id).first()
            if not host:
                context.abort(grpc.StatusCode.NOT_FOUND, "Host not found")

            return cohort_pb2.PublicEventTypeResponse(
                event_type=event_type_to_proto(et),
                host=user_to_proto(host),
            )

    def CreateEventType(self, request, context):
        with SessionLocal() as db:
            slug_val = request.slug or slugify(request.title)
            existing = db.query(EventType).filter(
                EventType.hostId == request.host_id,
                EventType.slug == slug_val
            ).first()
            if existing:
                context.abort(grpc.StatusCode.ALREADY_EXISTS, "Event type slug already exists for this host")

            et = EventType(
                hostId=request.host_id,
                title=request.title,
                description=request.description or None,
                slug=slug_val,
                durationMinutes=request.duration_minutes,
                isActive=request.is_active,
                locationType=request.location_type or "online",
                locationValue=request.location_value or None,
                bufferBeforeMinutes=request.buffer_before_minutes,
                bufferAfterMinutes=request.buffer_after_minutes,
                createdAt=datetime.datetime.utcnow(),
                updatedAt=datetime.datetime.utcnow(),
            )
            db.add(et)
            db.commit()
            db.refresh(et)

            # Trigger background slot regeneration
            try:
                regenerate_host_slots(db, request.host_id)
            except Exception as e:
                print(f"Slot regeneration error: {e}")

            return event_type_to_proto(et)

    def UpdateEventType(self, request, context):
        with SessionLocal() as db:
            et = db.query(EventType).filter(
                EventType.id == request.id,
                EventType.hostId == request.host_id
            ).first()
            if not et:
                context.abort(grpc.StatusCode.NOT_FOUND, "Event type not found")

            if request.HasField("title"):
                et.title = request.title
            if request.HasField("description"):
                et.description = request.description
            if request.HasField("slug") and request.slug != et.slug:
                if db.query(EventType).filter(EventType.hostId == request.host_id, EventType.slug == request.slug).first():
                    context.abort(grpc.StatusCode.ALREADY_EXISTS, "Slug already taken")
                et.slug = request.slug
            if request.HasField("duration_minutes"):
                et.durationMinutes = request.duration_minutes
            if request.HasField("is_active"):
                et.isActive = request.is_active
            if request.HasField("location_type"):
                et.locationType = request.location_type
            if request.HasField("location_value"):
                et.locationValue = request.location_value
            if request.HasField("buffer_before_minutes"):
                et.bufferBeforeMinutes = request.buffer_before_minutes
            if request.HasField("buffer_after_minutes"):
                et.bufferAfterMinutes = request.buffer_after_minutes

            et.updatedAt = datetime.datetime.utcnow()
            db.commit()
            db.refresh(et)

            # Trigger background slot regeneration
            try:
                regenerate_host_slots(db, request.host_id)
            except Exception as e:
                print(f"Slot regeneration error: {e}")

            return event_type_to_proto(et)

    def DeleteEventType(self, request, context):
        with SessionLocal() as db:
            et = db.query(EventType).filter(
                EventType.id == request.id,
                EventType.hostId == request.host_id
            ).first()
            if not et:
                context.abort(grpc.StatusCode.NOT_FOUND, "Event type not found")
            db.delete(et)
            db.commit()
            return cohort_pb2.StatusResponse(success=True, message="Event type deleted")


# ========================================================
# AVAILABILITY SERVICER
# ========================================================

class AvailabilityServicer(cohort_pb2_grpc.AvailabilityServiceServicer):
    def ListRules(self, request, context):
        with SessionLocal() as db:
            rules = db.query(AvailabilityRule).filter(
                AvailabilityRule.userId == request.user_id
            ).order_by(AvailabilityRule.weekday.asc(), AvailabilityRule.startTime.asc()).all()
            return cohort_pb2.ListRulesResponse(rules=[rule_to_proto(r) for r in rules])

    def CreateRule(self, request, context):
        with SessionLocal() as db:
            rule = AvailabilityRule(
                userId=request.user_id,
                weekday=request.weekday,
                startTime=request.start_time,
                endTime=request.end_time,
                isActive=request.is_active,
                timezone=request.timezone or "UTC",
                createdAt=datetime.datetime.utcnow(),
                updatedAt=datetime.datetime.utcnow(),
            )
            db.add(rule)
            db.commit()
            db.refresh(rule)

            try:
                regenerate_host_slots(db, request.user_id)
            except Exception:
                pass

            return rule_to_proto(rule)

    def UpdateRule(self, request, context):
        with SessionLocal() as db:
            rule = db.query(AvailabilityRule).filter(
                AvailabilityRule.id == request.id,
                AvailabilityRule.userId == request.user_id
            ).first()
            if not rule:
                context.abort(grpc.StatusCode.NOT_FOUND, "Availability rule not found")

            if request.HasField("weekday"):
                rule.weekday = request.weekday
            if request.HasField("start_time"):
                rule.startTime = request.start_time
            if request.HasField("end_time"):
                rule.endTime = request.end_time
            if request.HasField("is_active"):
                rule.isActive = request.is_active
            if request.HasField("timezone"):
                rule.timezone = request.timezone

            rule.updatedAt = datetime.datetime.utcnow()
            db.commit()
            db.refresh(rule)

            try:
                regenerate_host_slots(db, request.user_id)
            except Exception:
                pass

            return rule_to_proto(rule)

    def DeleteRule(self, request, context):
        with SessionLocal() as db:
            rule = db.query(AvailabilityRule).filter(
                AvailabilityRule.id == request.id,
                AvailabilityRule.userId == request.user_id
            ).first()
            if not rule:
                context.abort(grpc.StatusCode.NOT_FOUND, "Rule not found")
            db.delete(rule)
            db.commit()

            try:
                regenerate_host_slots(db, request.user_id)
            except Exception:
                pass

            return cohort_pb2.StatusResponse(success=True, message="Rule deleted")

    def ListExceptions(self, request, context):
        with SessionLocal() as db:
            query = db.query(AvailabilityException).filter(AvailabilityException.userId == request.user_id)
            if request.HasField("from"):
                query = query.filter(AvailabilityException.date >= parse_iso_date(getattr(request, "from")))
            if request.HasField("to"):
                query = query.filter(AvailabilityException.date <= parse_iso_date(request.to))
            exceptions = query.order_by(AvailabilityException.date.asc()).all()
            return cohort_pb2.ListExceptionsResponse(exceptions=[exception_to_proto(ex) for ex in exceptions])

    def CreateException(self, request, context):
        with SessionLocal() as db:
            date_val = parse_iso_date(request.date)
            ex = AvailabilityException(
                userId=request.user_id,
                date=date_val,
                type=request.type,
                startTime=request.start_time if request.HasField("start_time") else None,
                endTime=request.end_time if request.HasField("end_time") else None,
                timezone=request.timezone if request.HasField("timezone") else "UTC",
                reason=request.reason if request.HasField("reason") else None,
                createdAt=datetime.datetime.utcnow(),
                updatedAt=datetime.datetime.utcnow(),
            )
            db.add(ex)
            db.commit()
            db.refresh(ex)

            try:
                regenerate_host_slots(db, request.user_id)
            except Exception:
                pass

            return exception_to_proto(ex)

    def UpdateException(self, request, context):
        with SessionLocal() as db:
            ex = db.query(AvailabilityException).filter(
                AvailabilityException.id == request.id,
                AvailabilityException.userId == request.user_id
            ).first()
            if not ex:
                context.abort(grpc.StatusCode.NOT_FOUND, "Exception not found")

            if request.HasField("date"):
                ex.date = parse_iso_date(request.date)
            if request.HasField("type"):
                ex.type = request.type
            if request.HasField("start_time"):
                ex.startTime = request.start_time
            if request.HasField("end_time"):
                ex.endTime = request.end_time
            if request.HasField("timezone"):
                ex.timezone = request.timezone
            if request.HasField("reason"):
                ex.reason = request.reason

            ex.updatedAt = datetime.datetime.utcnow()
            db.commit()
            db.refresh(ex)

            try:
                regenerate_host_slots(db, request.user_id)
            except Exception:
                pass

            return exception_to_proto(ex)

    def DeleteException(self, request, context):
        with SessionLocal() as db:
            ex = db.query(AvailabilityException).filter(
                AvailabilityException.id == request.id,
                AvailabilityException.userId == request.user_id
            ).first()
            if not ex:
                context.abort(grpc.StatusCode.NOT_FOUND, "Exception not found")
            db.delete(ex)
            db.commit()

            try:
                regenerate_host_slots(db, request.user_id)
            except Exception:
                pass

            return cohort_pb2.StatusResponse(success=True, message="Exception deleted")


# ========================================================
# SLOT SERVICER
# ========================================================

class SlotServicer(cohort_pb2_grpc.SlotServiceServicer):
    def GetAvailableSlots(self, request, context):
        with SessionLocal() as db:
            from sqlalchemy.orm import joinedload
            try:
                date_val = parse_iso_date(request.date)
            except Exception:
                context.abort(grpc.StatusCode.INVALID_ARGUMENT, "Invalid date format, expected YYYY-MM-DD")

            start_dt = datetime.datetime(date_val.year, date_val.month, date_val.day, 0, 0, 0)
            end_dt = datetime.datetime(date_val.year, date_val.month, date_val.day, 23, 59, 59)

            slots = db.query(Slot).options(joinedload(Slot.event_type)).filter(
                Slot.eventTypeId == request.event_type_id,
                Slot.startAt >= start_dt,
                Slot.startAt <= end_dt,
                Slot.status == "AVAILABLE"
            ).order_by(Slot.startAt.asc()).all()

            return cohort_pb2.ListSlotsResponse(slots=[slot_to_proto(s) for s in slots])

    def ListSlotsForHost(self, request, context):
        with SessionLocal() as db:
            from sqlalchemy.orm import joinedload
            query = db.query(Slot).options(joinedload(Slot.event_type)).filter(
                Slot.hostId == request.host_id,
                Slot.status.in_(["AVAILABLE", "BOOKED"])
            )
            if request.HasField("from"):
                from_val = getattr(request, "from")
                if len(from_val) == 10:
                    from_dt = parse_iso_datetime(from_val + "T00:00:00Z")
                else:
                    from_dt = parse_iso_datetime(from_val)
                query = query.filter(Slot.startAt >= from_dt)
            if request.HasField("to"):
                to_val = request.to
                if len(to_val) == 10:
                    to_dt = parse_iso_datetime(to_val + "T23:59:59Z")
                else:
                    to_dt = parse_iso_datetime(to_val)
                query = query.filter(Slot.endAt <= to_dt)
            slots = query.order_by(Slot.startAt.asc()).all()
            return cohort_pb2.ListSlotsResponse(slots=[slot_to_proto(s) for s in slots])

    def CreateSlot(self, request, context):
        with SessionLocal() as db:
            slot = Slot(
                id=generate_slot_id(),
                hostId=request.host_id,
                eventTypeId=request.event_type_id,
                startAt=parse_iso_datetime(request.start_at),
                endAt=parse_iso_datetime(request.end_at),
                status="AVAILABLE",
                createdAt=datetime.datetime.utcnow(),
                updatedAt=datetime.datetime.utcnow(),
            )
            db.add(slot)
            db.commit()
            db.refresh(slot)
            return slot_to_proto(slot)

    def UpdateSlot(self, request, context):
        with SessionLocal() as db:
            from sqlalchemy.orm import joinedload
            slot = db.query(Slot).options(joinedload(Slot.event_type)).filter(
                Slot.id == request.id,
                Slot.hostId == request.host_id,
            ).first()
            if not slot:
                context.abort(grpc.StatusCode.NOT_FOUND, "Slot not found")

            if request.HasField("event_type_id"):
                slot.eventTypeId = request.event_type_id
            if request.HasField("start_at"):
                slot.startAt = parse_iso_datetime(request.start_at)
            if request.HasField("end_at"):
                slot.endAt = parse_iso_datetime(request.end_at)
            if request.HasField("status"):
                slot.status = request.status

            slot.updatedAt = datetime.datetime.utcnow()
            db.commit()
            db.refresh(slot)
            return slot_to_proto(slot)

    def DeleteSlot(self, request, context):
        with SessionLocal() as db:
            slot = db.query(Slot).filter(
                Slot.id == request.id,
                Slot.hostId == request.host_id,
            ).first()
            if not slot:
                context.abort(grpc.StatusCode.NOT_FOUND, "Slot not found")

            if slot.status == "BOOKED":
                context.abort(grpc.StatusCode.FAILED_PRECONDITION, "Cannot delete a booked slot. Please cancel the booking first.")

            db.delete(slot)
            db.commit()
            return cohort_pb2.StatusResponse(success=True, message="Slot deleted successfully")

    def RegenerateSlots(self, request, context):
        with SessionLocal() as db:
            from_str = getattr(request, "from") if request.HasField("from") else None
            to_str = request.to if request.HasField("to") else None
            count = regenerate_host_slots(db, request.host_id, from_str, to_str)
            return cohort_pb2.RegenerateSlotsResponse(
                success=True,
                generated_count=count,
                message=f"Successfully regenerated {count} slots",
            )


# ========================================================
# BOOKING SERVICER
# ========================================================

class BookingServicer(cohort_pb2_grpc.BookingServiceServicer):
    def ListBookings(self, request, context):
        with SessionLocal() as db:
            bookings = db.query(Booking).filter(
                Booking.hostId == request.host_id
            ).order_by(Booking.createdAt.desc()).all()
            return cohort_pb2.ListBookingsResponse(bookings=[booking_to_proto(b) for b in bookings])

    def GetBookingById(self, request, context):
        with SessionLocal() as db:
            booking = db.query(Booking).filter(Booking.id == request.id).first()
            if not booking:
                context.abort(grpc.StatusCode.NOT_FOUND, "Booking not found")
            return booking_to_proto(booking)

    def CreateBooking(self, request, context):
        with SessionLocal() as db:
            slot = db.query(Slot).filter(Slot.id == request.slot_id).first()
            if not slot:
                context.abort(grpc.StatusCode.NOT_FOUND, "Slot not found")
            if slot.status != "AVAILABLE":
                context.abort(grpc.StatusCode.FAILED_PRECONDITION, "Slot is no longer available")

            # Lock slot
            slot.status = "BOOKED"
            slot.updatedAt = datetime.datetime.utcnow()

            # Generate meet link
            random_code = f"co-{slot.id[:3]}-{slot.id[3:7]}-{slot.id[7:10]}"
            meet_link = f"https://meet.google.com/{random_code}"

            booking = Booking(
                hostId=slot.hostId,
                eventTypeId=request.event_type_id,
                slotId=slot.id,
                inviteeName=request.invitee_name,
                inviteeEmail=request.invitee_email,
                inviteeNotes=request.invitee_notes or None,
                status="CONFIRMED",
                meetLink=meet_link,
                createdAt=datetime.datetime.utcnow(),
                updatedAt=datetime.datetime.utcnow(),
            )
            db.add(booking)
            db.commit()
            db.refresh(booking)

            return booking_to_proto(booking)

    def CancelBooking(self, request, context):
        with SessionLocal() as db:
            booking = db.query(Booking).filter(
                Booking.id == request.id,
                Booking.hostId == request.host_id
            ).first()
            if not booking:
                context.abort(grpc.StatusCode.NOT_FOUND, "Booking not found")

            booking.status = "CANCELLED"
            booking.cancelledAt = datetime.datetime.utcnow()
            booking.updatedAt = datetime.datetime.utcnow()

            if booking.slot:
                booking.slot.status = "AVAILABLE"
                booking.slot.updatedAt = datetime.datetime.utcnow()

            db.commit()
            db.refresh(booking)

            return booking_to_proto(booking)


# ========================================================
# ENROLLER & TEACHER SERVICER
# ========================================================

class EnrollerServicer(cohort_pb2_grpc.EnrollerServiceServicer):
    def CreateEnroller(self, request, context):
        with SessionLocal() as db:
            existing = db.query(Enroller).filter(Enroller.email == request.email).first()
            if existing:
                return cohort_pb2.EnrollerModel(
                    id=existing.id,
                    auth_id=existing.authId,
                    email=existing.email,
                    name=existing.name,
                    created_at=to_iso(existing.createdAt),
                    updated_at=to_iso(existing.updatedAt),
                )

            enroller = Enroller(
                email=request.email,
                name=request.name,
                authId=request.auth_id if request.HasField("auth_id") else "",
                createdAt=datetime.datetime.utcnow(),
                updatedAt=datetime.datetime.utcnow(),
            )
            db.add(enroller)
            db.commit()
            db.refresh(enroller)

            return cohort_pb2.EnrollerModel(
                id=enroller.id,
                auth_id=enroller.authId,
                email=enroller.email,
                name=enroller.name,
                created_at=to_iso(enroller.createdAt),
                updated_at=to_iso(enroller.updatedAt),
            )

    def Subscribe(self, request, context):
        with SessionLocal() as db:
            sub = db.query(Subscription).filter(
                Subscription.enrollerId == request.enroller_id,
                Subscription.eventTypeId == request.event_type_id
            ).first()
            if not sub:
                sub = Subscription(
                    enrollerId=request.enroller_id,
                    eventTypeId=request.event_type_id,
                    createdAt=datetime.datetime.utcnow(),
                )
                db.add(sub)
                db.commit()
                db.refresh(sub)

            return cohort_pb2.SubscriptionModel(
                id=sub.id,
                enroller_id=sub.enrollerId,
                event_type_id=sub.eventTypeId,
                created_at=to_iso(sub.createdAt),
                event_type=event_type_to_proto(sub.event_type) if sub.event_type else None,
            )

    def Unsubscribe(self, request, context):
        with SessionLocal() as db:
            sub = db.query(Subscription).filter(
                Subscription.enrollerId == request.enroller_id,
                Subscription.eventTypeId == request.event_type_id
            ).first()
            if sub:
                db.delete(sub)
                db.commit()
            return cohort_pb2.StatusResponse(success=True, message="Unsubscribed successfully")

    def CreateSlotRequest(self, request, context):
        with SessionLocal() as db:
            req = SlotRequest(
                enrollerId=request.enroller_id,
                eventTypeId=request.event_type_id,
                message=request.message,
                status="PENDING",
                createdAt=datetime.datetime.utcnow(),
            )
            db.add(req)
            db.commit()
            db.refresh(req)

            return cohort_pb2.SlotRequestModel(
                id=req.id,
                enroller_id=req.enrollerId,
                event_type_id=req.eventTypeId,
                message=req.message or "",
                status=req.status,
                created_at=to_iso(req.createdAt),
                enroller=cohort_pb2.EnrollerModel(
                    id=req.enroller.id,
                    auth_id=req.enroller.authId,
                    email=req.enroller.email,
                    name=req.enroller.name,
                ) if req.enroller else None,
                event_type=event_type_to_proto(req.event_type) if req.event_type else None,
            )

    def ListSubscriptions(self, request, context):
        with SessionLocal() as db:
            subs = db.query(Subscription).filter(Subscription.enrollerId == request.enroller_id).all()
            return cohort_pb2.ListSubscriptionsResponse(
                subscriptions=[
                    cohort_pb2.SubscriptionModel(
                        id=s.id,
                        enroller_id=s.enrollerId,
                        event_type_id=s.eventTypeId,
                        created_at=to_iso(s.createdAt),
                        event_type=event_type_to_proto(s.event_type) if s.event_type else None,
                    )
                    for s in subs
                ]
            )

    def ListSlotRequestsForTeacher(self, request, context):
        with SessionLocal() as db:
            ets = db.query(EventType.id).filter(EventType.hostId == request.teacher_user_id).all()
            et_ids = [e[0] for e in ets]
            reqs = db.query(SlotRequest).filter(SlotRequest.eventTypeId.in_(et_ids)).all()
            return cohort_pb2.ListSlotRequestsResponse(
                slot_requests=[
                    cohort_pb2.SlotRequestModel(
                        id=r.id,
                        enroller_id=r.enrollerId,
                        event_type_id=r.eventTypeId,
                        message=r.message or "",
                        status=r.status,
                        created_at=to_iso(r.createdAt),
                        enroller=cohort_pb2.EnrollerModel(
                            id=r.enroller.id,
                            auth_id=r.enroller.authId,
                            email=r.enroller.email,
                            name=r.enroller.name,
                        ) if r.enroller else None,
                        event_type=event_type_to_proto(r.event_type) if r.event_type else None,
                    )
                    for r in reqs
                ]
            )
