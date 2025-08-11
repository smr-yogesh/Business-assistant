import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.message import EmailMessage
from flask import render_template, flash
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(override=True)

SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")


def send_mail(name, email, otp_link):
    try:
        # Set up the server
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)

        # Create the email
        msg = MIMEMultipart()
        msg["From"] = SMTP_USERNAME
        msg["To"] = email
        msg["Subject"] = "Your OTP Code"

        # Render HTML body with Jinja2/flask template
        body = render_template(
            "verification.html", user_name=name, verification_link=otp_link
        )
        msg.attach(MIMEText(body, "html"))

        # Send the email
        server.send_message(msg)
        server.quit()
        print("Email sent!")
        flash("Email sent!")
        return True

    except Exception as e:
        print(f"Failed to send email: {e}")
        return False


RESET_TOKEN_TTL_MIN = int(os.getenv("RESET_TOKEN_TTL_MIN", "30"))  # 30 min default


def send_reset_email(to_email: str, reset_url: str):
    msg = EmailMessage()
    msg["Subject"] = "Reset your BizBot password"
    msg["From"] = SMTP_USERNAME
    msg["To"] = to_email
    # Keep email simple; UI handles styling
    msg.set_content(
        f"Click the link to reset your password:\n\n{reset_url}\n\n"
        f"This link expires in {RESET_TOKEN_TTL_MIN} minutes.\n"
        "If you didn’t request this, you can ignore this email."
    )

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=15) as s:
        s.starttls()
        s.login(SMTP_USERNAME, SMTP_PASSWORD)
        s.send_message(msg)
