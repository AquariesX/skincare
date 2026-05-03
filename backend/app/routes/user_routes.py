from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models import User, SkinAnalysis

user_bp = Blueprint('users', __name__)


@user_bp.route('/user/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404
    return jsonify({'user': user.to_dict()}), 200


@user_bp.route('/user/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404

    data = request.get_json() or {}
    if 'username' in data and data['username'].strip():
        user.username = data['username'].strip()

    if 'password' in data and len(data['password']) >= 6:
        user.set_password(data['password'])

    db.session.commit()
    return jsonify({'user': user.to_dict()}), 200


@user_bp.route('/user/analysis-history', methods=['GET'])
@jwt_required()
def get_user_history():
    user_id = int(get_jwt_identity())
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    paginated = SkinAnalysis.query.filter_by(user_id=user_id)\
        .order_by(SkinAnalysis.created_at.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)

    records = []
    for r in paginated.items:
        d = r.to_dict()
        if r.recommendation:
            d['recommendation'] = r.recommendation.to_dict()
        records.append(d)

    return jsonify({
        'history': records,
        'total': paginated.total,
        'pages': paginated.pages,
        'current_page': page,
    }), 200
