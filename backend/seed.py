from app import create_app, db
from app.models import Airport, Flight
from datetime import datetime, timedelta

app = create_app()

def seed_data():
    with app.app_context():
        print("Seeding data...")
        
        # Clear existing data
        print("Clearing old data...")
        from app.models.booking import Booking
        db.session.query(Booking).delete()
        db.session.query(Flight).delete()
        db.session.query(Airport).delete()
        db.session.commit()
        
        # Add Airports
        # Indian Airports
        delhi = Airport(code='DEL', name='Indira Gandhi International Airport', city='New Delhi', country='India', latitude=28.5562, longitude=77.1000)
        mumbai = Airport(code='BOM', name='Chhatrapati Shivaji Maharaj International Airport', city='Mumbai', country='India', latitude=19.0896, longitude=72.8656)
        bangalore = Airport(code='BLR', name='Kempegowda International Airport', city='Bangalore', country='India', latitude=13.1986, longitude=77.7066)
        chennai = Airport(code='MAA', name='Chennai International Airport', city='Chennai', country='India', latitude=12.9941, longitude=80.1709)
        kolkata = Airport(code='CCU', name='Netaji Subhash Chandra Bose International Airport', city='Kolkata', country='India', latitude=22.6547, longitude=88.4467)
        hyderabad = Airport(code='HYD', name='Rajiv Gandhi International Airport', city='Hyderabad', country='India', latitude=17.2403, longitude=78.4294)
        kochi = Airport(code='COK', name='Cochin International Airport', city='Kochi', country='India', latitude=10.1518, longitude=76.3930)
        ahmedabad = Airport(code='AMD', name='Sardar Vallabhbhai Patel International Airport', city='Ahmedabad', country='India', latitude=23.0734, longitude=72.6266)
        goa = Airport(code='GOI', name='Dabolim Airport', city='Goa', country='India', latitude=15.3800, longitude=73.8314)
        pune = Airport(code='PNQ', name='Pune Airport', city='Pune', country='India', latitude=18.5821, longitude=73.9197)
        jaipur = Airport(code='JAI', name='Jaipur International Airport', city='Jaipur', country='India', latitude=26.8286, longitude=75.8056)
        lucknow = Airport(code='LKO', name='Chaudhary Charan Singh International Airport', city='Lucknow', country='India', latitude=26.7606, longitude=80.8893)
        trivandrum = Airport(code='TRV', name='Thiruvananthapuram International Airport', city='Thiruvananthapuram', country='India', latitude=8.4821, longitude=76.9182)
        
        # International Airports
        jfk = Airport(code='JFK', name='John F. Kennedy International Airport', city='New York', country='USA', latitude=40.6413, longitude=-73.7781)
        lhr = Airport(code='LHR', name='Heathrow Airport', city='London', country='UK', latitude=51.4700, longitude=-0.4543)
        dxb = Airport(code='DXB', name='Dubai International Airport', city='Dubai', country='UAE', latitude=25.2532, longitude=55.3657)
        sin = Airport(code='SIN', name='Singapore Changi Airport', city='Singapore', country='Singapore', latitude=1.3644, longitude=103.9915)
        nrt = Airport(code='NRT', name='Narita International Airport', city='Tokyo', country='Japan', latitude=35.7720, longitude=140.3929)
        syd = Airport(code='SYD', name='Sydney Kingsford Smith Airport', city='Sydney', country='Australia', latitude=-33.9399, longitude=151.1753)
        cdg = Airport(code='CDG', name='Charles de Gaulle Airport', city='Paris', country='France', latitude=49.0097, longitude=2.5479)
        fra = Airport(code='FRA', name='Frankfurt Airport', city='Frankfurt', country='Germany', latitude=50.0379, longitude=8.5622)
        hkg = Airport(code='HKG', name='Hong Kong International Airport', city='Hong Kong', country='Hong Kong', latitude=22.3080, longitude=113.9185)
        lax = Airport(code='LAX', name='Los Angeles International Airport', city='Los Angeles', country='USA', latitude=33.9416, longitude=-118.4085)
        ist = Airport(code='IST', name='Istanbul Airport', city='Istanbul', country='Turkey', latitude=41.2753, longitude=28.7519)
        ams = Airport(code='AMS', name='Amsterdam Airport Schiphol', city='Amsterdam', country='Netherlands', latitude=52.3105, longitude=4.7683)
        icn = Airport(code='ICN', name='Incheon International Airport', city='Seoul', country='South Korea', latitude=37.4602, longitude=126.4407)
        bkk = Airport(code='BKK', name='Suvarnabhumi Airport', city='Bangkok', country='Thailand', latitude=13.6900, longitude=100.7501)
        doh = Airport(code='DOH', name='Hamad International Airport', city='Doha', country='Qatar', latitude=25.2609, longitude=51.6138)
        sfo = Airport(code='SFO', name='San Francisco International Airport', city='San Francisco', country='USA', latitude=37.6213, longitude=-122.3790)
        muc = Airport(code='MUC', name='Munich Airport', city='Munich', country='Germany', latitude=48.3537, longitude=11.7750)
        zrh = Airport(code='ZRH', name='Zurich Airport', city='Zurich', country='Switzerland', latitude=47.4582, longitude=8.5555)
        yyz = Airport(code='YYZ', name='Toronto Pearson International Airport', city='Toronto', country='Canada', latitude=43.6777, longitude=-79.6248)
        mad = Airport(code='MAD', name='Adolfo Suárez Madrid–Barajas Airport', city='Madrid', country='Spain', latitude=40.4722, longitude=-3.5641)

        indian_airports = [delhi, mumbai, bangalore, chennai, kolkata, hyderabad, kochi, ahmedabad, goa, pune, jaipur, lucknow, trivandrum]
        international_airports = [jfk, lhr, dxb, sin, nrt, syd, cdg, fra, hkg, lax, ist, ams, icn, bkk, doh, sfo, muc, zrh, yyz, mad]        
        all_airports = indian_airports + international_airports
        db.session.add_all(all_airports)
        db.session.commit()

        # Add Admin User
        print("Creating/Updating admin user...")
        from app.models.user import User
        
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            admin = User(username='admin', email='admin@hawahawai.com', is_admin=True)
            db.session.add(admin)
        
        # Always reset password to ensure we know what it is
        admin.set_password('admin')
        db.session.commit()

        # Add Flights
        print("Generating flights...")
        flights = []
        import random
        
        aircraft_types = ['Boeing 737', 'Airbus A320', 'Boeing 787', 'Airbus A321', 'Boeing 777', 'Airbus A350', 'Airbus A380']
        
        # Helper to get appropriate aircraft and price for distance
        def get_flight_details(origin, destination):
            is_international = origin.country != destination.country
            
            if is_international:
                base_price_min, base_price_max = 25000, 100000
                possible_aircraft = ['Boeing 787', 'Boeing 777', 'Airbus A350', 'Airbus A380']
                min_duration, max_duration = 5, 16 
            else:
                base_price_min, base_price_max = 3000, 15000
                possible_aircraft = ['Boeing 737', 'Airbus A320', 'Airbus A321']
                min_duration, max_duration = 2, 4
            
            aircraft = random.choice(possible_aircraft)
            price = float(random.randint(base_price_min, base_price_max))
            duration = random.randint(min_duration, max_duration)
            
            return aircraft, price, duration

        for origin in all_airports:
            destinations = set() # Use set to avoid duplicates

            # 1. Logic for International Airports (e.g. JFK)
            if origin.country != 'India':
                # MUST connect to major Indian Hubs
                hubs = [a for a in indian_airports if a.code in ['DEL', 'BOM']]
                destinations.update(hubs)
                
                # Also connect to some other international airports (random)
                others = [a for a in international_airports if a.id != origin.id and a not in destinations]
                if others:
                    destinations.update(random.sample(others, min(3, len(others))))

            # 2. Logic for Indian Hubs (DEL, BOM)
            elif origin.code in ['DEL', 'BOM']:
                # Connect to ALL International Airports
                destinations.update(international_airports)
                
                # Connect to ALL Domestic Spokes (ensure coverage)
                domestic_spokes = [a for a in indian_airports if a.code not in ['DEL', 'BOM'] and a.id != origin.id]
                destinations.update(domestic_spokes)

            # 3. Logic for Indian Spokes (e.g. GOI)
            else:
                # MUST connect to major Connectors/Hubs
                hubs = [a for a in indian_airports if a.code in ['DEL', 'BOM', 'BLR']]
                destinations.update(hubs)

            # Convert back to list
            final_destinations = list(destinations)

            print(f"Generating flights for {origin.code} to {len(final_destinations)} destinations...")

            for destination in final_destinations:
                if destination.id == origin.id: continue

                # Create flights for the next 20 days, starting from 2 days ago
                for day in range(-2, 18):
                    # Major route check
                    is_major_route = (origin.code in ['DEL', 'BOM', 'LHR', 'DXB', 'JFK'] and destination.code in ['DEL', 'BOM', 'LHR', 'DXB', 'JFK'])
                    
                    # If Hub -> Spoke (e.g. DEL -> GOI), we also want frequent flights for connections
                    is_hub_spoke = (origin.code in ['DEL', 'BOM'] and destination.country == 'India') or \
                                   (destination.code in ['DEL', 'BOM'] and origin.country == 'India')

                    if is_major_route:
                        num_flights = 3 
                    elif is_hub_spoke:
                        num_flights = 2 # Ensure at least 2 flights for good connection chances
                    else:
                        num_flights = 1

                    for i in range(num_flights):
                        # Randomize departure time
                        if num_flights > 1:
                            # Spread out
                            base_hour = [8, 14, 20][i % 3] 
                            hour_offset = base_hour + random.randint(-1, 1)
                            # Clamp hour 0-23
                            hour_offset = max(0, min(23, hour_offset))
                        else:
                            hour_offset = random.randint(5, 23)
                            
                        minute_offset = random.choice([0, 15, 30, 45])
                        
                        aircraft, price, duration_hours = get_flight_details(origin, destination)
                        
                        departure = datetime.now() + timedelta(days=day, hours=hour_offset, minutes=minute_offset)
                        departure = departure.replace(second=0, microsecond=0)
                        
                        arrival = departure + timedelta(hours=duration_hours)
                        
                        # Determine status based on randomness and time
                        rand_val = random.random()
                        status = 'Scheduled'
                        if rand_val < 0.05:
                            status = 'Cancelled'
                        elif rand_val < 0.10:
                            status = 'Delayed'
                            
                        # If flight was in the past, it should probably be 'Scheduled' (flown) or 'Cancelled'/'Delayed'
                        # But 'Scheduled' is fine for past flights implies 'Completed' loosely in this simple model,
                        # or we could add 'Arrived' if the model supports it. 
                        # The user asked for "show in admin panel", standard statuses are fine.
                        
                        # Format: HH-ORIG-DEST-DAY-HOUR-IDX
                        # Use abs(day) for formatting or just a counter to avoid negative in string if we care, 
                        # but simple unique string is enough.
                        day_str = f"{day+2:02d}" # Map -2 to 00, -1 to 01, etc.
                        f_num = f'HH{origin.code}{destination.code}{day_str}{hour_offset:02d}{i}'
                        
                        flight = Flight(
                            flight_number=f_num,
                            origin_code=origin.code,
                            destination_code=destination.code,
                            departure_time=departure,
                            arrival_time=arrival,
                            price=price,
                            base_price=price,
                            status=status,
                            aircraft_type=aircraft,
                            total_seats=random.randint(200, 400) if duration_hours > 5 else random.randint(150, 200)
                        )
                        flights.append(flight)

            
            # Periodically commit to avoid massive list in memory if needed, though 20 days * 30 airports * 10 dests is manageable.
        
        db.session.add_all(flights)
        db.session.commit()
        
        # Add Mock Bookings
        print("Generating mock bookings...")
        from app.models.booking import Booking
        from faker import Faker
        fake = Faker()
        
        bookings = []
        # Get a sample of flights (e.g., 20% of flights)
        flights_sample = random.sample(flights, max(1, len(flights) // 5))
        
        for flight in flights_sample:
            # Create a few bookings per flight
            num_bookings = random.randint(1, 10)
            for _ in range(num_bookings):
                is_bot = random.random() < 0.3 # 30% bot bookings
                booking_date = flight.departure_time - timedelta(days=random.randint(1, 30))
                
                booking = Booking(
                    flight_id=flight.id, # Note: flight.id might not be set until commit if we re-fetch, but using objects is safe in session
                    user_id=None, # Anonymous or populate if needed, but None is fine for guest
                    passenger_name=fake.name(),
                    passenger_email=fake.email(),
                    seat_number=f"{random.randint(1, 30)}{random.choice(['A', 'B', 'C', 'D', 'E', 'F'])}",
                    seat_class=random.choice(['Economy', 'Business', 'First']),
                    meal_preference=random.choice(['Veg', 'Non-Veg', 'Vegan', 'None']),
                    booking_date=booking_date,
                    status='Confirmed',
                    price_paid=flight.price, # Simplified
                    is_bot=is_bot
                )
                bookings.append(booking)
        
        # We need flight IDs first, so we might need to commit flights first if not already (they are added but auto-increment IDs might strictly require commit or flush)
        # However, SQLAlchemy objects usually track relationships. But Booking uses flight_id FK.
        # Safest is to rely on the fact we did db.session.commit() for flights earlier (line 212 in original, but we are appending).
        # Wait, I noticed flight.id usage. The flights list items won't have IDs until flushed/committed.
        # The original code has db.session.commit() at line 212.
        # So I will place this AFTER that commit.
        
        db.session.add_all(bookings)
        db.session.commit()
        
        print(f"Seeding complete! Added {len(flights)} flights and {len(bookings)} bookings.")

if __name__ == '__main__':
    seed_data()
