# Email notification setup

When an authenticated user creates a notification, the API saves it for that
user and queues an email alert to the email address on that user's account.
Email delivery runs after the HTTP response is sent. If SMTP is unavailable,
the notification remains saved and the send failure is logged by the API.

Set the following values in `.env` to enable delivery (see `.env.example`):

- `EMAIL_HOST`: SMTP server hostname.
- `EMAIL_PORT`: SMTP port; port `465` uses SSL, otherwise STARTTLS is enabled
  when `EMAIL_USE_TLS=true`.
- `EMAIL_USERNAME` and `EMAIL_PASSWORD`: SMTP credentials, if required.
- `EMAIL_FROM`: sender address.
- `EMAIL_USE_TLS`: enable STARTTLS for non-465 ports (default `true`).
- `EMAIL_TIMEOUT_SECONDS`: connection timeout (default `10`).
