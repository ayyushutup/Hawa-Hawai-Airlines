import pytest
import json

def test_calculate_price_endpoint(client, seed_flight):
    payload = {
        "flight_id": seed_flight.id,
        "seat_class": "Business",
        "baggage_kg": 20
    }
    
    response = client.post('/api/calculate-price', 
                         data=json.dumps(payload),
                         content_type='application/json')
    
    assert response.status_code == 200
    data = response.get_json()
    
    # 500 * 1.5 = 750
    # Baggage = 20
    # Subtotal = 770
    # Tax = 770 * 0.18 = 138.6
    # Total = 908.6
    assert data['total_price'] == 908.6
    assert data['base_seat_price'] == 750.0

def test_calculate_price_invalid_flight(client):
    payload = {
        "flight_id": 9999,
        "seat_class": "Economy"
    }
    
    response = client.post('/api/calculate-price', 
                         data=json.dumps(payload),
                         content_type='application/json')
    
    
    assert response.status_code == 404

def test_search_flights_filters(client, seed_flight):
    # Test valid date
    start_date = seed_flight.departure_time.strftime('%Y-%m-%d')
    
    # 1. Test Price Filter causing empty result
    response = client.get(f'/api/flights?origin=JFK&destination=LHR&date={start_date}&max_price=100')
    data = response.get_json()
    assert len(data) == 0

    # 2. Test Price Filter allowing result
    response = client.get(f'/api/flights?origin=JFK&destination=LHR&date={start_date}&max_price=1000')
    data = response.get_json()
    assert len(data) >= 1
    
    # 3. Test Stops Filter
    # Seed flight is direct (created in conftest with origin->dest directly)
    response = client.get(f'/api/flights?origin=JFK&destination=LHR&date={start_date}&stops=direct')
    data = response.get_json()
    assert len(data) >= 1
    
    response = client.get(f'/api/flights?origin=JFK&destination=LHR&date={start_date}&stops=1_stop')
    data = response.get_json()
    # Should contain no direct flights, and we haven't seeded connecting ones, so 0
    assert len(data) == 0
