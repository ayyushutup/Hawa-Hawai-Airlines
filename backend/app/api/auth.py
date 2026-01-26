from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models.user import User
from app import db, limiter

bp = Blueprint('auth', __name__)

@bp.route('/register', methods=['POST'])
@limiter.limit("5 per minute")  # Rate limit registration attempts
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'error': 'Missing required fields'}), 400

    # Email format validation
    import re
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({'error': 'Invalid email format'}), 400
    
    # Password strength validation
    if len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 400

    new_user = User(username=username, email=email)
    new_user.set_password(password)
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

@bp.route('/login', methods=['POST'])
@limiter.limit("5 per minute")  # Rate limit login attempts to prevent brute force
def login():
    data = request.get_json()
    # Accept identifier in either email or username field for flexibility
    identifier = data.get('email') or data.get('username')
    password = data.get('password')

    if not identifier or not password:
        return jsonify({'error': 'Missing credentials'}), 400

    from sqlalchemy import or_
    user = User.query.filter(or_(User.email == identifier, User.username == identifier)).first()

    if user and user.check_password(password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
    
    return jsonify({'error': 'Invalid credentials'}), 401

@bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    return jsonify(user.to_dict()), 200
