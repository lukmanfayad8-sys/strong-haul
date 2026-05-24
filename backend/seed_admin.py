from argparse import ArgumentParser
from passlib.context import CryptContext

from database import get_db
from models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def seed_admin(email: str, password: str) -> None:
    db = next(get_db())
    try:
        admin = db.query(User).filter(User.email == email).first()
        hashed_password = pwd_context.hash(password)

        if admin:
            print(f"Admin user already exists with ID: {admin.id}. Updating credentials.")
            admin.name = "Admin"
            admin.password_hash = hashed_password
            admin.role = "admin"
            admin.plan = "Enterprise"
            admin.is_active = True
        else:
            admin = User(
                name="Admin",
                email=email,
                password_hash=hashed_password,
                role="admin",
                plan="Enterprise",
                is_active=True,
            )
            db.add(admin)

        db.commit()
        db.refresh(admin)
        print("Done. Admin ID:", admin.id)
    finally:
        db.close()


if __name__ == "__main__":
    parser = ArgumentParser(description="Seed the initial Strong Haul admin account.")
    parser.add_argument(
        "--email",
        default="admin@stronghaul.com",
        help="Admin email address",
    )
    parser.add_argument(
        "--password",
        default="yourpassword",
        help="Admin password",
    )

    args = parser.parse_args()
    seed_admin(args.email, args.password)
