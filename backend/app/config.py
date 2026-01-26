import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # Security: No fallback defaults - must be set in environment
    SECRET_KEY = os.environ.get('SECRET_KEY')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    
    # Provide helpful error if secrets not configured
    if not SECRET_KEY:
        import warnings
        warnings.warn("SECRET_KEY not set! Using insecure default for development only.")
        SECRET_KEY = 'dev-only-insecure-key-do-not-use-in-production'
    
    if not JWT_SECRET_KEY:
        import warnings
        warnings.warn("JWT_SECRET_KEY not set! Using insecure default for development only.")
        JWT_SECRET_KEY = 'dev-only-jwt-key-do-not-use-in-production'
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///hawa_hawai.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # CORS - restrict to configured origins
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173').split(',')
    
    # Rate Limiting
    RATELIMIT_STORAGE_URL = os.environ.get('RATELIMIT_STORAGE_URL', 'memory://')
    RATELIMIT_DEFAULT = "200 per day, 50 per hour"
    RATELIMIT_HEADERS_ENABLED = True
