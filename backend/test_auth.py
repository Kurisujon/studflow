from core.auth import get_clerk_jwks_url, _derive_clerk_issuer_from_publishable_key
try:
    print(get_clerk_jwks_url())
except Exception as e:
    print(type(e), str(e))
