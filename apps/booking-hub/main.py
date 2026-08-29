import os
import sys
import time
import uuid
import threading
from concurrent import futures
import grpc
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
import uvicorn

# Ensure python path contains services/domain-service
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.logging import configure_logging, get_logger, set_correlation_id
from app.core.config import settings
from app.db.session import engine, Base
from app.api.router import router as api_router
from app.proto import cohort_pb2_grpc
from app.grpc_server.servicers import (
    UserServicer,
    EventTypeServicer,
    AvailabilityServicer,
    SlotServicer,
    BookingServicer,
    EnrollerServicer,
)
from app.grpc_server.interceptor import LoggingServerInterceptor

# Initialize Structured Logging
configure_logging()
logger = get_logger("Domain-Service")

# Initialize Database tables if not exist
Base.metadata.create_all(bind=engine)

# FastAPI Application
app = FastAPI(
    title="Cohort Domain Service",
    description="Python Domain Service for Cohort Mentorship & Office Hours (gRPC + FastAPI REST)",
    version="1.0.0",
)

class HTTPLoggingMiddleware(BaseHTTPMiddleware):
    """FastAPI Middleware that logs every incoming HTTP request with latency and correlation ID."""
    
    async def dispatch(self, request: Request, call_next) -> Response:
        corr_id = request.headers.get("X-Correlation-ID") or request.headers.get("X-Request-ID") or uuid.uuid4().hex[:8]
        set_correlation_id(corr_id)
        
        client_ip = request.client.host if request.client else "unknown"
        method = request.method
        path = request.url.path
        
        start_time = time.perf_counter()
        logger.debug(
            f"-> [HTTP] {method} {path} from {client_ip}",
            extra={"http_method": method, "path": path, "client_ip": client_ip, "correlation_id": corr_id},
        )
        
        try:
            response = await call_next(request)
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            
            response.headers["X-Correlation-ID"] = corr_id
            
            if response.status_code < 400:
                logger.info(
                    f"<- [HTTP] {method} {path} {response.status_code} [{duration_ms}ms]",
                    extra={"http_method": method, "path": path, "status_code": response.status_code, "duration_ms": duration_ms, "correlation_id": corr_id},
                )
            else:
                logger.warning(
                    f"⚠️ [HTTP] {method} {path} {response.status_code} [{duration_ms}ms]",
                    extra={"http_method": method, "path": path, "status_code": response.status_code, "duration_ms": duration_ms, "correlation_id": corr_id},
                )
            return response
        except Exception as exc:
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.error(
                f"❌ [HTTP] {method} {path} Exception [{duration_ms}ms]: {exc}",
                exc_info=True,
                extra={"http_method": method, "path": path, "duration_ms": duration_ms, "error": str(exc), "correlation_id": corr_id},
            )
            raise

app.add_middleware(HTTPLoggingMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "service": "Cohort Python Domain Service",
        "grpc_port": settings.GRPC_PORT,
        "http_docs": f"http://localhost:{settings.HTTP_PORT}/docs",
    }

def run_grpc_server():
    server = grpc.server(
        futures.ThreadPoolExecutor(max_workers=10),
        interceptors=[LoggingServerInterceptor()],
    )

    cohort_pb2_grpc.add_UserServiceServicer_to_server(UserServicer(), server)
    cohort_pb2_grpc.add_EventTypeServiceServicer_to_server(EventTypeServicer(), server)
    cohort_pb2_grpc.add_AvailabilityServiceServicer_to_server(AvailabilityServicer(), server)
    cohort_pb2_grpc.add_SlotServiceServicer_to_server(SlotServicer(), server)
    cohort_pb2_grpc.add_BookingServiceServicer_to_server(BookingServicer(), server)
    cohort_pb2_grpc.add_EnrollerServiceServicer_to_server(EnrollerServicer(), server)

    server_address = f"0.0.0.0:{settings.GRPC_PORT}"
    server.add_insecure_port(server_address)
    logger.info(f"🚀 [gRPC Server] Listening on {server_address}")
    server.start()
    server.wait_for_termination()

def main():
    # Start gRPC in a dedicated background daemon thread
    grpc_thread = threading.Thread(target=run_grpc_server, daemon=True)
    grpc_thread.start()

    # Start FastAPI / Uvicorn server in main thread
    logger.info(f"⚡ [FastAPI Server] Listening on http://0.0.0.0:{settings.HTTP_PORT} (Docs: http://localhost:{settings.HTTP_PORT}/docs)")
    uvicorn.run(app, host="0.0.0.0", port=settings.HTTP_PORT, log_level="warning")

if __name__ == "__main__":
    main()
