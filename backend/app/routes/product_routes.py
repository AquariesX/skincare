import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from ..extensions import db
from ..models import Product, SkinType, User

product_bp = Blueprint('products', __name__)

ALLOWED = {'jpg', 'jpeg', 'png', 'webp'}


def _allowed(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED


@product_bp.route('/products', methods=['GET'])
def get_products():
    skin_type_id = request.args.get('skin_type_id', type=int)
    query = Product.query
    if skin_type_id:
        query = query.filter_by(skin_type_id=skin_type_id)
    products = query.order_by(Product.created_at.desc()).all()
    return jsonify({'products': [p.to_dict() for p in products]}), 200


@product_bp.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found.'}), 404
    return jsonify({'product': product.to_dict()}), 200


@product_bp.route('/products/skin-type/<int:skin_type_id>', methods=['GET'])
def get_products_by_skin_type(skin_type_id):
    products = Product.query.filter_by(skin_type_id=skin_type_id)\
        .order_by(Product.created_at.desc()).all()
    return jsonify({'products': [p.to_dict() for p in products]}), 200


@product_bp.route('/admin/products', methods=['POST'])
@jwt_required()
def create_product():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user or not user.is_admin:
            return jsonify({'error': 'Admin access required.'}), 403

        name = request.form.get('name', '').strip()
        if not name:
            return jsonify({'error': 'Product name is required.'}), 400

        upload_folder = current_app.config.get('UPLOAD_FOLDER')

        if not upload_folder:
            return jsonify({'error': 'UPLOAD_FOLDER is not configured.'}), 500

        os.makedirs(upload_folder, exist_ok=True)

        image_path = None

        if 'image' in request.files:
            img = request.files['image']

            if img and img.filename:
                if not _allowed(img.filename):
                    return jsonify({'error': 'Invalid image type. Use jpg, jpeg, png, or webp.'}), 400

                fname = f"{uuid.uuid4().hex}_{secure_filename(img.filename)}"
                save_path = os.path.join(upload_folder, fname)
                img.save(save_path)
                image_path = fname

        product = Product(
            name=name,
            skin_type_id=request.form.get('skin_type_id', type=int),
            category=request.form.get('category', ''),
            product_type=request.form.get('product_type', ''),
            description=request.form.get('description', ''),
            usage_instruction=request.form.get('usage_instruction', ''),
            ingredients=request.form.get('ingredients', ''),
            image_path=image_path
        )

        db.session.add(product)
        db.session.commit()

        return jsonify({
            'message': 'Product saved successfully',
            'product': product.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        print('[Create Product Error]', e)
        return jsonify({'error': f'Save failed: {str(e)}'}), 500


@product_bp.route('/admin/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return jsonify({'error': 'Admin access required.'}), 403

    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found.'}), 404

    # Support both JSON and form-data
    if request.content_type and 'multipart' in request.content_type:
        data = request.form
    else:
        data = request.get_json() or {}

    for field in ['name', 'category', 'product_type', 'description',
                  'usage_instruction', 'ingredients']:
        if field in data:
            setattr(product, field, data[field])

    if 'skin_type_id' in data:
        product.skin_type_id = int(data['skin_type_id']) if data['skin_type_id'] else None

    if 'image' in request.files:
        img = request.files['image']
        if img and _allowed(img.filename):
            fname = f"{uuid.uuid4().hex}_{secure_filename(img.filename)}"
            img.save(os.path.join(current_app.config['UPLOAD_FOLDER'], fname))
            product.image_path = fname

    db.session.commit()
    return jsonify({'product': product.to_dict()}), 200


@product_bp.route('/admin/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return jsonify({'error': 'Admin access required.'}), 403

    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found.'}), 404

    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Product deleted.'}), 200
