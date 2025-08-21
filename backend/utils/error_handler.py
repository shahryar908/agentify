"""
Centralized error handling system
"""
import logging
import traceback
from typing import Dict, Any, Optional
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import ValidationError as PydanticValidationError

logger = logging.getLogger(__name__)

class ErrorHandler:
    """Centralized error handler for the application"""
    
    @staticmethod
    def log_error(error: Exception, context: Dict[str, Any] = None):
        """Log error with context"""
        context = context or {}
        logger.error(
            f"Error: {str(error)}\nContext: {context}\nTraceback: {traceback.format_exc()}"
        )
    
    @staticmethod
    def create_error_response(
        error: Exception,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        user_message: str = None,
        include_details: bool = False
    ) -> JSONResponse:
        """Create standardized error response"""
        
        # Default user-friendly messages
        user_messages = {
            400: "Invalid request. Please check your input and try again.",
            401: "Authentication required. Please log in.",
            403: "Access denied. You don't have permission for this action.",
            404: "The requested resource was not found.",
            409: "Conflict. The resource already exists or is in use.",
            422: "Validation error. Please check your input data.",
            429: "Too many requests. Please try again later.",
            500: "An internal error occurred. Please try again later.",
            503: "Service temporarily unavailable. Please try again later."
        }
        
        message = user_message or user_messages.get(status_code, "An error occurred")
        
        response_data = {
            "error": True,
            "message": message,
            "status_code": status_code
        }
        
        if include_details:
            response_data["details"] = str(error)
            response_data["type"] = error.__class__.__name__
        
        # Log the error
        ErrorHandler.log_error(error, {"status_code": status_code, "message": message})
        
        return JSONResponse(
            status_code=status_code,
            content=response_data
        )

async def validation_exception_handler(request: Request, exc: PydanticValidationError):
    """Handle Pydantic validation errors"""
    errors = []
    for error in exc.errors():
        field = " -> ".join(str(loc) for loc in error["loc"])
        errors.append(f"{field}: {error['msg']}")
    
    return ErrorHandler.create_error_response(
        exc,
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        user_message=f"Validation failed: {'; '.join(errors)}",
        include_details=True
    )

async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with consistent format"""
    return ErrorHandler.create_error_response(
        exc,
        status_code=exc.status_code,
        user_message=exc.detail,
        include_details=False
    )

async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions"""
    return ErrorHandler.create_error_response(
        exc,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        user_message="An unexpected error occurred. Our team has been notified.",
        include_details=False
    )

def create_error_response(
    message: str,
    status_code: int = status.HTTP_400_BAD_REQUEST,
    details: Dict[str, Any] = None
) -> HTTPException:
    """Create HTTPException with standardized format"""
    error_detail = {
        "message": message,
        "status_code": status_code
    }
    
    if details:
        error_detail["details"] = details
    
    return HTTPException(status_code=status_code, detail=error_detail)