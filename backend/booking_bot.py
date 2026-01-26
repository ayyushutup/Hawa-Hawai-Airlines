import random
import time
from app import create_app, db
from app.models.flight import Flight
from app.services.booking_service import BookingService
from app.services.pricing_service import PricingService
from faker import Faker


# Use multiple locales for diverse names
fake_locales = [
    Faker('en_US'), # USA
    Faker('en_IN'), # India
    Faker('es_ES'), # Spain
    Faker('fr_FR'), # France
    Faker('de_DE'), # Germany
    Faker('it_IT'), # Italy
    Faker('pt_BR'), # Brazil
    Faker('id_ID'), # Indonesia - Latin script
    Faker('tr_TR'), # Turkey - Latin script
]

app = create_app()

def run_bot(iterations=10):
    with app.app_context():
        print(f"Starting Booking Bot for {iterations} iterations...")
        
        flights = Flight.query.all()
        if not flights:
            print("No flights found. Run seed.py first.")
            return

        for i in range(iterations):
            flight = random.choice(flights)
            
            # Select random ethnicity/locale
            fake = random.choice(fake_locales)
            
            # Simulate a booking
            passenger_name = fake.name()
            passenger_email = fake.email()
            
            try:
                print(f"[{i+1}/{iterations}] Booking flight {flight.flight_number}...")
                old_price = flight.price
                
                BookingService.create_booking(
                    flight_id=flight.id,
                    passenger_name=passenger_name,
                    passenger_email=passenger_email,
                    is_bot=True
                )
                
                # Trigger Dynamic Pricing
                new_price = PricingService.update_flight_price(flight.id)
                
                print(f"  -> Booking Successful for {passenger_name}")
                print(f"  -> Price Update: {old_price} -> {new_price}")
                
            except ValueError as e:
                print(f"  -> Booking Failed: {str(e)}")
            except Exception as e:
                print(f"  -> Error: {str(e)}")
                
            time.sleep(1) # Sleep to make it readable

if __name__ == "__main__":
    run_bot(20)
