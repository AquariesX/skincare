from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..extensions import db
from ..models import User, UserLog

auth_bp = Blueprint('auth', __name__)


def _log(user_id, action, details=None):
    try:
        log = UserLog(
            user_id=user_id,
            action=action,
            details=details,
            ip_address=request.remote_addr
        )
        db.session.add(log)
        db.session.commit()
    except Exception:
        db.session.rollback()


@auth_bp.route('/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body must be JSON.'}), 400

        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not username or not email or not password:
            return jsonify({'error': 'UserName, email, and password are required.'}), 400

        if len(username) < 2 or len(username) > 120:
            return jsonify({'error': 'Name must be 2-120 characters.'}), 400

        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters.'}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email is already registered.'}), 409

        user = User(username=username, email=email, role='user')
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        _log(user.id, 'register', f'New user registered: {email}')

        access_token = create_access_token(identity=str(user.id))
        return jsonify({
    'message': 'Registration successful',
    'token': access_token,
    'access_token': access_token,
    'user': user.to_dict()
}), 201

    except Exception as e:
        db.session.rollback()
        print(f'[Register Error] {e}')
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500


@auth_bp.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body must be JSON.'}), 400

        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email or not password:
            return jsonify({'error': 'Email and password are required.'}), 400

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid email or password.'}), 401

        if not user.is_active:
            return jsonify({'error': 'Your account has been deactivated.'}), 403

        _log(user.id, 'login', f'Login from {request.remote_addr}')

        access_token = create_access_token(identity=str(user.id))
        return jsonify({
        'message': 'Login successful',
        'token': access_token,
        'access_token': access_token,
        'user': user.to_dict()
    }), 200

    except Exception as e:
        db.session.rollback()
        print(f'[Login Error] {e}')
        return jsonify({'error': f'Login failed: {str(e)}'}), 500


@auth_bp.route('/auth/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404
    return jsonify({'user': user.to_dict()}), 200


@auth_bp.route('/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    user_id = int(get_jwt_identity())
    _log(user_id, 'logout', None)
    return jsonify({'message': 'Logged out successfully.'}), 200
