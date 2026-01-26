"""
Utility decorators for the Hawa Hawai API.
"""
from functools import wraps
from typing import Callable, Any
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User


def admin_required(f: Callable) -> Callable:
    """
    Decorator that combines JWT authentication with admin verification.
    Use this instead of manually calling verify_admin() in each route.
    
    Usage:
        @bp.route('/admin-only')
        @admin_required
        def admin_endpoint():
            return jsonify({'message': 'Welcome, admin!'})
    """
    @wraps(f)
    @jwt_required()
    def decorated_function(*args: Any, **kwargs: Any):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if not user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        
        return f(*args, **kwargs)
    
    return decorated_function


def api_response(data: Any = None, message: str = None, status: int = 200):
    """
    Standardized API response format.
    
    Args:
        data: Response data payload
        message: Optional message
        status: HTTP status code
        
    Returns:
        Tuple of (response_json, status_code)
    """
    response = {}
    
    if data is not None:
        response['data'] = data
    
    if message:
        response['message'] = message
        
    if not response:
        response['success'] = True
        
    return jsonify(response), status


def api_error(error: str, status: int = 400, details: dict = None):
    """
    Standardized API error response format.
    
    Args:
        error: Error message
        status: HTTP status code
        details: Optional additional error details
        
    Returns:
        Tuple of (response_json, status_code)
    """
    response = {'error': error}
    
    if details:
        response['details'] = details
        
    return jsonify(response), status
