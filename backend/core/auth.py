import json
import logging
from typing import Any
from urllib.request import urlopen
from pydantic import BaseModel
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

from core.config import settings

logger = logging.getLogger(__name__)

security = HTTPBearer()

class CurrentUser(BaseModel):
    clerk_user_id: str
    email: str | None = None

def get_clerk_jwks() -> dict[str, Any]:
    if not settings.clerk_jwks_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="CLERK_JWKS_URL is not configured",
        )
    try:
        response = urlopen(settings.clerk_jwks_url)
        return json.loads(response.read())
    except Exception as e:
        logger.error(f"Failed to fetch Clerk JWKS: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch auth keys",
        )

def verify_clerk_token(token: str) -> dict[str, Any]:
    jwks = get_clerk_jwks()
    
    try:
        unverified_header = jwt.get_unverified_header(token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token header",
        )

    rsa_key = {}
    if "kid" not in unverified_header:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token kid",
        )

    for key in jwks.get("keys", []):
        if key["kid"] == unverified_header["kid"]:
            rsa_key = {
                "kty": key["kty"],
                "kid": key["kid"],
                "use": key["use"],
                "n": key["n"],
                "e": key["e"],
            }
            break

    if not rsa_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unable to find appropriate key",
        )

    try:
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            audience=settings.clerk_audience if settings.clerk_audience else None,
            issuer=settings.clerk_issuer if settings.clerk_issuer else None,
            options={"verify_aud": bool(settings.clerk_audience)}
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is expired",
        )
    except jwt.JWTClaimsError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect claims, please check audience and issuer",
        )
    except Exception as e:
        logger.error(f"JWT Verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> CurrentUser:
    token = credentials.credentials
    payload = verify_clerk_token(token)
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject",
        )
        
    return CurrentUser(clerk_user_id=user_id)
