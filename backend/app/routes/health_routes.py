import os
from flask import Blueprint, jsonify, send_from_directory, current_app
from ..extensions import db

health_bp = Blueprint('health', __name__)


@health_bp.route('/health', methods=['GET'])
def health_check():
    db_status = 'connected'
    try:
        db.session.execute(db.text('SELECT 1'))
    except Exception:
        db_status = 'disconnected'

    return jsonify({
        'status': 'ok',
        'server': 'running',
        'database': db_status
    }), 200


@health_bp.route('/uploads/<path:filename>', methods=['GET'])
def serve_upload(filename):
    """Serve uploaded files (images) directly from the uploads folder."""
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)
