"""Chat router - AI-powered email assistant endpoints."""

from uuid import UUID

from fastapi import APIRouter, HTTPException, Query

from app.core.database import db
from app.models.schemas import ChatRequest, ChatResponse
from app.services.ai_service import AIService
from app.services.gmail_service import GmailService

router = APIRouter()


@router.post("/message")
async def send_message(
    request: ChatRequest, user_id: str = Query(..., description="User ID")
) -> ChatResponse:
    """
    Process a chat message from the user.

    This endpoint will:
    1. Parse user intent (fetch, summarize, reply, send, delete, categorize, digest)
    2. Call appropriate Gmail/AI services
    3. Return AI response with action metadata including email data
    """
    try:
        user_uuid = UUID(user_id)

        # Verify user exists
        user = await db.get_user_by_id(user_uuid)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Save user message to history
        await db.save_chat_message(user_uuid, "user", request.message)

        # Initialize services
        ai_service = AIService()
        gmail_service = GmailService(user)

        # Detect intent with enhanced NLP
        intent_data = ai_service.detect_intent(request.message, request.conversation_history)
        intent = intent_data["intent"]

        response_message = ""
        action_taken = None
        metadata = {}

        # Process based on intent
        if intent == "fetch_emails" or intent == "summarize":
            # Fetch emails with AI-generated summaries for each
            count = intent_data.get("count", 5)
            query = intent_data.get("query", "")

            print(f"[CHAT] Fetching {count} emails with query: '{query}'")
            emails = gmail_service.fetch_emails(max_results=count, query=query)

            if not emails:
                response_message = "No emails found matching your criteria."
                action_taken = "fetch_emails"
                metadata = {"emails": [], "count": 0}
            else:
                # Generate AI summary for each email
                enriched_emails = []
                for email in emails:
                    summary = ai_service.summarize_single_email(email)
                    enriched_emails.append(
                        {
                            "id": email["id"],
                            "thread_id": email["thread_id"],
                            "from": email["from"],
                            "subject": email["subject"],
                            "date": email["date"],
                            "snippet": email["snippet"],
                            "body": email["body"][:500],  # Truncate for frontend
                            "summary": summary,
                            "labels": email["labels"],
                        }
                    )

                # Create conversational response
                response_message = ai_service.create_email_list_response(enriched_emails, query)
                action_taken = "fetch_emails"
                metadata = {
                    "emails": enriched_emails,
                    "count": len(enriched_emails),
                    "query": query,
                }

        elif intent == "generate_reply":
            # Generate reply for specific email
            email_id = intent_data.get("email_id")
            email_index = intent_data.get("email_index")
            custom_instruction = intent_data.get("instruction", "")

            if not email_id and email_index is not None:
                # Get email from previous context (need to fetch recent emails)
                emails = gmail_service.fetch_emails(max_results=10)
                if email_index < len(emails):
                    email_id = emails[email_index]["id"]

            if email_id:
                emails = gmail_service.fetch_emails(max_results=50)
                target_email = next((e for e in emails if e["id"] == email_id), None)

                if target_email:
                    reply_text = ai_service.generate_reply(target_email, custom_instruction)
                    response_message = f"Here's a suggested reply:\n\n{reply_text}\n\nWould you like me to send this? (Say 'yes send it' or 'no thanks')"
                    action_taken = "generate_reply"
                    metadata = {
                        "email_id": email_id,
                        "reply_text": reply_text,
                        "thread_id": target_email["thread_id"],
                        "to": target_email["from"],
                        "subject": f"Re: {target_email['subject']}",
                    }
                else:
                    response_message = "I couldn't find that email. Could you be more specific?"
                    action_taken = "error"
            else:
                response_message = "Which email would you like me to reply to? You can say 'reply to email #1' or 'reply to the email from John'."
                action_taken = "reply_prompt"

        elif intent == "send_reply":
            # Send the generated reply
            email_id = intent_data.get("email_id")
            reply_text = intent_data.get("reply_text")
            to = intent_data.get("to")
            subject = intent_data.get("subject")
            thread_id = intent_data.get("thread_id")

            if all([reply_text, to, subject]):
                result = gmail_service.send_email(to, subject, reply_text, thread_id)
                response_message = f"✅ Reply sent successfully to {to}!"
                action_taken = "send_reply"
                metadata = {"sent_message_id": result["id"]}
            else:
                response_message = (
                    "I need more information to send the reply. Please generate a reply first."
                )
                action_taken = "error"

        elif intent == "delete_email":
            # Delete specific email with confirmation
            email_id = intent_data.get("email_id")
            email_index = intent_data.get("email_index")
            confirmed = intent_data.get("confirmed", False)

            if not email_id and email_index is not None:
                emails = gmail_service.fetch_emails(max_results=10)
                if email_index < len(emails):
                    email_id = emails[email_index]["id"]

            if email_id:
                if confirmed:
                    gmail_service.delete_email(email_id)
                    response_message = "🗑️ Email deleted successfully!"
                    action_taken = "delete_email"
                    metadata = {"deleted_email_id": email_id}
                else:
                    # Ask for confirmation
                    emails = gmail_service.fetch_emails(max_results=50)
                    target_email = next((e for e in emails if e["id"] == email_id), None)
                    if target_email:
                        response_message = f"Are you sure you want to delete:\n\nFrom: {target_email['from']}\nSubject: {target_email['subject']}\n\nSay 'yes delete it' to confirm."
                        action_taken = "delete_confirm"
                        metadata = {"email_id": email_id, "email": target_email}
                    else:
                        response_message = "I couldn't find that email."
                        action_taken = "error"
            else:
                response_message = "Which email would you like to delete? Say something like 'delete email #1' or 'delete the email from spam@example.com'."
                action_taken = "delete_prompt"

        elif intent == "categorize":
            # Smart inbox categorization
            count = intent_data.get("count", 20)
            emails = gmail_service.fetch_emails(max_results=count)

            categories = ai_service.categorize_emails(emails)
            response_message = ai_service.format_categorized_emails(categories)
            action_taken = "categorize"
            metadata = {"categories": categories, "total_emails": len(emails)}

        elif intent == "digest":
            # Daily email digest
            emails = gmail_service.fetch_emails(max_results=20, query="newer_than:1d")
            digest = ai_service.generate_daily_digest(emails)
            response_message = digest
            action_taken = "digest"
            metadata = {"emails_count": len(emails)}

        else:
            # General query with context
            context = ""
            if request.conversation_history:
                context = "\n".join(
                    [f"{msg.role}: {msg.content}" for msg in request.conversation_history[-5:]]
                )

            response_message = ai_service.process_natural_query(request.message, context)
            action_taken = "query"

        # Save assistant response to history
        await db.save_chat_message(user_uuid, "assistant", response_message, metadata)

        return ChatResponse(message=response_message, action_taken=action_taken, metadata=metadata)

    except ValueError as e:
        error_msg = f"Error: {e!s}"
        print(f"[CHAT ERROR] ValueError: {e}")
        await db.save_chat_message(user_uuid, "assistant", error_msg)
        raise HTTPException(status_code=400, detail=error_msg) from e
    except Exception as e:
        error_msg = f"Failed to process message: {e!s}"
        print(f"[CHAT ERROR] Exception: {type(e).__name__}: {e}")
        import traceback

        traceback.print_exc()
        await db.save_chat_message(user_uuid, "assistant", error_msg)
        raise HTTPException(status_code=500, detail=error_msg) from e


@router.get("/history")
async def get_history(
    user_id: str = Query(..., description="User ID"),
    limit: int = Query(50, ge=1, le=100),
) -> list[dict]:
    """
    Retrieve chat history for the user.

    Returns recent conversation history.
    """
    try:
        user_uuid = UUID(user_id)

        # Verify user exists
        user = await db.get_user_by_id(user_uuid)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        history = await db.get_chat_history(user_uuid, limit=limit)

        # Reverse to get chronological order
        return list(reversed(history))

    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid user ID") from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {e!s}") from e
