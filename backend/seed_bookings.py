import random
from app import create_app, db
from app.models.flight import Flight
from app.models.booking import Booking
from app.services.booking_service import BookingService
from faker import Faker
from datetime import datetime, timedelta

app = create_app()

fake_locales = [
    Faker('en_US'), Faker('en_IN'), Faker('es_ES'), Faker('fr_FR'),
    Faker('de_DE'), Faker('it_IT'), Faker('pt_BR'), Faker('id_ID'), Faker('tr_TR')
]

def seed_bookings():
    with app.app_context():
        print("Seeding bookings...")
        flights = Flight.query.all()
        
        if not flights:
            print("No flights found. Run seed.py first.")
            return

        bookings_to_add = []
        total_flights = len(flights)
        
        print(f"Found {total_flights} flights. generating bookings...")

        for idx, flight in enumerate(flights):
            # Determine how many bookings for this flight
            # Random occupancy between 0% and 80%
            occupancy_rate = random.uniform(0, 0.8)
            num_bookings = int(flight.total_seats * occupancy_rate)
            
            # Limit simply to avoid massive DB generation for this demo if needed, 
            # but let's do a reasonable amount.
            # 5000 flights * 50 bookings = 250,000 bookings. Might be too slow.
            # Let's cap at max 10 bookings per flight for the demo speed.
            num_bookings = min(num_bookings, 15) 

            for _ in range(num_bookings):
                fake = random.choice(fake_locales)
                passenger_name = fake.name()
                passenger_email = fake.email()
                
                # 30% Bot, 70% Real
                is_bot = random.random() < 0.3
                
                seat_class = random.choice(['Economy', 'Economy', 'Economy', 'Business', 'First Class'])
                meal_preference = random.choice(['Standard', 'Vegetarian', 'Vegan', 'Gluten-Free', None])
                
                # Calculate price (approximate logic from service, but applied directly or via service)
                # Using Service is safer but slower. 
                # Since we want BULK speed, we might construct objects directly if service is too heavy.
                # But Service handles reference generation etc. 
                # Let's use Service for correctness, but maybe batch commit.
                # Actually Service has commit inside it. That will be slow.
                # I'll replicate the construction logic here for batch insert speed.
                
                reference = BookingService.generate_reference()
                # Simple check to avoid duplicates in current batch
                existing_refs = {b.booking_reference for b in bookings_to_add}
                while reference in existing_refs or Booking.query.filter_by(booking_reference=reference).first():
                    reference = BookingService.generate_reference()
                
                multiplier = 1.0
                if seat_class == 'Business': multiplier = 1.5
                elif seat_class == 'First Class': multiplier = 2.5
                
                meal_price = 500 if meal_preference else 0
                price_paid = (flight.price * multiplier) + meal_price
                
                # Randomized booking date relative to flight departure or "now"
                # If flight is in past, booking was before flight.
                # If flight is in future, booking is recent.
                
                days_before = random.randint(1, 30)
                booking_date = flight.departure_time - timedelta(days=days_before)
                # Ensure booking date is not in future relative to now if we want "history"
                # But booking date can be in past.
                if booking_date > datetime.now():
                    booking_date = datetime.now() - timedelta(minutes=random.randint(1, 10000))

                booking = Booking(
                    booking_reference=reference,
                    flight_id=flight.id,
                    passenger_name=passenger_name,
                    passenger_email=passenger_email,
                    seat_number=None, # Skip complex seat logic for bulk seed
                    seat_class=seat_class,
                    price_paid=price_paid,
                    meal_preference=meal_preference,
                    meal_price=meal_price,
                    is_bot=is_bot,
                    booking_date=booking_date
                )
                bookings_to_add.append(booking)
            
            if len(bookings_to_add) >= 1000:
                print(f"  Processed {idx+1}/{total_flights} flights... Committing batch.")
                db.session.add_all(bookings_to_add)
                db.session.commit()
                bookings_to_add = []

        if bookings_to_add:
            db.session.add_all(bookings_to_add)
            db.session.commit()
            
        print("Booking seeding complete!")

if __name__ == "__main__":
    seed_bookings()
