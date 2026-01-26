import requests
import json

BASE_URL = "http://127.0.0.1:5001"

def debug_api():
    session = requests.Session()
    
    # 1. Login
    print("1. Logging in...")
    login_payload = {
        "email": "admin@hawa-hawai.com",
        "password": "admin123"
    }
    
    try:
        resp = session.post(f"{BASE_URL}/api/auth/login", json=login_payload)
        if resp.status_code != 200:
            print(f"Login Failed: {resp.status_code} - {resp.text}")
            return
            
        data = resp.json()
        print("Login Info:", data)
        token = data.get('token')
        if not token:
             print("NO TOKEN RECEIVED")
             return
        print(f"Login Successful! Token: {token[:20]}... (len={len(token) if token else 0})")
    except Exception as e:
        print(f"Login Exception: {str(e)}")
        return

    headers = {
        'Authorization': f'Bearer {token}'
    }

    # 2. Test Stats
    print("\n2. Testing /api/admin/stats...")
    try:
        resp = session.get(f"{BASE_URL}/api/admin/stats", headers=headers)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            print("Response:", json.dumps(resp.json(), indent=2))
        else:
            print("Error:", resp.text)
    except Exception as e:
        print(f"Stats Exception: {str(e)}")

    # 3. Test Flights (Limit output)
    print("\n3. Testing /api/admin/flights...")
    try:
        resp = session.get(f"{BASE_URL}/api/admin/flights", headers=headers)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            flights = resp.json()
            print(f"Got {len(flights)} flights. First one:")
            if flights:
                print(json.dumps(flights[0], indent=2))
        else:
            print("Error:", resp.text)
    except Exception as e:
        print(f"Flights Exception: {str(e)}")

    # 4. Test Recent Bookings
    print("\n4. Testing /api/admin/bookings/recent...")
    try:
        resp = session.get(f"{BASE_URL}/api/admin/bookings/recent", headers=headers)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            bookings = resp.json()
            print(f"Got {len(bookings)} bookings. First one:")
            if bookings:
                print(json.dumps(bookings[0], indent=2))
        else:
            print("Error:", resp.text)
    except Exception as e:
        print(f"Bookings Exception: {str(e)}")

if __name__ == "__main__":
    debug_api()
