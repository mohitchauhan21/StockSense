from typing import Any, List, Optional

class AppException(Exception):
    def __init__(self, message: str, status_code: int = 400, errors: Optional[List[Any]] = None):
        self.message = message
        self.status_code = status_code
        self.errors = errors or []
        super().__init__(message)

class InsufficientStockError(AppException):
    def __init__(
        self,
        product_id: Optional[int] = None,
        location_id: Optional[int] = None,
        requested: Optional[float] = None,
        available: Optional[float] = None,
        items: Optional[List[dict]] = None,
        message: Optional[str] = None
    ):
        if items:
            formatted_errors = items
            msg = message or "Insufficient stock for one or more items"
        else:
            formatted_errors = [{
                "product_id": product_id,
                "location_id": location_id,
                "requested": requested,
                "available": available
            }]
            msg = message or f"Insufficient stock for product id {product_id} at location id {location_id}: requested {requested}, available {available}"
        super().__init__(message=msg, status_code=422, errors=formatted_errors)

class DuplicateSKUError(AppException):
    def __init__(self, sku: str):
        super().__init__(message=f"SKU '{sku}' already exists", status_code=409)

class ResourceNotFoundError(AppException):
    def __init__(self, resource: str, identifier: Any):
        super().__init__(message=f"{resource} with identifier '{identifier}' not found", status_code=404)

class ResourceConflictError(AppException):
    def __init__(self, message: str):
        super().__init__(message=message, status_code=409)

class InvalidStateTransitionError(AppException):
    def __init__(self, message: str = "Invalid document state transition"):
        super().__init__(message=message, status_code=409)

class UnauthorizedError(AppException):
    def __init__(self, message: str = "Invalid credentials"):
        super().__init__(message=message, status_code=401)

class ForbiddenError(AppException):
    def __init__(self, message: str = "This action requires manager role"):
        super().__init__(message=message, status_code=403)
