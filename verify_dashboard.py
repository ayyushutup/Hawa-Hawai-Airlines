import requests
import json

BASE_URL = 'http://127.0.0.1:5000/api'

def test_dashboard_flow():
    # 1. Register User
    username = "dashboard_user"
    email = "dashboard@test.com"
    password = "password123"
    
    # Try registration (ignore if exists)
    requests.post(f"{BASE_URL}/auth/register", json={
        "username": username, "email": email, "password": password
    })
    
    # 2. Login
    print(f"Logging in as {username}...")
    res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": email, "password": password
    })
    
    if res.status_code != 200:
        print("Login failed:", res.text)
        return

    data = res.json()
    token = data['access_token']
    user_id = data['user']['id']
    print(f"Logged in. User ID: {user_id}")
    
    # 3. Search Flight to get ID
    print("Searching for flights...")
    flights_res = requests.get(f"{BASE_URL}/flights?origin=DEL&destination=BOM&date=2025-12-25")
    flights_data = flights_res.json()
    
    if not flights_data:
        # If no specific flight, just get all
        print("No specific flight found, fetching all...")
        all_flights = requests.get(f"{BASE_URL}/flights").json()
        if not all_flights:
            print("No flights available to book.")
            return
        flight_id = all_flights[0]['id']
    else:
        flight_id = flights_data[0]['flights'][0]['id']

    print(f"Booking flight ID: {flight_id}...")
    
    # 4. Create Booking as Authenticated User
    headers = {"Authorization": f"Bearer {token}"}
    booking_payload = {
        "flight_id": flight_id,
        "passenger_name": "Dashboard Tester",
        "passenger_email": email,
        "seat_class": "Economy",
        "payment_method": "Credit Card"
    }
    
    book_res = requests.post(f"{BASE_URL}/book", json=booking_payload, headers=headers)
    if book_res.status_code != 201:
        print("Booking failed:", book_res.text)
        return
        
    booking_ref = book_res.json()['booking_reference']
    print(f"Booking successful! Reference: {booking_ref}")
    
    # 5. Verify Dashboard (My Bookings)
    print("Fetching My Bookings...")
    dashboard_res = requests.get(f"{BASE_URL}/my-bookings", headers=headers)
    
    if dashboard_res.status_code == 200:
        bookings = dashboard_res.json()
        found = any(b['booking_reference'] == booking_ref for b in bookings)
        if found:
            print("SUCCESS: Booking found in user dashboard!")
            print(f"Total bookings for user: {len(bookings)}")
        else:
            print("FAILURE: Booking NOT found in dashboard.")
            print("Bookings found:", [b['booking_reference'] for b in bookings])
    else:
        print("Failed to fetch dashboard:", dashboard_res.text)

if __name__ == "__main__":
    test_dashboard_flow()
