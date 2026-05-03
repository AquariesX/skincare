import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from werkzeug.utils import secure_filename
from ..utils.validators import is_valid_image
from ..services.model_service import predict_skin_condition
from ..services.recommendation_service import get_recommendation_for_condition
from ..extensions import db
from ..models import SkinAnalysis, SkinType, Recommendation, UserLog

prediction_bp = Blueprint('prediction', __name__)

LOW_CONFIDENCE_THRESHOLD = 40.0


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


@prediction_bp.route('/predict', methods=['POST'])
def predict():
    # JWT optional — works for both authenticated and guest users
    current_user_id = None
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        if identity:
            current_user_id = int(identity)
    except Exception:
        pass

    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided. Please select an image.'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No file selected. Please choose an image.'}), 400

    if not is_valid_image(file, current_app.config['ALLOWED_EXTENSIONS']):
        return jsonify({'error': 'Invalid file. Please upload a JPG, PNG, or WEBP image.'}), 400

    filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
    save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    file.save(save_path)

    try:
        result = predict_skin_condition(save_path)

        # Low confidence guard
        if result['confidence'] < LOW_CONFIDENCE_THRESHOLD:
            return jsonify({
                'success': True,
                'low_confidence': True,
                'confidence': result['confidence'],
                'message': (
                    'The image quality or lighting is too low for a reliable diagnosis. '
                    'Please upload a clear, well-lit photo of the affected skin area.'
                ),
                'all_predictions': result['all_predictions'],
            }), 200

        # Fetch recommendation from DB
        rec_data, skin_type_obj, rec_obj = get_recommendation_for_condition(result['condition'])

        # Save record to MySQL
        analysis_id = None
        try:
            record = SkinAnalysis(
                user_id=current_user_id,
                image_path=filename,
                predicted_condition=result['condition'],
                confidence_score=result['confidence'],
                skin_type_id=skin_type_obj.id if skin_type_obj else None,
                recommendation_id=rec_obj.id if rec_obj else None,
            )
            db.session.add(record)
            db.session.commit()
            analysis_id = record.id

            _log(current_user_id, 'skin_analysis',
                 f'Condition: {result["condition"]}, Confidence: {result["confidence"]}%')
        except Exception:
            db.session.rollback()

        return jsonify({
            'success': True,
            'low_confidence': False,
            'analysis_id': analysis_id,
            'image_filename': filename,
            'condition': result['condition'],
            'confidence': result['confidence'],
            'all_predictions': result['all_predictions'],
            'recommendation': rec_data,
        }), 200

    except FileNotFoundError as e:
        return jsonify({'error': str(e)}), 503
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        current_app.logger.error(f'Prediction error: {e}')
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500


@prediction_bp.route('/analysis/history', methods=['GET'])
@jwt_required()
def get_history():
    user_id = int(get_jwt_identity())
    try:
        limit = request.args.get('limit', 20, type=int)
        records = SkinAnalysis.query.filter_by(user_id=user_id)\
            .order_by(SkinAnalysis.created_at.desc()).limit(limit).all()
        return jsonify({
            'success': True,
            'history': [r.to_dict() for r in records],
            'count': len(records)
        }), 200
    except Exception as e:
        return jsonify({'error': f'Failed to fetch history: {str(e)}'}), 500


@prediction_bp.route('/analysis/<int:analysis_id>', methods=['GET'])
@jwt_required()
def get_analysis(analysis_id):
    user_id = int(get_jwt_identity())
    record = SkinAnalysis.query.get(analysis_id)
    if not record:
        return jsonify({'error': 'Analysis not found.'}), 404
    if record.user_id and record.user_id != user_id:
        return jsonify({'error': 'Access denied.'}), 403

    data = record.to_dict()
    if record.recommendation:
        data['recommendation'] = record.recommendation.to_dict()
    return jsonify({'success': True, 'analysis': data}), 200
