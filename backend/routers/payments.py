from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db
from models import User, Subscription
from schemas import SubscriptionInitiate, SubscriptionOut
from routers.users import get_current_user
import requests
import os
import hmac
import hashlib
from dotenv import load_dotenv

load_dotenv()

PAYSTACK_SECRET = os.getenv("PAYSTACK_SECRET_KEY")
HEADERS = {
    "Authorization": f"Bearer {PAYSTACK_SECRET}",
    "Content-Type": "application/json",
}
print("Paystack key:", PAYSTACK_SECRET[:15] if PAYSTACK_SECRET else "NOT FOUND")

# Plan codes — create these in Paystack dashboard first
PLAN_CODES = {
    "Premium": "PLN_0erpwyjo5r87zrv",
    "Enterprise": "PLN_m9avegudwcyakfm",
}

PLAN_AMOUNTS = {
    "Premium": 29000,      # in pesewas/kobo — adjust to your currency
    "Enterprise": 99000,
}

router = APIRouter(prefix="/payments", tags=["payments"])

@router.post("/initiate")
def initiate_subscription(
    payload: SubscriptionInitiate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print("Received plan:", payload.plan)
    print("Plan codes:", PLAN_CODES)
    if payload.plan not in PLAN_CODES:
        raise HTTPException(status_code=400, detail="Invalid plan")

    # Initialize Paystack transaction
    res = requests.post(
        "https://api.paystack.co/transaction/initialize",
        headers=HEADERS,
        json={
            "email": current_user.email,
            "amount": PLAN_AMOUNTS[payload.plan],
            "plan": PLAN_CODES[payload.plan],
            "callback_url": "http://localhost:5173/subscription?payment=success",
            "metadata": {
                "user_id": current_user.id,
                "plan": payload.plan,
            }
        }
    )

    print("Paystack response:", res.status_code, res.json())

    if res.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to initiate payment")

    data = res.json()["data"]
    return {
        "authorization_url": data["authorization_url"],
        "reference": data["reference"],
    }


@router.get("/verify/{reference}")
def verify_payment(
    reference: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    res = requests.get(
        f"https://api.paystack.co/transaction/verify/{reference}",
        headers=HEADERS,
    )

    if res.status_code != 200:
        raise HTTPException(status_code=400, detail="Verification failed")

    data = res.json()["data"]
    customer_code = data.get("customer", {}).get("customer_code")
    subscription_code = None
    email_token = None

    if customer_code:
        sub_res = requests.get(
            f"https://api.paystack.co/subscription?customer={customer_code}",
            headers=HEADERS,
        )
        if sub_res.status_code == 200:
            sub_data = sub_res.json().get("data", [])
            if sub_data:
                subscription_code = sub_data[0].get("subscription_code")
                email_token = sub_data[0].get("email_token")

    if data["status"] != "success":
        raise HTTPException(status_code=400, detail="Payment not successful")

    plan = data["metadata"]["plan"]

    # Update user plan
    current_user.plan = plan
    db.commit()

    # Save subscription record
    sub = Subscription(
        user_id=current_user.id,
        plan=plan,
        status="active",
        paystack_customer_code=customer_code,
        paystack_subscription_code=subscription_code,
        paystack_email_token=email_token,
        amount=data["amount"],
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)

    return {"message": "Subscription activated", "plan": plan}


@router.post("/cancel")
def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sub = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active"
    ).first()

    if not sub:
        raise HTTPException(status_code=404, detail="No active subscription found")

    # Try to disable on Paystack if subscription code exists
    if sub.paystack_subscription_code and sub.paystack_email_token:
        requests.post(
            "https://api.paystack.co/subscription/disable",
            headers=HEADERS,
            json={
                "code": sub.paystack_subscription_code,
                "token": sub.paystack_email_token,
            }
        )

    # Always update locally regardless
    sub.status = "cancelled"
    current_user.plan = "Free Trial"
    db.commit()

    return {"message": "Subscription cancelled"}


@router.post("/webhook")
async def paystack_webhook(request: Request, db: Session = Depends(get_db)):
    # Verify webhook signature
    body = await request.body()
    signature = request.headers.get("x-paystack-signature")
    expected = hmac.new(
        PAYSTACK_SECRET.encode(),
        body,
        hashlib.sha512
    ).hexdigest()

    if signature != expected:
        raise HTTPException(status_code=400, detail="Invalid signature")

    payload = await request.json()
    event = payload.get("event")

    if event == "subscription.disable":
        sub_code = payload["data"]["subscription_code"]
        sub = db.query(Subscription).filter(
            Subscription.paystack_subscription_code == sub_code
        ).first()
        if sub:
            sub.status = "cancelled"
            user = db.query(User).filter(User.id == sub.user_id).first()
            if user:
                user.plan = "Free Trial"
            db.commit()

    if event == "invoice.payment_failed":
        sub_code = payload["data"]["subscription"]["subscription_code"]
        sub = db.query(Subscription).filter(
            Subscription.paystack_subscription_code == sub_code
        ).first()
        if sub:
            sub.status = "expired"
            db.commit()

    return {"status": "ok"}


@router.get("/my-subscription", response_model=SubscriptionOut)
def get_my_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sub = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active"
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="No active subscription")
    return sub