import sqlite3

def migrate():
    print("Adding extras columns to bookings table...")
    conn = sqlite3.connect('instance/hawa_hawai.db')
    cursor = conn.cursor()

    try:
        cursor.execute("ALTER TABLE bookings ADD COLUMN baggage_kg INTEGER DEFAULT 0")
        print("Added baggage_kg")
    except sqlite3.OperationalError:
        print("baggage_kg already exists")

    try:
        cursor.execute("ALTER TABLE bookings ADD COLUMN has_insurance BOOLEAN DEFAULT 0")
        print("Added has_insurance")
    except sqlite3.OperationalError:
        print("has_insurance already exists")

    try:
        cursor.execute("ALTER TABLE bookings ADD COLUMN has_priority BOOLEAN DEFAULT 0")
        print("Added has_priority")
    except sqlite3.OperationalError:
        print("has_priority already exists")

    try:
        cursor.execute("ALTER TABLE bookings ADD COLUMN extras_price FLOAT DEFAULT 0.0")
        print("Added extras_price")
    except sqlite3.OperationalError:
        print("extras_price already exists")

    conn.commit()
    conn.close()
    print("Migration successful.")

if __name__ == "__main__":
    migrate()
