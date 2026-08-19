"""Tests for password hashing, JWT creation, and validation."""

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_password_hashing():
    """Verify password hash generation and verification."""
    raw_password = "SuperSecretPassword123!"
    hashed = hash_password(raw_password)

    assert hashed != raw_password
    assert verify_password(raw_password, hashed) is True
    assert verify_password("WrongPassword123!", hashed) is False


def test_jwt_access_token_lifecycle():
    """Verify JWT access token generation and payload decoding."""
    subject_id = "123e4567-e89b-12d3-a456-426614174000"
    token = create_access_token(subject=subject_id, extra_claims={"role": "merchant"})

    assert isinstance(token, str)
    payload = decode_token(token)
    assert payload is not None
    assert payload["sub"] == subject_id
    assert payload["type"] == "access"
    assert payload["role"] == "merchant"
    assert "exp" in payload


def test_jwt_refresh_token_lifecycle():
    """Verify JWT refresh token generation."""
    subject_id = "123e4567-e89b-12d3-a456-426614174000"
    token = create_refresh_token(subject=subject_id)

    payload = decode_token(token)
    assert payload is not None
    assert payload["sub"] == subject_id
    assert payload["type"] == "refresh"


def test_invalid_jwt_token():
    """Verify corrupted or invalid token returns None."""
    invalid_token = "invalid.bearer.token.signature"
    assert decode_token(invalid_token) is None
