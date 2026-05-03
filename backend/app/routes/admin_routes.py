from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models import User, SkinAnalysis, Blog, Product, UserLog, SkinType

admin_bp = Blueprint('admin', __name__)


def _require_admin():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return None
    return user


@admin_bp.route('/admin/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    if not _require_admin():
        return jsonify({'error': 'Admin access required.'}), 403

    stats = {
        'total_users': User.query.filter_by(role='user').count(),
        'total_analyses': SkinAnalysis.query.count(),
        'total_blogs': Blog.query.count(),
        'total_products': Product.query.count(),
        'total_skin_types': SkinType.query.count(),
        'recent_analyses': [
            a.to_dict() for a in
            SkinAnalysis.query.order_by(SkinAnalysis.created_at.desc()).limit(5).all()
        ],
        'recent_users': [
            u.to_dict() for u in
            User.query.filter_by(role='user').order_by(User.created_at.desc()).limit(5).all()
        ],
    }
    return jsonify({'stats': stats}), 200


@admin_bp.route('/admin/stats', methods=['GET'])
@jwt_required()
def stats():
    if not _require_admin():
        return jsonify({'error': 'Admin access required.'}), 403

    from sqlalchemy import func
    condition_counts = db.session.query(
        SkinAnalysis.predicted_condition,
        func.count(SkinAnalysis.id).label('count')
    ).group_by(SkinAnalysis.predicted_condition).all()

    return jsonify({
        'user_count': User.query.filter_by(role='user').count(),
        'analysis_count': SkinAnalysis.query.count(),
        'blog_count': Blog.query.count(),
        'product_count': Product.query.count(),
        'condition_distribution': [
            {'condition': c, 'count': n} for c, n in condition_counts
        ],
    }), 200


@admin_bp.route('/admin/users', methods=['GET'])
@jwt_required()
def get_users():
    if not _require_admin():
        return jsonify({'error': 'Admin access required.'}), 403

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    paginated = User.query.order_by(User.created_at.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'users': [u.to_dict() for u in paginated.items],
        'total': paginated.total,
        'pages': paginated.pages,
        'current_page': page,
    }), 200


@admin_bp.route('/admin/users/<int:uid>', methods=['PUT'])
@jwt_required()
def update_user(uid):
    if not _require_admin():
        return jsonify({'error': 'Admin access required.'}), 403

    user = User.query.get(uid)
    if not user:
        return jsonify({'error': 'User not found.'}), 404

    data = request.get_json() or {}
    if 'is_active' in data:
        user.is_active = bool(data['is_active'])
    if 'role' in data and data['role'] in ('user', 'admin'):
        user.role = data['role']

    db.session.commit()
    return jsonify({'user': user.to_dict()}), 200


@admin_bp.route('/admin/analysis-records', methods=['GET'])
@jwt_required()
def get_analysis_records():
    if not _require_admin():
        return jsonify({'error': 'Admin access required.'}), 403

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    paginated = SkinAnalysis.query.order_by(SkinAnalysis.created_at.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)

    records = []
    for r in paginated.items:
        d = r.to_dict()
        if r.user:
            d['user_name'] = r.user.username
            d['user_email'] = r.user.email
        else:
            d['user_name'] = 'Guest'
            d['user_email'] = None
        records.append(d)

    return jsonify({
        'records': records,
        'total': paginated.total,
        'pages': paginated.pages,
        'current_page': page,
    }), 200


@admin_bp.route('/admin/user-logs', methods=['GET'])
@jwt_required()
def get_user_logs():
    if not _require_admin():
        return jsonify({'error': 'Admin access required.'}), 403

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 30, type=int)
    paginated = UserLog.query.order_by(UserLog.created_at.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'logs': [l.to_dict() for l in paginated.items],
        'total': paginated.total,
        'pages': paginated.pages,
        'current_page': page,
    }), 200
