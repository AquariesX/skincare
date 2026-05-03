from app import create_app
from app.extensions import db
from app.models import User

app = create_app()

with app.app_context():
    admin = User.query.filter_by(email="admin@gmail.com").first()

    if not admin:
        admin = User(
            username="Admin",
            email="admin@gmail.com",
            role="admin",
            is_active=True
        )
        admin.set_password("admin123")
        db.session.add(admin)
    else:
        admin.username = "Admin"
        admin.role = "admin"
        admin.is_active = True
        admin.set_password("admin123")

    db.session.commit()
    print("Admin created/updated successfully")