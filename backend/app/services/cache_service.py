"""
Redis caching service for Hawa Hawai.
Provides caching for expensive operations like flight searches.
"""
import json
import os
from functools import wraps
from datetime import timedelta

try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False

# Initialize Redis connection
_redis_client = None

def get_redis_client():
    """Get or create Redis client instance."""
    global _redis_client
    if _redis_client is None and REDIS_AVAILABLE:
        redis_url = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
        try:
            _redis_client = redis.from_url(redis_url, decode_responses=True)
            _redis_client.ping()  # Test connection
        except (redis.ConnectionError, redis.RedisError) as e:
            print(f"Redis connection failed: {e}. Caching disabled.")
            _redis_client = None
    return _redis_client


def cache_result(prefix: str, ttl_seconds: int = 300):
    """
    Decorator to cache function results in Redis.
    
    Args:
        prefix: Cache key prefix (e.g., 'flight_search')
        ttl_seconds: Time-to-live in seconds (default 5 minutes)
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            client = get_redis_client()
            
            # If Redis unavailable, just call the function
            if client is None:
                return func(*args, **kwargs)
            
            # Build cache key from function args
            key_parts = [prefix] + [str(arg) for arg in args]
            key_parts += [f"{k}={v}" for k, v in sorted(kwargs.items())]
            cache_key = ":".join(key_parts)
            
            # Try to get from cache
            try:
                cached = client.get(cache_key)
                if cached:
                    return json.loads(cached)
            except (redis.RedisError, json.JSONDecodeError):
                pass
            
            # Call function and cache result
            result = func(*args, **kwargs)
            
            try:
                client.setex(cache_key, ttl_seconds, json.dumps(result))
            except (redis.RedisError, TypeError):
                pass  # Fail silently if caching fails
            
            return result
        return wrapper
    return decorator


def invalidate_cache(pattern: str):
    """Invalidate all cache keys matching a pattern."""
    client = get_redis_client()
    if client:
        try:
            keys = client.keys(pattern)
            if keys:
                client.delete(*keys)
        except redis.RedisError:
            pass
