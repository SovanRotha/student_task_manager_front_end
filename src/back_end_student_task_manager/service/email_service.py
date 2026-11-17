import logging
import smtplib
import ssl
from email.message import EmailMessage

from back_end_student_task_manager.core.config import (
    EMAIL_FROM,
    EMAIL_HOST,
    EMAIL_PASSWORD,
    EMAIL_PORT,
    EMAIL_TIMEOUT_SECONDS,
    EMAIL_USE_TLS,
    EMAIL_USERNAME,
)

logger = logging.getLogger(__name__)


def send_notification_email(
    recipient: str,
    title: str,
    message: str,
) -> bool:
    """Send a notification email. Returns False if SMTP is not configured or fails."""
    if not EMAIL_HOST or not EMAIL_FROM:
        logger.warning("Email not sent: configure EMAIL_HOST and EMAIL_FROM")
        return False

    safe_title = " ".join(title.splitlines()).strip() or "You have a notification"
    email = EmailMessage()
    email["Subject"] = f"Student Task Manager: {safe_title}"
    email["From"] = EMAIL_FROM
    email["To"] = recipient
    email.set_content(f"{safe_title}\n\n{message}")

    try:
        if EMAIL_PORT == 465:
            with smtplib.SMTP_SSL(
                EMAIL_HOST,
                EMAIL_PORT,
                timeout=EMAIL_TIMEOUT_SECONDS,
                context=ssl.create_default_context(),
            ) as smtp:
                _login_and_send(smtp, email)
        else:
            with smtplib.SMTP(
                EMAIL_HOST, EMAIL_PORT, timeout=EMAIL_TIMEOUT_SECONDS
            ) as smtp:
                if EMAIL_USE_TLS:
                    smtp.starttls(context=ssl.create_default_context())
                _login_and_send(smtp, email)
        return True
    except (OSError, smtplib.SMTPException):
        logger.exception("Could not send notification email to %s", recipient)
        return False


def _login_and_send(smtp: smtplib.SMTP, email: EmailMessage) -> None:
    if EMAIL_USERNAME:
        smtp.login(EMAIL_USERNAME, EMAIL_PASSWORD or "")
    smtp.send_message(email)
