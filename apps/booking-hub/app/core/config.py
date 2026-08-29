import os
from pydantic import BaseModel

class Settings(BaseModel):
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://temporal:temporal@localhost:5433/temporal"
    )
    GRPC_PORT: int = int(os.getenv("GRPC_PORT", "50051"))
    HTTP_PORT: int = int(os.getenv("HTTP_PORT", "8000"))
    TEMPORAL_ADDRESS: str = os.getenv("TEMPORAL_ADDRESS", "localhost:7233")
    TEMPORAL_TASK_QUEUE: str = os.getenv("TEMPORAL_TASK_QUEUE", "cohort-task-queue")
    SLOT_GENERATION_DAYS: int = int(os.getenv("SLOT_GENERATION_DAYS", "30"))

settings = Settings()
