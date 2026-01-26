from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from .config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
limiter = Limiter(key_func=get_remote_address)

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Initialize rate limiter with config
    limiter.init_app(app)
    
    # Configure CORS with specific origins from config
    CORS(app, origins=config_class.CORS_ORIGINS, supports_credentials=True)

    # Import models to ensure they are registered with SQLAlchemy
    from . import models

    # Register blueprints
    from .api import bp as api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    
    from .api.auth import bp as auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    from .api.admin_routes import bp as admin_bp
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    from .api.pricing_api import bp as pricing_bp
    app.register_blueprint(pricing_bp, url_prefix='/api')

    from .api.tracking_routes import bp as tracking_bp
    app.register_blueprint(tracking_bp, url_prefix='/api/tracking')

    @app.route('/')
    def index():
        return "Welcome to Hawa Hawai API"

    return app
