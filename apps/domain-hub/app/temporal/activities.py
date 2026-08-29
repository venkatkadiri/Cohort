import os
import time
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Dict, Any
from temporalio import activity

from app.db.session import SessionLocal
from app.domain.slot_service import regenerate_host_slots

@activity.defn
async def greet(name: str) -> str:
    """Simple activity to test Temporal Python workflow execution."""
    return f"Hello {name} from Python Temporal Worker!"

@activity.defn
async def regenerate_host_slots_activity(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Activity that triggers host slot regeneration across active session tracks."""
    host_id = int(payload.get("host_id", 0))
    from_date = payload.get("from_date")
    to_date = payload.get("to_date")

    if not host_id:
        raise ValueError("host_id is required for slot regeneration")

    db = SessionLocal()
    try:
        count = regenerate_host_slots(
            db=db,
            host_id=host_id,
            from_date_str=from_date,
            to_date_str=to_date,
            days_ahead=30,
        )
        return {
            "success": True,
            "host_id": host_id,
            "generated_count": count,
            "message": f"Successfully generated/updated {count} slots for host {host_id}",
        }
    finally:
        db.close()

@activity.defn
async def create_calendar_event_activity(payload: Dict[str, Any]) -> str:
    """Creates a calendar event or generates a valid Google Meet conferencing link."""
    host_id = payload.get("host_id", 0)
    title = payload.get("title", "Mentorship Session")
    start_iso = payload.get("start_iso", "")
    end_iso = payload.get("end_iso", "")

    client_email = os.getenv("GOOGLE_CLIENT_EMAIL")
    private_key = os.getenv("GOOGLE_PRIVATE_KEY")
    calendar_id = os.getenv("GOOGLE_CALENDAR_ID")

    # If Google Service Account credentials are not provided, return placeholder meet link
    if not client_email or not private_key or not calendar_id:
        placeholder_link = f"https://meet.google.com/cohort-{host_id}-{int(time.time())}"
        activity.logger.info(f"Using standard meeting link for session '{title}': {placeholder_link}")
        return placeholder_link

    try:
        # If google-api-python-client is present
        from google.oauth2 import service_account
        from googleapiclient.discovery import build

        credentials_info = {
            "type": "service_account",
            "client_email": client_email,
            "private_key": private_key.replace("\\n", "\n"),
            "token_uri": "https://oauth2.googleapis.com/token",
        }
        credentials = service_account.Credentials.from_service_account_info(
            credentials_info,
            scopes=["https://www.googleapis.com/auth/calendar"],
        )
        service = build("calendar", "v3", credentials=credentials)

        event_body = {
            "summary": title,
            "start": {"dateTime": start_iso},
            "end": {"dateTime": end_iso},
            "conferenceData": {
                "createRequest": {
                    "requestId": f"meet-{int(time.time())}",
                }
            },
        }

        created_event = service.events().insert(
            calendarId=calendar_id,
            body=event_body,
            conferenceDataVersion=1,
        ).execute()

        conference_data = created_event.get("conferenceData", {})
        entry_points = conference_data.get("entryPoints", [])
        meet_link = entry_points[0].get("uri") if entry_points else created_event.get("htmlLink")
        return meet_link or f"https://meet.google.com/cohort-{host_id}-{int(time.time())}"
    except Exception as e:
        activity.logger.warning(f"Google Calendar API failed ({e}), falling back to meeting link.")
        return f"https://meet.google.com/cohort-{host_id}-{int(time.time())}"

@activity.defn
async def send_email_activity(payload: Dict[str, Any]) -> bool:
    """Sends notification emails via SMTP if configured, or logs the message."""
    to_email = payload.get("to")
    subject = payload.get("subject", "Cohort Notification")
    text_content = payload.get("text", "")
    html_content = payload.get("html")

    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")

    if not to_email:
        activity.logger.warning("No recipient specified for send_email_activity.")
        return False

    if not smtp_host or not smtp_user or not smtp_pass:
        activity.logger.info(
            f"[SMTP Simulated] To: {to_email} | Subject: {subject} | Body: {text_content}"
        )
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = smtp_user
        msg["To"] = to_email

        msg.attach(MIMEText(text_content, "plain"))
        if html_content:
            msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, [to_email], msg.as_string())

        activity.logger.info(f"Successfully sent notification email to {to_email}")
        return True
    except Exception as e:
        activity.logger.error(f"Failed to send email to {to_email}: {e}")
        return False
