import asyncio
import os
import sys

# Ensure python path includes domain service root
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from temporalio.client import Client
from temporalio.worker import Worker

from app.core.config import settings
from app.core.logging import configure_logging, get_logger
from app.temporal.activities import (
    greet,
    regenerate_host_slots_activity,
    create_calendar_event_activity,
    send_email_activity,
)
from app.temporal.workflows import (
    HelloWorkflow,
    RegenerateHostSlotsWorkflow,
    NotifyBookingWorkflow,
)

configure_logging()
logger = get_logger("Temporal-Worker")

async def run_worker():
    logger.info(f"Connecting to Temporal Server at {settings.TEMPORAL_ADDRESS}...")
    
    # Retry connection to Temporal server if starting up
    client = None
    for attempt in range(1, 31):
        try:
            client = await Client.connect(settings.TEMPORAL_ADDRESS)
            logger.info(f"Connected to Temporal Server on attempt {attempt}")
            break
        except Exception as e:
            if attempt == 30:
                logger.error(f"Failed to connect to Temporal after {attempt} attempts: {e}", exc_info=True)
                raise
            logger.warning(f"Waiting for Temporal ({e}), retrying in 1s... ({attempt}/30)")
            await asyncio.sleep(1)

    worker = Worker(
        client,
        task_queue=settings.TEMPORAL_TASK_QUEUE,
        workflows=[
            HelloWorkflow,
            RegenerateHostSlotsWorkflow,
            NotifyBookingWorkflow,
        ],
        activities=[
            greet,
            regenerate_host_slots_activity,
            create_calendar_event_activity,
            send_email_activity,
        ],
    )

    logger.info(f"🚀 Temporal Python worker running on task queue: '{settings.TEMPORAL_TASK_QUEUE}'")
    await worker.run()

def main():
    try:
        asyncio.run(run_worker())
    except KeyboardInterrupt:
        logger.info("Temporal Worker stopped gracefully.")

if __name__ == "__main__":
    main()
