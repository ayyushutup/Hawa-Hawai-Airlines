"""
Tests for admin endpoints.
"""
import pytest
import json
from datetime import datetime, timedelta, timezone


class TestAdminAuthentication:
    """Test admin authentication requirements."""
    
    def test_admin_flights_requires_auth(self, client):
        """Test that admin flights endpoint requires authentication."""
        response = client.get('/api/admin/flights')
        assert response.status_code == 401
    
    def test_admin_flights_requires_admin_role(self, client, auth_headers):
        """Test that admin endpoint requires admin role, not just auth."""
        response = client.get('/api/admin/flights', headers=auth_headers)
        assert response.status_code == 403
        assert 'admin' in response.get_json()['error'].lower()
    
    def test_admin_flights_success_with_admin(self, client, admin_headers, seed_flight):
        """Test admin can access flights endpoint."""
        response = client.get('/api/admin/flights', headers=admin_headers)
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)


class TestAdminFlightManagement:
    """Test flight CRUD operations."""
    
    def test_create_flight(self, client, admin_headers, seed_airports):
        """Test creating a new flight."""
        response = client.post('/api/admin/flights', 
            headers=admin_headers,
            json={
                'flight_number': 'HW999',
                'origin_code': 'JFK',
                'destination_code': 'LHR',
                'departure_time': (datetime.now(timezone.utc) + timedelta(days=2)).isoformat(),
                'arrival_time': (datetime.now(timezone.utc) + timedelta(days=2, hours=7)).isoformat(),
                'price': 600.0,
                'aircraft_type': 'Airbus A320',
                'total_seats': 150
            }
        )
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['flight_number'] == 'HW999'
        assert data['price'] == 600.0
    
    def test_update_flight_status(self, client, admin_headers, seed_flight):
        """Test updating flight status."""
        response = client.put(
            f'/api/admin/flights/{seed_flight.id}',
            headers=admin_headers,
            json={'status': 'Delayed'}
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'Delayed'
    
    def test_update_flight_price(self, client, admin_headers, seed_flight):
        """Test updating flight price."""
        response = client.put(
            f'/api/admin/flights/{seed_flight.id}',
            headers=admin_headers,
            json={'price': 550.0}
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['price'] == 550.0
    
    def test_get_flight_manifest(self, client, admin_headers, seed_flight):
        """Test getting passenger manifest for a flight."""
        # First create a booking
        client.post('/api/book', json={
            'flight_id': seed_flight.id,
            'passenger_name': 'Test Passenger',
            'passenger_email': 'test@example.com',
            'seat_number': '1A'
        })
        
        response = client.get(
            f'/api/admin/flights/{seed_flight.id}/manifest',
            headers=admin_headers
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) == 1
        assert data[0]['passenger_name'] == 'Test Passenger'


class TestAdminStats:
    """Test admin statistics endpoint."""
    
    def test_get_stats(self, client, admin_headers, seed_flight):
        """Test getting admin statistics."""
        # Create some bookings first
        client.post('/api/book', json={
            'flight_id': seed_flight.id,
            'passenger_name': 'Test User',
            'passenger_email': 'test@example.com'
        })
        
        response = client.get('/api/admin/stats', headers=admin_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'total_revenue' in data
        assert 'total_bookings' in data
        assert 'active_flights' in data
        assert data['total_bookings'] >= 1


class TestRecentBookings:
    """Test recent bookings endpoint with pagination."""
    
    def test_get_recent_bookings(self, client, admin_headers, seed_flight):
        """Test getting recent bookings."""
        # Create a booking
        client.post('/api/book', json={
            'flight_id': seed_flight.id,
            'passenger_name': 'Recent User',
            'passenger_email': 'recent@example.com'
        })
        
        response = client.get('/api/admin/bookings/recent', headers=admin_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'bookings' in data
        assert 'pagination' in data
        assert len(data['bookings']) >= 1
    
    def test_pagination_params(self, client, admin_headers, seed_flight):
        """Test pagination parameters."""
        response = client.get(
            '/api/admin/bookings/recent?page=1&per_page=10',
            headers=admin_headers
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['pagination']['page'] == 1
        assert data['pagination']['per_page'] == 10
