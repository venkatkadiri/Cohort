from datetime import timedelta
from typing import Optional, Dict, Any
from temporalio import workflow

with workflow.unsafe.imports_passed_through():
    from app.temporal.activities import (
        greet,
        regenerate_host_slots_activity,
        create_calendar_event_activity,
        send_email_activity,
    )

@workflow.defn
class HelloWorkflow:
    @workflow.run
    async def run(self, name: str) -> str:
        return await workflow.execute_activity(
            greet,
            name,
            start_to_close_timeout=timedelta(minutes=1),
        )

@workflow.defn
class RegenerateHostSlotsWorkflow:
    @workflow.run
    async def run(
        self,
        host_id: int,
        from_date: Optional[str] = None,
        to_date: Optional[str] = None,
    ) -> Dict[str, Any]:
        return await workflow.execute_activity(
            regenerate_host_slots_activity,
            {
                "host_id": host_id,
                "from_date": from_date,
                "to_date": to_date,
            },
            start_to_close_timeout=timedelta(minutes=10),
        )

@workflow.defn
class NotifyBookingWorkflow:
    @workflow.run
    async def run(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        # 1. Create calendar event (returns conference / meet link)
        meet_link = await workflow.execute_activity(
            create_calendar_event_activity,
            payload,
            start_to_close_timeout=timedelta(minutes=2),
        )
        meet_link = meet_link or payload.get("meet_link", "")

        # 2. Build email notification
        invitee_name = payload.get("invitee_name", "Student")
        invitee_email = payload.get("invitee_email", "")
        title = payload.get("title", "Mentorship Session")
        start_iso = payload.get("start_iso", "")
        end_iso = payload.get("end_iso", "")

        subject = f"Booking confirmed: {title}"
        text = f"Hi {invitee_name}, your booking is confirmed for {start_iso} - {end_iso}. Join: {meet_link}"
        html = f"<p>Hi {invitee_name},</p><p>Your booking is confirmed for <strong>{start_iso}</strong> - <strong>{end_iso}</strong>.</p><p>Join session: <a href='{meet_link}'>{meet_link}</a></p>"

        # 3. Send email confirmation
        if invitee_email:
            await workflow.execute_activity(
                send_email_activity,
                {
                    "to": invitee_email,
                    "subject": subject,
                    "text": text,
                    "html": html,
                },
                start_to_close_timeout=timedelta(minutes=2),
            )

        return {
            "ok": True,
            "meetLink": meet_link,
            "status": "NOTIFIED",
        }
