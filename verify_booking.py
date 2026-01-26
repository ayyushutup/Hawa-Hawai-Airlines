import requests
import sys

BASE_URL = "http://127.0.0.1:5000/api"

def test_booking_validation():
    print("Fetching a flight to test with...")
    response = requests.get(f"{BASE_URL}/flights")
    if response.status_code != 200:
        print("Failed to fetch flights")
        return
    
    flights = response.json()
    if not flights:
        print("No flights found")
        return
        
    flight = flights[0]
    flight_id = flight['id']
    print(f"Testing with Flight ID: {flight_id} (Price: {flight['price']})")

    # 1. Test Invalid Email
    print("\n--- Test 1: Invalid Email ---")
    payload = {
        "flight_id": flight_id,
        "passenger_name": "Test User",
        "passenger_email": "invalid-email",
        "seat_number": "1A"
    }
    resp = requests.post(f"{BASE_URL}/book", json=payload)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.json()}")
    
    if resp.status_code == 400 and "Invalid email" in resp.json().get('error', ''):
        print("✅ Passed: Invalid email rejected")
    else:
        print("❌ Failed: Invalid email not handled correctly")

    # 2. Test Successful Booking
    print("\n--- Test 2: Successful Booking ---")
    payload["passenger_email"] = "valid@example.com"
    resp = requests.post(f"{BASE_URL}/book", json=payload)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.json()}")
    
    if resp.status_code == 201:
        print("✅ Passed: valid booking created")
    else:
        print("❌ Failed: Valid booking rejected")

    # 3. Test Double Booking (Same Seat)
    print("\n--- Test 3: Double Booking (Same Seat) ---")
    resp = requests.post(f"{BASE_URL}/book", json=payload)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.json()}")
    
    if resp.status_code == 400 and "already taken" in resp.json().get('error', ''):
        print("✅ Passed: Double booking rejected")
    else:
        print("❌ Failed: Double booking not handled correctly")

if __name__ == "__main__":
    try:
        test_booking_validation()
    except Exception as e:
        print(f"Error: {e}")
