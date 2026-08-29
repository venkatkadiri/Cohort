import time
import uuid
import grpc
from typing import Callable, Any
from app.core.logging import get_logger, set_correlation_id

logger = get_logger("gRPC-Server")

class LoggingServerInterceptor(grpc.ServerInterceptor):
    """
    gRPC Server Interceptor that adds structured logging, latency measurement,
    and correlation ID tracking to all incoming RPC invocations.
    """

    def intercept_service(
        self,
        continuation: Callable[[grpc.HandlerCallDetails], grpc.RpcMethodHandler],
        handler_call_details: grpc.HandlerCallDetails,
    ) -> grpc.RpcMethodHandler:
        handler = continuation(handler_call_details)
        if handler is None:
            return None

        # Only wrap unary-unary RPC calls
        if handler.unary_unary:
            return grpc.unary_unary_rpc_method_handler(
                self._wrap_unary_unary(handler.unary_unary, handler_call_details.method),
                request_deserializer=handler.request_deserializer,
                response_serializer=handler.response_serializer,
            )

        return handler

    def _wrap_unary_unary(self, behavior: Callable, method: str) -> Callable:
        def wrapper(request: Any, context: grpc.ServicerContext) -> Any:
            req_id = uuid.uuid4().hex[:8]
            set_correlation_id(req_id)
            
            peer = context.peer() or "unknown"
            start_time = time.perf_counter()

            logger.debug(
                f"-> [{method}] Received RPC",
                extra={
                    "grpc_method": method,
                    "peer": peer,
                    "correlation_id": req_id,
                },
            )

            try:
                response = behavior(request, context)
                duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
                
                # Check if servicer set a non-OK status code
                code = context.code() or grpc.StatusCode.OK
                
                if code == grpc.StatusCode.OK:
                    logger.info(
                        f"<- [{method}] RPC Completed [{duration_ms}ms]",
                        extra={
                            "grpc_method": method,
                            "grpc_status": "OK",
                            "duration_ms": duration_ms,
                            "correlation_id": req_id,
                        },
                    )
                else:
                    logger.warning(
                        f"⚠️ [{method}] RPC Status: {code.name} [{duration_ms}ms]",
                        extra={
                            "grpc_method": method,
                            "grpc_status": code.name,
                            "duration_ms": duration_ms,
                            "correlation_id": req_id,
                        },
                    )
                return response
            except Exception as exc:
                duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
                logger.error(
                    f"❌ [{method}] RPC Exception [{duration_ms}ms]: {exc}",
                    exc_info=True,
                    extra={
                        "grpc_method": method,
                        "duration_ms": duration_ms,
                        "error": str(exc),
                        "correlation_id": req_id,
                    },
                )
                context.abort(grpc.StatusCode.INTERNAL, f"Internal Domain Service Error: {exc}")

        return wrapper
