from passlib.context import CryptContext
import hashlib

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str):
    return pwd_context.verify(password, hashed)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def verify_token_hash(token: str, hashed: str | None) -> bool:
    if not hashed:
        return False

    return hash_token(token) == hashed
