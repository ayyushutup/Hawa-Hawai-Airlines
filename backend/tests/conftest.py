import pytest
from datetime import datetime, timedelta, timezone
from app import create_app, db
from app.models.flight import Flight
from app.models.airport import Airport
from app.models.user import User


@pytest.fixture
def app():
    """Create application for testing with in-memory database."""
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "RATELIMIT_ENABLED": False  # Disable rate limiting in tests
    })

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Test client for making requests."""
    return app.test_client()


@pytest.fixture
def runner(app):
    """Test CLI runner."""
    return app.test_cli_runner()


@pytest.fixture
def seed_airports(app):
    """Seed airports for testing."""
    with app.app_context():
        airports = [
            Airport(code="JFK", name="John F. Kennedy", city="New York", country="USA"),
            Airport(code="LHR", name="Heathrow", city="London", country="UK"),
            Airport(code="DEL", name="Indira Gandhi", city="New Delhi", country="India"),
        ]
        for airport in airports:
            existing = Airport.query.filter_by(code=airport.code).first()
            if not existing:
                db.session.add(airport)
        db.session.commit()
        return airports


@pytest.fixture
def seed_flight(app, seed_airports):
    """Seed a flight for testing."""
    with app.app_context():
        flight = Flight(
            flight_number="HW101",
            origin_code="JFK",
            destination_code="LHR",
            departure_time=datetime.now(timezone.utc) + timedelta(days=1),
            arrival_time=datetime.now(timezone.utc) + timedelta(days=1, hours=7),
            price=500.0,
            base_price=500.0,
            aircraft_type="Boeing 737",
            total_seats=100
        )
        db.session.add(flight)
        db.session.commit()
        db.session.refresh(flight)
        return flight


@pytest.fixture
def seed_user(app):
    """Seed a regular user for testing."""
    with app.app_context():
        user = User(username="testuser", email="test@example.com")
        user.set_password("password123")
        db.session.add(user)
        db.session.commit()
        db.session.refresh(user)
        return user


@pytest.fixture
def seed_admin(app):
    """Seed an admin user for testing."""
    with app.app_context():
        admin = User(username="adminuser", email="admin@example.com", is_admin=True)
        admin.set_password("adminpass123")
        db.session.add(admin)
        db.session.commit()
        db.session.refresh(admin)
        return admin


@pytest.fixture
def auth_headers(client, seed_user):
    """Get authentication headers for a regular user."""
    response = client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    token = response.get_json()['access_token']
    return {'Authorization': f'Bearer {token}'}


@pytest.fixture
def admin_headers(client, seed_admin):
    """Get authentication headers for an admin user."""
    response = client.post('/api/auth/login', json={
        'email': 'admin@example.com',
        'password': 'adminpass123'
    })
    token = response.get_json()['access_token']
    return {'Authorization': f'Bearer {token}'}
