def send_email(to_email: str, subject: str, body: str) -> bool:
    return bool(to_email and subject and body)
