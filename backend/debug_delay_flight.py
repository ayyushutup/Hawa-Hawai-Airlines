
from app import create_app, db
from app.models.flight import Flight
from app.models.booking import Booking

app = create_app()

def delay_flight_with_booking():
    with app.app_context():
        # Find a booking to test with
        booking = Booking.query.first()
        if not booking:
            print("No bookings found to test.")
            return

        flight = booking.flight
        if not flight:
            print("Booking has no flight.")
            return

        # Update status to Delayed
        flight.status = "Delayed"
        db.session.commit()
        
        print(f"Updated Flight {flight.flight_number} (Ref: {booking.booking_reference}) to Delayed.")
        print(f"Please check status for Reference: {booking.booking_reference}")

if __name__ == "__main__":
    delay_flight_with_booking()
