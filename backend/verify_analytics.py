from app import create_app
import json

app = create_app()

def verify_analytics():
    print("Verifying Analytics API...")
    with app.test_client() as client:
        # 1. Get Stats
        res = client.get('/api/v1/analytics/stats')
        if res.status_code != 200:
            print(f"FAILED: /stats returned {res.status_code}")
            return
        
        stats = json.loads(res.data)
        print("Stats Response:", stats)
        
        # 2. Get Bookings
        res = client.get('/api/v1/analytics/bookings')
        if res.status_code != 200:
            print(f"FAILED: /bookings returned {res.status_code}")
            return
            
        bookings = json.loads(res.data)
        print(f"Bookings Response: {len(bookings)} bookings found.")
        if len(bookings) > 0:
            print("Sample Booking:", bookings[0])

if __name__ == '__main__':
    verify_analytics()
