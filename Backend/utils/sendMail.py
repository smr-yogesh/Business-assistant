from flask import jsonify, request, Blueprint, render_template
import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

validator = Blueprint("validator", __name__)
# SMTP Configuration
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = os.getenv("SMTP_PORT")
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")


def send_mail(name, email, otp):
    # Function to send email with OTP
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

        # Email body
        # Render the HTML template with the OTP
        body = render_template(
            "verification.html", user_name=name, verification_link=otp
        )
        msg.attach(MIMEText(body, "html"))

        # Send the email
        server.send_message(msg)
        server.quit()

        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
