from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    google_sub = Column(String, unique=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    avatar = Column(String, nullable=True)
    password_hash = Column(String, nullable=True)
    plan = Column(String, default="Free Trial")
    role = Column(String, default="owner")
    admin_section = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    vehicles = relationship("Vehicle", back_populates="owner")
    notifications = relationship("Notification", back_populates="user")

class Vehicle(Base):
    __tablename__ = "vehicles"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    type = Column(String)
    capacity = Column(String)
    location = Column(String)
    reg = Column(String)
    image_url = Column(String, nullable=True)
    online = Column(Boolean, default=False)
    views = Column(Integer, default=0)
    contacts = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    owner = relationship("User", back_populates="vehicles")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String)
    message = Column(String)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="notifications")

class Subscription(Base):
    __tablename__ = "subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plan = Column(String)
    status = Column(String)
    paystack_customer_code = Column(String, nullable=True)
    paystack_subscription_code = Column(String, nullable=True)
    amount = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User")

class Complaint(Base):
    __tablename__ = "complaints"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    email = Column(String)
    subject = Column(String)
    category = Column(String)
    message = Column(Text)
    status = Column(String, default="open")
    created_at = Column(DateTime(timezone=True), server_default=func.now())