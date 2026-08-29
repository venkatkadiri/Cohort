import os
import sys
from typing import Optional, Dict, Any

# Ensure python path includes domain service root
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from temporalio.client import Client
from app.core.config import settings
from app.temporal.workflows import (
    HelloWorkflow,
    RegenerateHostSlotsWorkflow,
    NotifyBookingWorkflow,
)

async def get_temporal_client() -> Client:
    """Returns a connected Temporal client."""
    return await Client.connect(settings.TEMPORAL_ADDRESS)

async def trigger_hello_workflow(name: str = "Cohort Developer") -> str:
    """Triggers the HelloWorkflow and awaits its result."""
    client = await get_temporal_client()
    result = await client.execute_workflow(
        HelloWorkflow.run,
        name,
        id=f"hello-{int(os.getpid())}-{int(os.times().elapsed * 1000)}",
        task_queue=settings.TEMPORAL_TASK_QUEUE,
    )
    return result

async def trigger_regenerate_workflow(
    host_id: int,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
) -> Dict[str, Any]:
    """Triggers the RegenerateHostSlotsWorkflow and awaits its result."""
    client = await get_temporal_client()
    result = await client.execute_workflow(
        RegenerateHostSlotsWorkflow.run,
        args=[host_id, from_date, to_date],
        id=f"regen-host-{host_id}-{int(os.times().elapsed * 1000)}",
        task_queue=settings.TEMPORAL_TASK_QUEUE,
    )
    return result

async def trigger_notify_booking_workflow(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Triggers the NotifyBookingWorkflow in background."""
    client = await get_temporal_client()
    booking_id = payload.get("booking_id", "session")
    handle = await client.start_workflow(
        NotifyBookingWorkflow.run,
        payload,
        id=f"notify-booking-{booking_id}-{int(os.times().elapsed * 1000)}",
        task_queue=settings.TEMPORAL_TASK_QUEUE,
    )
    return {"workflow_id": handle.id, "run_id": handle.result_run_id}
