from app import create_app, db
import os

app = create_app()

def reset_db():
    with app.app_context():
        db_path = app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', '')
        if os.path.exists(os.path.join('instance', 'hawa_hawai.db')):
            print("Removing old database...")
            # actually db.drop_all() is safer than removing file if we want to keep context
        
        print("Dropping all tables...")
        db.drop_all()
        print("Creating all tables...")
        db.create_all()
        print("Database reset complete.")

if __name__ == '__main__':
    reset_db()
