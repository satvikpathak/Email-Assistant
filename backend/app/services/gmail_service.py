"""Gmail service for fetching, sending, and deleting emails."""

import asyncio
import base64
from email.mime.text import MIMEText
from typing import Any

from bs4 import BeautifulSoup
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from app.core.config import settings
from app.core.database import db
from app.models.schemas import UserInDB, UserUpdate


class GmailService:
    """Gmail API service with automatic token refresh."""

    def __init__(self, user: UserInDB) -> None:
        """Initialize Gmail service for a specific user."""
        self.user = user
        self.credentials = self._get_credentials()
        self.service = build("gmail", "v1", credentials=self.credentials)

    def _get_credentials(self) -> Credentials:
        """Get and refresh Google credentials if needed."""
        credentials = Credentials(
            token=self.user.access_token,
            refresh_token=self.user.refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            scopes=[
                "openid",
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/userinfo.profile",
                "https://www.googleapis.com/auth/gmail.readonly",
                "https://www.googleapis.com/auth/gmail.send",
                "https://www.googleapis.com/auth/gmail.modify",
            ],
        )

        # Check if token needs refresh
        if credentials.expired or not credentials.valid:
            credentials.refresh(Request())

            # Update user tokens in database
            task = asyncio.create_task(
                db.update_user(
                    self.user.id,
                    UserUpdate(
                        access_token=credentials.token,
                        token_expiry=credentials.expiry if credentials.expiry else None,
                    ),
                )
            )
            # Store task reference to avoid warning
            self._update_task = task

        return credentials

    def fetch_emails(self, max_results: int = 10, query: str = "") -> list[dict[str, Any]]:
        """
        Fetch emails from Gmail.

        Args:
            max_results: Maximum number of emails to fetch
            query: Gmail query string (e.g., 'is:unread', 'from:example@gmail.com')

        Returns:
            List of email dictionaries with sanitized content
        """
        try:
            # Fetch message list
            results = (
                self.service.users()
                .messages()
                .list(userId="me", q=query, maxResults=max_results)
                .execute()
            )

            messages = results.get("messages", [])

            if not messages:
                return []

            emails = []
            for message in messages:
                # Fetch full message details
                msg = (
                    self.service.users()
                    .messages()
                    .get(userId="me", id=message["id"], format="full")
                    .execute()
                )

                email_data = self._parse_message(msg)
                emails.append(email_data)

            return emails

        except HttpError as error:
            raise ValueError(f"Gmail API error: {error!s}") from error

    def _parse_message(self, message: dict) -> dict[str, Any]:
        """Parse Gmail message and extract relevant information."""
        headers = message["payload"]["headers"]
        header_dict = {header["name"]: header["value"] for header in headers}

        # Extract body
        body = self._get_message_body(message["payload"])

        # Sanitize HTML content
        sanitized_body = self._sanitize_html(body)

        return {
            "id": message["id"],
            "thread_id": message["threadId"],
            "subject": header_dict.get("Subject", "(No Subject)"),
            "from": header_dict.get("From", "Unknown"),
            "to": header_dict.get("To", ""),
            "date": header_dict.get("Date", ""),
            "snippet": message.get("snippet", ""),
            "body": sanitized_body,
            "labels": message.get("labelIds", []),
        }

    def _get_message_body(self, payload: dict) -> str:
        """Extract body from email payload."""
        body = ""

        if "parts" in payload:
            for part in payload["parts"]:
                if part["mimeType"] == "text/plain" and "data" in part["body"]:
                    body = base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8")
                    break
                if part["mimeType"] == "text/html" and "data" in part["body"]:
                    body = base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8")
        elif "body" in payload and "data" in payload["body"]:
            body = base64.urlsafe_b64decode(payload["body"]["data"]).decode("utf-8")

        return body

    def _sanitize_html(self, html_content: str) -> str:
        """
        Strip HTML tags and return plain text.

        This saves tokens when sending to AI.
        """
        if not html_content:
            return ""

        # Parse HTML
        soup = BeautifulSoup(html_content, "lxml")

        # Remove script and style tags
        for script in soup(["script", "style"]):
            script.decompose()

        # Get text
        text = soup.get_text()

        # Clean up whitespace
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        return "\n".join(chunk for chunk in chunks if chunk)

    def send_email(
        self, to: str, subject: str, body: str, thread_id: str | None = None
    ) -> dict[str, Any]:
        """
        Send an email via Gmail.

        Args:
            to: Recipient email address
            subject: Email subject
            body: Email body (plain text)
            thread_id: Optional thread ID for replies

        Returns:
            Sent message details
        """
        try:
            message = MIMEText(body)
            message["to"] = to
            message["subject"] = subject

            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")

            send_params = {"userId": "me", "body": {"raw": raw_message}}

            if thread_id:
                send_params["body"]["threadId"] = thread_id

            sent_message = self.service.users().messages().send(**send_params).execute()

            return {
                "id": sent_message["id"],
                "thread_id": sent_message.get("threadId"),
                "label_ids": sent_message.get("labelIds", []),
            }

        except HttpError as error:
            raise ValueError(f"Failed to send email: {error!s}") from error

    def delete_email(self, message_id: str) -> bool:
        """
        Move email to trash.

        Args:
            message_id: Gmail message ID

        Returns:
            True if successful
        """
        try:
            self.service.users().messages().trash(userId="me", id=message_id).execute()
            return True

        except HttpError as error:
            raise ValueError(f"Failed to delete email: {error!s}") from error

    def mark_as_read(self, message_id: str) -> bool:
        """
        Mark email as read.

        Args:
            message_id: Gmail message ID

        Returns:
            True if successful
        """
        try:
            self.service.users().messages().modify(
                userId="me",
                id=message_id,
                body={"removeLabelIds": ["UNREAD"]},
            ).execute()
            return True

        except HttpError as error:
            raise ValueError(f"Failed to mark email as read: {error!s}") from error
