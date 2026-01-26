"""
Tests for authentication endpoints.
"""
import pytest


class TestRegistration:
    """Test user registration."""
    
    def test_register_success(self, client):
        """Test successful registration."""
        response = client.post('/api/auth/register', json={
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'securepassword123'
        })
        
        assert response.status_code == 201
        assert 'successfully' in response.get_json()['message'].lower()
    
    def test_register_missing_fields(self, client):
        """Test registration fails with missing fields."""
        response = client.post('/api/auth/register', json={
            'username': 'incomplete'
        })
        
        assert response.status_code == 400
        assert 'error' in response.get_json()
    
    def test_register_invalid_email(self, client):
        """Test registration fails with invalid email."""
        response = client.post('/api/auth/register', json={
            'username': 'testuser',
            'email': 'not-an-email',
            'password': 'password123'
        })
        
        assert response.status_code == 400
    
    def test_register_short_password(self, client):
        """Test registration fails with short password."""
        response = client.post('/api/auth/register', json={
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'short'
        })
        
        assert response.status_code == 400
    
    def test_register_duplicate_username(self, client, seed_user):
        """Test registration fails with duplicate username."""
        response = client.post('/api/auth/register', json={
            'username': 'testuser',  # Same as seed_user
            'email': 'different@example.com',
            'password': 'password123'
        })
        
        assert response.status_code == 400
        assert 'username' in response.get_json()['error'].lower()
    
    def test_register_duplicate_email(self, client, seed_user):
        """Test registration fails with duplicate email."""
        response = client.post('/api/auth/register', json={
            'username': 'differentuser',
            'email': 'test@example.com',  # Same as seed_user
            'password': 'password123'
        })
        
        assert response.status_code == 400
        assert 'email' in response.get_json()['error'].lower()


class TestLogin:
    """Test user login."""
    
    def test_login_success(self, client, seed_user):
        """Test successful login."""
        response = client.post('/api/auth/login', json={
            'email': 'test@example.com',
            'password': 'password123'
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'access_token' in data
        assert 'user' in data
        assert data['user']['email'] == 'test@example.com'
    
    def test_login_wrong_password(self, client, seed_user):
        """Test login fails with wrong password."""
        response = client.post('/api/auth/login', json={
            'email': 'test@example.com',
            'password': 'wrongpassword'
        })
        
        assert response.status_code == 401
        assert 'invalid' in response.get_json()['error'].lower()
    
    def test_login_nonexistent_user(self, client):
        """Test login fails for non-existent user."""
        response = client.post('/api/auth/login', json={
            'email': 'nobody@example.com',
            'password': 'password123'
        })
        
        assert response.status_code == 401


class TestProtectedEndpoints:
    """Test protected endpoint access."""
    
    def test_me_requires_auth(self, client):
        """Test /me endpoint requires authentication."""
        response = client.get('/api/auth/me')
        assert response.status_code == 401
    
    def test_me_with_auth(self, client, auth_headers):
        """Test /me endpoint returns user data."""
        response = client.get('/api/auth/me', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['username'] == 'testuser'
        assert data['email'] == 'test@example.com'
    
    def test_my_bookings_requires_auth(self, client):
        """Test /my-bookings requires authentication."""
        response = client.get('/api/my-bookings')
        assert response.status_code == 401
    
    def test_my_bookings_with_auth(self, client, auth_headers, seed_flight):
        """Test /my-bookings returns user's bookings."""
        # Create a booking as authenticated user
        client.post('/api/book', 
            headers=auth_headers,
            json={
                'flight_id': seed_flight.id,
                'passenger_name': 'Test User',
                'passenger_email': 'test@example.com'
            }
        )
        
        response = client.get('/api/my-bookings', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) >= 1
