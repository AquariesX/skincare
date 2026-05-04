from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models import Recommendation, SkinType, User

recommendation_bp = Blueprint('recommendations', __name__)


@recommendation_bp.route('/recommendations', methods=['GET'])
def get_all_recommendations():
    recs = Recommendation.query.all()
    return jsonify({'recommendations': [r.to_dict() for r in recs]}), 200


@recommendation_bp.route('/recommendations/<int:skin_type_id>', methods=['GET'])
def get_recommendation(skin_type_id):
    rec = Recommendation.query.filter_by(skin_type_id=skin_type_id).first()
    if not rec:
        return jsonify({'error': 'No recommendation found for this skin type.'}), 404
    return jsonify({'recommendation': rec.to_dict()}), 200


@recommendation_bp.route('/admin/recommendations', methods=['POST'])
@jwt_required()
def create_recommendation():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return jsonify({'error': 'Admin access required.'}), 403

    data = request.get_json()
    skin_type_id = data.get('skin_type_id')
    if not skin_type_id:
        return jsonify({'error': 'skin_type_id is required.'}), 400

    if not SkinType.query.get(skin_type_id):
        return jsonify({'error': 'Skin type not found.'}), 404

    rec = Recommendation()
    Recommendation.skin_type_id=skin_type_id,
    Recommendation.description=data.get('description', ''),
    Recommendation.skincare_routine=data.get('skincare_routine', ''),
    Recommendation.medicines=data.get('medicines', ''),
    Recommendation.ointments=data.get('ointments', ''),
    Recommendation.serums=data.get('serums', ''),
    Recommendation.home_remedies=data.get('home_remedies', ''),
    Recommendation.precautions=data.get('precautions', ''),
    Recommendation.dermatologist_advice=data.get('dermatologist_advice', ''),

    db.session.add(rec)
    db.session.commit()
    return jsonify({'recommendation': rec.to_dict()}), 201


@recommendation_bp.route('/admin/recommendations/<int:rec_id>', methods=['PUT'])
@jwt_required()
def update_recommendation(rec_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return jsonify({'error': 'Admin access required.'}), 403

    rec = Recommendation.query.get(rec_id)
    if not rec:
        return jsonify({'error': 'Recommendation not found.'}), 404

    data = request.get_json()
    fields = ['description', 'skincare_routine', 'medicines', 'ointments',
              'serums', 'home_remedies', 'precautions', 'dermatologist_advice']
    for f in fields:
        if f in data:
            setattr(rec, f, data[f])

    db.session.commit()
    return jsonify({'recommendation': rec.to_dict()}), 200


@recommendation_bp.route('/admin/recommendations/<int:rec_id>', methods=['DELETE'])
@jwt_required()
def delete_recommendation(rec_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return jsonify({'error': 'Admin access required.'}), 403

    rec = Recommendation.query.get(rec_id)
    if not rec:
        return jsonify({'error': 'Recommendation not found.'}), 404

    db.session.delete(rec)
    db.session.commit()
    return jsonify({'message': 'Recommendation deleted.'}), 200
