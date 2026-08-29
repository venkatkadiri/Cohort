import datetime
from app.db.session import SessionLocal, engine, Base
from app.db.models import User, EventType, AvailabilityRule, AvailabilityException, Teacher, Enroller

def seed_database():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count > 0:
            print("Database already has users, skipping seed.")
            return

        ada = User(
            email="ada@lovelace.dev",
            name="Ada Lovelace",
            slug="ada",
            timezone="UTC",
        )
        grace = User(
            email="grace@hopper.dev",
            name="Grace Hopper",
            slug="grace",
            timezone="America/New_York",
        )
        db.add_all([ada, grace])
        db.commit()
        db.refresh(ada)
        db.refresh(grace)

        # Teachers and Enrollers
        ada_teacher = Teacher(
            userId=ada.id,
            name=ada.name,
            email=ada.email,
            slug=ada.slug,
            timezone=ada.timezone,
        )
        grace_enroller = Enroller(
            name="Grace Admissions",
            email="admissions@hopper.dev",
            timezone="America/New_York",
        )
        db.add_all([ada_teacher, grace_enroller])

        # Event Types
        et1 = EventType(
            hostId=ada.id,
            title="Intro call",
            description="A quick 30 minute intro to see if we are a good fit.",
            slug="intro-call",
            durationMinutes=30,
            locationType="online",
            locationValue="Google Meet",
        )
        et2 = EventType(
            hostId=ada.id,
            title="Coffee chat",
            description="Grab a coffee and chat about anything.",
            slug="coffee-chat",
            durationMinutes=15,
            locationType="in-person",
            locationValue="Blue Bottle, Pine St",
            bufferBeforeMinutes=5,
            bufferAfterMinutes=5,
        )
        et3 = EventType(
            hostId=grace.id,
            title="Product demo",
            description="See the platform in action with a 45 minute guided walkthrough.",
            slug="product-demo",
            durationMinutes=45,
            locationType="online",
            isActive=False,
        )
        db.add_all([et1, et2, et3])

        # Availability Rules: Mon-Fri 9-17 for Ada (UTC), Tue-Thu 10-18 for Grace (NY)
        for weekday in range(1, 6):
            db.add(
                AvailabilityRule(
                    userId=ada.id,
                    weekday=weekday,
                    startTime="09:00",
                    endTime="17:00",
                    timezone="UTC",
                )
            )

        for weekday in [2, 3, 4]:
            db.add(
                AvailabilityRule(
                    userId=grace.id,
                    weekday=weekday,
                    startTime="10:00",
                    endTime="18:00",
                    timezone="America/New_York",
                )
            )

        # Exception: Ada blocks day two weeks out
        db.add(
            AvailabilityException(
                userId=ada.id,
                date=datetime.date.today() + datetime.timedelta(days=14),
                type="BLOCK_FULL_DAY",
                timezone="UTC",
                reason="Conference day",
            )
        )

        db.commit()
        print(f"✅ Successfully seeded database: {ada.email}, {grace.email}")
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
