from app import create_app, db
from app.models.flight import Flight

app = create_app()
with app.app_context():
    flights = Flight.query.all()
    print(f"Total flights: {len(flights)}")
    for f in flights[:5]:
        print(f"Flight {f.flight_number}: Price={f.price}, Base={f.base_price}, Origin={f.origin_code}, Dest={f.destination_code}")
