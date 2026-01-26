"""
Integration tests for the complete booking flow.
"""
import pytest
import json
from datetime import datetime, timedelta, timezone


class TestBookingFlow:
    """Test the complete booking flow from search to confirmation."""
    
    def test_search_flights_returns_results(self, client, seed_flight):
        """Test that searching for flights returns results."""
        flight = seed_flight
        date_str = (datetime.now(timezone.utc) + timedelta(days=1)).strftime('%Y-%m-%d')
        
        response = client.get(f'/api/flights?origin=JFK&destination=LHR&date={date_str}')
        
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) >= 1
        assert data[0]['type'] == 'direct'
    
    def test_search_flights_no_results_for_invalid_route(self, client, seed_flight):
        """Test that invalid routes return empty results."""
        date_str = (datetime.now(timezone.utc) + timedelta(days=1)).strftime('%Y-%m-%d')
        
        response = client.get(f'/api/flights?origin=XXX&destination=YYY&date={date_str}')
        
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) == 0
    
    def test_create_booking_success(self, client, seed_flight):
        """Test creating a booking successfully."""
        response = client.post('/api/book', json={
            'flight_id': seed_flight.id,
            'passenger_name': 'John Doe',
            'passenger_email': 'john@example.com',
            'seat_class': 'Economy'
        })
        
        assert response.status_code == 201
        data = response.get_json()
        assert 'booking_reference' in data
        assert data['passenger_name'] == 'John Doe'
        assert data['seat_class'] == 'Economy'
    
    def test_create_booking_with_extras(self, client, seed_flight):
        """Test creating a booking with extras like baggage and insurance."""
        response = client.post('/api/book', json={
            'flight_id': seed_flight.id,
            'passenger_name': 'Jane Smith',
            'passenger_email': 'jane@example.com',
            'seat_class': 'Business',
            'baggage_kg': 20,
            'has_insurance': True,
            'has_priority': True
        })
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['baggage_kg'] == 20
        assert data['has_insurance'] == True
        assert data['has_priority'] == True
        assert data['extras_price'] > 0
    
    def test_create_booking_invalid_email(self, client, seed_flight):
        """Test that invalid email is rejected."""
        response = client.post('/api/book', json={
            'flight_id': seed_flight.id,
            'passenger_name': 'Test User',
            'passenger_email': 'invalid-email',
            'seat_class': 'Economy'
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
    
    def test_create_booking_invalid_flight(self, client, seed_flight):
        """Test that booking for non-existent flight fails."""
        response = client.post('/api/book', json={
            'flight_id': 99999,
            'passenger_name': 'Test User',
            'passenger_email': 'test@example.com',
            'seat_class': 'Economy'
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
    
    def test_seat_selection_conflict(self, client, seed_flight):
        """Test that double-booking a seat fails."""
        # First booking
        response1 = client.post('/api/book', json={
            'flight_id': seed_flight.id,
            'passenger_name': 'First Passenger',
            'passenger_email': 'first@example.com',
            'seat_number': '1A'
        })
        assert response1.status_code == 201
        
        # Second booking with same seat
        response2 = client.post('/api/book', json={
            'flight_id': seed_flight.id,
            'passenger_name': 'Second Passenger',
            'passenger_email': 'second@example.com',
            'seat_number': '1A'
        })
        assert response2.status_code == 400
        assert 'occupied' in response2.get_json()['error'].lower()
    
    def test_get_occupied_seats(self, client, seed_flight):
        """Test getting list of occupied seats."""
        # Create a booking with a seat
        client.post('/api/book', json={
            'flight_id': seed_flight.id,
            'passenger_name': 'Test Passenger',
            'passenger_email': 'test@example.com',
            'seat_number': '5B'
        })
        
        response = client.get(f'/api/flights/{seed_flight.id}/seats')
        
        assert response.status_code == 200
        data = response.get_json()
        assert '5B' in data


class TestPricingCalculation:
    """Test pricing calculation endpoints."""
    
    def test_calculate_price_economy(self, client, seed_flight):
        """Test price calculation for economy class."""
        response = client.post('/api/calculate-price', json={
            'flight_id': seed_flight.id,
            'seat_class': 'Economy'
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['base_seat_price'] == 500.0  # Original price
        assert data['total_price'] > 500.0  # With taxes
    
    def test_calculate_price_business(self, client, seed_flight):
        """Test price calculation for business class."""
        response = client.post('/api/calculate-price', json={
            'flight_id': seed_flight.id,
            'seat_class': 'Business'
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['base_seat_price'] == 750.0  # 500 * 1.5
    
    def test_calculate_price_with_baggage(self, client, seed_flight):
        """Test price calculation with extra baggage."""
        response = client.post('/api/calculate-price', json={
            'flight_id': seed_flight.id,
            'seat_class': 'Economy',
            'baggage_kg': 20
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['extras_price'] >= 20.0  # Baggage fee
