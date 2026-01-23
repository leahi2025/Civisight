import smtplib
from email.mime.text import MIMEText
import os

def send_email(subject, body, receiver_email):
    sender_email = os.environ.get('EMAIL_HOST_USER', '').strip().strip("'\"")
    password = os.environ.get('EMAIL_APP_PASSWORD', '').strip().strip("'\"")
    smtp_server = "smtp.gmail.com" 
    smtp_port = 587 
    
    print(f"[EMAIL] Attempting to send email to: {receiver_email}")
    print(f"[EMAIL] From: {sender_email}")
    print(f"[EMAIL] Subject: {subject}")
    
    if not sender_email or not password:
        print("[EMAIL ERROR] Missing EMAIL_HOST_USER or EMAIL_HOST_PASSWORD in environment")
        return False
    
    # Ensure body is a string and handle encoding properly
    body = str(body) if body is not None else ""
    message = MIMEText(body, 'plain', 'utf-8')
    message["From"] = sender_email
    message["To"] = receiver_email
    message["Subject"] = subject
    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()  #Secure the connection
            server.login(sender_email, password) 
            server.sendmail(sender_email, receiver_email, message.as_string()) 
            print(f"[EMAIL] Email sent successfully to {receiver_email}!")
            return True
    except smtplib.SMTPAuthenticationError as e:
        print(f"[EMAIL ERROR] Authentication failed. Gmail requires an App Password (not your regular password).")
        print(f"[EMAIL ERROR] Go to https://myaccount.google.com/apppasswords to generate one.")
        print(f"[EMAIL ERROR] Details: {e}")
        return False
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send email: {e}")
        return False