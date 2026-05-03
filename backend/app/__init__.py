import os
from flask import Flask, jsonify
from flask_cors import CORS
from .config import Config
from .extensions import db, jwt


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)

    CORS(app, resources={r"/api/*": {
        "origins": ["http://localhost:5173", "http://localhost:3000"],
        "supports_credentials": True
    }})

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    with app.app_context():
        from . import models  # register all models with SQLAlchemy before create_all
        db.create_all()
        _create_default_admin()

    from .routes.health_routes import health_bp
    from .routes.auth_routes import auth_bp
    from .routes.prediction_routes import prediction_bp
    from .routes.skin_type_routes import skin_type_bp
    from .routes.recommendation_routes import recommendation_bp
    from .routes.product_routes import product_bp
    from .routes.blog_routes import blog_bp
    from .routes.user_routes import user_bp
    from .routes.admin_routes import admin_bp

    app.register_blueprint(health_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(prediction_bp, url_prefix='/api')
    app.register_blueprint(skin_type_bp, url_prefix='/api')
    app.register_blueprint(recommendation_bp, url_prefix='/api')
    app.register_blueprint(product_bp, url_prefix='/api')
    app.register_blueprint(blog_bp, url_prefix='/api')
    app.register_blueprint(user_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api')

    @app.errorhandler(413)
    def file_too_large(e):
        return jsonify({'error': 'File too large. Maximum allowed size is 5MB.'}), 413

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Endpoint not found.'}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({'error': 'Internal server error. Please try again.'}), 500

    return app


def _create_default_admin():
    from .models import User
    try:
        if not User.query.filter_by(email='admin@gmail.com').first():
            admin = User(username='Admin', email='admin@gmail.com', role='admin')
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print('[App] Default admin created: admin@gmail.com / admin123')
        else:
            print('[App] Default admin already exists.')
    except Exception as e:
        db.session.rollback()
        print(f'[App] Could not create default admin: {e}')
