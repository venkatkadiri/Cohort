import logging
import os
import sys
import json
import uuid
import datetime
from contextvars import ContextVar
from typing import Optional, Dict, Any

# ContextVar for request correlation ID across async coroutines and threads
correlation_id_var: ContextVar[str] = ContextVar("correlation_id", default="")

def get_correlation_id() -> str:
    corr_id = correlation_id_var.get()
    if not corr_id:
        corr_id = uuid.uuid4().hex[:8]
        correlation_id_var.set(corr_id)
    return corr_id

def set_correlation_id(corr_id: str) -> str:
    correlation_id_var.set(corr_id)
    return corr_id

class CorrelationFilter(logging.Filter):
    """Injects correlation_id into log records."""
    def filter(self, record: logging.LogRecord) -> bool:
        record.correlation_id = correlation_id_var.get() or "-"
        return True

class ColoredConsoleFormatter(logging.Formatter):
    """Colorized human-readable console formatter for local development."""
    
    COLORS = {
        "DEBUG": "\033[36m",    # Cyan
        "INFO": "\033[32m",     # Green
        "WARNING": "\033[33m",  # Yellow
        "ERROR": "\033[31m",    # Red
        "CRITICAL": "\033[35m", # Magenta
    }
    RESET = "\033[0m"
    DIM = "\033[2m"
    PURPLE = "\033[35m"

    def format(self, record: logging.LogRecord) -> str:
        timestamp = datetime.datetime.fromtimestamp(record.created).strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
        level_color = self.COLORS.get(record.levelname, self.RESET)
        level_tag = f"{level_color}{record.levelname:<7}{self.RESET}"
        name_tag = f"{self.PURPLE}[{record.name}]{self.RESET}"
        
        req_id = getattr(record, "correlation_id", "-")
        req_tag = f"{self.DIM}(req_id={req_id}){self.RESET} " if req_id != "-" else ""
        
        message = record.getMessage()
        
        # Include extra attributes if present
        extra_items = {}
        for key, val in record.__dict__.items():
            if key not in {
                "name", "msg", "args", "levelname", "levelno", "pathname", "filename",
                "module", "exc_info", "exc_text", "stack_info", "lineno", "funcName",
                "created", "msecs", "relativeCreated", "thread", "threadName",
                "processName", "process", "correlation_id", "message"
            }:
                extra_items[key] = val

        extra_str = f" {self.DIM}{extra_items}{self.RESET}" if extra_items else ""
        
        formatted = f"{self.DIM}{timestamp}{self.RESET} {level_tag} {name_tag} {req_tag}{message}{extra_str}"
        
        if record.exc_info:
            formatted += f"\n{self.formatException(record.exc_info)}"
            
        return formatted

class JSONFormatter(logging.Formatter):
    """JSON log formatter for production log aggregators (Loki, Datadog, ELK)."""
    
    def format(self, record: logging.LogRecord) -> str:
        log_entry: Dict[str, Any] = {
            "timestamp": datetime.datetime.fromtimestamp(record.created).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "correlation_id": getattr(record, "correlation_id", "-"),
            "service": "cohort-domain-service",
            "thread": record.threadName,
        }
        
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
            
        # Collect extra metadata
        for key, val in record.__dict__.items():
            if key not in {
                "name", "msg", "args", "levelname", "levelno", "pathname", "filename",
                "module", "exc_info", "exc_text", "stack_info", "lineno", "funcName",
                "created", "msecs", "relativeCreated", "thread", "threadName",
                "processName", "process", "correlation_id", "message"
            }:
                try:
                    json.dumps(val)
                    log_entry[key] = val
                except (TypeError, OverflowError):
                    log_entry[key] = str(val)

        return json.dumps(log_entry)

def configure_logging(
    log_level: Optional[str] = None,
    json_format: Optional[bool] = None,
) -> None:
    """Configures the root logger with handlers and formatters."""
    if log_level is None:
        log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    
    if json_format is None:
        json_format = os.getenv("LOG_FORMAT", "").lower() == "json" or os.getenv("NODE_ENV") == "production"

    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level, logging.INFO))
    
    # Remove existing handlers to avoid duplicate output
    for handler in list(root_logger.handlers):
        root_logger.removeHandler(handler)
        
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(getattr(logging, log_level, logging.INFO))
    handler.addFilter(CorrelationFilter())
    
    if json_format:
        handler.setFormatter(JSONFormatter())
    else:
        handler.setFormatter(ColoredConsoleFormatter())
        
    root_logger.addHandler(handler)
    
    # Set reasonable levels for chatty 3rd party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

def get_logger(name: str) -> logging.Logger:
    """Factory helper to obtain a named logger."""
    return logging.getLogger(name)
