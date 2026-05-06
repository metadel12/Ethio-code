from datetime import datetime

PLATFORM_FEE_PERCENT = 15.0


def create_checkout_session(plan: str) -> dict:
    return {"plan": plan, "status": "created"}


def calculate_platform_fees(amount: float) -> dict:
    platform_fee = round(amount * (PLATFORM_FEE_PERCENT / 100), 2)
    creator_earning = round(amount - platform_fee, 2)
    return {
        "amount": amount,
        "platform_fee_percent": PLATFORM_FEE_PERCENT,
        "platform_fee": platform_fee,
        "creator_earning": creator_earning,
    }


def process_mock_payment(amount: float, payment_method: str) -> dict:
    platform_fee, creator_earning = calculate_platform_fees(amount)
    return {
        "status": "completed",
        "transaction_id": f"txn_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        "amount": amount,
        "currency": "ETB",
        "payment_method": payment_method,
        "platform_fee": platform_fee,
        "creator_earning": creator_earning,
    }


def process_telebirr_payment(phone_number: str, amount: float) -> dict:
    return process_mock_payment(amount, "telebirr")


def process_cbebirr_payment(phone_number: str, amount: float) -> dict:
    return process_mock_payment(amount, "cbebirr")


def process_credit_card(card_token: str, amount: float) -> dict:
    return process_mock_payment(amount, "credit_card")


def process_paypal(payment_data: dict) -> dict:
    return process_mock_payment(payment_data.get("amount", 0), "paypal")
