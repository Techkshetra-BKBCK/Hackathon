import openai
import os
import json

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

openai.api_key = os.getenv('OPENAI_API_KEY')  # Ensure you have your API key set

def check_phishing(email_subject, email_body, sender_email):
    prompt = f"""
    Analyze the following email and determine if it's a phishing attempt:

    Sender: {sender_email}
    Subject: {email_subject}
    Body: {email_body}

    Consider the following:
    - Suspicious sender address, if its forwarded email than u can consider ignoring it
    - Urgency or threatening language
    - Fake login pages or links
    - Requests for sensitive information

    Respond with only "Phishing" or "Not Phishing".

    And also provide the reason why is it unsafe?
    In two parameters:
    return a json, reason, email_type

    In email_type only return "Phishing" or "Not Phishing".
    """

    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    # Remove backticks and "json" keyword
    response_content = response["choices"][0]["message"]["content"]
    cleaned_content = response_content.strip("```json").strip("```").strip()

    # Parse the cleaned JSON string
    email_analysis = json.loads(cleaned_content)

    # Extract values
    reason = email_analysis["reason"]
    email_type = email_analysis["email_type"]

    print("Reason:", reason)
    print("Email Type:", email_type)

    return email_type, reason

# Example usage
# email_subject = "Urgent: Your account will be suspended!"
# email_body = "Dear user, click this link to update your password immediately: http://fake-login.com"
# sender_email = "security@bank-alerts.com"

# result = check_phishing(email_subject, email_body, sender_email)
# print("Result:", result)
