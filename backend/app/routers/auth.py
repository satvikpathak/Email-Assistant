"""Authentication router - Google OAuth2 implementation."""

import logging
import traceback
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow

from app.core.config import settings
from app.core.database import db
from app.models.schemas import TokenResponse, UserCreate, UserResponse, UserUpdate

router = APIRouter()
logger = logging.getLogger(__name__)

# Google OAuth2 Scopes
SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.modify",
]


def create_oauth_flow() -> Flow:
    """Create Google OAuth2 flow."""
    return Flow.from_client_config(
        {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [settings.GOOGLE_REDIRECT_URI],
            }
        },
        scopes=SCOPES,
        redirect_uri=settings.GOOGLE_REDIRECT_URI,
    )


@router.get("/login")
async def login() -> dict[str, str]:
    """
    Initiate Google OAuth2 login flow.

    Returns the authorization URL for the frontend to redirect to.
    """
    flow = create_oauth_flow()
    authorization_url, state = flow.authorization_url(
        access_type="offline",  # Request refresh token
        include_granted_scopes="true",
        prompt="consent",  # Force consent screen to get refresh token
    )

    return {"authorization_url": authorization_url, "state": state}


@router.get("/callback")
async def callback(
    code: str = Query(..., description="Authorization code from Google"),
) -> TokenResponse:
    """
    Handle Google OAuth2 callback.

    Exchange authorization code for tokens and create/update user.
    """
    try:
        # Create flow and fetch token
        flow = create_oauth_flow()
        logger.info("Fetching token with code: %s...", code[:20])
        flow.fetch_token(code=code)

        credentials = flow.credentials
        logger.info(
            "Got credentials, token: %s...",
            credentials.token[:20] if credentials.token else "None",
        )

        # Verify and decode the ID token
        id_info = id_token.verify_oauth2_token(
            credentials.id_token, google_requests.Request(), settings.GOOGLE_CLIENT_ID
        )

        # Extract user info
        google_id = id_info["sub"]
        email = id_info["email"]
        logger.info("Verified user: %s, google_id: %s", email, google_id)

        # Calculate token expiry
        token_expiry = None
        if credentials.expiry:
            token_expiry = credentials.expiry

        # Check if user exists
        logger.info("Checking for existing user with google_id: %s", google_id)
        existing_user = await db.get_user_by_google_id(google_id)

        if existing_user:
            logger.info("Updating existing user: %s", existing_user.id)
            # Update tokens for existing user
            user_update = UserUpdate(
                refresh_token=credentials.refresh_token or existing_user.refresh_token,
                access_token=credentials.token,
                token_expiry=token_expiry,
            )
            user = await db.update_user(existing_user.id, user_update)
        else:
            logger.info("Creating new user for: %s", email)
            # Create new user
            if not credentials.refresh_token:
                logger.error("No refresh token received!")
                raise HTTPException(
                    status_code=400,
                    detail="No refresh token received. User may need to revoke access.",
                )

            user_create = UserCreate(
                email=email,
                google_id=google_id,
                refresh_token=credentials.refresh_token,
                access_token=credentials.token,
                token_expiry=token_expiry,
            )
            user = await db.create_user(user_create)
            logger.info("Created new user: %s", user.id)

        # Return user info and access token
        user_response = UserResponse(
            id=user.id,
            email=user.email,
            google_id=user.google_id,
            created_at=user.created_at,
        )

        logger.info("Successfully authenticated user: %s", user.id)
        return TokenResponse(
            access_token=str(user.id),  # Use user ID as session token
            user=user_response,
        )

    except HTTPException:
        raise
    except ValueError as e:
        logger.error("ValueError: %s", e)
        raise HTTPException(status_code=400, detail=f"Invalid token: {e!s}") from e
    except Exception as e:
        logger.error("Exception: %s: %s", type(e).__name__, e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Authentication failed: {e!s}") from e


@router.get("/me")
async def get_current_user(user_id: str = Query(..., description="User ID")) -> UserResponse:
    """
    Get current user information.

    Used by frontend to verify authentication status.
    """
    try:
        user_uuid = UUID(user_id)
        user = await db.get_user_by_id(user_uuid)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return UserResponse(
            id=user.id,
            email=user.email,
            google_id=user.google_id,
            created_at=user.created_at,
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid user ID") from e


@router.post("/logout")
async def logout() -> dict[str, str]:
    """
    Logout endpoint.

    Frontend should clear local storage/cookies.
    """
    return {"message": "Logged out successfully"}
