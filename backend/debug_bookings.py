from app import create_app, db
from app.models.booking import Booking
from app.models.flight import Flight
import sys

app = create_app()

def check_orphaned_bookings():
    with app.app_context():
        print("Checking for orphaned bookings and data integrity...")
        bookings = Booking.query.order_by(Booking.booking_date.desc()).limit(10).all()
        orphaned_count = 0
        valid_count = 0
        null_price_count = 0
        
        print("Top 10 most recent bookings:")
        for b in bookings:
            flight = Flight.query.get(b.flight_id)
            print(f"ID: {b.id}, Date: {b.booking_date}, Bot: {b.is_bot}, Passenger: {b.passenger_name}")
                
        # Basic check
        # ... logic ...

if __name__ == "__main__":
    check_orphaned_bookings()
