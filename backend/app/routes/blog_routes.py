import os
import uuid
import re
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from ..extensions import db
from ..models import Blog, User

blog_bp = Blueprint('blogs', __name__)

ALLOWED = {'jpg', 'jpeg', 'png', 'webp'}


def _slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text[:200]


def _unique_slug(title):
    base = _slugify(title)
    slug = base
    i = 1
    while Blog.query.filter_by(slug=slug).first():
        slug = f"{base}-{i}"
        i += 1
    return slug


def _allowed(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED


@blog_bp.route('/blogs', methods=['GET'])
def get_blogs():
    blogs = Blog.query.order_by(Blog.created_at.desc()).all()
    return jsonify({'blogs': [b.to_dict(include_content=False) for b in blogs]}), 200


@blog_bp.route('/blogs/<slug>', methods=['GET'])
def get_blog(slug):
    blog = Blog.query.filter_by(slug=slug).first()
    if not blog:
        # Fallback: try integer ID for legacy clients
        try:
            blog = Blog.query.get(int(slug))
        except (ValueError, TypeError):
            pass
    if not blog:
        return jsonify({'error': 'Blog post not found.'}), 404
    return jsonify({'blog': blog.to_dict(include_content=True)}), 200


@blog_bp.route('/admin/blogs', methods=['POST'])
@jwt_required()
def create_blog():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return jsonify({'error': 'Admin access required.'}), 403

    if request.content_type and 'multipart' in request.content_type:
        data = request.form
        title = data.get('title', '').strip()
        content = data.get('content', '').strip()
    else:
        data = request.get_json() or {}
        title = data.get('title', '').strip()
        content = data.get('content', '').strip()

    if not title or not content:
        return jsonify({'error': 'Title and content are required.'}), 400

    image_path = None
    if 'image' in request.files:
        img = request.files['image']
        if img and _allowed(img.filename):
            fname = f"{uuid.uuid4().hex}_{secure_filename(img.filename)}"
            img.save(os.path.join(current_app.config['UPLOAD_FOLDER'], fname))
            image_path = fname

    blog = Blog(
        title=title,
        slug=_unique_slug(title),
        content=content,
        image_path=image_path,
        author_id=user_id,
    )
    db.session.add(blog)
    db.session.commit()
    return jsonify({'blog': blog.to_dict()}), 201


@blog_bp.route('/admin/blogs/<int:blog_id>', methods=['PUT'])
@jwt_required()
def update_blog(blog_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return jsonify({'error': 'Admin access required.'}), 403

    blog = Blog.query.get(blog_id)
    if not blog:
        return jsonify({'error': 'Blog post not found.'}), 404

    if request.content_type and 'multipart' in request.content_type:
        data = request.form
    else:
        data = request.get_json() or {}

    if 'title' in data and data['title'].strip():
        blog.title = data['title'].strip()
        blog.slug = _unique_slug(blog.title)

    if 'content' in data:
        blog.content = data['content']

    if 'image' in request.files:
        img = request.files['image']
        if img and _allowed(img.filename):
            fname = f"{uuid.uuid4().hex}_{secure_filename(img.filename)}"
            img.save(os.path.join(current_app.config['UPLOAD_FOLDER'], fname))
            blog.image_path = fname

    db.session.commit()
    return jsonify({'blog': blog.to_dict()}), 200


@blog_bp.route('/admin/blogs/<int:blog_id>', methods=['DELETE'])
@jwt_required()
def delete_blog(blog_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return jsonify({'error': 'Admin access required.'}), 403

    blog = Blog.query.get(blog_id)
    if not blog:
        return jsonify({'error': 'Blog post not found.'}), 404

    db.session.delete(blog)
    db.session.commit()
    return jsonify({'message': 'Blog post deleted.'}), 200
