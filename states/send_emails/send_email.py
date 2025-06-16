import smtplib
from email.mime.text import MIMEText
def main(str):


    sender_email = """sender's email"""
    with open("email_sender_password.txt", "r") as file2:
        password = file2.read()
    with open("email_ist.txt", "r") as file:
        data = file.read()
        for i in data.split("\n"):
            receiver_email = i.strip()
            if not receiver_email:
                    continue
            smtp_server = "smtp.gmail.com" 
            smtp_port = 587 
            body = str
            message = MIMEText(body)
            message["From"] = sender_email
            message["To"] = receiver_email
            message["Subject"] = "REMINDERRRR"
            try:
                with smtplib.SMTP(smtp_server, smtp_port) as server:
                    server.starttls()  #Secure the connection
                    server.login(sender_email, password) 
                    server.sendmail(sender_email, receiver_email, message.as_string()) 
                    print("Email sent successfully!")
            except Exception as e:
                print(f"Error: {e}")



main("This is another reminder!!!!!")