from app import create_app, db
from app.models import Flight
from app.services.flight_service import FlightService
from datetime import datetime

app = create_app()

with app.app_context():
    print("--- Debugging Flight Search ---")
    
    # 1. Get a sample flight
    flight = Flight.query.filter_by(status='Scheduled').first()
    
    if not flight:
        print("❌ No Scheduled flights found in DB!")
    else:
        print(f"✅ Found sample flight: {flight.flight_number}")
        print(f"   Route: {flight.origin_code} -> {flight.destination_code}")
        print(f"   Date: {flight.departure_time.date()}")
        
        origin = flight.origin_code
        destination = flight.destination_code
        date_str = flight.departure_time.strftime('%Y-%m-%d')
        
        print(f"\n--- Testing Search for {origin} -> {destination} on {date_str} ---")
        
        # 2. Run Search
        results = FlightService.search_flights(origin, destination, date_str)
        
        print(f"Found {len(results)} itineraries")
        if len(results) > 0:
            print("✅ Search returned results!")
            print("First result:", results[0])
        else:
            print("❌ Search returned NO results, but flight exists!")
            
            # Debugging why
            print("\n--- Digging Deeper ---")
            direct_flights = Flight.query.filter(
                Flight.origin_code == origin,
                Flight.destination_code == destination,
            ).all()
            print(f"Direct flights query found: {len(direct_flights)}")
            for f in direct_flights:
                print(f"   Flight {f.flight_number}: Date={f.departure_time.date()}, Status={f.status}")
                if f.departure_time.date() == flight.departure_time.date():
                     print("   -> Match!")
                else:
                     print("   -> Date mismatch")
