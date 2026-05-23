from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VehicleCreate(BaseModel):
    name: str
    type: str
    capacity: str
    location: str
    reg: str
    phone: Optional[str] = None
    image_url: Optional[str] = None

class VehicleUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    capacity: Optional[str] = None
    location: Optional[str] = None
    reg: Optional[str] = None
    online: Optional[bool] = None
    image_url: Optional[str] = None
    phone: Optional[str] = None

class VehicleOut(BaseModel):
    id: int
    name: str
    type: str
    capacity: str
    location: str
    reg: str
    phone: Optional[str] = None
    image_url: Optional[str] = None
    online: bool
    views: int
    contacts: int
    created_at: datetime
    class Config: from_attributes = True

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str = "owner"
    avatar: Optional[str]
    plan: str
    is_active: bool
    created_at: datetime
    class Config: from_attributes = True

class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class SubscriptionInitiate(BaseModel):
    plan: str

class SubscriptionOut(BaseModel):
    id: int
    user_id: int
    plan: str
    status: str
    paystack_customer_code: Optional[str]
    paystack_subscription_code: Optional[str]
    amount: int
    created_at: datetime
    class Config: from_attributes = True

class NotificationOut(BaseModel):
    id: int
    type: str
    message: str
    read: bool
    created_at: datetime
    class Config: from_attributes = True

class ComplaintCreate(BaseModel):
    email: str
    subject: str
    category: str
    message: str

class ComplaintOut(BaseModel):
    id: int
    email: str
    subject: str
    category: str
    message: str
    status: str
    created_at: datetime
    class Config: from_attributes = True

class TokenOut(BaseModel):
    access_token: str
    token_type: str
    user: UserOut