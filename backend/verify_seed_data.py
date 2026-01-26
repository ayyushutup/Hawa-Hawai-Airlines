from app import create_app, db
from app.models import Airport, Flight

app = create_app()

with app.app_context():
    airport_count = db.session.query(Airport).count()
    flight_count = db.session.query(Flight).count()
    
    print(f"Total Airports: {airport_count}")
    print(f"Total Flights: {flight_count}")
    
    # Check for a specific international airport
    jfk = Airport.query.filter_by(code='JFK').first()
    if jfk:
        print(f"Found JFK: {jfk.name}, {jfk.city}, {jfk.country}")
    else:
        print("JFK not found!")
        
    # Check for international flights
    int_flights = Flight.query.join(Airport, Flight.origin_code == Airport.code)\
        .filter(Airport.country != 'India').limit(5).all()
        
    if int_flights:
        print("Found International Flights:")
        for flight in int_flights:
            print(f"{flight.flight_number}: {flight.origin_code} -> {flight.destination_code} ({flight.aircraft_type})")
    else:
        print("No international flights found!")
