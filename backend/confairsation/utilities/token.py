import os

from hashlib import pbkdf2_hmac
from hmac import compare_digest

TOKEN_SECRET = os.getenv("TOKEN_SECRET")

if TOKEN_SECRET is None:
    raise Exception(
        "TOKEN_SECRET is not set -- please configure with something secret before starting"
    )


def create_token(email: str) -> bytes:
    return pbkdf2_hmac("sha256", email.encode(), TOKEN_SECRET.encode(), 1000)


def check_token(email: str, token: bytes) -> bool:
    return compare_digest(create_token(email), token)
