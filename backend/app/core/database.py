"""Database operations and utilities."""

from uuid import UUID

from supabase import Client, create_client

from app.core.config import settings
from app.models.schemas import UserCreate, UserInDB, UserUpdate


class Database:
    """Database client wrapper for Supabase operations."""

    def __init__(self) -> None:
        """Initialize Supabase client with service key to bypass RLS."""
        # Use service key instead of anon key to bypass RLS
        self.client: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_KEY,  # Changed from SUPABASE_KEY
        )

    async def get_user_by_email(self, email: str) -> UserInDB | None:
        """Fetch user by email."""
        response = self.client.table("users").select("*").eq("email", email).execute()

        if not response.data:
            return None

        return UserInDB(**response.data[0])

    async def get_user_by_google_id(self, google_id: str) -> UserInDB | None:
        """Fetch user by Google ID."""
        response = self.client.table("users").select("*").eq("google_id", google_id).execute()

        if not response.data:
            return None

        return UserInDB(**response.data[0])

    async def get_user_by_id(self, user_id: UUID) -> UserInDB | None:
        """Fetch user by ID."""
        response = self.client.table("users").select("*").eq("id", str(user_id)).execute()

        if not response.data:
            return None

        return UserInDB(**response.data[0])

    async def create_user(self, user_data: UserCreate) -> UserInDB:
        """Create a new user."""
        data = {
            "email": user_data.email,
            "google_id": user_data.google_id,
            "refresh_token": user_data.refresh_token,
            "access_token": user_data.access_token,
            "token_expiry": (
                user_data.token_expiry.isoformat() if user_data.token_expiry else None
            ),
        }

        response = self.client.table("users").insert(data).execute()

        if not response.data:
            raise ValueError("Failed to create user")

        return UserInDB(**response.data[0])

    async def update_user(self, user_id: UUID, user_data: UserUpdate) -> UserInDB:
        """Update user tokens."""
        update_data = {}

        if user_data.refresh_token is not None:
            update_data["refresh_token"] = user_data.refresh_token
        if user_data.access_token is not None:
            update_data["access_token"] = user_data.access_token
        if user_data.token_expiry is not None:
            update_data["token_expiry"] = user_data.token_expiry.isoformat()

        response = self.client.table("users").update(update_data).eq("id", str(user_id)).execute()

        if not response.data:
            raise ValueError("Failed to update user")

        return UserInDB(**response.data[0])

    async def save_chat_message(
        self, user_id: UUID, role: str, content: str, metadata: dict | None = None
    ) -> None:
        """Save a chat message to history."""
        data = {
            "user_id": str(user_id),
            "role": role,
            "content": content,
            "metadata": metadata,
        }

        self.client.table("chat_history").insert(data).execute()

    async def get_chat_history(self, user_id: UUID, limit: int = 50) -> list[dict]:
        """Retrieve chat history for a user."""
        response = (
            self.client.table("chat_history")
            .select("*")
            .eq("user_id", str(user_id))
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )

        return response.data if response.data else []


# Singleton instance
db = Database()
