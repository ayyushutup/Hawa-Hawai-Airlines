from app import create_app, db
from app.models.user import User

app = create_app()

def create_admin(username, email, password):
    with app.app_context():
        # Check if user exists
        user = User.query.filter_by(username=username).first()
        if user:
            print(f"User {username} already exists. Promoting to admin...")
            user.is_admin = True
        else:
            print(f"Creating new admin user {username}...")
            user = User(username=username, email=email, is_admin=True)
            user.set_password(password)
            db.session.add(user)
        
        db.session.commit()
        print(f"Admin user {username} created/updated successfully!")

if __name__ == "__main__":
    create_admin('admin', 'admin@hawa-hawai.com', 'admin123')
