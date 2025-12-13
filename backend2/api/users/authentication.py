# import requests
# from jose import jwt
# from rest_framework import authentication, exceptions
# from django.conf import settings
# from users.utils import get_or_create_user_from_clerk

# class ClerkAuthentication(authentication.BaseAuthentication):
#     """
#     Authenticate requests using Clerk JWT.
#     """

#     def authenticate(self, request):
#         auth_header = request.headers.get("Authorization")

#         if not auth_header or not auth_header.startswith("Bearer "):
#             return None  # No token = request is not authenticated

#         token = auth_header.split(" ")[1]

#         try:
#             # Fetch JWKS keys from Clerk
#             jwks_url = f"https://{settings.CLERK_DOMAIN}/.well-known/jwks.json"
#             jwks = requests.get(jwks_url).json()

#             # Validate JWT
#             payload = jwt.decode(
#                 token,
#                 jwks,
#                 algorithms=["RS256"],
#                 options={"verify_aud": False}
#             )

#         except Exception as e:
#             raise exceptions.AuthenticationFailed(f"Invalid Clerk token: {str(e)}")

#         clerk_id = payload.get("sub")
#         email = payload.get("email_addresses", [{}])[0].get("email_address", "")
#         first_name = payload.get("first_name", "")
#         last_name = payload.get("last_name", "")
#         image_url = payload.get("image_url", "")

#         if not clerk_id:
#             raise exceptions.AuthenticationFailed("No Clerk ID found in token")

#         user = get_or_create_user_from_clerk(
#             clerk_id,
#             email,
#             first_name,
#             last_name,
#             image_url
#         )

#         return (user, None)

import requests
from jose import jwt
from jose.utils import base64url_decode
from django.conf import settings
from rest_framework import authentication, exceptions
from users.utils import get_or_create_user_from_clerk


class ClerkAuthentication(authentication.BaseAuthentication):

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ")[1]
        print("\n============== Clerk Authentication Debug ==============")
        print("Incoming Token:", token[:50] + "..." if token else "None")

        try:
            # Step 1 — load JWKS from Clerk
            jwks_url = f"https://{settings.CLERK_DOMAIN}/.well-known/jwks.json"
            jwks = requests.get(jwks_url).json()["keys"]

            # Step 2 — get KID from the token header
            headers = jwt.get_unverified_header(token)
            kid = headers.get("kid")

            if not kid:
                raise exceptions.AuthenticationFailed("Missing KID in token header")

            # Step 3 — find matching public key
            public_key = next((key for key in jwks if key["kid"] == kid), None)

            if not public_key:
                raise exceptions.AuthenticationFailed("Matching JWKS key not found")

            # Step 4 — verify token using the correct key
            payload = jwt.decode(
                token,
                public_key,
                algorithms=["RS256"],
                options={"verify_aud": False},
            )
            print("Decoded Payload:", payload)

        except Exception as e:
            print("JWT Verification Error:", e)
            raise exceptions.AuthenticationFailed(f"Invalid Clerk token: {str(e)}")

        clerk_id = payload.get("sub")
        email = payload.get("email")
        first_name = payload.get("first_name", "")
        last_name = payload.get("last_name", "")
        image_url = payload.get("image_url")

        if not clerk_id:
            raise exceptions.AuthenticationFailed("Token missing Clerk user ID")

        print("Clerk ID:", clerk_id)
        print("Email:", email)
        print("First Name:", first_name)
        print("Last Name:", last_name)
        print("=======================================================\n")

        user = get_or_create_user_from_clerk(
            clerk_id,
            email,
            first_name,
            last_name,
            image_url
        )

        print("Authenticated Django User:", user.id, user.username, "\n")

        return (user, None)
