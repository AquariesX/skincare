from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from .extensions import db


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default='user', nullable=False)  # 'user' or 'admin'
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    analyses = db.relationship('SkinAnalysis', backref='user', lazy=True,
                               foreign_keys='SkinAnalysis.user_id')
    blogs = db.relationship('Blog', backref='author', lazy=True,
                            foreign_keys='Blog.author_id')
    logs = db.relationship('UserLog', backref='user', lazy=True,
                           foreign_keys='UserLog.user_id')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @property
    def is_admin(self):
        return self.role == 'admin'

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'name': self.username,        # alias so frontend user.name still works
            'email': self.email,
            'role': self.role,
            'is_admin': self.is_admin,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class SkinType(db.Model):
    __tablename__ = 'skin_types'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)

    recommendations = db.relationship('Recommendation', backref='skin_type', lazy=True)
    products = db.relationship('Product', backref='skin_type', lazy=True)
    analyses = db.relationship('SkinAnalysis', backref='skin_type_ref', lazy=True,
                               foreign_keys='SkinAnalysis.skin_type_id')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
        }


class Recommendation(db.Model):
    __tablename__ = 'recommendations'

    id = db.Column(db.Integer, primary_key=True)
    skin_type_id = db.Column(db.Integer, db.ForeignKey('skin_types.id'), nullable=False)
    description = db.Column(db.Text, nullable=True)
    skincare_routine = db.Column(db.Text, nullable=True)
    medicines = db.Column(db.Text, nullable=True)
    ointments = db.Column(db.Text, nullable=True)
    serums = db.Column(db.Text, nullable=True)
    home_remedies = db.Column(db.Text, nullable=True)
    precautions = db.Column(db.Text, nullable=True)
    dermatologist_advice = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'skin_type_id': self.skin_type_id,
            'skin_type_name': self.skin_type.name if self.skin_type else None,  # type: ignore[attr-defined]
            'description': self.description,
            'skincare_routine': self.skincare_routine,
            'medicines': self.medicines,
            'ointments': self.ointments,
            'serums': self.serums,
            'home_remedies': self.home_remedies,
            'precautions': self.precautions,
            'dermatologist_advice': self.dermatologist_advice,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class SkinAnalysis(db.Model):
    __tablename__ = 'skin_analysis'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    image_path = db.Column(db.String(256), nullable=False)
    predicted_condition = db.Column(db.String(100), nullable=False)
    confidence_score = db.Column(db.Float, nullable=False)
    skin_type_id = db.Column(db.Integer, db.ForeignKey('skin_types.id'), nullable=True)
    recommendation_id = db.Column(db.Integer, db.ForeignKey('recommendations.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    recommendation = db.relationship('Recommendation', backref='analyses', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'image_path': self.image_path,
            'predicted_condition': self.predicted_condition,
            'confidence_score': self.confidence_score,
            'skin_type_id': self.skin_type_id,
            'recommendation_id': self.recommendation_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    skin_type_id = db.Column(db.Integer, db.ForeignKey('skin_types.id'), nullable=True)
    name = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(100), nullable=True)
    product_type = db.Column(db.String(80), nullable=True)
    description = db.Column(db.Text, nullable=True)
    usage_instruction = db.Column(db.Text, nullable=True)
    ingredients = db.Column(db.Text, nullable=True)
    image_path = db.Column(db.String(256), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'skin_type_id': self.skin_type_id,
            'skin_type_name': self.skin_type.name if self.skin_type else None,  # type: ignore[attr-defined]
            'name': self.name,
            'category': self.category,
            'product_type': self.product_type,
            'description': self.description,
            'usage_instruction': self.usage_instruction,
            'ingredients': self.ingredients,
            'image_path': self.image_path,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class Blog(db.Model):
    __tablename__ = 'blogs'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(220), unique=True, nullable=False)
    content = db.Column(db.Text, nullable=False)
    image_path = db.Column(db.String(256), nullable=True)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self, include_content=True):
        d = {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'image_path': self.image_path,
            'author_id': self.author_id,
            'author_name': self.author.username if self.author else 'Admin',  # type: ignore[attr-defined]
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_content:
            d['content'] = self.content
        else:
            d['excerpt'] = (self.content[:200] + '...') if len(self.content) > 200 else self.content
        return d


class UserLog(db.Model):
    __tablename__ = 'user_logs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    action = db.Column(db.String(100), nullable=False)
    details = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.username if self.user else 'Guest',  # type: ignore[attr-defined]
            'action': self.action,
            'details': self.details,
            'ip_address': self.ip_address,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
class QuizQuestion(db.Model):
    __tablename__ = "quiz_questions"

    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.String(255), nullable=False)
    option_a = db.Column(db.String(255), nullable=False)
    option_b = db.Column(db.String(255), nullable=False)
    option_c = db.Column(db.String(255), nullable=False)
    order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "question": self.question,
            "option_a": self.option_a,
            "option_b": self.option_b,
            "option_c": self.option_c,
            "order": self.order,
        }
