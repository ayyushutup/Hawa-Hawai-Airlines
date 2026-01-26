import urllib.request
import json
from app import create_app
from app.services.flight_service import FlightService

# 1. Verify Analytics
print("--- Verifying Analytics ---")
try:
    with urllib.request.urlopen('http://localhost:5001/api/v1/analytics/stats') as response:
        if response.status == 200:
            data = json.loads(response.read().decode())
            print("Analytics Stats:")
            print(f"Total Bookings: {data.get('total_bookings')}")
            print(f"Bot Bookings: {data.get('bot_bookings')}")
            print(f"Real Bookings: {data.get('real_bookings')}")
            
            if data.get('bot_bookings', 0) > 0:
                print("SUCCESS: Bot bookings detected.")
            else:
                print("FAILURE: No bot bookings found.")
        else:
            print(f"FAILURE: API returned {response.status}")
except Exception as e:
    print(f"FAILURE: Could not connect to API: {e}")

# 2. Verify Connectivity (Search)
print("\n--- Verifying Connectivity ---")
app = create_app()
with app.app_context():
    # Test a route that likely requires a connection: JFK -> GOI (Goa)
    # JFK -> DEL/BOM -> GOI
    # Search for flights tomorrow
    import datetime
    tomorrow = (datetime.date.today() + datetime.timedelta(days=1)).strftime('%Y-%m-%d')
    print(f"Searching for JFK -> GOI on {tomorrow}...")
    
    results = FlightService.search_flights('JFK', 'GOI', tomorrow)
    
    if results:
        print(f"Found {len(results)} flight options.")
        for res in results[:3]:
            print(f"Type: {res['type']}")
            route = " -> ".join([f"{f.origin_code}-{f.destination_code}" for f in res['flights']])
            print(f"Route: {route}")
            print(f"Price: {res['total_price']}")
    else:
        print("No flights found for JFK -> GOI. Trying another date/route.")
        
        # Try another popular one: LHR -> BLR
        results = FlightService.search_flights('LHR', 'BLR', tomorrow)
        if results:
             print(f"Found {len(results)} flight options for LHR -> BLR.")
        else:
             print("Still no flights found. Check seed logic.")
