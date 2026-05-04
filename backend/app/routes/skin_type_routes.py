from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models import SkinType, User

skin_type_bp = Blueprint('skin_types', __name__)


def _require_admin():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return None, jsonify({'error': 'Admin access required.'}), 403
    return user, None, None


@skin_type_bp.route('/skin-types', methods=['GET'])
def get_skin_types():
    skin_types = SkinType.query.order_by(SkinType.name).all()
    return jsonify({'skin_types': [st.to_dict() for st in skin_types]}), 200


@skin_type_bp.route('/admin/skin-types', methods=['POST'])
@jwt_required()
def create_skin_type():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return jsonify({'error': 'Admin access required.'}), 403

    data = request.get_json()
    name = (data.get('name') or '').strip()
    if not name:
        return jsonify({'error': 'Name is required.'}), 400

    if SkinType.query.filter_by(name=name).first():
        return jsonify({'error': 'Skin type already exists.'}), 409

    st = SkinType()
    st.name=name, 
    st.description=data.get('description', '')
    db.session.add(st)
    db.session.commit()
    return jsonify({'skin_type': st.to_dict()}), 201


@skin_type_bp.route('/admin/skin-types/<int:st_id>', methods=['PUT'])
@jwt_required()
def update_skin_type(st_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return jsonify({'error': 'Admin access required.'}), 403

    st = SkinType.query.get(st_id)
    if not st:
        return jsonify({'error': 'Skin type not found.'}), 404

    data = request.get_json()
    if 'name' in data:
        st.name = data['name'].strip()
    if 'description' in data:
        st.description = data['description']

    db.session.commit()
    return jsonify({'skin_type': st.to_dict()}), 200


@skin_type_bp.route('/admin/skin-types/<int:st_id>', methods=['DELETE'])
@jwt_required()
def delete_skin_type(st_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return jsonify({'error': 'Admin access required.'}), 403

    st = SkinType.query.get(st_id)
    if not st:
        return jsonify({'error': 'Skin type not found.'}), 404

    db.session.delete(st)
    db.session.commit()
    return jsonify({'message': 'Skin type deleted.'}), 200
