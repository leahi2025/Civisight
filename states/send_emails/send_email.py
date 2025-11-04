import smtplib
from email.mime.text import MIMEText
import os

def send_email(subject, body, receiver_email):


    sender_email = os.environ['EMAIL_HOST_USER']
    password = os.environ['EMAIL_HOST_PASSWORD']
    smtp_server = "smtp.gmail.com" 
    smtp_port = 587 
    body = str
    message = MIMEText(body)
    message["From"] = sender_email
    message["To"] = receiver_email
    message["Subject"] = subject
    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()  #Secure the connection
            server.login(sender_email, password) 
            server.sendmail(sender_email, receiver_email, message.as_string()) 
            print("Email sent successfully!")
    except Exception as e:
        print(f"Error: {e}")