from app import create_app

app = create_app()

if __name__ == '__main__':
    import os
    
    with app.app_context():
        from app.models.user import User
        from app.models.airport import Airport
        from app.models.flight import Flight
        from app.models.booking import Booking

        # If no users, airports, OR FLIGHTS, run seed
        if not User.query.first() or not Airport.query.first() or not Flight.query.first():
            print("Database appears incomplete. Running base seed...")
            from seed import seed_data
            seed_data()
            
        # If no bookings, run booking seed
        if not Booking.query.first():
            print("No bookings found. Running bookings seed...")
            from seed_bookings import seed_bookings
            seed_bookings()

    debug = os.environ.get('FLASK_DEBUG', 'True') == 'True'
    app.run(debug=debug, host='0.0.0.0', port=5001)
