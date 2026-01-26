
import sys
import os
from datetime import datetime, timedelta

# Add the backend directory to the python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from app import create_app, db
from app.models.flight import Flight
from app.models.booking import Booking
from app.models.promo_code import PromoCode
from app.services.booking_service import BookingService

def reproduce_bug():
    app = create_app()
    with app.app_context():
        # Setup: Ensure we have a flight and a promo code
        flight = Flight.query.first()
        if not flight:
            print("No flight found to test with.")
            # Create a dummy flight
            # (Skipping detailed creation for brevity, assuming seed data exists or created)
            return

        promo_code = "TEST10"
        promo = PromoCode.query.filter_by(code=promo_code).first()
        if not promo:
            # Create promo with required fields
            promo = PromoCode(
                code=promo_code, 
                discount_percent=10, 
                valid_from=datetime.utcnow(),
                valid_until=datetime.utcnow() + timedelta(days=30)
            )
            db.session.add(promo)
            db.session.commit()
            print(f"Created test promo code: {promo_code}")

        print(f"Testing Booking with Flight Price: {flight.price}")
        
        # Action: Create Booking with Promo Code
        try:
            booking = BookingService.create_booking(
                flight_id=flight.id,
                passenger_name="Bug Tester",
                passenger_email="bug@test.com",
                seat_class="Economy",
                promo_code=promo_code
            )
            
            print(f"Booking Created: {booking.booking_reference}")
            print(f"Price Paid: {booking.price_paid}")
            print(f"Discount Amount: {booking.discount_amount}")
            
            # pricing logic: Economy multiplier is 1.0. 
            # Expected Price = Flight Price - Discount
            # Discount = Flight Price * 0.10
            
            expected_discount = flight.price * 0.10
            expected_price = (flight.price * 1.0) - expected_discount
            # Add taxes? BookingService logic (step 56) adds taxes.
            # Taxes = (Price + Meal + Extras) * 0.18
            # Wait, the current implementation in BookingService lines 70-72:
            # subtotal = base + meal + extras
            # taxes = subtotal * 0.18
            # total = subtotal + taxes
            # AND IT IGNORES PROMO CODE.
            
            # So currently:
            # Price Paid = (Flight Price * 1.18)
            
            # If bug exists, price_paid will be high, and discount_amount will likely be 0 or ignored.
            
            if booking.discount_amount == 0 and booking.price_paid > expected_price:
                 print("\n[FAIL] BUG REPRODUCED: Promo code was ignored!")
                 print(f"Expected Price (approx): {expected_price}")
                 print(f"Actual Price: {booking.price_paid}")
            else:
                 print("\n[PASS] Bug not found? (Unexpected)")

        except Exception as e:
            print(f"Error reproducing bug: {e}")

if __name__ == "__main__":
    reproduce_bug()
